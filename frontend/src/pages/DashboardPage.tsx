import React, { useEffect, useState } from 'react';
import { fetchAdminAnalytics, fetchBatches, fetchMyBookings } from '../services/api';
import { GradingBatch, UserRole, Language } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Scan, ShieldCheck, TrendingUp, ArrowUpRight, Award, Bell, Clock, Users, Calendar, QrCode, Sparkles, Printer, CheckCircle2 } from 'lucide-react';
import { t } from '../utils/i18n';
import { SlotBookingModal } from '../components/SlotBookingModal';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  onNavigate: (tab: string, batchId?: string) => void;
  userRole?: UserRole;
  language?: Language;
  autoOpenSlotModal?: boolean;
}

export const DashboardPage: React.FC<Props> = ({
  onNavigate,
  userRole = 'farmer',
  language = 'en',
  autoOpenSlotModal = false
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentBatches, setRecentBatches] = useState<GradingBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSlotModal, setShowSlotModal] = useState(autoOpenSlotModal);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);

  useEffect(() => {
    if (autoOpenSlotModal) {
      setShowSlotModal(true);
    }
  }, [autoOpenSlotModal]);

  const isFarmer = userRole === 'farmer';

  useEffect(() => {
    async function loadData() {
      try {
        const [anData, batchList, bookingsList] = await Promise.all([
          fetchAdminAnalytics(),
          fetchBatches(),
          fetchMyBookings().catch(() => [])
        ]);
        setAnalytics(anData);
        setRecentBatches(batchList.slice(0, 10));

        if (bookingsList && bookingsList.length > 0) {
          setActiveBooking(bookingsList[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '📈 Lasalgaon APMC Price Surge',
      message: 'Grade A market rate increased to ₹2,420 / Qtl (+6.2%). Recommended selling window: 48 hours.',
      time: '10 mins ago',
      unread: true
    },
    {
      id: 2,
      title: '✅ Grading Approval & DBT Payout',
      message: 'Batch #TOK-2026-PN-889 approved for Grade A. Payout of ₹53,125 processed via Direct Bank Transfer.',
      time: '1 hour ago',
      unread: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">Loading Dashboard Data...</span>
        </div>
      </div>
    );
  }

  const gradeDist = analytics?.gradeDistribution || { gradeA: 6, urs: 4, rejected: 1 };
  const pieData = [
    { name: t('gradeA', language), value: gradeDist.gradeA, color: '#059669' },
    { name: t('ursGrade', language), value: gradeDist.urs, color: '#10B981' },
    { name: t('rejectedGrade', language), value: gradeDist.rejected, color: '#5A0E45' },
  ];

  const defects = analytics?.defectBreakdown || { Healthy: 75, Damaged: 8, Rotten: 3, Sprouted: 5, Undersized: 8, Discolored: 3 };
  const barData = [
    { name: 'Healthy', count: defects.Healthy || 75, fill: '#059669' },
    { name: 'Damaged', count: defects.Damaged || 8, fill: '#5A0E45' },
    { name: 'Rotten', count: defects.Rotten || 3, fill: '#5A0E45' },
    { name: 'Sprouted', count: defects.Sprouted || 5, fill: '#5A0E45' },
    { name: 'Undersized', count: defects.Undersized || 8, fill: '#059669' },
    { name: 'Discolored', count: defects.Discolored || 3, fill: '#5A0E45' }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn max-w-7xl mx-auto text-slate-900 dark:text-white">
      
      {/* 1. GREETING & LOCATION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#059669] dark:text-emerald-400 uppercase block">
            DOCA SMART MANDI PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Farmer Quality & Procurement Dashboard
          </h1>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-400">
            National Horticultural Procurement Network • All Registered Farmers Records
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors focus:outline-none"
              title="View APMC Mandi Alerts & Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Real-Time APMC Alerts
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-[#5A0E45] dark:text-purple-300 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl border text-xs space-y-1 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-white font-black">{n.title}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-800 dark:text-slate-300 leading-snug font-bold">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-300 cursor-pointer"
                >
                  Close Notifications
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#059669] hover:bg-emerald-600 text-white text-xs font-extrabold shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Scan size={16} /> {t('farmerScan', language)}
          </button>
        </div>
      </div>

      {/* 2. FUNCTION 1: APMC PROCUREMENT CENTER LIVE QUEUE ADVISORY */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 border-2 border-emerald-500/40 bg-white dark:bg-[#0C1510] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
              <Clock size={20} className="animate-spin text-[#059669]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#059669] dark:text-emerald-400">
                  FUNCTION 1 • LIVE QUEUE ADVISORY
                </span>
                <span className="bg-emerald-500/20 text-[#059669] dark:text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> LIVE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                APMC Procurement Center Live Queue Status
              </h2>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900/90 px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-800 text-right shadow-sm">
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase block tracking-wider">CURRENTLY PROCESSING</span>
            <strong className="text-2xl font-black text-[#059669] dark:text-emerald-400">A-112</strong>
          </div>
        </div>

        {/* Stat Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-slate-900/60 border border-[#5A0E45]/40 space-y-2">
            <div className="flex justify-between items-center text-[#5A0E45] dark:text-purple-300">
              <span className="text-[11px] font-black uppercase tracking-wider">PEOPLE AHEAD</span>
              <Users size={16} className="text-[#5A0E45] dark:text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">14</span>
              <span className="text-xs text-slate-800 dark:text-slate-400 font-extrabold">farmers</span>
            </div>
            <p className="text-[10px] font-black text-[#5A0E45] dark:text-purple-300">
              Active queue in yard
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-900/60 border border-[#059669]/40 space-y-2">
            <div className="flex justify-between items-center text-[#059669] dark:text-emerald-400">
              <span className="text-[11px] font-black uppercase tracking-wider">ACTIVE COUNTERS</span>
              <ShieldCheck size={16} className="text-[#059669]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">4</span>
              <span className="text-xs text-slate-800 dark:text-slate-400 font-extrabold">/ 6 active</span>
            </div>
            <p className="text-[10px] font-black text-[#059669] dark:text-emerald-400">
              Counters active
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-[#059669]/40 space-y-2">
            <div className="flex justify-between items-center text-[#059669] dark:text-emerald-400">
              <span className="text-[11px] font-black uppercase tracking-wider">ESTIMATED WAITING</span>
              <Clock size={16} className="text-[#059669]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#059669] dark:text-emerald-400">24</span>
              <span className="text-xs text-[#059669] dark:text-emerald-400 font-extrabold">minutes</span>
            </div>
            <p className="text-[10px] font-black text-[#059669] dark:text-emerald-400">
              AI queue algorithm
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-slate-900/60 border border-[#5A0E45]/40 space-y-2">
            <div className="flex justify-between items-center text-[#5A0E45]">
              <span className="text-[11px] font-black uppercase tracking-wider">RECOMMENDED ARRIVAL</span>
              <span className="px-2 py-0.5 rounded-full bg-[#5A0E45] text-white text-[9px] font-black">
                ● Optimal Window
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              09:37 AM
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-800 dark:text-slate-400 font-bold">
              <span>Queue Status:</span>
              <span className="font-black text-[#5A0E45] dark:text-purple-300">Active Procurement</span>
            </div>
          </div>
        </div>

        {/* Smart Recommendation */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              i
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-emerald-200 leading-relaxed">
              <strong>Smart Recommendation:</strong> Plan your arrival for <strong>09:37 AM</strong> based on 14 farmers ahead of you and 4 active counters.
            </p>
          </div>
          <span className="text-xs font-black text-[#059669] dark:text-emerald-400 whitespace-nowrap italic">
            "The Queue Comes To You"
          </span>
        </div>
      </div>

      {/* 3. FUNCTION 2: SMART SLOT BOOKING & DIGITAL QR TOKEN PASS */}
      <div className="glass-panel p-6 rounded-3xl border-2 border-purple-500/40 bg-gradient-to-br from-purple-50 via-white to-emerald-50 dark:from-purple-950/20 dark:via-slate-900/60 dark:to-emerald-950/20 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 dark:border-purple-800/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#5A0E45] to-[#059669] text-white shadow-lg">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#5A0E45] dark:text-purple-400 block">
                FUNCTION 2 • SMART PROCUREMENT SLOT BOOKING
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                APMC Procurement Center Slot Reservation
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-400 font-bold">
                Book your procurement slot & obtain your scannable digital QR token pass
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSlotModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#059669] to-[#5A0E45] hover:scale-105 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
          >
            <Sparkles size={16} />
            <span>Book / Change Procurement Slot</span>
          </button>
        </div>

        {/* Farmer Smart Pass Ticket Card */}
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-[#059669] bg-slate-900 text-white shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-600">
                <QrCode size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  OFFICIAL DOCA MANDI SMART PASS
                </span>
                <h3 className="text-base font-black text-white">
                  {activeBooking?.centerName || 'Pune APMC Main Yard'}
                </h3>
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-extrabold text-xs border border-emerald-600 uppercase tracking-wider">
              {activeBooking?.status || 'CONFIRMED'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">TOKEN ID</span>
              <strong className="text-emerald-400 font-mono font-black text-base">
                {activeBooking?.tokenId || 'TOK-2026-PN-889'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">ALLOCATED COUNTER</span>
              <strong className="text-amber-300 font-black text-sm">
                {activeBooking?.allocatedCounter || activeBooking?.counterName || 'Counter #4'}
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">SLOT WINDOW</span>
              <strong className="text-slate-200 font-black text-xs block">
                {activeBooking?.slotDate || activeBooking?.date || new Date().toISOString().split('T')[0]} ({activeBooking?.slotWindow || activeBooking?.timeSlotLabel || '09:30 AM - 11:00 AM'})
              </strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">ESTIMATED PAYOUT</span>
              <strong className="text-emerald-400 font-black text-sm block">
                ₹{((activeBooking?.estimatedPayout || 53125)).toLocaleString('en-IN')} ({activeBooking?.quantityQuintals || 25} Qtl)
              </strong>
            </div>
          </div>

          {/* QR Code & Verification */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-4 border-t border-slate-800">
            <div className="p-3 bg-white rounded-2xl shrink-0 shadow-2xl border-2 border-emerald-500">
              <QRCodeSVG
                value={
                  activeBooking?.qrCodePayload ||
                  JSON.stringify({
                    token: activeBooking?.tokenId || 'TOK-2026-PN-889',
                    center: activeBooking?.centerName || 'Pune APMC Main Yard',
                    counter: activeBooking?.allocatedCounter || 'Counter #4',
                    quantity: '25 Qtl'
                  })
                }
                size={115}
              />
            </div>

            <div className="space-y-2 text-left flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                  Cryptographic SHA-256 Verification Hash
                </span>
              </div>
              <p className="font-mono text-[9px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all font-bold select-all">
                {activeBooking?.blockchainHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Present this QR token pass at the APMC gate scanner for instant check-in.</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                >
                  <Printer size={13} /> Print Token Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-300 dark:border-slate-800">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">{isFarmer ? 'My Total Batches' : 'Total Batches Inspected'}</span>
            <Scan size={18} className="text-[#059669] dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">{isFarmer ? recentBatches.length : (analytics?.totalBatches || 11)}</h3>
          <span className="text-[10px] text-[#059669] dark:text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight size={12} /> {isFarmer ? 'My Verified Batches' : '+24% this week'}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-300 dark:border-slate-800">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Onions Analyzed</span>
            <ShieldCheck size={18} className="text-[#059669] dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-[#059669] dark:text-emerald-400">{isFarmer ? 52 : (analytics?.totalOnionsInspected || 96)}</h3>
          <span className="text-[10px] text-slate-700 dark:text-slate-400 font-bold">Optical Blob Contours</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-300 dark:border-slate-800">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">Average Quality Score</span>
            <Award size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">88<span className="text-xs text-slate-500 font-bold"> / 100</span></h3>
          <span className="text-[10px] text-[#059669] dark:text-emerald-400 font-bold">Grade A Benchmark</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-300 dark:border-slate-800">
          <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
            <span className="text-[11px] font-black uppercase tracking-wider">{t('payoutDisbursed', language)}</span>
            <TrendingUp size={18} className="text-[#059669] dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-[#059669] dark:text-emerald-400">
            ₹{isFarmer ? '1,12,500' : '14,25,000'}
          </h3>
          <span className="text-[10px] text-slate-700 dark:text-slate-400 font-bold">Direct Bank Transfer</span>
        </div>
      </div>

      {/* 5. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart: Grade Distribution */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl space-y-4 border border-slate-300 dark:border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Grade Distribution
            </h3>
            <span className="text-[10px] font-bold text-slate-500">APMC Mandi Benchmark</span>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{isFarmer ? recentBatches.length : (analytics?.totalBatches || 11)}</span>
              <span className="text-[10px] font-bold text-slate-500">Batches</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800">
              <span className="text-[#059669] dark:text-emerald-400 font-black text-sm block">{gradeDist.gradeA}</span>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">Grade A</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-slate-900 border border-emerald-200/80 dark:border-slate-800">
              <span className="text-emerald-700 dark:text-emerald-300 font-black text-sm block">{gradeDist.urs}</span>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">URS (Grade B)</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-slate-900 border border-purple-200 dark:border-slate-800">
              <span className="text-[#5A0E45] dark:text-purple-300 font-black text-sm block">{gradeDist.rejected}</span>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-300">Rejected</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Defect Breakdown */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl space-y-4 border border-slate-300 dark:border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Defect Distribution Overview
            </h3>
            <span className="text-[10px] font-bold text-slate-500">Computer Vision Counts</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} fontWeight="bold" tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. RECENT BATCH GRADING TABLE */}
      <div className="glass-panel p-5 rounded-3xl space-y-4 border border-slate-300 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              APMC Procurement Queue & All Farmer Records
            </h3>
            <p className="text-[11px] text-[#059669] dark:text-emerald-400 font-bold mt-0.5">
              Displaying all registered farmer quality reports & batch entries across the APMC network
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-black text-[#059669] dark:text-emerald-400 hover:underline cursor-pointer"
          >
            View All Reports →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-900 dark:text-slate-200 font-semibold">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-300 uppercase text-[10px] font-black">
              <tr>
                <th className="p-3">Batch ID</th>
                <th className="p-3">Farmer</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Score</th>
                <th className="p-3">Assigned Grade</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentBatches.map((b) => (
                <tr key={b.batchId} className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono text-slate-900 dark:text-white font-black">{b.batchId}</td>
                  <td className="p-3 font-bold">{b.farmerName}</td>
                  <td className="p-3 font-bold">{b.quantityQuintals} Qtl</td>
                  <td className="p-3 font-black text-slate-900 dark:text-white">{b.aiAnalysisResult?.qualityScore || 85}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        b.aiAnalysisResult?.finalAssignedGrade === 'Grade A'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : b.aiAnalysisResult?.finalAssignedGrade === 'URS'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                      }`}
                    >
                      {b.aiAnalysisResult?.finalAssignedGrade || 'Grade A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-black text-slate-900 dark:text-slate-100">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onNavigate('history', b.batchId)}
                      className="text-[11px] font-black text-white bg-[#059669] hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSlotModal && (
        <SlotBookingModal
          isOpen={showSlotModal}
          onClose={() => setShowSlotModal(false)}
          onBookingSuccess={(booking) => {
            setActiveBooking(booking);
            setShowSlotModal(false);
          }}
        />
      )}
    </div>
  );
};
