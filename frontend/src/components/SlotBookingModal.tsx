import React, { useState } from 'react';
import { SmartReceiptQR } from './SmartReceiptQR';

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName?: string;
  farmerId?: string;
  onBookingSuccess?: (booking: any) => void;
}

export const SlotBookingModal: React.FC<SlotBookingModalProps> = ({
  isOpen,
  onClose,
  farmerName = 'Ramesh V. Patil',
  farmerId = 'FARM_101',
  onBookingSuccess
}) => {
  const [center, setCenter] = useState('Lasalgaon APMC Mandi, Nashik');
  const [date, setDate] = useState('2026-10-02');
  const [slotTime, setSlotTime] = useState('10:00 AM - 12:00 PM');
  const [quantity, setQuantity] = useState(25);
  const [vehicleNo, setVehicleNo] = useState('MH 15 AB 4821');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [tokenId, setTokenId] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `NAFED-SLOT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTokenId(token);
    setBookingConfirmed(true);

    if (onBookingSuccess) {
      onBookingSuccess({
        tokenId: token,
        farmerId,
        farmerName,
        center,
        date,
        slotTime,
        vehicleNo,
        quantity
      });
    }
  };

  const handleReset = () => {
    setBookingConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-300 dark:border-slate-700 max-w-lg w-full overflow-hidden text-slate-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide block">
              Official Government Procurement Portal
            </span>
            <h3 className="text-lg font-black text-white">NAFED Smart Procurement Slot Reservation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-black text-xl px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!bookingConfirmed ? (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-950 font-black">
                🌾 Official NAFED Procurement Gate Slot Booking • Direct APMC Mandi Fast-Track Pass
              </div>

              {/* Farmer Info */}
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-1">
                  Registered Farmer Details
                </label>
                <input
                  type="text"
                  disabled
                  value={`${farmerName} (${farmerId}) • Aadhaar Verified`}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-white cursor-not-allowed"
                />
              </div>

              {/* Center Selector */}
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-1">
                  Select NAFED Procurement Center / APMC Mandi
                </label>
                <select
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                >
                  <option value="Lasalgaon APMC Mandi, Nashik">Lasalgaon APMC Mandi Yard, Nashik (Hub #01)</option>
                  <option value="Pimpalgaon Baswant Hub, Nashik">Pimpalgaon Baswant Hub, Nashik (Hub #02)</option>
                  <option value="Kalwan Sub-Market Yard">Kalwan Sub-Market Yard (Hub #03)</option>
                  <option value="Yeola Procurement Station">Yeola Procurement Station (Hub #04)</option>
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-1">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-1">
                    Available Time Slot
                  </label>
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Morning Slot)</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Mid-Day Slot)</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon Slot)</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening Slot)</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Vehicle Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-1">
                    Est. Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wide mb-1">
                    Vehicle Registration No.
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="MH 15 AB 4821"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>🎫 Confirm & Book Mandi Gate Pass Token</span>
              </button>
            </form>
          ) : (
            /* Booking Confirmation & QR Code Pass */
            <div className="text-center space-y-4">
              <div className="bg-emerald-100 border-2 border-emerald-500 text-emerald-950 p-4 rounded-xl">
                <span className="text-3xl block mb-1">✅</span>
                <h4 className="font-black text-base">NAFED Mandi Slot Confirmed!</h4>
                <p className="text-xs font-bold mt-1">
                  Mandi Gate Pass Token: <span className="text-emerald-900 underline font-mono text-sm font-black">{tokenId}</span>
                </p>
              </div>

              <div className="flex justify-center my-3 p-4 bg-slate-50 border-2 border-slate-300 rounded-xl">
                <SmartReceiptQR
                  qrData={`https://nafed.gov.in/verify-slot?token=${tokenId}&farmer=${farmerId}&date=${date}&qty=${quantity}`}
                  size={150}
                  caption={`Scan at Mandi Gate • ${tokenId}`}
                />
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-left text-xs space-y-1.5 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-black">
                <p>📍 <span className="text-slate-600 dark:text-slate-300 font-bold">Center:</span> {center}</p>
                <p>📅 <span className="text-slate-600 dark:text-slate-300 font-bold">Date & Time:</span> {date} | {slotTime}</p>
                <p>🚛 <span className="text-slate-600 dark:text-slate-300 font-bold">Vehicle & Lot:</span> {vehicleNo} ({quantity} Quintals)</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  🖨️ Print Token Pass
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
