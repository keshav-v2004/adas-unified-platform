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

router.get('/analytics/r-insights', async (req, res) => {
    try {
        const latestSession = await SessionSummary.findOne().sort({ sessionDate: -1 }).lean();
        const statusBreakdown = await AdasData.aggregate([
            { $group: { _id: "$Status_Label", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const response = {
            latestSession: latestSession || null,
            totalFramesStored: await AdasData.countDocuments(),
            topStatuses: statusBreakdown
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Provide static metadata for the PySpark UI tab
router.get('/insights', (req, res) => {
    res.json({
        model_type: "RandomForestClassifier (Pre-trained)",
        accuracy: "96.4",
        features_used: ["FL", "FR", "BL", "BR", "Steering_Angle", "Aggression_Score"]
    });
});

module.exports = router;