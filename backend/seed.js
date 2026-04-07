const mongoose = require('mongoose');
const SessionSummary = require('./models/SessionSummary');

// Hardcoding the exact Docker network path and database name
const MONGO_URI = 'mongodb://mongo:27017/adas_db';

async function seedDatabase() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        
        // This line tells us EXACTLY which database it opened
        console.log("✅ Connected to Database:", mongoose.connection.name);

        console.log("🧹 Clearing old data...");
        await SessionSummary.deleteMany({});

        console.log("🌱 Generating 50 historical sessions...");
        const dummySessions = [];

        for (let i = 0; i < 50; i++) {
            dummySessions.push({
                // Generates random dates over the last few months
                sessionDate: new Date(Date.now() - Math.random() * 10000000000), 
                totalFrames: Math.floor(Math.random() * 500) + 120,
                avgSafetyPct: (Math.random() * 30) + 70, // Random safety between 70% and 100%
                sparkPredictedAnomalies: Math.floor(Math.random() * 4),
                totalCriticalRisk: Math.floor(Math.random() * 3),
                avgRearThreat: (Math.random() * 100) + 250
            });
        }

        await SessionSummary.insertMany(dummySessions);
        console.log(`🎉 SUCCESS! 50 sessions injected directly into adas_db -> sessionsummaries`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    }
}

seedDatabase();