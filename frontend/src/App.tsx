import React, { useState, useEffect } from 'react';
import { GovHeader } from './components/GovHeader';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeBatchPage } from './pages/AnalyzeBatchPage';
import { BatchHistoryPage } from './pages/BatchHistoryPage';
import { FarmerDirectoryPage } from './pages/FarmerDirectoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { VerificationPage } from './pages/VerificationPage';
import { LoginPage } from './pages/LoginPage';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { UserRole, Language, GradingBatch } from './types';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [userRole, setUserRole] = useState<UserRole>('farmer');
  const [language, setLanguage] = useState<Language>('en');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);

  // User Authentication State — starts as NULL so user lands on LoginPage first
  const [user, setUser] = useState<{ name: string; role: UserRole; identifier: string } | null>(null);

  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(undefined);

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (user) {
      setUser({
        ...user,
        role: newRole,
        name: newRole === 'farmer' ? 'State Registered Farmer' : newRole === 'inspector' ? 'Officer V. K. Deshmukh (APMC)' : 'Director A. K. Verma (NAFED Admin)'
      });
    }
    if (newRole === 'admin') {
      setActiveTab('analytics');
    } else if (newRole === 'inspector') {
      setActiveTab('verification');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLoginSuccess = (userData: { name: string; role: UserRole; identifier: string }) => {
    setUser(userData);
    setUserRole(userData.role);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('login');
  };

  const handleNavigate = (tab: string, batchId?: string) => {
    setActiveTab(tab);
    if (batchId) setSelectedBatchId(batchId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Official Government Header */}
      <GovHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Primary Navigation Navbar */}
      <Navbar
        currentRole={userRole}
        onRoleChange={handleRoleChange}
        language={language}
        onLanguageChange={setLanguage}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      {activeTab === 'login' || !user ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Left Sidebar Menu */}
          <Sidebar activeTab={activeTab} onTabChange={handleNavigate} userRole={userRole} />

          {/* Page Router */}
          <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-y-auto">
            {/* Active Portal Header Banner */}
            <div className="mb-6 px-4 py-2.5 rounded-2xl glass-panel flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Active Portal Mode:</span>
                <span className={`font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                  userRole === 'farmer' 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                }`}>
                  {userRole === 'farmer' ? '🌾 Farmer Quality & Payout Portal' : '🏛 Administrative APMC Procurement Portal'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                <span>Logged as: <strong className="text-slate-900 dark:text-white">{user.name}</strong></span>
                <button
                  onClick={() => handleNavigate('login')}
                  className="text-onion-ruby dark:text-onion-amber font-bold hover:underline"
                >
                  Switch Account
                </button>
              </div>
            </div>

            {/* Page Components */}
            {activeTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
            {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
            {activeTab === 'procurement' && <DashboardPage autoOpenSlotModal={true} onNavigate={handleNavigate} />}
            {activeTab === 'analyze' && (
              <AnalyzeBatchPage
                userRole={userRole}
                onViewReport={(batch: GradingBatch) => handleNavigate('history', batch.batchId)}
                onNavigate={handleNavigate}
              />
            )}
            {activeTab === 'history' && (
              <BatchHistoryPage
                userRole={userRole}
                initialSelectedBatchId={selectedBatchId}
              />
            )}
            {activeTab === 'verification' && <VerificationPage />}
            {activeTab === 'farmers' && (
              <FarmerDirectoryPage onNavigateToFarmerBatches={() => handleNavigate('history')} />
            )}
            {(activeTab === 'market' || activeTab === 'analytics') && <AnalyticsPage />}
          </main>
        </div>
      )}

      {/* Multilingual Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        language={language}
      />
    </div>
  );
}

export default App;
