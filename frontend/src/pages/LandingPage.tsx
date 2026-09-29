import React from 'react';
import { Scan, ShieldCheck, TrendingUp, Award, Sparkles, CheckCircle2, ArrowRight, FileCheck, Layers, Scale } from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl glass-panel border border-onion-ruby/40 bg-gradient-to-b from-onion-ruby/20 via-dark-card to-dark-bg p-6 lg:p-12 shadow-2xl">
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-onion-ruby/30 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-onion-amber/20 rounded-full blur-3xl -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-onion-ruby/30 border border-onion-ruby/50 text-onion-amber text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles size={14} className="animate-spin" /> Smart India Hackathon • SIH26031
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
              AI-Powered <span className="onion-gradient-text">Onion Quality</span> Grading & Procurement
            </h1>

            <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed max-w-xl">
              Eliminate subjective grading disputes and middleman exploitation. Using OpenCV & YOLO computer vision, Harvest Heist automates defect detection, size bucketing, explainable scoring, and tamper-evident SHA-256 smart receipt issuance in APMC mandis.
            </p>

            {/* Action Button Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('analyze')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-onion-ruby via-rose-600 to-onion-amber text-white font-extrabold text-sm shadow-xl shadow-onion-ruby/30 hover:scale-105 transition-all group"
              >
                <Scan size={18} className="group-hover:rotate-12 transition-transform" />
                <span>Analyze Onion Batch</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-black text-sm border border-slate-700 transition-all hover:scale-105"
              >
                <span>View Live Dashboard</span>
              </button>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <span className="text-xl sm:text-2xl font-black text-white block">97.4%</span>
                <span className="text-[11px] text-slate-300 font-bold">CV Accuracy</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 block">&lt; 3 Sec</span>
                <span className="text-[11px] text-slate-300 font-bold">Grading Speed</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-onion-amber block">₹0 Delay</span>
                <span className="text-[11px] text-slate-300 font-bold">Direct DBT Payout</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visualizer Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card p-4 rounded-3xl border border-onion-amber/30 bg-slate-950/80 shadow-2xl space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=800&auto=format&fit=crop"
                  alt="Onion Detection Demo"
                  className="w-full h-full object-cover"
                />

                {/* Simulated Overlay Bounding Box */}
                <div className="absolute inset-4 border-2 border-emerald-400 rounded-xl bg-emerald-500/10 p-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                      Onion #1 • Healthy (68mm)
                    </span>
                    <span className="bg-slate-900/90 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                      97% Conf
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <span className="bg-slate-900/90 text-onion-amber text-[10px] font-mono px-2 py-0.5 rounded border border-onion-amber/40 font-bold">
                      Grade A • ₹2,125/qtl
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Feature Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-white font-bold flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" /> Tamper-Evident SHA-256
                  </span>
                  <span className="text-[10px] font-mono text-onion-amber font-black">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-white font-bold flex items-center gap-2">
                    <TrendingUp size={16} className="text-onion-amber" /> Mandi Price Forecast
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-black">+6.2% Next Week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM & SOLUTION SECTION (DARK CRISP FONTS - PHOTO 3) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Transforming Agricultural Procurement
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-extrabold max-w-xl mx-auto">
            Addressing core vulnerabilities in traditional onion supply chains through trust-centric artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Procurement Pitfalls */}
          <div className="p-6 rounded-3xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-slate-950/80 shadow-md space-y-4">
            <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400 border-b border-rose-200 dark:border-rose-900/40 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-200 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                <Scale size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Traditional Procurement Challenges</h3>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-900 dark:text-slate-100 font-bold leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-black text-sm">•</span>
                <span><strong className="text-slate-950 dark:text-white">Subjective Quality Assessment:</strong> Manual grading leads to dispute and price manipulation at mandi gates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-black text-sm">•</span>
                <span><strong className="text-slate-950 dark:text-white">Middleman Exploitation:</strong> Farmers lose up to 25-30% payout due to informal defect deductions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-black text-sm">•</span>
                <span><strong className="text-slate-950 dark:text-white">Payment Delays:</strong> Paper reports cause 15-30 day processing lags for MSP disbursements.</span>
              </li>
            </ul>
          </div>

          {/* Harvest Heist Solution */}
          <div className="p-6 rounded-3xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-slate-950/80 shadow-md space-y-4">
            <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-900/40 pb-3">
              <div className="p-2.5 rounded-xl bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Harvest Heist AI Solution</h3>
            </div>
            <ul className="space-y-3.5 text-xs text-slate-900 dark:text-slate-100 font-bold leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-black text-sm">✓</span>
                <span><strong className="text-slate-950 dark:text-white">Standardized Computer Vision:</strong> Instant detection of rot, sprouts, size buckets, and discoloration.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-black text-sm">✓</span>
                <span><strong className="text-slate-950 dark:text-white">Explainable Scoring Rationale:</strong> Transparent penalty deductions (Rotten -30, Damaged -15, Sprouted -20).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-black text-sm">✓</span>
                <span><strong className="text-slate-950 dark:text-white">Tamper-Evident SHA-256 Receipts:</strong> Cryptographic QR receipts with instant simulated DBT payout.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID (DARK CRISP FONTS - PHOTO 3) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            6 Pillars of OnionGrade AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-extrabold max-w-xl mx-auto">
            Comprehensive technology suite built specifically for horticultural crop procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-rose-100 dark:bg-onion-ruby/30 text-rose-800 dark:text-onion-amber border border-rose-300 dark:border-onion-ruby/50">
              <Scan size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">YOLO / OpenCV Defect Detector</h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              Detects healthy, damaged, rotten, sprouted, undersized, and discolored onions with bounding boxes and diameter metrics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
              <Layers size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Transparent Penalty Deductions</h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              Configurable quality scoring engine starting at 100 with plain-language explainability for every grade decision.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Blockchain Cryptographic Receipt</h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              SHA-256 hash checksum and live scannable QR code on digital quality reports for dispute-proof audit trails.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
              <FileCheck size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Simulated MSP/DBT Payout</h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              Automated price stabilization payout calculation at ₹2,125/quintal baseline with instant bank transfer status.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400 border border-purple-300 dark:border-purple-800">
              <TrendingUp size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Mandi Price Forecasting</h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              Time-series forecasting over regional APMC mandis recommending optimal sell timing and congestion heatmaps.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 w-fit rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
              <Award size={22} />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">Offline Edge Sync</h4>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
              Local on-device inference mode for remote procurement centers, auto-syncing to cloud when reconnected.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="glass-panel p-8 rounded-3xl border border-onion-ruby/50 bg-gradient-to-r from-onion-ruby/40 via-dark-card to-dark-bg flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-white">Ready to Grade your Onion Batch?</h3>
          <p className="text-xs text-slate-200 font-bold">Upload batch photos or use industrial AR camera scanner to test computer vision analysis.</p>
        </div>

        <button
          onClick={() => onNavigate('analyze')}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-onion-ruby to-onion-amber text-white font-extrabold text-sm shadow-xl hover:scale-105 transition-all shrink-0 cursor-pointer"
        >
          Start AI Analysis Now →
        </button>
      </section>
    </div>
  );
};

