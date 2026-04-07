const express = require('express');
const router = express.Router();
const axios = require('axios');
const SessionSummary = require('../models/SessionSummary');

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
        
        // 1. Send the 120 frames to Flask for R & PySpark processing
        const response = await axios.post(`${mlUrl}/process-session`, {
            data: currentSessionData
        });

        const finalData = response.data.results;

        // 2. Calculate final KPIs from the Spark output
        const criticalRiskCount = finalData.filter(d => d.Engineered_Status === 'CRITICAL RISK').length;
        const avgRearThreat = finalData.reduce((acc, curr) => acc + parseFloat(curr.Rear_Threat || 0), 0) / finalData.length;
        const mlPredictedCollisions = finalData.filter(d => parseFloat(d.prediction) >= 3).length;
        
        // Calculate basic safety average from the raw React data
        const avgSafety = currentSessionData.reduce((acc, curr) => acc + parseFloat(curr.Safety_Pct || 0), 0) / currentSessionData.length;

        engineeredSessionKpis = {
            totalFrames: finalData.length,
            avgSafetyPct: avgSafety,
            sparkPredictedAnomalies: mlPredictedCollisions,
            totalCriticalRisk: criticalRiskCount,
            avgRearThreat: avgRearThreat
        };

        // 3. Save to MongoDB for historical fleet analytics
        const newSessionRecord = new SessionSummary(engineeredSessionKpis);
        await newSessionRecord.save();
        
        res.json({ message: "Pipelines executed and saved to MongoDB", kpis: engineeredSessionKpis });

    } catch (err) { 
        console.error("ML Pipeline Error:", err.message);
        res.status(500).json({ error: 'Failed to process ML pipeline' }); 
    }
});

// --- 3. FETCH METRICS FOR REACT DASHBOARD ---
router.get('/analytics/session', (req, res) => {
    if (!engineeredSessionKpis) return res.status(404).json({ message: "No session data yet." });
    res.json(engineeredSessionKpis);
});

router.get('/analytics/kpis', async (req, res) => {
    try {
        // Fetch long-term averages across all saved sessions
        const fleetAverages = await SessionSummary.aggregate([
            { $group: { 
                _id: null, 
                avgSafety: { $avg: "$avgSafetyPct" }, 
                totalAnomalies: { $sum: "$sparkPredictedAnomalies" },
                totalSessions: { $sum: 1 }
            }}
        ]);
        
        res.json(fleetAverages[0] || { avgSafety: 0, totalAnomalies: 0, totalSessions: 0 });
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