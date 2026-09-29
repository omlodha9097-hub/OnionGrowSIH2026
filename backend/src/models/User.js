const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['farmer', 'inspector', 'admin'], 
    default: 'farmer' 
  },
  preferredLanguage: { 
    type: String, 
    enum: ['hi', 'mr', 'en'], 
    default: 'en' 
  },
  apmcCenterId: { type: String, default: 'APMC_PUNE_01' },
  village: { type: String, default: 'Manchar, Pune' },
  acres: { type: Number, default: 4.5 },
  totalBatchesSubmitted: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
