const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const { connectDB } = require('../backend/src/services/dbFallback');
const { seedData } = require('../backend/src/seed');

const gradingRoutes = require('../backend/src/routes/gradingRoutes');
const adminRoutes = require('../backend/src/routes/adminRoutes');
const marketRoutes = require('../backend/src/routes/marketRoutes');
const slotRoutes = require('../backend/src/routes/slotRoutes');
const { analyzeOnionImage, getModelInfo } = require('../backend/src/services/aiServiceProxy');

const app = express();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

// Lazy initialize DB & Seed Data on Serverless Cold Start
let isSeeded = false;
async function ensureDbSeeded(req, res, next) {
  if (!isSeeded) {
    try {
      await connectDB();
      await seedData();
      isSeeded = true;
    } catch (err) {
      console.error('Failed to seed DB on serverless init:', err);
    }
  }
  next();
}

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(ensureDbSeeded);

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Harvest Heist Backend API (Vercel Serverless)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Direct API Routes
app.post(['/analyze', '/api/analyze'], upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }
    const result = await analyzeOnionImage(req.file.buffer, req.file.originalname);
    if (result.error) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get(['/model-info', '/api/model-info'], async (req, res) => {
  try {
    const info = await getModelInfo();
    return res.json(info);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Versioned Routes (/api/v1/ and /v1/)
app.use(['/api/v1/grading', '/v1/grading'], gradingRoutes);
app.use(['/api/v1/admin', '/v1/admin'], adminRoutes);
app.use(['/api/v1/market', '/v1/market'], marketRoutes);
app.use(['/api/v1/slots', '/v1/slots'], slotRoutes);

module.exports = app;
