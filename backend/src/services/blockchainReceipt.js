const crypto = require('crypto');

/**
 * Creates a tamper-evident cryptographic SHA-256 hash for a batch report.
 */
function generateBlockchainHash(batchData) {
  const payloadStr = JSON.stringify({
    batchId: batchData.batchId,
    farmerId: batchData.farmerId,
    quantity: batchData.quantityQuintals,
    score: batchData.qualityScore,
    grade: batchData.finalAssignedGrade,
    timestamp: batchData.createdAt || new Date().toISOString(),
    apmcCenter: batchData.procurementCenterId,
    authority: 'Ministry of Consumer Affairs & NAFED India'
  });

  const hash = crypto.createHash('sha256').update(payloadStr).digest('hex');
  
  const qrPayload = JSON.stringify({
    bId: batchData.batchId,
    fId: batchData.farmerId,
    grd: batchData.finalAssignedGrade,
    scr: batchData.qualityScore,
    hash: hash.substring(0, 16),
    ts: new Date().toISOString()
  });

  return {
    blockchainHash: `0x${hash}`,
    qrCodePayload: qrPayload
  };
}

module.exports = {
  generateBlockchainHash
};
