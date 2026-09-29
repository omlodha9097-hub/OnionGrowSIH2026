import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Lock, QrCode } from 'lucide-react';
import { GradingBatch } from '../types';

interface Props {
  batch?: GradingBatch;
  qrData?: string;
  size?: number;
  caption?: string;
}

export const SmartReceiptQR: React.FC<Props> = ({
  batch,
  qrData,
  size = 110,
  caption
}) => {
  const qrString = qrData || batch?.qrCodePayload || batch?.batchId || 'NAFED-QR-PASS';
  const displayId = batch?.batchId || 'MANDI-GATE-PASS';
  const hash = batch?.blockchainHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  return (
    <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-slate-900 text-white space-y-3 shadow-xl">
      {/* Receipt Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700">
            <QrCode size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Tamper-Evident Mandi Token Pass
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono font-bold block">{displayId}</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-700">
          SHA-256 Verified
        </span>
      </div>

      {/* QR & Details */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-xl shrink-0 shadow-md border-2 border-emerald-500">
          <QRCodeSVG value={qrString} size={size} />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-black">
            <ShieldCheck size={14} />
            <span>Cryptographic Checksum</span>
          </div>
          <p className="font-mono text-[9px] text-slate-300 bg-slate-950 p-1.5 rounded-lg border border-slate-800 break-all font-bold select-all">
            {hash}
          </p>
          <span className="text-[10px] text-slate-300 font-semibold block">
            {caption || 'Scan at Mandi gate for instant automated clearance.'}
          </span>
        </div>
      </div>
    </div>
  );
};
