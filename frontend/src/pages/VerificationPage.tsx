import React, { useState } from 'react';
import { User, QualityReport } from '../types';
import { ReportPDFModal } from '../components/ReportPDFModal';
import { getGradeProfile } from '../utils/gradeUtils';

interface VerificationPageProps {
  user?: User | null;
  pendingUser?: any;
  onVerificationSuccess?: (user: any) => void;
  onBackToLogin?: () => void;
  language?: string;
}

export const VerificationPage: React.FC<VerificationPageProps> = () => {
  const [selectedReport, setSelectedReport] = useState<QualityReport | null>(null);

  const pendingReports: QualityReport[] = [
    {
      id: 'REP-2026-9041',
      farmerId: 'FARM_101',
      farmerName: 'Ramesh V. Patil',
      timestamp: '2026-09-28 14:30',
      totalCount: 45,
      healthyPercentage: 82,
      cutsPercentage: 8,
      rottenPercentage: 6,
      sproutedPercentage: 4,
      grade: 'A',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80',
      dbtDisbursed: true,
      dbtAmount: 53125,
      sbiRefNo: 'DBT-2026-SBI-88912'
    },
    {
      id: 'REP-2026-9042',
      farmerId: 'FARM_102',
      farmerName: 'Suresh D. Pawar',
      timestamp: '2026-09-28 15:10',
      totalCount: 50,
      healthyPercentage: 70,
      cutsPercentage: 12,
      rottenPercentage: 10,
      sproutedPercentage: 8,
      grade: 'B',
      imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',
      dbtDisbursed: false
    },
    {
      id: 'REP-2026-9043',
      farmerId: 'FARM_103',
      farmerName: 'Bhagwan K. Shinde',
      timestamp: '2026-09-28 16:00',
      totalCount: 62,
      healthyPercentage: 55,
      cutsPercentage: 15,
      rottenPercentage: 20,
      sproutedPercentage: 10,
      grade: 'C',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80',
      dbtDisbursed: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Officer Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-black text-amber-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            OFFICER VERIFICATION DESK • QUALITY AUDIT & DBT AUTHORIZATION
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">NAFED Quality Inspector Desk</h1>
          <p className="text-xs text-slate-300 font-semibold mt-1">
            Audit farmer quality certificates, inspect computer vision scans & authorize direct SBI bank payments.
          </p>
        </div>

        <span className="bg-emerald-900/80 text-emerald-300 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-700">
          ● Live Inspector Portal Active
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Pending Quality Audits</p>
          <p className="text-2xl font-black text-amber-600 mt-1">3 Batches</p>
          <span className="text-[11px] font-bold text-slate-600">Requires Inspector Sign-Off</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Grade A Quality Ratio</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">72.4%</p>
          <span className="text-[11px] font-bold text-emerald-700">Premium Export Class</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Inspection Avg Time</p>
          <p className="text-2xl font-black text-slate-900 mt-1">2.4 Sec</p>
          <span className="text-[11px] font-bold text-slate-600">Computer Vision Verified</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">Total DBT Authorized</p>
          <p className="text-2xl font-black text-blue-700 mt-1">₹ 95,625</p>
          <span className="text-[11px] font-bold text-blue-800">Direct SBI Disbursal</span>
        </div>
      </div>

      {/* Quality Batches Inspection Queue */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span>📜 Batches Pending Officer Audit & DBT Authorization</span>
        </h3>
        <div className="space-y-4">
          {pendingReports.map((report) => {
            const profile = getGradeProfile(report.grade);
            return (
              <div key={report.id} className="border border-slate-300 rounded-xl p-5 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{report.id}</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black border ${profile.badgeBg}`}>
                      {profile.badgeText}
                    </span>
                    {report.dbtDisbursed ? (
                      <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded border border-emerald-300">
                        ✓ DBT Paid (₹{report.dbtAmount?.toLocaleString()})
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded border border-amber-300">
                        ⏳ Awaiting Authorization
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-slate-900 text-base">{report.farmerName} ({report.farmerId})</h4>
                  <p className="text-xs font-bold text-slate-700">
                    Inspection Breakdown: Healthy <span className="text-emerald-700">{report.healthyPercentage}%</span> | Rotten <span className="text-red-700">{report.rottenPercentage}%</span> | Cuts <span className="text-blue-700">{report.cutsPercentage}%</span> | Sprouted <span className="text-amber-700">{report.sproutedPercentage}%</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-lg shadow transition-all flex items-center gap-2"
                >
                  <span>Inspect & Authorize Certificate 📜</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedReport && (
        <ReportPDFModal
          batch={selectedReport as any}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

