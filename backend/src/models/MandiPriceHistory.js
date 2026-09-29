const mongoose = require('mongoose');

const MandiPriceHistorySchema = new mongoose.Schema({
  centerId: { type: String, required: true },
  centerName: { type: String, required: true },
  region: { type: String, default: 'Maharashtra' },
  date: { type: String, required: true },
  modalPricePerQuintal: { type: Number, required: true }, // e.g. 2150 INR
  minPricePerQuintal: { type: Number },
  maxPricePerQuintal: { type: Number },
  congestionLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  arrivalVolumeTons: { type: Number, default: 450 },
  forecastedNextWeekPrice: { type: Number, default: 2280 },
  recommendation: { type: String, default: 'Optimal window to sell within 48h' }
}, { timestamps: true });

module.exports = mongoose.model('MandiPriceHistory', MandiPriceHistorySchema);
