import React from 'react';
import { OnionLogo } from './OnionLogo';
import { UserRole, Language } from '../types';
import { Mic, Sun, Moon, LogOut, User, ShieldCheck, Building, BarChart2 } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenVoiceAssistant: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: { name: string; role: UserRole; identifier: string } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenVoiceAssistant,
  isDarkMode,
  onToggleDarkMode,
  user,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl px-4 lg:px-8 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand Logo */}
        <OnionLogo />

        {/* Center Role Navigation Switcher Pills (Matching Screenshot 1) */}
        {user && (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => onRoleChange('farmer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'farmer'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <User size={14} />
              <span>Farmer View</span>
            </button>

            <button
              onClick={() => onRoleChange('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'inspector'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Officer Desk</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'admin'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Building size={14} />
              <span>Centre Admin</span>
            </button>

          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 lg:gap-3">
          {/* Voice Assistant Button */}
          <button
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm"
            title="Multilingual Speech Assistant (Hindi / Marathi / English)"
          >
            <Mic size={15} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Voice AI</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
          </button>

          {/* Logged In User Profile Badge & Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{user.name}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">{user.role === 'farmer' ? '🌾 Farmer' : '🏛 APMC Officer'}</span>
              </div>
              <button
                onClick={onLogout}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1"
                title="Logout from Portal"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800">
                Official Portal
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
