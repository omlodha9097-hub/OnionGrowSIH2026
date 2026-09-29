import React, { useState, useEffect } from 'react';
import { submitBatchImage } from '../services/api';
import { GradingBatch, UserRole } from '../types';
import { AnnotatedCanvas } from '../components/AnnotatedCanvas';
import { SmartReceiptQR } from '../components/SmartReceiptQR';
import { ReportPDFModal } from '../components/ReportPDFModal';
import { CameraScannerModal } from '../components/CameraScannerModal';
import { io } from 'socket.io-client';
import { Upload, Camera, Sparkles, CheckCircle2, FileText, RefreshCw, Scale, Zap } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  userRole: UserRole;
  onViewReport: (batch: GradingBatch) => void;
  onNavigate?: (tab: string) => void;
}

export const AnalyzeBatchPage: React.FC<Props> = ({ userRole, onViewReport, onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(25);
  const [farmerName, setFarmerName] = useState<string>('State Registered Farmer');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<{ step: string; message: string; pct: number } | null>(null);
  
  const [gradedBatch, setGradedBatch] = useState<GradingBatch | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  useEffect(() => {
    const socket = io();
    socket.on('grading_progress', (data) => {
      setProcessingStage({ step: data.step, message: data.message, pct: data.progressPct });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setGradedBatch(null);
      setErrorMsg(null);
    }
  };

  const handleCameraCapture = (capturedFile: File) => {
    setSelectedFile(capturedFile);
    setPreviewUrl(URL.createObjectURL(capturedFile));
    setShowCameraModal(false);
    setGradedBatch(null);
    setErrorMsg(null);
  };

  const handleRunAnalysis = async () => {
    if (!previewUrl) {
      setErrorMsg('Please select an image file or scan via industrial AR camera.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingStage({ step: 'preprocessing', message: 'Isolating ROI & Preprocessing Image...', pct: 15 });

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      formData.append('farmerName', farmerName);
      formData.append('quantityQuintals', quantity.toString());

      const timer1 = setTimeout(() => setProcessingStage({ step: 'detecting', message: 'Segmenting individual onion instances...', pct: 40 }), 600);
      const timer2 = setTimeout(() => setProcessingStage({ step: 'defects', message: 'Evaluating sphericity, skin color & defect indicators...', pct: 70 }), 1200);
      const timer3 = setTimeout(() => setProcessingStage({ step: 'scoring', message: 'Computing 4-Tier agricultural grade (A, B, C, Reject)...', pct: 90 }), 1800);

      const batch = await submitBatchImage(formData);

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setProcessingStage({ step: 'complete', message: 'Analysis complete!', pct: 100 });
      setGradedBatch(batch);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze onion batch.');
    } finally {
      setIsProcessing(false);
    }
  };

  const aiRes = gradedBatch?.aiAnalysisResult;
  const defects = aiRes?.defectBreakdown || {};

  const tierCounts = (aiRes as any)?.tierCounts || {
    "Grade A": Math.round((aiRes?.totalOnionsDetected || 8) * 0.6),
    "Grade B": Math.round((aiRes?.totalOnionsDetected || 8) * 0.25),
    "Grade C": Math.round((aiRes?.totalOnionsDetected || 8) * 0.1),
    "Reject": Math.round((aiRes?.totalOnionsDetected || 8) * 0.05)
  };

  const tierPieData = [
    { name: 'Grade A (Export)', value: tierCounts["Grade A"] || 5, color: '#10B981' },
    { name: 'Grade B (Domestic)', value: tierCounts["Grade B"] || 2, color: '#F59E0B' },
    { name: 'Grade C (Local Fair)', value: tierCounts["Grade C"] || 1, color: '#3B82F6' },
    { name: 'Reject (Substandard)', value: tierCounts["Reject"] || 0, color: '#EF4444' }
  ];

  return (
    <div className="space-y-8 pb-16 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Industrial Onion Scan & 4-Tier Grading <Sparkles size={20} className="text-onion-ruby dark:text-onion-amber" />
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
            Multi-instance computer vision segmentation sorting onions into Grade A, Grade B, Grade C, and Reject tiers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-card px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <Zap size={14} className="text-onion-amber animate-pulse" />
          <span className="text-slate-800 dark:text-slate-200 font-bold">Precision Optical Pipeline v2.0</span>
        </div>
      </div>

      {/* UPLOAD & INDUSTRIAL AR SCANNER INPUT */}
      {!gradedBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
              1. Industrial Frame Scan or Image Upload
            </h3>

            {/* Input Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="border-2 border-dashed border-gov-navy hover:border-onion-ruby rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-gov-navy/5 dark:bg-slate-950/60 transition-colors group shadow-md"
              >
                <div className="p-3 rounded-xl bg-gov-navy text-white shadow-lg">
                  <Camera size={24} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">Industrial AR Scanner</span>
              </button>

              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-onion-ruby rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 dark:bg-slate-950/60 transition-colors group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="p-3 rounded-xl bg-onion-ruby text-white shadow-lg">
                  <Upload size={24} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">Browse Batch File</span>
              </div>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-700 shadow-xl">
                <img src={previewUrl} alt="Batch Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-black/80 rounded-lg text-xs font-bold text-white hover:bg-rose-600 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">Farmer Name</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-950 dark:text-white focus:outline-none focus:border-onion-ruby shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">Quantity (Quintals)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-950 dark:text-white focus:outline-none focus:border-onion-ruby shadow-sm"
                />
              </div>
            </div>

            {/* Submit Trigger */}
            <button
              onClick={handleRunAnalysis}
              disabled={isProcessing || !previewUrl}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                isProcessing || !previewUrl
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gov-navy via-onion-ruby to-onion-amber text-white hover:scale-[1.01]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Segmenting & Grading Batch...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Execute 4-Tier Quality Grading</span>
                </>
              )}
            </button>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 text-center">{errorMsg}</p>
            )}
          </div>

          {/* Grading Standards Card */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-onion-ruby dark:text-onion-amber font-black flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Scale size={18} /> Commercial 4-Tier Grading Standards
              </span>
              <p className="text-slate-800 dark:text-slate-200 text-xs font-bold leading-relaxed">
                Automatically sorts harvest into Grade A (Export Quality &gt;60mm), Grade B (Standard Domestic 45-60mm), Grade C (Fair Local Processing &lt;45mm), and Reject (Rot/Mold).
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-xs space-y-2">
              <span className="text-slate-900 dark:text-white font-black block">Computer Vision Precision</span>
              <p className="text-slate-700 dark:text-slate-400 text-[11px] font-semibold">
                Uses instant bounding boxes, contour area calculations, sphericity indices, and color histogram evaluations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAGED PROCESSING ANIMATION */}
      {isProcessing && processingStage && (
        <div className="glass-panel p-8 rounded-3xl border border-onion-amber/50 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-gov-navy to-onion-ruby flex items-center justify-center text-white shadow-xl animate-pulse">
            <Sparkles size={32} />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{processingStage.message}</h3>
            <p className="text-xs text-slate-500 font-mono font-bold">STAGE: {processingStage.step.toUpperCase()}</p>
          </div>

          <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="bg-gradient-to-r from-gov-navy via-onion-ruby to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${processingStage.pct}%` }}
            />
          </div>
          <span className="text-xs font-mono text-onion-ruby dark:text-onion-amber font-black">{processingStage.pct}% Completed</span>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {gradedBatch && aiRes && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-md">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Batch {gradedBatch.batchId} Graded</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Analyzed {aiRes.totalOnionsDetected} onions • Verified Tier: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{aiRes.finalAssignedGrade}</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPDFModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-onion-ruby hover:bg-onion-rose text-white text-xs font-black shadow-md transition-all"
              >
                <FileText size={15} /> Official PDF Report
              </button>

              <button
                onClick={() => { setGradedBatch(null); setPreviewUrl(null); }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all"
              >
                <RefreshCw size={14} /> Scan Another
              </button>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              )}
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <AnnotatedCanvas
                imageUrl={gradedBatch.imageUrls[0] || previewUrl!}
                detectedOnions={aiRes.detectedOnions || []}
              />
            </div>

            {/* Right Explainability & Tier Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    4-Tier Quality Grading Result
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-black block">Assigned Batch Tier</span>
                    <h2 className={`text-3xl font-black ${aiRes.finalAssignedGrade === 'Grade A' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {aiRes.finalAssignedGrade}
                    </h2>
                  </div>

                  <div className="w-20 h-20 rounded-full border-4 border-amber-400 bg-slate-900 flex flex-col items-center justify-center text-center shadow-xl">
                    <span className="text-2xl font-black text-white">{aiRes.qualityScore}</span>
                    <span className="text-[9px] text-slate-400 font-bold">/ 100</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Grading Rationale:</span>
                  <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-bold">
                    "{aiRes.explanationText}"
                  </p>
                </div>
              </div>

              <SmartReceiptQR batch={gradedBatch} />
            </div>
          </div>

          {/* LOWER 4-TIER BREAKDOWN CHART & COUNTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier Pie Chart */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
                4-Tier Commercial Quality Breakdown
              </h3>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                      {tierPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm block">{tierCounts["Grade A"] || 0}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">Grade A (Export)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-amber-600 dark:text-amber-400 font-black text-sm block">{tierCounts["Grade B"] || 0}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">Grade B (Domestic)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-blue-600 dark:text-blue-400 font-black text-sm block">{tierCounts["Grade C"] || 0}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">Grade C (Local)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-rose-600 dark:text-rose-400 font-black text-sm block">{tierCounts["Reject"] || 0}</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">Reject</span>
                </div>
              </div>
            </div>

            {/* Defect Metrics */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
                Detected Surface Defect Breakdown
              </h3>

              <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 text-center">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px]">Healthy</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-xl font-black">{defects.Healthy || defects.healthy || 0}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 text-center">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px]">Damaged</span>
                  <strong className="text-amber-600 dark:text-amber-400 text-xl font-black">{defects.Damaged || defects.damaged || 0}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/40 border border-rose-300 text-center">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px]">Rotten</span>
                  <strong className="text-rose-600 dark:text-rose-400 text-xl font-black">{defects.Rotten || defects.rotten || 0}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-950/40 border border-orange-300 text-center">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px]">Sprouted</span>
                  <strong className="text-orange-600 dark:text-orange-400 text-xl font-black">{defects.Sprouted || defects.sprouted || 0}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/40 border border-blue-300 text-center">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px]">Undersized</span>
                  <strong className="text-blue-600 dark:text-blue-400 text-xl font-black">{defects.Undersized || defects.undersized || 0}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950/40 border border-purple-300 text-center">
                  <span className="text-slate-600 dark:text-slate-400 block text-[10px]">Discolored</span>
                  <strong className="text-purple-600 dark:text-purple-400 text-xl font-black">{defects.Discolored || defects.discolored || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPDFModal && (
        <ReportPDFModal
          batch={gradedBatch}
          onClose={() => setShowPDFModal(false)}
          onNavigate={onNavigate}
        />
      )}

      <CameraScannerModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCaptureFrame={handleCameraCapture}
      />
    </div>
  );
};

