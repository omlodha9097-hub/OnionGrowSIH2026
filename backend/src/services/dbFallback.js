const mongoose = require('mongoose');

// In-memory cache fallback for instant demo startup without external MongoDB dependencies
const memoryStore = {
  users: new Map(),
  batches: new Map(),
  mandiPrices: new Map()
};

let isConnectedToMongo = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/harvest_heist';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    isConnectedToMongo = true;
    console.log('✅ Connected to MongoDB server');
  } catch (err) {
    isConnectedToMongo = false;
    console.log('⚠️ Local MongoDB not detected. Running in Instant Demo In-Memory Database mode.');
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isConnectedToMongo,
  memoryStore
};
