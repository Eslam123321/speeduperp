import React, { useState } from 'react';
import { Cigarette, Lock, User, Key, ArrowRight } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const LoginPage: React.FC = () => {
  const { login } = useERP();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(usernameInput, passwordInput);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10 animate-scaleUp">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20 mx-auto transform -rotate-6">
            <Cigarette className="w-9 h-9 text-slate-950 font-bold" />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white pt-2">
            الدخان <span className="text-amber-500">ERP</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            نظام تتبع المبيعات والمخزون وحسابات التجار والصلاحيات
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-6 sm:p-8 space-y-5 border-amber-500/30">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>تسجيل الدخول للنظام</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">أدخل اسم المستخدم وكلمة السر المعتمدة</p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">اسم المستخدم (Username) *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full pr-10 pl-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">كلمة السر (Password) *</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة السر"
                  className="w-full pr-10 pl-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>دخول النظام</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
