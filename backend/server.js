const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const adasRoutes = require('./routes/adasRoutes');

const app = express();

// UPDATED: Allow Vite frontend to talk to this API
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost'], // 5173 for local dev, 80 for Docker prod
    credentials: true
}));

app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/adas_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Register Routes
app.use('/api/adas', adasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`🧠 Connected to ML Engine at: ${process.env.ML_SERVICE_URL || 'Not configured'}`);
});