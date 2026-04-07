const mongoose = require('mongoose');

const sessionSummarySchema = new mongoose.Schema({
    sessionDate: { type: Date, default: Date.now },
    totalFrames: { type: Number, required: true },
    avgSafetyPct: { type: Number, required: true },
    sparkPredictedAnomalies: { type: Number, required: true },
    totalCriticalRisk: { type: Number, required: true },
    avgRearThreat: { type: Number, required: true },
    // --- NEW FIELDS FOR THE DASHBOARD ---
    avgAggressionScore: { type: Number, default: 0 },
    hardTurns: { type: Number, default: 0 },
    criticalBrakes: { type: Number, default: 0 }
});

module.exports = mongoose.model('SessionSummary', sessionSummarySchema);