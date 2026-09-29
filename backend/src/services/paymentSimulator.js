/**
 * Harvest Heist - Simulated Price Stabilization Fund & Direct Benefit Transfer (DBT)
 */

const BASE_MSP_RATE_PER_QUINTAL = 2125; // ₹2,125 / quintal baseline

function calculatePayout(quantityQuintals, grade) {
  let multiplier = 1.0;
  if (grade === 'URS') {
    multiplier = 0.88;
  } else if (grade === 'Rejected') {
    multiplier = 0.0;
  }

  const ratePerQuintal = Math.round(BASE_MSP_RATE_PER_QUINTAL * multiplier);
  const totalAmount = Math.round(quantityQuintals * ratePerQuintal);

  const dbtReference = `DBT-MH-ONION-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    ratePerQuintal,
    totalAmount,
    dbtReference,
    paidAt: new Date(),
    status: 'Paid'
  };
}

module.exports = {
  calculatePayout,
  BASE_MSP_RATE_PER_QUINTAL
};
