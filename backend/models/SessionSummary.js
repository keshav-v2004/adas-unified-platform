const mongoose = require('mongoose');

const sessionSummarySchema = new mongoose.Schema({
    sessionDate: { type: Date, default: Date.now },
    totalFrames: { type: Number, required: true },
    avgSafetyPct: { type: Number, required: true },
    sparkPredictedAnomalies: { type: Number, required: true },
    totalCriticalRisk: { type: Number, required: true },
    avgRearThreat: { type: Number, required: true }
});

module.exports = mongoose.model('SessionSummary', sessionSummarySchema);