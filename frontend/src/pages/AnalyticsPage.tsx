import React, { useEffect, useState } from 'react';
import { fetchMarketForecast } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Sparkles, BarChart3, Building2, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface Props {
  language?: Language;
}

export const AnalyticsPage: React.FC<Props> = () => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forecast' | 'disbursement'>('forecast');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMarketForecast();
        setForecastData(data);
      } catch (err) {
        console.error('Failed to load market forecast:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // MANDI PRICE FORECAST DATA
  const mandiWeeklyFutures = [
    { day: 'Mon', Pune: 2150, Lasalgaon: 2240, Ahmednagar: 2080, Solapur: 2010 },
    { day: 'Tue', Pune: 2170, Lasalgaon: 2270, Ahmednagar: 2100, Solapur: 2030 },
    { day: 'Wed', Pune: 2190, Lasalgaon: 2300, Ahmednagar: 2115, Solapur: 2050 },
    { day: 'Thu', Pune: 2220, Lasalgaon: 2340, Ahmednagar: 2130, Solapur: 2080 },
    { day: 'Fri (Forecast)', Pune: 2250, Lasalgaon: 2370, Ahmednagar: 2150, Solapur: 2100 },
    { day: 'Sat (Forecast)', Pune: 2270, Lasalgaon: 2390, Ahmednagar: 2160, Solapur: 2120 },
    { day: 'Sun (Forecast)', Pune: 2290, Lasalgaon: 2420, Ahmednagar: 2180, Solapur: 2140 }
  ];

  const procurementComplianceBar = [
    { metric: 'Grade A Procurement', quintals: 8835, pct: 62, fill: '#16A34A' },
    { metric: 'URS (Grade B)', quintals: 4417, pct: 31, fill: '#D97706' },
    { metric: 'Rejected Batches', quintals: 998, pct: 7, fill: '#DC2626' }
  ];

  const mandiArrivals = [
    { mandi: 'Lasalgaon Yard (Nashik)', tonsPerDay: 820, congestion: 'High' },
    { mandi: 'Pimpalgaon Baswant Hub', tonsPerDay: 580, congestion: 'Medium' },
    { mandi: 'Ahmednagar APMC', tonsPerDay: 380, congestion: 'Low' },
    { mandi: 'Solapur APMC Yard', tonsPerDay: 310, congestion: 'Low' }
  ];

  if (loading) {
    return <div className="py-12 text-center text-xs font-bold text-slate-700 dark:text-slate-300">Loading NAFED Administrative Desk...</div>;
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn text-slate-900 dark:text-slate-100">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gov-navy via-slate-900 to-emerald-950 text-white shadow-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-600">
              NAFED State APMC Administrative Desk
            </span>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-700">
              ● Live Market & Procurement Analytics
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2.5 flex items-center gap-2">
            <Building2 className="text-amber-400" size={26} /> NAFED APMC State Procurement & Market Intelligence
          </h1>
          <p className="text-xs text-slate-200 font-bold mt-1 max-w-3xl leading-relaxed">
            Administrative overview for state mandi price forecasting models, APMC procurement volume tracking, and NAFED direct bank transfer (DBT) disbursals.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'forecast'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <TrendingUp size={14} /> Mandi Price Futures Model
          </button>
          <button
            onClick={() => setActiveTab('disbursement')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'disbursement'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 size={14} /> APMC Volume & DBT Payouts
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-xs font-extrabold uppercase">
            <span>Total State Procurement</span>
            <BarChart3 size={16} className="text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">14,250 Quintals</p>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            Grade A & B Verified Batches
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-xs font-extrabold uppercase">
            <span>Total DBT Disbursed</span>
            <ShieldCheck size={16} className="text-emerald-700 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹ 3,02,81,250</p>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Direct SBI Bank Disbursal
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-xs font-extrabold uppercase">
            <span>Grade A Compliance</span>
            <TrendingUp size={16} className="text-blue-700 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400">62.0% Ratio</p>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Premium Export Class Quality
          </span>
        </div>
      </div>

      {/* TAB 1: MANDI PRICE FORECASTING MODEL */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* AI Predictive Sell Advisory */}
          <div className="p-6 rounded-3xl border border-amber-400/50 bg-gradient-to-r from-gov-navy/10 via-white dark:via-slate-900 to-slate-50 dark:to-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-onion-ruby dark:text-onion-amber font-extrabold text-xs uppercase">
              <Sparkles size={16} /> Market Timing Intelligence
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Target Mandi: <span className="text-emerald-700 dark:text-emerald-400">Lasalgaon APMC Yard (Nashik)</span>
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-bold">
              "Prices expected to rise +6.2% over next 5 days. Recommended selling window: 48 to 72 hours for Grade A batches."
            </p>
          </div>

          {/* 7-Day Price Futures Line Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                7-Day Regional APMC Price Futures (₹ / Quintal)
              </h4>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">MSP Baseline: ₹2,125 / qtl</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mandiWeeklyFutures} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#334155" fontSize={11} fontWeight="bold" />
                  <YAxis domain={[1900, 2500]} stroke="#334155" fontSize={11} fontWeight="bold" />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontWeight: 'bold' }} />
                  <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="Lasalgaon" stroke="#16A34A" strokeWidth={3.5} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Pune" stroke="#D97706" strokeWidth={3} />
                  <Line type="monotone" dataKey="Ahmednagar" stroke="#2563EB" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="Solapur" stroke="#9333EA" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mandi Arrival Volume & Congestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mandiArrivals.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{m.mandi}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                    m.congestion === 'Low' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                  }`}>
                    {m.congestion}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Daily Arrival: <strong className="text-slate-900 dark:text-white font-black">{m.tonsPerDay} Tons / Day</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: APMC VOLUME & DBT DISBURSEMENT ANALYTICS */}
      {activeTab === 'disbursement' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Procurement Compliance Bar Chart */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Procurement Volume Breakdown (Total 14,250 Quintals)
              </h4>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">APMC Verified</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={procurementComplianceBar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="metric" stroke="#334155" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="#334155" fontSize={11} fontWeight="bold" />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
                  <Bar dataKey="quintals" radius={[8, 8, 0, 0]}>
                    {procurementComplianceBar.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Stats Card */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
                NAFED Fund & Quality Overview
              </h4>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Total DBT Payout Authorized</span>
                <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹3,02,81,250</h3>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">Direct Bank Transfers Processed</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px] font-bold">Dispute Rate</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-lg font-black">&lt; 1.2%</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px] font-bold">Inspection Speed</span>
                  <strong className="text-slate-900 dark:text-white text-lg font-black">2.4 Sec / Batch</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gov-navy/10 border border-gov-navy/20 text-xs text-gov-navy dark:text-blue-300 font-bold">
              ✔ Procurement & Forecasting Data Streams Synchronized
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


