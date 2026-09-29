import React from 'react';
import { Sun, Moon, Globe, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/i18n';

interface GovHeaderProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  language,
  onLanguageChange
}) => {
  return (
    <div className="w-full bg-[#0B0F17] text-slate-200 text-xs border-b border-slate-800 font-sans z-50">
      {/* Indian National Flag Tricolor Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Official Government Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 border-r border-slate-700 pr-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-bold text-[11px]">
              🇮🇳
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white tracking-wide uppercase">
                Government of India | Ministry of Consumer Affairs, Food & Public Distribution
              </span>
              <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                <ShieldCheck size={11} /> OnionGrade AI - National Procurement & Quality Assurance Portal
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
              NAFED Certified
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
              DoCA Procurement Cell
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-[11px]">
            <Globe size={13} className="text-emerald-400" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-slate-200 text-[11px] font-bold focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
