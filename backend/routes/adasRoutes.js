const express = require('express');
const router = express.Router();
const axios = require('axios');
const SessionSummary = require('../models/SessionSummary');
const AdasData = require('../models/AdasData');

let currentSessionData = [];
let engineeredSessionKpis = null;

// --- 1. LIVE EDGE INGESTION ---
router.post('/session/start', (req, res) => {
    currentSessionData = []; 
    engineeredSessionKpis = null;
    res.json({ message: "Session started. Ready to record." });
});

router.post('/session/record', (req, res) => {
    // React sends 120 frames here, held temporarily in memory
    currentSessionData.push(req.body);
    res.status(200).send("Recorded");
});

// --- 2. POST-SESSION PIPELINE & MONGODB SAVE ---
router.post('/session/stop', async (req, res) => {
    if (currentSessionData.length === 0) {
        return res.status(400).json({error: "No data collected"});
    }

    try {
        const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        
        console.log("1. Sending data to Flask ML Engine...");
        const response = await axios.post(`${mlUrl}/process-session`, {
            data: currentSessionData
        });

        const finalData = response.data.results || [];
        console.log(`2. Received ${finalData.length} frames back from PySpark.`);

        if (finalData.length === 0) throw new Error("Flask returned empty data");

        // Bulletproof Math: Use fallback || 0 to prevent NaN crashes
        const criticalRiskCount = finalData.filter((d) => {
            const engineeredStatus = String(d.Engineered_Status || '').toUpperCase();
            const dangerLevel = parseFloat(d.Danger) || 0;
            const ttc = parseFloat(d.TTC_Seconds || d.TTC) || Number.POSITIVE_INFINITY;

            // Treat any of these as a critical frame for BI live session view.
            return engineeredStatus === 'CRITICAL RISK' || dangerLevel >= 3 || ttc <= 4;
        }).length;
        const avgRearThreat = finalData.reduce((acc, curr) => acc + (parseFloat(curr.Rear_Threat) || 0), 0) / finalData.length;
        
        // PySpark outputs the Random Forest prediction in a column named 'prediction'
        const mlPredictedCollisions = finalData.filter(d => (parseFloat(d.prediction) || 0) >= 3).length;
        const avgSafety = currentSessionData.reduce((acc, curr) => acc + (parseFloat(curr.Safety_Pct) || 0), 0) / currentSessionData.length;
        const avgAggressionScore = finalData.reduce((acc, curr) => acc + (parseFloat(curr.Aggression_Score) || 0), 0) / finalData.length;
        const hardTurnCount = finalData.filter(d => {
            const status = String(d.Status_Label || '').toUpperCase();
            return status.includes('TURN');
        }).length;
        const criticalBrakeCount = finalData.filter(d => {
            const status = String(d.Status_Label || '').toUpperCase();
            return status.includes('BRAKE') || ((parseFloat(d.Danger) || 0) >= 3 && status.includes('EVASIVE'));
        }).length;

        // Persist each frame for historical analysis in adasdatas.
        const frameDocs = finalData.map((frame) => ({
            FL: parseFloat(frame.FL) || 0,
            FR: parseFloat(frame.FR) || 0,
            BL: parseFloat(frame.BL) || 0,
            BR: parseFloat(frame.BR) || 0,
            Danger: parseFloat(frame.Danger) || 0,
            Front_Avg: parseFloat(frame.Front_Avg) || ((parseFloat(frame.FL) || 0) + (parseFloat(frame.FR) || 0)) / 2,
            Min_Dist: parseFloat(frame.Min_Dist) || 0,
            Rel_Speed: parseFloat(frame.Rel_Speed) || 0,
            Acceleration: parseFloat(frame.Acceleration) || 0,
            TTC_Seconds: parseFloat(frame.TTC_Seconds) || parseFloat(frame.TTC) || 0,
            Steering_Angle: parseFloat(frame.Steering_Angle) || 0,
            Status_Label: String(frame.Status_Label || frame.Engineered_Status || 'UNKNOWN'),
            Safety_Pct: parseFloat(frame.Safety_Pct) || 0,
            False_Positive_Pct: parseFloat(frame.False_Positive_Pct) || 0,
            Steering_Display: String(frame.Steering_Display || ''),
            Aggression_Score: parseFloat(frame.Aggression_Score) || 0,
            Threat_Source: String(frame.Threat_Source || '')
        }));

        if (frameDocs.length > 0) {
            await AdasData.insertMany(frameDocs, { ordered: false });
        }

        engineeredSessionKpis = {
            totalFrames: finalData.length,
            avgSafetyPct: avgSafety || 0,
            sparkPredictedAnomalies: mlPredictedCollisions || 0,
            totalCriticalRisk: criticalRiskCount || 0,
            avgRearThreat: avgRearThreat || 0,
            avgAggressionScore: avgAggressionScore || 0,
            hardTurns: hardTurnCount || 0,
            criticalBrakes: criticalBrakeCount || 0
        };

        console.log("3. Attempting to save this payload to MongoDB:", engineeredSessionKpis);

        // 3. Save to MongoDB
        const newSessionRecord = new SessionSummary(engineeredSessionKpis);
        await newSessionRecord.save();
        
        console.log("4. SUCCESS! Saved to MongoDB sessionsummaries collection.");
        res.json({ message: "Pipelines executed and saved to MongoDB", kpis: engineeredSessionKpis });

    } catch (err) { 
        console.error("❌ BACKEND CRASH:", err.message);
        // If Axios caught an error from Flask, print the actual Flask error
        if (err.response) console.error("Flask Output:", err.response.data);
        
        res.status(500).json({ error: 'Failed to process ML pipeline or save to DB', details: err.message }); 
    }
});

// --- 3. FETCH METRICS FOR REACT DASHBOARD ---
router.get('/analytics/session', async (req, res) => {
    try {
        if (engineeredSessionKpis) {
            return res.json(engineeredSessionKpis);
        }

        const latestSession = await SessionSummary.findOne().sort({ sessionDate: -1 }).lean();
        if (!latestSession) {
            return res.status(404).json({ message: "No session data yet." });
        }

        const { _id, __v, ...safePayload } = latestSession;
        res.json(safePayload);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/analytics/kpis', async (req, res) => {
    try {
        const fleetAverages = await SessionSummary.aggregate([
            { $group: { 
                _id: null, 
                avgSafety: { $avg: "$avgSafetyPct" }, 
                avgAggression: { $avg: "$avgAggressionScore" }, // New
                totalHardTurns: { $sum: "$hardTurns" },         // New
                totalCriticalBrakes: { $sum: "$criticalBrakes" },// New
                totalAnomalies: { $sum: "$sparkPredictedAnomalies" },
                totalSessions: { $sum: 1 }
            }}
        ]);
        
        res.json(fleetAverages[0] || { 
            avgSafety: 0, avgAggression: 0, totalHardTurns: 0, totalCriticalBrakes: 0, totalSessions: 0 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/analytics/frame-insights', async (req, res) => {
    try {
        const totalFrames = await AdasData.countDocuments();

        const dangerRaw = await AdasData.aggregate([
            {
                $project: {
                    dangerBucket: {
                        $switch: {
                            branches: [
                                { case: { $lte: ['$Danger', 0] }, then: 'L0 Safe' },
                                { case: { $eq: ['$Danger', 1] }, then: 'L1 Caution' },
                                { case: { $eq: ['$Danger', 2] }, then: 'L2 Warning' },
                                { case: { $eq: ['$Danger', 3] }, then: 'L3 Danger' }
                            ],
                            default: 'L4 Critical'
                        }
                    }
                }
            },
            { $group: { _id: '$dangerBucket', count: { $sum: 1 } } }
        ]);

        const statusFrequencyRaw = await AdasData.aggregate([
            { $group: { _id: '$Status_Label', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        const steeringBucketsRaw = await AdasData.aggregate([
            {
                $bucket: {
                    groupBy: '$Steering_Angle',
                    boundaries: [-45, -36, -27, -18, -9, 0, 9, 18, 27, 36, 45],
                    default: 'other',
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        const safetyScatterRaw = await AdasData.find({}, { Min_Dist: 1, Safety_Pct: 1, Danger: 1 })
            .sort({ _id: -1 })
            .limit(180)
            .lean();

        const threatSourceRaw = await AdasData.aggregate([
            {
                $project: {
                    inferredSource: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [
                                            { $lte: ['$FR', '$FL'] },
                                            { $lte: ['$FR', '$BL'] },
                                            { $lte: ['$FR', '$BR'] }
                                        ]
                                    },
                                    then: 'FR'
                                },
                                {
                                    case: {
                                        $and: [
                                            { $lte: ['$BR', '$FL'] },
                                            { $lte: ['$BR', '$BL'] },
                                            { $lte: ['$BR', '$FR'] }
                                        ]
                                    },
                                    then: 'BR'
                                },
                                {
                                    case: {
                                        $and: [
                                            { $lte: ['$FL', '$FR'] },
                                            { $lte: ['$FL', '$BL'] },
                                            { $lte: ['$FL', '$BR'] }
                                        ]
                                    },
                                    then: 'FL'
                                }
                            ],
                            default: 'BL'
                        }
                    }
                }
            },
            { $group: { _id: '$inferredSource', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const aggressionTimelineRaw = await AdasData.find({}, { Aggression_Score: 1 })
            .sort({ _id: -1 })
            .limit(60)
            .lean();

        const dangerOrder = ['L0 Safe', 'L1 Caution', 'L2 Warning', 'L3 Danger', 'L4 Critical'];
        const dangerMap = Object.fromEntries(dangerRaw.map((d) => [d._id, d.count]));
        const dangerDistribution = dangerOrder.map((label) => ({ label, count: dangerMap[label] || 0 }));

        const steeringLabelOrder = ['-45', '-36', '-27', '-18', '-9', '0', '9', '18', '27', '36'];
        const steeringMap = Object.fromEntries(
            steeringBucketsRaw
                .filter((row) => row._id !== 'other')
                .map((row) => [String(row._id), row.count])
        );
        const steeringDistribution = steeringLabelOrder.map((label) => ({ label, count: steeringMap[label] || 0 }));

        const statusFrequency = statusFrequencyRaw.map((row) => ({
            label: row._id || 'UNKNOWN',
            count: row.count
        }));

        const safetyScatter = safetyScatterRaw
            .reverse()
            .map((row) => ({
                x: parseFloat(row.Min_Dist) || 0,
                y: parseFloat(row.Safety_Pct) || 0,
                danger: parseFloat(row.Danger) || 0
            }));

        const threatSourceBreakdown = threatSourceRaw.map((row) => ({
            label: row._id,
            count: row.count
        }));

        const aggressionTimeline = aggressionTimelineRaw
            .reverse()
            .map((row, idx) => ({
                frame: idx + 1,
                value: parseFloat(row.Aggression_Score) || 0
            }));

        res.json({
            totalFrames,
            dangerDistribution,
            statusFrequency,
            steeringDistribution,
            safetyScatter,
            threatSourceBreakdown,
            aggressionTimeline
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/analytics/r-insights', async (req, res) => {
    try {
        const latestSession = await SessionSummary.findOne().sort({ sessionDate: -1 }).lean();
        const statusBreakdown = await AdasData.aggregate([
            { $group: { _id: "$Status_Label", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const safeDivide = (numerator, denominator) => {
            if (!denominator || denominator <= 0) return 0;
            return numerator / denominator;
        };

        const totalFrames = latestSession?.totalFrames || 0;
        const criticalFrameRate = safeDivide(latestSession?.totalCriticalRisk || 0, totalFrames) * 100;
        const modelAlertRate = safeDivide(latestSession?.sparkPredictedAnomalies || 0, totalFrames) * 100;
        const hardManeuverRate = safeDivide((latestSession?.hardTurns || 0) + (latestSession?.criticalBrakes || 0), totalFrames) * 100;

        const derivedMetrics = {
            sessionSafetyPct: latestSession?.avgSafetyPct || 0,
            avgAggressionScore: latestSession?.avgAggressionScore || 0,
            avgRearDistanceCm: latestSession?.avgRearThreat || 0,
            criticalFrameRate,
            modelAlertRate,
            hardManeuverRate,
            totalFrames,
            topStatusLabel: statusBreakdown[0]?._id || 'UNKNOWN',
            topStatusCount: statusBreakdown[0]?.count || 0
        };

        const response = {
            latestSession: latestSession || null,
            totalFramesStored: await AdasData.countDocuments(),
            topStatuses: statusBreakdown,
            metrics: derivedMetrics
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Provide PySpark model metadata + latest live-session inference metrics
router.get('/insights', async (req, res) => {
    try {
        const latestSession = await SessionSummary.findOne().sort({ sessionDate: -1 }).lean();

        const totalFrames = latestSession?.totalFrames || 0;
        const highRiskFrames = latestSession?.sparkPredictedAnomalies || 0;
        const criticalFrames = latestSession?.totalCriticalRisk || 0;
        const safeDivide = (numerator, denominator) => (denominator > 0 ? numerator / denominator : 0);

        const response = {
            model: {
                name: 'RandomForestClassifier',
                library: 'PySpark MLlib',
                mode: 'Batch inference on session frames',
                trainingConfig: {
                    numTrees: 20,
                    maxDepth: 10,
                    labelColumn: 'Danger',
                    featureColumn: 'features',
                    highRiskRule: 'prediction >= 3'
                },
                featuresUsed: ['FL', 'FR', 'BL', 'BR', 'Steering_Angle', 'Aggression_Score']
            },
            liveSession: latestSession
                ? {
                    available: true,
                    sessionDate: latestSession.sessionDate,
                    totalFrames,
                    highRiskFrames,
                    highRiskRatePct: Number((safeDivide(highRiskFrames, totalFrames) * 100).toFixed(2)),
                    criticalFrames,
                    criticalRatePct: Number((safeDivide(criticalFrames, totalFrames) * 100).toFixed(2)),
                    avgAggressionScore: Number((latestSession.avgAggressionScore || 0).toFixed(2)),
                    avgSafetyPct: Number((latestSession.avgSafetyPct || 0).toFixed(2))
                }
                : {
                    available: false
                }
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;