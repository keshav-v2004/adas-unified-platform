const mongoose = require('mongoose');
const SessionSummary = require('./models/SessionSummary');

const MONGO_URI = 'mongodb://127.0.0.1:27017/adas_db';

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        await SessionSummary.deleteMany({}); // Clear old incomplete data

        const dummySessions = [];
        for (let i = 0; i < 50; i++) {
            dummySessions.push({
                sessionDate: new Date(Date.now() - Math.random() * 10000000000), 
                totalFrames: 120,
                avgSafetyPct: (Math.random() * 30) + 70,
                sparkPredictedAnomalies: Math.floor(Math.random() * 4),
                totalCriticalRisk: Math.floor(Math.random() * 3),
                avgRearThreat: (Math.random() * 100) + 250,
                // --- NEW RICH DATA ---
                avgAggressionScore: (Math.random() * 40) + 10, // Score between 10 and 50
                hardTurns: Math.floor(Math.random() * 6),      // 0 to 5 hard turns per session
                criticalBrakes: Math.floor(Math.random() * 4)  // 0 to 3 critical brakes
            });
        }

        await SessionSummary.insertMany(dummySessions);
        console.log(`🎉 SUCCESS! Rich dashboard data injected into adas_db.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seedDatabase();