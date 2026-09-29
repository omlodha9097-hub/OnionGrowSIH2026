const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { memoryStore } = require('../services/dbFallback');

// In-memory slot capacity & booking store (backed by memoryStore)
if (!memoryStore.slotBookings) {
  memoryStore.slotBookings = new Map();
}
if (!memoryStore.slotCapacities) {
  memoryStore.slotCapacities = new Map();
}

// Seed default booking if empty
if (memoryStore.slotBookings.size === 0) {
  const seedDate = new Date().toISOString().split('T')[0];
  const seedQrPayload = JSON.stringify({
    token: 'TOK-2026-PN-889',
    farmer: 'Ramesh Patil',
    center: 'Pune APMC Main Yard',
    date: seedDate,
    time: '09:30 AM - 11:00 AM',
    counter: 'Counter #4',
    quantity: '25 Qtl'
  });
  const seedHash = crypto.createHash('sha256').update(seedQrPayload).digest('hex');

  const seedBooking = {
    bookingId: 'BOOK_SEED_101',
    tokenId: 'TOK-2026-PN-889',
    farmerId: 'FARM_101',
    farmerName: 'Ramesh Patil',
    farmerPhone: '+91 98220 12345',
    village: 'Khed Shivapur, Pune',
    centerId: 'APMC_PUNE_MAIN',
    centerName: 'Pune APMC Main Yard',
    date: seedDate,
    slotDate: seedDate,
    timeSlotId: 'SLOT_0930_1100',
    timeSlotLabel: '09:30 AM - 11:00 AM',
    slotWindow: '09:30 AM - 11:00 AM',
    allocatedCounter: 'Counter #4',
    counterName: 'Counter #4',
    quantityQuintals: 25,
    estimatedPayout: 53125,
    qrCodePayload: seedQrPayload,
    blockchainHash: seedHash,
    status: 'BOOKED',
    createdAt: new Date().toISOString()
  };
  memoryStore.slotBookings.set(seedBooking.tokenId, seedBooking);
}

// Initial Seed Procurement Centers
const PROCUREMENT_CENTERS = [
  {
    id: 'APMC_PUNE_MAIN',
    name: 'Pune APMC Main Yard',
    district: 'Pune',
    address: 'Khed Shivapur / Market Yard, Pune, Maharashtra',
    activeCounters: 6,
    dailyCapacityQuintals: 1200
  },
  {
    id: 'APMC_LASALGAON',
    name: 'Lasalgaon APMC Yard',
    district: 'Nashik',
    address: 'Niphad Taluka, Lasalgaon, Nashik, Maharashtra',
    activeCounters: 10,
    dailyCapacityQuintals: 2500
  },
  {
    id: 'APMC_SOLAPUR',
    name: 'Solapur APMC Mandi',
    district: 'Solapur',
    address: 'New Paccha Peth, Solapur, Maharashtra',
    activeCounters: 4,
    dailyCapacityQuintals: 800
  },
  {
    id: 'APMC_NASHIK_CENTRAL',
    name: 'Nashik Central Mandi',
    district: 'Nashik',
    address: 'Panchavati, Nashik, Maharashtra',
    activeCounters: 8,
    dailyCapacityQuintals: 1800
  }
];

const TIME_SLOTS_DEF = [
  { id: 'SLOT_0800_0930', label: '08:00 AM - 09:30 AM', windowName: 'Early Morning Slot', maxCapacity: 8 },
  { id: 'SLOT_0930_1100', label: '09:30 AM - 11:00 AM', windowName: 'Peak Morning Slot', maxCapacity: 10 },
  { id: 'SLOT_1100_1230', label: '11:00 AM - 12:30 PM', windowName: 'Midday Slot', maxCapacity: 10 },
  { id: 'SLOT_1400_1530', label: '02:00 PM - 03:30 PM', windowName: 'Afternoon Slot', maxCapacity: 8 },
  { id: 'SLOT_1530_1700', label: '03:30 PM - 05:00 PM', windowName: 'Evening Slot', maxCapacity: 6 }
];

/**
 * GET /api/v1/slots/centers
 */
router.get('/centers', (req, res) => {
  return res.json({
    success: true,
    centers: PROCUREMENT_CENTERS
  });
});

/**
 * GET /api/v1/slots/available?centerId=...&date=...
 */
router.get('/available', (req, res) => {
  const { centerId = 'APMC_PUNE_MAIN', date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const slotsWithCapacity = TIME_SLOTS_DEF.map(slot => {
    const key = `${centerId}_${targetDate}_${slot.id}`;
    const bookedCount = memoryStore.slotCapacities.get(key) || 0;
    const remainingCapacity = Math.max(0, slot.maxCapacity - bookedCount);
    
    return {
      ...slot,
      bookedCount,
      remainingCapacity,
      isAvailable: remainingCapacity > 0
    };
  });

  return res.json({
    success: true,
    centerId,
    date: targetDate,
    slots: slotsWithCapacity
  });
});

/**
 * POST /api/v1/slots/book
 */
router.post('/book', (req, res) => {
  try {
    const {
      farmerId = 'FARM_101',
      farmerName = 'Ramesh Patil',
      farmerPhone = '+91 98220 12345',
      village = 'Khed Shivapur, Pune',
      centerId = 'APMC_PUNE_MAIN',
      centerName = 'Pune APMC Main Yard',
      date,
      timeSlotId = 'SLOT_0930_1100',
      quantityQuintals = 25.0
    } = req.body;

    const targetDate = date || new Date().toISOString().split('T')[0];
    const slotDef = TIME_SLOTS_DEF.find(s => s.id === timeSlotId) || TIME_SLOTS_DEF[1];
    const capKey = `${centerId}_${targetDate}_${slotDef.id}`;

    const currentBooked = memoryStore.slotCapacities.get(capKey) || 0;
    if (currentBooked >= slotDef.maxCapacity) {
      return res.status(400).json({
        success: false,
        error: `Slot window '${slotDef.label}' at ${centerName} is fully booked. Please select an alternative time slot.`
      });
    }

    // Increment booked capacity
    memoryStore.slotCapacities.set(capKey, currentBooked + 1);

    const randomNum = Math.floor(100 + Math.random() * 900);
    const centerCode = centerId.includes('PUNE') ? 'PN' : (centerId.includes('LASAL') ? 'LS' : 'NK');
    const tokenId = `TOK-2026-${centerCode}-${randomNum}`;
    const counterNo = (currentBooked % 6) + 1;

    const qrPayload = JSON.stringify({
      token: tokenId,
      farmer: farmerName,
      center: centerName,
      date: targetDate,
      time: slotDef.label,
      counter: `Counter #${counterNo}`,
      quantity: `${quantityQuintals} Qtl`
    });

    const sha256Hash = crypto.createHash('sha256').update(qrPayload).digest('hex');

    const booking = {
      bookingId: `BOOK_${Date.now()}`,
      tokenId,
      farmerId,
      farmerName,
      farmerPhone,
      village,
      centerId,
      centerName,
      date: targetDate,
      slotDate: targetDate,
      timeSlotId: slotDef.id,
      timeSlotLabel: slotDef.label,
      slotWindow: slotDef.label,
      allocatedCounter: `Counter #${counterNo}`,
      counterName: `Counter #${counterNo}`,
      quantityQuintals: parseFloat(quantityQuintals),
      estimatedPayout: Math.round(parseFloat(quantityQuintals) * 2125), // MSP ₹2,125/Qtl
      qrCodePayload: qrPayload,
      blockchainHash: sha256Hash,
      status: 'BOOKED',
      createdAt: new Date().toISOString()
    };

    memoryStore.slotBookings.set(booking.tokenId, booking);

    return res.status(201).json({
      success: true,
      message: 'Procurement slot booked successfully!',
      booking
    });
  } catch (err) {
    console.error('Error booking slot:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/slots/my-bookings
 */
router.get('/my-bookings', (req, res) => {
  const { farmerId = 'FARM_101' } = req.query;
  const list = Array.from(memoryStore.slotBookings.values())
    .filter(b => b.farmerId === farmerId || !b.farmerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({
    success: true,
    count: list.length,
    bookings: list
  });
});

module.exports = router;
