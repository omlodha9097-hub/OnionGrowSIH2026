const User = require('./models/User');
const GradingBatch = require('./models/GradingBatch');
const MandiPriceHistory = require('./models/MandiPriceHistory');
const { generateBlockchainHash } = require('./services/blockchainReceipt');
const { isMongoConnected, memoryStore } = require('./services/dbFallback');

const sampleFarmers = [
  { userId: 'FARM_101', name: 'Ramesh V. Patil', phoneNumber: '+91 98220 11234', village: 'Manchar, Pune', acres: 5.5, role: 'farmer', preferredLanguage: 'mr' },
  { userId: 'FARM_102', name: 'Suresh D. Shinde', phoneNumber: '+91 98221 22345', village: 'Khed, Pune', acres: 4.0, role: 'farmer', preferredLanguage: 'mr' },
  { userId: 'FARM_103', name: 'Ganesh M. Bhosale', phoneNumber: '+91 98222 33456', village: 'Lasalgaon, Nashik', acres: 8.2, role: 'farmer', preferredLanguage: 'hi' },
  { userId: 'FARM_104', name: 'Prakash B. Jadhav', phoneNumber: '+91 98223 44567', village: 'Pimpalgaon, Nashik', acres: 6.0, role: 'farmer', preferredLanguage: 'mr' },
  { userId: 'FARM_105', name: 'Sunita K. Deshmukh', phoneNumber: '+91 98224 55678', village: 'Rahuri, Ahmednagar', acres: 3.5, role: 'farmer', preferredLanguage: 'mr' },
  { userId: 'FARM_106', name: 'Anilkumar P. Pawar', phoneNumber: '+91 98225 66789', village: 'Sangamner, Ahmednagar', acres: 7.0, role: 'farmer', preferredLanguage: 'hi' },
  { userId: 'FARM_107', name: 'Vijay R. More', phoneNumber: '+91 98226 77890', village: 'Pandharpur, Solapur', acres: 4.8, role: 'farmer', preferredLanguage: 'mr' },
  { userId: 'FARM_108', name: 'Sachin T. Gaikwad', phoneNumber: '+91 98227 88901', village: 'Baramati, Pune', acres: 9.0, role: 'farmer', preferredLanguage: 'mr' },
  { userId: 'FARM_109', name: 'Mahesh C. Kulkarni', phoneNumber: '+91 98228 99012', village: 'Narayangaon, Pune', acres: 5.0, role: 'farmer', preferredLanguage: 'en' },
  { userId: 'FARM_110', name: 'Dnyaneshwar N. Thorat', phoneNumber: '+91 98229 00123', village: 'Sinnar, Nashik', acres: 6.5, role: 'farmer', preferredLanguage: 'mr' }
];

const sampleInspector = {
  userId: 'INS_001', name: 'Officer V. K. Deshmukh', phoneNumber: '+91 99000 11111', role: 'inspector', preferredLanguage: 'en'
};

const sampleAdmin = {
  userId: 'ADMIN_001', name: 'Director A. K. Verma (APMC Board)', phoneNumber: '+91 99000 22222', role: 'admin', preferredLanguage: 'en'
};

const sampleBatchesData = [
  { farmerId: 'FARM_101', farmerName: 'Ramesh V. Patil', quantity: 30.0, score: 94, grade: 'Grade A', status: 'Paid', defects: { healthy: 9, damaged: 0, rotten: 0, sprouted: 0, undersized: 1, discolored: 0 }, sizes: { small: 1, medium: 6, large: 3 } },
  { farmerId: 'FARM_101', farmerName: 'Ramesh V. Patil', quantity: 22.5, score: 82, grade: 'URS', status: 'Approved', defects: { healthy: 6, damaged: 1, rotten: 0, sprouted: 1, undersized: 1, discolored: 1 }, sizes: { small: 2, medium: 5, large: 3 } },
  { farmerId: 'FARM_102', farmerName: 'Suresh D. Shinde', quantity: 18.0, score: 91, grade: 'Grade A', status: 'Paid', defects: { healthy: 8, damaged: 0, rotten: 0, sprouted: 0, undersized: 0, discolored: 1 }, sizes: { small: 0, medium: 5, large: 4 } },
  { farmerId: 'FARM_103', farmerName: 'Ganesh M. Bhosale', quantity: 45.0, score: 96, grade: 'Grade A', status: 'Paid', defects: { healthy: 11, damaged: 0, rotten: 0, sprouted: 0, undersized: 0, discolored: 0 }, sizes: { small: 0, medium: 4, large: 7 } },
  { farmerId: 'FARM_104', farmerName: 'Prakash B. Jadhav', quantity: 35.0, score: 76, grade: 'URS', status: 'Approved', defects: { healthy: 5, damaged: 2, rotten: 0, sprouted: 1, undersized: 2, discolored: 0 }, sizes: { small: 3, medium: 5, large: 2 } },
  { farmerId: 'FARM_105', farmerName: 'Sunita K. Deshmukh', quantity: 15.0, score: 55, grade: 'Rejected', status: 'Disputed', defects: { healthy: 2, damaged: 2, rotten: 3, sprouted: 2, undersized: 1, discolored: 0 }, sizes: { small: 3, medium: 4, large: 3 } },
  { farmerId: 'FARM_106', farmerName: 'Anilkumar P. Pawar', quantity: 40.0, score: 92, grade: 'Grade A', status: 'Approved', defects: { healthy: 9, damaged: 1, rotten: 0, sprouted: 0, undersized: 0, discolored: 0 }, sizes: { small: 1, medium: 6, large: 3 } },
  { farmerId: 'FARM_107', farmerName: 'Vijay R. More', quantity: 28.0, score: 85, grade: 'URS', status: 'Paid', defects: { healthy: 7, damaged: 1, rotten: 0, sprouted: 1, undersized: 1, discolored: 0 }, sizes: { small: 2, medium: 5, large: 3 } },
  { farmerId: 'FARM_108', farmerName: 'Sachin T. Gaikwad', quantity: 50.0, score: 95, grade: 'Grade A', status: 'Paid', defects: { healthy: 12, damaged: 0, rotten: 0, sprouted: 0, undersized: 0, discolored: 1 }, sizes: { small: 0, medium: 6, large: 7 } },
  { farmerId: 'FARM_109', farmerName: 'Mahesh C. Kulkarni', quantity: 24.0, score: 88, grade: 'Grade A', status: 'Pending_Verification', defects: { healthy: 8, damaged: 0, rotten: 0, sprouted: 1, undersized: 0, discolored: 0 }, sizes: { small: 1, medium: 5, large: 3 } },
  { farmerId: 'FARM_110', farmerName: 'Dnyaneshwar N. Thorat', quantity: 32.0, score: 79, grade: 'URS', status: 'Pending_Verification', defects: { healthy: 6, damaged: 1, rotten: 0, sprouted: 1, undersized: 2, discolored: 0 }, sizes: { small: 3, medium: 5, large: 2 } }
];

async function seedData() {
  console.log('🌱 Populating Harvest Heist Demo Data...');

  // Populate Users
  const allUsers = [...sampleFarmers, sampleInspector, sampleAdmin];
  for (const u of allUsers) {
    memoryStore.users.set(u.userId, u);
    if (isMongoConnected()) {
      await User.findOneAndUpdate({ userId: u.userId }, u, { upsert: true });
    }
  }

  // Populate Batches
  for (let i = 0; i < sampleBatchesData.length; i++) {
    const data = sampleBatchesData[i];
    const batchId = `BATCH-MH-2026-${(1000 + i)}`;

    const totalDet = Object.values(data.defects).reduce((a, b) => a + b, 0);

    const batchObj = {
      batchId,
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      inspectorId: 'INS_001',
      inspectorName: 'Officer V. K. Deshmukh',
      procurementCenterId: 'APMC_PUNE_CENTRAL',
      procurementCenterName: 'Pune APMC Main Yard',
      quantityQuintals: data.quantity,
      imageUrls: [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=800&auto=format&fit=crop'
      ],
      aiAnalysisResult: {
        totalOnionsDetected: totalDet,
        gradeACount: data.defects.healthy,
        gradeAPercentage: Math.round((data.defects.healthy / totalDet) * 100),
        defectBreakdown: data.defects,
        sizeDistribution: data.sizes,
        qualityScore: data.score,
        suggestedGrade: data.grade,
        finalAssignedGrade: data.grade,
        explanationText: data.grade === 'Grade A' 
          ? `Grade A batch: ${data.defects.healthy} of ${totalDet} onions are premium quality with firm skin.`
          : `Grade B (URS) due to minor damages and size variations.`,
        isDemoModel: true
      },
      status: data.status,
      isOfflineSynced: i % 3 === 0,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      payoutDetails: data.status === 'Paid' ? {
        ratePerQuintal: data.grade === 'Grade A' ? 2125 : 1870,
        totalAmount: Math.round(data.quantity * (data.grade === 'Grade A' ? 2125 : 1870)),
        dbtReference: `DBT-MH-ONION-${Date.now().toString().slice(-6)}-${1000 + i}`,
        paidAt: new Date(Date.now() - i * 43200000)
      } : {}
    };

    const cryptoInfo = generateBlockchainHash(batchObj);
    batchObj.blockchainHash = cryptoInfo.blockchainHash;
    batchObj.qrCodePayload = cryptoInfo.qrCodePayload;

    memoryStore.batches.set(batchId, batchObj);
    if (isMongoConnected()) {
      await GradingBatch.findOneAndUpdate({ batchId }, batchObj, { upsert: true });
    }
  }

  console.log(`✅ Seeded ${allUsers.length} Users and ${sampleBatchesData.length} Grading Batches!`);
}

module.exports = { seedData };

if (require.main === module) {
  seedData().then(() => process.exit(0));
}
