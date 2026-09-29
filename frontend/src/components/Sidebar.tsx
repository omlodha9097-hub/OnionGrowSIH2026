import React from 'react';
import { LayoutDashboard, Scan, History, Calendar, BarChart3, ShieldCheck, Info, UserCheck } from 'lucide-react';
import { UserRole, Language } from '../types';
import { t } from '../utils/i18n';

interface SidebarProps {
  activeTab: string;
  onNavigate?: (tab: string, batchId?: string) => void;
  onTabChange?: (tab: string, batchId?: string) => void;
  userRole?: UserRole;
  language?: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate: propNavigate,
  onTabChange,
  userRole = 'farmer',
  language = 'en'
}) => {
  const onNavigate = onTabChange || propNavigate || (() => {});
  const isFarmer = userRole === 'farmer';
  const isInspector = userRole === 'inspector';
  const isAdmin = userRole === 'admin';

  return (
    <aside className="w-full lg:w-64 glass-panel border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 shrink-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-3 block">
          Navigation Menu
        </span>

        {/* 1. Main Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#059669] text-white shadow-lg'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>{t('farmerDashboard', language)}</span>
        </button>

        {/* 2. Scan Onion Batch */}
        <button
          onClick={() => onNavigate('analyze')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'analyze'
              ? 'bg-[#5A0E45] text-white shadow-lg'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scan size={18} />
          <span>{t('farmerScan', language)}</span>
        </button>

        {/* 3. Smart Procurement Slot Reservation */}
        <button
          onClick={() => onNavigate('procurement')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'procurement'
              ? 'bg-[#059669] text-white shadow-lg'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar size={18} />
          <span>Procurement Slot Booking</span>
        </button>

        {/* 4. Batch History & Quality Reports */}
        <button
          onClick={() => onNavigate('history')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#5A0E45] text-white shadow-lg'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History size={18} />
          <span>{t('farmerReports', language)}</span>
        </button>
      </div>

      {/* Admin / Inspector Only Functions */}
      {(isInspector || isAdmin) && (
        <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-3 block">
            APMC Desk Operations
          </span>

          <button
            onClick={() => onNavigate('verification')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-[#059669] text-white shadow-lg'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck size={18} />
            <span>Inspector Desk</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#5A0E45] text-white shadow-lg'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 size={18} />
            <span>Market Analytics</span>
          </button>
        </div>
      )}

    </aside>
  );
};
