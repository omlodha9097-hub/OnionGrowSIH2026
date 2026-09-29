import React, { useState, useEffect } from 'react';
import { fetchBatches, verifyAndOverrideBatch } from '../services/api';
import { GradingBatch, UserRole, Language } from '../types';
import { ReportPDFModal } from '../components/ReportPDFModal';
import { Search, Download, ShieldAlert, Sparkles, FileText, ArrowLeft, Landmark, CheckCircle2 } from 'lucide-react';
import { t } from '../utils/i18n';
import { normalizeGrade, getGradeProfile } from '../utils/gradeUtils';

interface Props {
  userRole: UserRole;
  initialSelectedBatchId?: string;
  language?: Language;
  onNavigate?: (tab: string) => void;
}

export const BatchHistoryPage: React.FC<Props> = ({
  userRole,
  initialSelectedBatchId,
  language = 'en',
  onNavigate
}) => {
  const [batches, setBatches] = useState<GradingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedBatch, setSelectedBatch] = useState<GradingBatch | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const isFarmer = userRole === 'farmer';

  useEffect(() => {
    async function loadData() {
      try {
        const list = await fetchBatches();
        
        // SINGLE FARMER ISOLATION FOR FARMER ROLE
        if (isFarmer) {
          const farmerOnly = list.filter(b => b.farmerId === 'FARM_101' || b.farmerName.includes('Ramesh'));
          setBatches(farmerOnly);
        } else {
          setBatches(list);
        }

        if (initialSelectedBatchId) {
          const match = list.find(b => b.batchId === initialSelectedBatchId);
          if (match) {
            setSelectedBatch(match);
            setShowReportModal(true);
          }
        }
      } catch (err) {
        console.error('Failed to load batch history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialSelectedBatchId, isFarmer]);

  // Handle Browser Native Back Button
  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.hash.includes('report-')) {
        setShowReportModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const openReport = (batch: GradingBatch) => {
    setSelectedBatch(batch);
    setShowReportModal(true);
    try {
      window.history.pushState({ reportBatchId: batch.batchId }, '', `#report-${batch.batchId}`);
    } catch (e) {
      // Ignore
    }
  };

  const closeReport = () => {
    setShowReportModal(false);
    if (window.location.hash.includes('report-')) {
      try {
        window.history.back();
      } catch (e) {
        // Fallback
      }
    }
  };

  const handleOverrideGrade = async (batchId: string, newGrade: string) => {
    try {
      const updated = await verifyAndOverrideBatch(batchId, newGrade, 'Inspector manual verification override', 'Approved');
      setBatches(prev => prev.map(b => b.batchId === batchId ? updated : b));
      if (selectedBatch?.batchId === batchId) setSelectedBatch(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to override grade');
    }
  };

  const handleDisburseDBT = (batch: GradingBatch) => {
    batch.status = 'Paid';
    setBatches(prev => prev.map(b => b.batchId === batch.batchId ? { ...b, status: 'Paid' } : b));
    setSelectedBatch(batch);
    setShowReportModal(true);
  };

  const filteredBatches = batches.filter(b => {
    const matchesSearch = b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const canonical = normalizeGrade(b.aiAnalysisResult?.finalAssignedGrade);
    const matchesGrade = !gradeFilter || canonical === gradeFilter;
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Batch ID', 'Farmer Name', 'Quantity (Qtl)', 'Quality Score', 'Assigned Grade', 'Status', 'Date'];
    const rows = filteredBatches.map(b => [
      b.batchId,
      b.farmerName,
      b.quantityQuintals,
      b.aiAnalysisResult?.qualityScore || 85,
      normalizeGrade(b.aiAnalysisResult?.finalAssignedGrade),
      b.status,
      new Date(b.createdAt).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `National_Onion_Batches_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {isFarmer ? 'My Digital Quality Reports (Ramesh V. Patil)' : t('farmerReports', language)} <Sparkles size={20} className="text-[#059669] dark:text-purple-400" />
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-400 font-bold">
            {isFarmer ? 'Showing strictly your own single-farmer digital certificates & DBT transfer logs.' : 'Cryptographic SHA-256 verified digital quality certificates & procurement records.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs font-bold border border-purple-800/50 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          )}

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-900 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 glass-panel p-4 rounded-2xl border border-slate-300 dark:border-slate-800">
        <div className="sm:col-span-6 relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Batch ID or Farmer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#5A0E45]"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#5A0E45]"
          >
            <option value="">All Grades</option>
            <option value="Grade A">Grade A (Export)</option>
            <option value="Grade B">Grade B (Domestic)</option>
            <option value="Grade C">Grade C (Local Fair)</option>
            <option value="Reject">Reject (Substandard)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#5A0E45]"
          >
            <option value="">All Statuses</option>
            <option value="Pending_Verification">Pending Verification</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid (DBT Disbursed)</option>
            <option value="Disputed">Disputed</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-panel p-5 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800">
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-slate-500">Loading batch records...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-500">No matching batch records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-900 dark:text-slate-200 font-semibold">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-300 uppercase text-[10px] font-black">
                <tr>
                  <th className="p-3">Batch ID</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredBatches.map((b) => {
                  const prof = getGradeProfile(b.aiAnalysisResult?.finalAssignedGrade, b.batchId);
                  const isPaid = b.status === 'Paid';
                  return (
                    <tr key={b.batchId} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-900 dark:text-white font-black">{b.batchId}</td>
                      <td className="p-3 font-bold">{b.farmerName}</td>
                      <td className="p-3 font-bold">{b.quantityQuintals} Qtl</td>
                      <td className="p-3 font-black text-slate-900 dark:text-white">{b.aiAnalysisResult?.qualityScore || 85}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${prof.badgeBg} ${prof.badgeText} ${prof.badgeBorder}`}>
                          {prof.displayName}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-900 border-slate-300'}`}>
                          {isPaid ? 'Paid (DBT Disbursed)' : b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => openReport(b)}
                          className="text-[11px] font-black text-white bg-[#5A0E45] hover:bg-purple-900 px-3 py-1.5 rounded-xl transition-colors shadow-sm cursor-pointer"
                        >
                          View Report
                        </button>

                        {!isPaid && prof.canonicalGrade !== 'Reject' && (
                          <button
                            onClick={() => handleDisburseDBT(b)}
                            className="text-[10px] font-black text-white bg-[#059669] hover:bg-emerald-600 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                          >
                            Disburse DBT
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showReportModal && selectedBatch && (
        <ReportPDFModal
          batch={selectedBatch}
          onClose={closeReport}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
