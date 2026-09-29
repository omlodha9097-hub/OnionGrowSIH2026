const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeOnionImage, getModelInfo } = require('../services/aiServiceProxy');
const { generateBlockchainHash } = require('../services/blockchainReceipt');
const GradingBatch = require('../models/GradingBatch');
const User = require('../models/User');
const { isMongoConnected, memoryStore } = require('../services/dbFallback');

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max file
});

const emitSocketProgress = (req, step, message, progressPct) => {
  if (req.app.get('io')) {
    req.app.get('io').emit('grading_progress', { step, message, progressPct });
  }
};

/**
 * POST /api/analyze & POST /api/v1/grading/analyze
 * Directly processes uploaded image using Python real YOLO AI microservice.
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
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

/**
 * GET /api/model-info & GET /api/v1/grading/model-info
 * Returns real YOLO model metadata & evaluation metrics.
 */
router.get('/model-info', async (req, res) => {
  try {
    const info = await getModelInfo();
    return res.json(info);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/v1/grading/submit-batch
 */
router.post('/submit-batch', upload.single('image'), async (req, res) => {
  try {
    const { farmerId = 'FARM_101', farmerName = 'Ramesh Patil', quantityQuintals = 25.0, isOfflineSynced = false } = req.body;
    
    emitSocketProgress(req, 'preprocessing', 'Preprocessing onion batch image (Color space conversion & HSV normalization)...', 15);
    
    const fileBuffer = req.file ? req.file.buffer : Buffer.from('mock_image');
    const filename = req.file ? req.file.originalname : 'onion_batch.jpg';

    console.log(`🔬 [NODE DEV LOG] /submit-batch -> File: ${filename}, Size: ${fileBuffer.length} bytes`);
    emitSocketProgress(req, 'detecting', 'Running Real YOLO Computer Vision object detection...', 35);
    
    const aiResult = await analyzeOnionImage(fileBuffer, filename);
    console.log(`🔬 [NODE DEV LOG] AI Result -> error: ${aiResult.error || 'None'}, onions: ${aiResult.totalOnionsDetected}, grade: ${aiResult.grade || aiResult.finalAssignedGrade}`);
    
    if (aiResult.error || aiResult.totalOnionsDetected === 0 || aiResult.total_onions === 0 || aiResult.is_onion_valid === false) {
      return res.status(400).json({
        success: false,
        error: aiResult.error || 'Error: Onions not detected. Please position onion batch within the scanning reticle.'
      });
    }

    emitSocketProgress(req, 'analyzing_defects', 'Classifying onion defects (Rotten, Sprouted, Damaged, Discolored)...', 60);
    emitSocketProgress(req, 'size_estimation', 'Calculating millimeter diameter & bucket sizing (Small/Medium/Large)...', 80);

    const batchId = `BATCH-MH-${Date.now().toString().slice(-6)}`;
    
    let imageUrl = 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=800&auto=format&fit=crop';
    if (req.file) {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newBatch = {
      batchId,
      farmerId,
      farmerName,
      inspectorId: 'INS_001',
      inspectorName: 'Officer V. K. Deshmukh',
      procurementCenterId: 'APMC_PUNE_CENTRAL',
      procurementCenterName: 'Pune APMC Main Yard',
      quantityQuintals: parseFloat(quantityQuintals),
      imageUrls: [imageUrl],
      aiAnalysisResult: aiResult,
      status: 'Pending_Verification',
      isOfflineSynced: Boolean(isOfflineSynced === 'true' || isOfflineSynced === true),
      offlineSyncedAt: isOfflineSynced ? new Date() : null,
      createdAt: new Date().toISOString()
    };

    const cryptoHashData = generateBlockchainHash(newBatch);
    newBatch.blockchainHash = cryptoHashData.blockchainHash;
    newBatch.qrCodePayload = cryptoHashData.qrCodePayload;

    emitSocketProgress(req, 'generating_report', 'Generating SHA-256 tamper-evident blockchain receipt & report...', 95);

    if (isMongoConnected()) {
      await GradingBatch.create(newBatch);
      await User.findOneAndUpdate({ userId: farmerId }, { $inc: { totalBatchesSubmitted: 1 } });
    } else {
      memoryStore.batches.set(batchId, newBatch);
    }

    emitSocketProgress(req, 'complete', 'Grading analysis complete!', 100);

    return res.status(201).json({
      success: true,
      message: 'Batch graded successfully',
      batch: newBatch
    });
  } catch (err) {
    console.error('Error submitting batch:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/grading/batches
 */
router.get('/batches', async (req, res) => {
  try {
    const { grade, status, farmerId } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (grade) query['aiAnalysisResult.finalAssignedGrade'] = grade;
      if (status) query.status = status;
      if (farmerId) query.farmerId = farmerId;

      const list = await GradingBatch.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: list.length, batches: list });
    } else {
      let list = Array.from(memoryStore.batches.values());
      if (grade) list = list.filter(b => b.aiAnalysisResult.finalAssignedGrade === grade);
      if (status) list = list.filter(b => b.status === status);
      if (farmerId) list = list.filter(b => b.farmerId === farmerId);
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, count: list.length, batches: list });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/grading/batches/:batchId
 */
router.get('/batches/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    if (isMongoConnected()) {
      const batch = await GradingBatch.findOne({ batchId });
      if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
      return res.json({ success: true, batch });
    } else {
      const batch = memoryStore.batches.get(batchId);
      if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
      return res.json({ success: true, batch });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/grading/history/:farmerId
 */
router.get('/history/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    if (isMongoConnected()) {
      const batches = await GradingBatch.find({ farmerId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: batches.length, batches });
    } else {
      const list = Array.from(memoryStore.batches.values())
        .filter(b => b.farmerId === farmerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, count: list.length, batches: list });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
