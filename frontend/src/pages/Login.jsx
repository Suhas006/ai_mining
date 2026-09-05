import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../context/LiveDataContext';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { addAuditLog } = useLiveData();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    addAuditLog('System Login', email);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex-1 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center p-4">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0EA5E9]/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 dark:bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <ShieldCheck className="w-6 h-6 text-[#0EA5E9]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">DepthFence Login</h2>
            <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 text-center">
              Authenticate to access the Enterprise Grid
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-[#475569]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] sm:text-sm transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-[#475569]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] sm:text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] hover:from-[#0284C7] hover:to-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0EA5E9] focus:ring-offset-[#0B0F17] transition-all"
            >
              AUTHENTICATE
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
