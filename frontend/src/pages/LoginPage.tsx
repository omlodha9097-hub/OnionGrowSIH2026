import React, { useState } from 'react';
import { UserRole, Language } from '../types';
import { Phone, Mail, Lock, ShieldCheck, ArrowRight, User, Sprout, Shield, ChevronRight } from 'lucide-react';
import { t } from '../utils/i18n';
import { OnionLogo } from '../components/OnionLogo';

interface LoginPageProps {
  onLoginSuccess?: (user: { name: string; role: UserRole; identifier: string }) => void;
  onSelectRoleForVerification?: (user: { name: string; role: UserRole; identifier: string }) => void;
  language?: Language;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSelectRoleForVerification = () => {},
  language = 'en'
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loginMethod, setLoginMethod] = useState<'google' | 'phone' | 'email'>('google');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return alert('Please enter a valid mobile number.');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const role = selectedRole || 'farmer';
    const name = role === 'farmer' ? 'Ramesh V. Patil (Farmer)' : role === 'inspector' ? 'Officer V. K. Deshmukh (APMC Official)' : 'Dr. A. K. Sharma (Centre Admin)';
    const payload = { name, role, identifier: phone || '98230 48192' };
    if (onLoginSuccess) onLoginSuccess(payload);
    onSelectRoleForVerification(payload);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = selectedRole || 'farmer';
    const name = role === 'farmer' 
      ? (email.includes('patil') ? 'Ramesh V. Patil (Farmer)' : `${email.split('@')[0] || 'Ramesh Patil'} (Farmer)`)
      : role === 'inspector' ? 'Officer V. K. Deshmukh (APMC Official)' : 'Dr. A. K. Sharma (Centre Admin)';
    
    const payload = { name, role, identifier: email || 'ramesh.farmer@gmail.com' };
    if (onLoginSuccess) onLoginSuccess(payload);
    onSelectRoleForVerification(payload);
  };

  const handleGoogleLogin = () => {
    const role = selectedRole || 'farmer';
    const name = role === 'farmer' ? 'Ramesh V. Patil (Farmer)' : role === 'inspector' ? 'Officer V. K. Deshmukh (APMC Official)' : 'Dr. A. K. Sharma (Centre Admin)';
    const payload = { name, role, identifier: 'ramesh.farmer@gmail.com' };
    if (onLoginSuccess) onLoginSuccess(payload);
    onSelectRoleForVerification(payload);
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setLoginMethod('google');
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 overflow-hidden bg-slate-100 dark:bg-[#180413] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Background Shade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-300 dark:border-[#5A0E45]/60 bg-white dark:bg-[#280B20]/95 text-slate-900 dark:text-white backdrop-blur-xl animate-fadeIn transition-colors duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <OnionLogo size={46} />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5 font-sans">
            <span className="text-emerald-950 dark:text-emerald-300">Onion</span><span className="text-emerald-700 dark:text-emerald-400">Grow</span>
          </h1>

          <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 tracking-wide uppercase">
            National Horticultural Procurement Portal
          </p>

          <p className="text-[11px] font-bold text-slate-700 dark:text-purple-200/80">
            Government of India • NAFED Procurement Cell
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {!selectedRole ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs font-black text-slate-900 dark:text-slate-200 text-center tracking-wide uppercase">
              Select Your Official Portal Role
            </p>

            <div className="space-y-3">
              {/* 1. Farmer / Kisan Card */}
              <div
                onClick={() => handleSelectRole('farmer')}
                className="group p-4 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border-2 border-emerald-300 dark:border-emerald-700 transition-all flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-700 text-white font-black">
                    <Sprout size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-800 transition-colors">Farmer / Kisan Portal</h3>
                    <p className="text-[11px] text-slate-800 dark:text-purple-200 font-bold">Quality scan, slot booking & DBT bank payouts</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-700 dark:text-purple-300 group-hover:translate-x-1 transition-all" />
              </div>

              {/* 2. Procurement Officer Card */}
              <div
                onClick={() => handleSelectRole('inspector')}
                className="group p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#5A0E45]/20 border border-slate-300 dark:border-[#5A0E45]/40 hover:border-emerald-600 transition-all flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 font-black">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-800 transition-colors">Mandi Procurement Officer Desk</h3>
                    <p className="text-[11px] text-slate-800 dark:text-purple-200 font-bold">Gate verification & DBT authorization</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-700 dark:text-purple-300 group-hover:translate-x-1 transition-all" />
              </div>

              {/* 3. Centre Admin Card */}
              <div
                onClick={() => handleSelectRole('admin')}
                className="group p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#5A0E45]/20 border border-slate-300 dark:border-[#5A0E45]/40 hover:border-emerald-600 transition-all flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-purple-400 font-black">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-800 transition-colors">NAFED Centre Admin</h3>
                    <p className="text-[11px] text-slate-800 dark:text-purple-200 font-bold">Mandi analytics & digital twin control</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-700 dark:text-purple-300 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Sign-In Options (Google, Mobile OTP, Email) */
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-[#5A0E45]/40 pb-2.5 text-xs">
              <span className="font-black text-slate-900 dark:text-emerald-300 uppercase">
                Signing in as: <span className="text-emerald-800 dark:text-emerald-400">{selectedRole === 'farmer' ? 'Farmer / Kisan' : selectedRole === 'inspector' ? 'Mandi Officer' : 'Centre Admin'}</span>
              </span>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-emerald-800 dark:text-slate-300 hover:underline font-black cursor-pointer"
              >
                ← Change Role
              </button>
            </div>

            {/* 3 Sign-In Options Switcher Pills */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800 text-[11px] font-black">
              <button
                type="button"
                onClick={() => setLoginMethod('google')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  loginMethod === 'google'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-300'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Phone size={13} />
                <span>Mobile OTP</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  loginMethod === 'email'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Mail size={13} />
                <span>Email ID</span>
              </button>
            </div>

            {/* Method 1: Google Sign-In */}
            {loginMethod === 'google' && (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center text-xs font-bold text-slate-900">
                  ⚡ Fast Single Sign-On with Official Google / Farmer Account
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}

            {/* Method 2: Mobile OTP Sign-In */}
            {loginMethod === 'phone' && (
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">
                    Aadhaar-Linked Mobile Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98230 48192"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white dark:bg-[#1C0617] border border-slate-400 dark:border-[#5A0E45]/40 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="1 2 3 4 5 6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white text-center tracking-widest font-mono border border-slate-400 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{otpSent ? 'Verify OTP & Enter Portal' : 'Send Verification OTP'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Method 3: Email Sign-In */}
            {loginMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">
                    Government / Official Email ID
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder={selectedRole === 'farmer' ? 'ramesh.farmer@gmail.com' : 'officer.deshmukh@apmc.gov.in'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-[#1C0617] border border-slate-400 dark:border-[#5A0E45]/40 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 block mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white dark:bg-[#1C0617] border border-slate-400 dark:border-[#5A0E45]/40 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In with Password</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
