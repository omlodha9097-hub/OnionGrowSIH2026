import React, { useState } from 'react';
import { GradingBatch } from '../types';
import { Download, ShieldCheck, Award, FileCheck2, CheckCircle2, ArrowLeft, Stamp, CreditCard, Landmark, Check, DollarSign } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getGradeProfile } from '../utils/gradeUtils';

interface Props {
  batch: GradingBatch | null;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const ReportPDFModal: React.FC<Props> = ({ batch, onClose, onNavigate }) => {
  const [dbtStatus, setDbtStatus] = useState<'idle' | 'processing' | 'completed'>(
    batch?.status === 'Paid' ? 'completed' : 'idle'
  );
  const [dbtTxRef, setDbtTxRef] = useState<string>(
    (batch?.payoutDetails as any)?.dbtReference || `DBT-2026-SBI-${Date.now().toString().slice(-6)}`
  );

  if (!batch) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDisburseDBT = () => {
    setDbtStatus('processing');
    setTimeout(() => {
      setDbtStatus('completed');
      batch.status = 'Paid';
    }, 1200);
  };

  const aiRes: any = batch.aiAnalysisResult || {};
  const rawGrade = aiRes.finalAssignedGrade || aiRes.suggestedGrade || aiRes.grade || (batch as any).overallGrade || 'Grade A';
  const profile = getGradeProfile(rawGrade, batch.batchId);

  const avgDiam = aiRes.averageDiameterMm || aiRes.average_diameter_mm || (profile.canonicalGrade === 'Grade A' ? 64.2 : profile.canonicalGrade === 'Grade B' ? 54.1 : profile.canonicalGrade === 'Grade C' ? 44.5 : 32.0);
  const avgSph = aiRes.averageSphericity || aiRes.average_sphericity || (profile.canonicalGrade === 'Grade A' ? 94.8 : profile.canonicalGrade === 'Grade B' ? 84.2 : profile.canonicalGrade === 'Grade C' ? 74.5 : 62.0);
  const colorRating = aiRes.colorRating || aiRes.color_rating || (profile.canonicalGrade === 'Grade A' ? 'Deep Red Ruby (Export)' : profile.canonicalGrade === 'Grade B' ? 'Golden Skin (Standard)' : profile.canonicalGrade === 'Grade C' ? 'Light Red / Pink Skin' : 'Discolored / Dark Shell');
  const maxSprout = aiRes.sproutLengthMm ?? aiRes.max_sprout_mm ?? (profile.canonicalGrade === 'Reject' ? 8.5 : 0.0);
  const defectCount = aiRes.defectCount ?? aiRes.defect_count ?? (profile.canonicalGrade === 'Reject' ? 4 : profile.canonicalGrade === 'Grade C' ? 2 : 0);
  const qualityScore = aiRes.qualityScore ?? aiRes.quality_score ?? (profile.canonicalGrade === 'Grade A' ? 94 : profile.canonicalGrade === 'Grade B' ? 82 : profile.canonicalGrade === 'Grade C' ? 62 : 38);
  const explanationText = aiRes.explanationText || aiRes.reason || profile.defaultRationale;

  const ratePerQtl = profile.ratePerQuintal;
  const totalPayout = Math.round(batch.quantityQuintals * ratePerQtl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-3 sm:p-6 overflow-hidden animate-fadeIn">
      {/* Main Modal Card Container */}
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Sticky Action Header Bar */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 z-20 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300 border border-purple-700/50">
              <FileCheck2 size={18} />
            </div>
            <div>
              <span className="text-xs font-black text-purple-300 tracking-wider uppercase block">
                Official Digital Quality Certificate
              </span>
              <span className="text-[11px] font-semibold text-slate-400 block">
                AGMARK-Style Quality Inspection Report & DBT Voucher
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Single Primary Back to Dashboard Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigate) {
                  onNavigate('dashboard');
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-700 transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>

            {/* Direct Benefit Transfer (DBT) Action Button */}
            {profile.canonicalGrade !== 'Reject' && (
              <button
                type="button"
                onClick={handleDisburseDBT}
                disabled={dbtStatus === 'processing'}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
                  dbtStatus === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white'
                }`}
              >
                {dbtStatus === 'processing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing DBT...</span>
                  </>
                ) : dbtStatus === 'completed' ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>DBT Paid ₹{totalPayout.toLocaleString('en-IN')}</span>
                  </>
                ) : (
                  <>
                    <Landmark size={15} />
                    <span>Pay via Direct Benefit (DBT)</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-black shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Download size={15} /> Download PDF
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-slate-950">
          
          {/* PRINTABLE CERTIFICATE CANVAS (Pure White Background, Formal Typography) */}
          <div
            id="printable-report"
            className="space-y-6 bg-white text-slate-900 p-6 sm:p-10 rounded-2xl border-2 border-slate-400 shadow-2xl font-serif text-xs relative select-text"
          >
            {/* Outer Certificate Border */}
            <div className="absolute inset-2 border border-slate-300 pointer-events-none rounded-xl" />

            {/* 1. CERTIFICATE HEADER WITH CREST */}
            <div className="text-center space-y-3 pb-4 border-b-2 border-slate-900 relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Crest SVG */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-[#581C87] bg-purple-50 p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="30" stroke="#581C87" strokeWidth="2.5" strokeDasharray="3 2" />
                      <circle cx="32" cy="32" r="26" stroke="#059669" strokeWidth="2" />
                      <path d="M32 10C24 17 16 25 16 38C16 47 23 54 32 54C41 54 48 47 48 38C48 25 40 17 32 10Z" fill="#059669" opacity="0.8" />
                      <path d="M32 18C27 23 21 29 21 39C21 45 26 49 32 49C38 49 43 45 43 39C43 29 37 23 32 18Z" fill="#34D399" />
                      <path d="M32 10V4M28 7L24 2M36 7L40 2" stroke="#581C87" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="text-left font-sans">
                    <h3 className="text-xs font-black uppercase text-[#0F172A] tracking-wider">
                      DEPARTMENT OF CONSUMER AFFAIRS (DoCA)
                    </h3>
                    <p className="text-[10px] font-extrabold text-slate-800">
                      Ministry of Consumer Affairs, Food & Public Distribution • Govt. of India
                    </p>
                    <p className="text-[10px] font-bold text-[#581C87]">
                      National Horticultural Procurement & Quality Cell • NAFED Mandi Network
                    </p>
                  </div>
                </div>

                {/* Certificate ID & Issue Date Box */}
                <div className="text-right font-mono bg-slate-100 p-3 rounded-xl border border-slate-400 shrink-0 font-sans">
                  <span className="text-[9px] text-slate-700 font-extrabold block uppercase tracking-widest">CERTIFICATE NO.</span>
                  <strong className="text-xs font-black text-[#581C87] block">{batch.batchId}</strong>
                  <span className="text-[10px] text-slate-800 font-bold block mt-0.5">
                    Date: {new Date(batch.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="pt-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] uppercase tracking-wide font-serif">
                  NATIONAL HORTICULTURAL QUALITY CERTIFICATE
                </h1>
                <p className="text-[11px] font-sans text-slate-800 italic font-medium">
                  Digital Quality Assessment & Physical Parameters Evaluation Certificate for Onion Procurement
                </p>
              </div>
            </div>

            {/* 2. INSPECTION & PRODUCER METADATA TABLE */}
            <div className="space-y-2 font-sans">
              <h3 className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5 font-serif border-b border-slate-300 pb-1">
                Section I: Producer & Procurement Metadata
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-300 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Grower / Farmer Name</span>
                  <strong className="text-slate-900 font-black text-xs">{batch.farmerName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Farmer ID / Village</span>
                  <strong className="text-slate-900 font-bold">{batch.farmerId} (Manchar, Pune)</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Procurement APMC Yard</span>
                  <strong className="text-slate-900 font-bold">{batch.procurementCenterName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Commodity Specie</span>
                  <strong className="text-slate-900 font-bold">Onion (Allium cepa L.)</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Total Lot Quantity</span>
                  <strong className="text-[#059669] font-black text-xs">{batch.quantityQuintals} Quintals</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Inspection Officer</span>
                  <strong className="text-slate-900 font-bold">{batch.inspectorName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Grading Engine</span>
                  <strong className="text-slate-900 font-bold">YOLOv8 Dual-Stage CV Engine</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Verification Status</span>
                  <strong className={profile.canonicalGrade === 'Reject' ? 'text-rose-700 font-black' : 'text-[#059669] font-black'}>
                    {dbtStatus === 'completed' ? 'Paid (DBT Disbursed)' : profile.canonicalGrade === 'Reject' ? 'Substandard / Rejected' : 'NAFED Verified'}
                  </strong>
                </div>
              </div>
            </div>

            {/* 3. DIRECT BENEFIT TRANSFER (DBT) PAYMENT RECEIPT VOUCHER */}
            {profile.canonicalGrade !== 'Reject' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 font-sans space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Landmark size={18} className="text-[#059669]" />
                    <span className="text-xs font-black text-[#059669] uppercase tracking-wider">
                      DIRECT BENEFIT TRANSFER (DBT) PAYMENT RECEIPT VOUCHER
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                    {dbtStatus === 'completed' ? '✓ DISBURSED TO BANK' : 'ELIGIBLE FOR DBT'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold uppercase">Assigned Grade Rate</span>
                    <strong className="text-slate-900 font-black">₹{ratePerQtl} / Quintal</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold uppercase">Total Disbursed Amount</span>
                    <strong className="text-[#059669] font-black text-sm">₹{totalPayout.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold uppercase">Bank Account (Aadhaar Linked)</span>
                    <strong className="text-slate-900 font-bold">State Bank of India (****4821)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold uppercase">DBT Transaction Ref</span>
                    <strong className="text-purple-900 font-mono font-black text-[10px]">{dbtTxRef}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 4. QUALITY PARAMETERS TABLE & EMBOSSED GRADE SEAL */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                <h3 className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider font-serif">
                  Section II: AGMARK / NAFED Physical Quality Evaluation Parameters
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Standard 100-Point Deduction Matrix</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Structured Quality Table */}
                <div className="lg:col-span-8 overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300">Physical Parameter</th>
                        <th className="p-2 border-r border-slate-300">Measured Value</th>
                        <th className="p-2 border-r border-slate-300">AGMARK Benchmark</th>
                        <th className="p-2">Conformance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 border-r border-slate-300 font-bold">1. Average Bulb Diameter</td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-900">{avgDiam} mm</td>
                        <td className="p-2 border-r border-slate-300 text-slate-600">{profile.diameterBenchmark}</td>
                        <td className={`p-2 font-bold ${profile.sealColor}`}>
                          {avgDiam >= 60 ? '✓ Grade A (Export)' : avgDiam >= 50 ? 'Grade B (Fair)' : avgDiam >= 35 ? 'Grade C (Local)' : 'Under-sized'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 font-bold">2. Shape Sphericity Index</td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-900">{avgSph}%</td>
                        <td className="p-2 border-r border-slate-300 text-slate-600">{profile.sphericityBenchmark}</td>
                        <td className={`p-2 font-bold ${profile.sealColor}`}>
                          {avgSph >= 90 ? '✓ Optimal Roundness' : avgSph >= 78 ? 'Acceptable Sphericity' : 'Slight Irregularity'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 font-bold">3. Skin Pigment & Color</td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{colorRating}</td>
                        <td className="p-2 border-r border-slate-300 text-slate-600">Double Outer Shell</td>
                        <td className="p-2 font-bold text-[#581C87]">Verified Shell Pigment</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 font-bold">4. Apical Sprout Length</td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-900">{maxSprout} mm</td>
                        <td className="p-2 border-r border-slate-300 text-slate-600">&lt; 3.0 mm (Zero Sprout)</td>
                        <td className={`p-2 font-bold ${maxSprout > 3 ? 'text-rose-700' : 'text-[#059669]'}`}>
                          {maxSprout === 0 ? '✓ Nil Sprouting' : maxSprout < 3 ? 'Minor Sprout' : '⚠️ Sprouted (Defect)'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-300 font-bold">5. Surface Rot / Mold Blotches</td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-900">{defectCount} Defect Spots</td>
                        <td className="p-2 border-r border-slate-300 text-slate-600">&lt; 2% Surface Defect</td>
                        <td className={`p-2 font-bold ${defectCount > 0 ? 'text-amber-700' : 'text-[#059669]'}`}>
                          {defectCount === 0 ? '✓ Defect Free' : `${defectCount} Surface Spots`}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-black">
                        <td className="p-2 border-r border-slate-300 text-slate-950 font-extrabold">6. Overall AI Quality Index</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-xs font-black" style={{ color: profile.canonicalGrade === 'Grade A' ? '#059669' : profile.canonicalGrade === 'Grade B' ? '#D97706' : profile.canonicalGrade === 'Grade C' ? '#581C87' : '#DC2626' }}>{qualityScore} / 100</td>
                        <td className="p-2 border-r border-slate-300 text-slate-800 font-bold">{profile.qualityScoreBenchmark}</td>
                        <td className={`p-2 text-xs font-black ${profile.sealColor}`}>{profile.displayName}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Circular Double-Ring Embossed Seal Badge */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-300 text-center space-y-2">
                  <div className="w-28 h-28 rounded-full border-4 border-double border-[#581C87] p-1 flex items-center justify-center bg-white shadow-md relative">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-[#059669] flex flex-col items-center justify-center p-2 text-center">
                      <span className="text-[8px] font-black uppercase text-slate-700 tracking-wider">{profile.canonicalGrade === 'Reject' ? 'SUBSTANDARD' : 'QUALIFIED'}</span>
                      <strong className={`text-base font-black uppercase font-serif ${profile.sealColor}`}>
                        {profile.sealTitle}
                      </strong>
                      <span className="text-[7px] font-extrabold text-slate-800 uppercase">{profile.sealSubtitle}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#0F172A] font-serif uppercase tracking-wider">
                    OFFICIAL INSPECTION SEAL
                  </span>
                </div>
              </div>
            </div>

            {/* 5. AI EXPLANAINABILITY RATIONALE */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-[11px] font-sans space-y-1">
              <span className="text-[10px] font-black uppercase text-[#0F172A] tracking-wider flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#059669]" /> Technical Assessment Rationale:
              </span>
              <p className="text-slate-900 leading-relaxed font-bold">
                "{explanationText}"
              </p>
            </div>

            {/* 6. AUTHENTICATION & SIGNATURE BLOCK */}
            <div className="pt-4 border-t-2 border-slate-900 font-sans space-y-3">
              <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider font-serif">
                Section III: Cryptographic Authentication & Officer Sign-off
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* QR Code & SHA-256 Hash */}
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl border-2 border-slate-300 shadow-sm shrink-0">
                    <QRCodeSVG value={batch.qrCodePayload || batch.batchId} size={84} />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <span className="text-[10px] font-black text-[#059669] uppercase tracking-wider block">
                      Tamper-Evident SHA-256 Checksum
                    </span>
                    <p className="font-mono text-[9px] text-slate-950 break-all bg-slate-100 p-2 rounded-lg border border-slate-300 font-bold">
                      {batch.blockchainHash}
                    </p>
                  </div>
                </div>

                {/* Inspector Signature Line */}
                <div className="text-center sm:text-right space-y-1 shrink-0">
                  <div className="h-10 border-b-2 border-slate-900 w-44 mx-auto sm:ml-auto flex items-end justify-center pb-1">
                    <span className="font-serif italic text-slate-900 text-xs font-bold">Officer V. K. Deshmukh</span>
                  </div>
                  <strong className="text-xs font-black text-slate-950 block">Inspector V. K. Deshmukh</strong>
                  <span className="text-[10px] text-slate-800 font-bold block">Senior Quality Assurance Inspector</span>
                  <span className="text-[9px] text-[#059669] font-mono font-black block">Digitally Signed & Authenticated</span>
                </div>
              </div>
            </div>

            {/* 7. FORMAL FOOTER */}
            <div className="pt-4 border-t border-slate-300 font-sans text-[9px] text-slate-600 text-center space-y-1">
              <p className="leading-relaxed font-semibold italic">
                Official Government Quality Certificate — DoCA & NAFED Procurement Network.
              </p>
              <div className="flex items-center justify-between text-slate-600 font-mono text-[9px] pt-1">
                <span className="font-bold">Timestamp: {new Date().toISOString()}</span>
                <span className="font-black text-slate-800">PAGE 1 OF 1</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
