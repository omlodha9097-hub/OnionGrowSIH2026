const mongoose = require('mongoose');

const GradingBatchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, index: true },
  farmerId: { type: String, required: true, ref: 'User' },
  farmerName: { type: String, default: 'Ramesh Patil' },
  inspectorId: { type: String, default: 'INS_001' },
  inspectorName: { type: String, default: 'Officer V. K. Deshmukh' },
  procurementCenterId: { type: String, default: 'APMC_PUNE_CENTRAL' },
  procurementCenterName: { type: String, default: 'Pune APMC Main Yard' },
  quantityQuintals: { type: Number, default: 25.0 },
  imageUrls: [{ type: String }],
  
  aiAnalysisResult: {
    totalOnionsDetected: { type: Number, default: 0 },
    gradeACount: { type: Number, default: 0 },
    gradeAPercentage: { type: Number, default: 0 },
    defectBreakdown: {
      healthy: { type: Number, default: 0 },
      damaged: { type: Number, default: 0 },
      rotten: { type: Number, default: 0 },
      sprouted: { type: Number, default: 0 },
      undersized: { type: Number, default: 0 },
      discolored: { type: Number, default: 0 }
    },
    sizeDistribution: {
      small: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      large: { type: Number, default: 0 }
    },
    qualityScore: { type: Number, default: 85 },
    suggestedGrade: { type: String, enum: ['Grade A', 'URS', 'Rejected'], default: 'Grade A' },
    finalAssignedGrade: { type: String, enum: ['Grade A', 'URS', 'Rejected'], default: 'Grade A' },
    detectedOnions: [{ type: mongoose.Schema.Types.Mixed }],
    explanationText: { type: String, default: '' },
    isDemoModel: { type: Boolean, default: true }
  },

  blockchainHash: { type: String, required: true },
  qrCodePayload: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending_Verification', 'Approved', 'Disputed', 'Paid'], 
    default: 'Pending_Verification' 
  },
  isOfflineSynced: { type: Boolean, default: false },
  offlineSyncedAt: { type: Date },
  
  payoutDetails: {
    ratePerQuintal: { type: Number, default: 2125 },
    totalAmount: { type: Number, default: 0 },
    dbtReference: { type: String, default: '' },
    paidAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('GradingBatch', GradingBatchSchema);
