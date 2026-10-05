const express = require('express');
const router = express.Router();
const GradingBatch = require('../models/GradingBatch');
const User = require('../models/User');
const { calculatePayout } = require('../services/paymentSimulator');
const { isMongoConnected, memoryStore } = require('../services/dbFallback');

/**
 * PATCH /api/v1/admin/verify-batch/:batchId
 * Allows Procurement Officer to verify/override grade & trigger MSP payout
 */
const handleVerifyBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { overrideGrade, assignedGrade, inspectorNotes, notes, status = 'Approved' } = req.body;

    let targetBatch = null;

    if (isMongoConnected()) {
      targetBatch = await GradingBatch.findOne({ batchId });
    } else {
      targetBatch = memoryStore.batches.get(batchId);
    }

    if (!targetBatch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const finalGrade = overrideGrade || assignedGrade || targetBatch.aiAnalysisResult.finalAssignedGrade;
    targetBatch.aiAnalysisResult.finalAssignedGrade = finalGrade;
    targetBatch.status = status;
    if (inspectorNotes || notes) targetBatch.inspectorNotes = inspectorNotes || notes;

    // Trigger MSP/DBT Payout calculation if approved
    if (status === 'Approved' || status === 'Paid') {
      const payout = calculatePayout(targetBatch.quantityQuintals, finalGrade);
      targetBatch.payoutDetails = payout;
      targetBatch.status = 'Paid';
    }

    if (isMongoConnected()) {
      await targetBatch.save();
    } else {
      memoryStore.batches.set(batchId, targetBatch);
    }

    return res.json({
      success: true,
      message: `Batch ${batchId} verified & MSP payout calculated`,
      batch: targetBatch
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

router.patch('/verify-batch/:batchId', handleVerifyBatch);
router.post('/verify-batch/:batchId', handleVerifyBatch);
router.post('/batches/:batchId/override', handleVerifyBatch);

/**
 * GET /api/v1/admin/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    let batches = [];
    if (isMongoConnected()) {
      batches = await GradingBatch.find({});
    } else {
      batches = Array.from(memoryStore.batches.values());
    }

    const totalBatches = batches.length;
    let totalOnionsInspected = 0;
    let gradeACount = 0;
    let ursCount = 0;
    let rejectedCount = 0;
    let totalScoreSum = 0;

    const defectBreakdown = {
      Healthy: 0, Damaged: 0, Rotten: 0, Sprouted: 0, Undersized: 0, Discolored: 0
    };

    let totalPayoutCalculated = 0;

    batches.forEach(b => {
      const res = b.aiAnalysisResult || {};
      totalOnionsInspected += (res.totalOnionsDetected || 0);
      totalScoreSum += (res.qualityScore || 80);

      const grade = res.finalAssignedGrade || 'Grade A';
      if (grade === 'Grade A') gradeACount++;
      else if (grade === 'URS') ursCount++;
      else if (grade === 'Rejected') rejectedCount++;

      const defects = res.defectBreakdown || {};
      Object.keys(defects).forEach(k => {
        const keyCap = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
        if (defectBreakdown[keyCap] !== undefined) {
          defectBreakdown[keyCap] += defects[k];
        }
      });

      if (b.payoutDetails && b.payoutDetails.totalAmount) {
        totalPayoutCalculated += b.payoutDetails.totalAmount;
      }
    });

    const averageQualityScore = totalBatches > 0 ? Math.round(totalScoreSum / totalBatches) : 88;

    return res.json({
      success: true,
      analytics: {
        totalBatches,
        totalOnionsInspected,
        gradeDistribution: {
          gradeA: gradeACount,
          urs: ursCount,
          rejected: rejectedCount
        },
        defectBreakdown,
        averageQualityScore,
        totalPayoutCalculated,
        activeMandiCenters: 6
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/admin/farmers
 */
router.get('/farmers', async (req, res) => {
  try {
    let farmersList = [];
    if (isMongoConnected()) {
      farmersList = await User.find({ role: 'farmer' });
    } else {
      farmersList = Array.from(memoryStore.users.values()).filter(u => u.role === 'farmer');
    }

    return res.json({
      success: true,
      count: farmersList.length,
      farmers: farmersList
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
