const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const { connectDB } = require('./services/dbFallback');
const { seedData } = require('./seed');

const gradingRoutes = require('./routes/gradingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const marketRoutes = require('./routes/marketRoutes');
const slotRoutes = require('./routes/slotRoutes');
const { analyzeOnionImage, getModelInfo } = require('./services/aiServiceProxy');

const app = express();
const server = http.createServer(app);

const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Attach Socket.io to Express App
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Harvest Heist Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Direct API Routes (Top-level & Versioned)
app.post('/api/analyze', upload.single('image'), async (req, res) => {
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

app.get('/api/model-info', async (req, res) => {
  try {
    const info = await getModelInfo();
    return res.json(info);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Versioned Routes (/api/v1/)
app.use('/api/v1/grading', gradingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/slots', slotRoutes);

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('join_farmer_room', (farmerId) => {
    socket.join(`farmer_${farmerId}`);
    console.log(`Farmer joined room: farmer_${farmerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;

// Initialize Database & Start Server
connectDB().then(async () => {
  await seedData();
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Harvest Heist Backend API listening on port ${PORT}`);
    console.log(`📡 Socket.IO real-time server operational`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
