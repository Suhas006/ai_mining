import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, FileText, Upload, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    registrationType: 'User',
    education: '',
    photo: null
  });
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      setFormData({ ...formData, photo: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    let submitData;
    if (formData.registrationType === 'Employee') {
      submitData = new FormData();
      submitData.append('name', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('role', 'employee');
      submitData.append('qualifications', formData.education || 'N/A');
      if (formData.photo) submitData.append('photo', formData.photo);
    } else {
      submitData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'user'
      };
    }

    const res = await register(submitData);
    setIsSubmitting(false);

    if (res.success) {
      if (res.pending) {
        setSuccessMsg(res.msg);
        setTimeout(() => navigate('/login'), 4000);
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex-1 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#0EA5E9]/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:backdrop-blur-xl rounded-2xl p-8 shadow-2xl mt-12 mb-12">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 dark:bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <ShieldCheck className="w-6 h-6 text-[#0EA5E9]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Security Clearance</h2>
            <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 text-center">
              Request access to the Enterprise Grid
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm text-center font-semibold animate-pulse">
              {successMsg}
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                  Registration Type
                </label>
                <select
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] sm:text-sm transition-all"
                >
                  <option value="User">Standard User</option>
                  <option value="Employee">Internal Employee (Requires Approval)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 dark:text-[#475569]" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="new-name"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] sm:text-sm transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="new-email"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] sm:text-sm transition-all"
                    placeholder="Enter your official email"
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] sm:text-sm transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {formData.registrationType === 'Employee' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                      Educational Qualifications
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                        <FileText className="h-5 w-5 text-slate-400 dark:text-[#475569]" />
                      </div>
                      <textarea
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] sm:text-sm transition-all min-h-[80px]"
                        placeholder="List degrees and certifications"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
                      ID / Photo Upload
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Upload className="h-5 w-5 text-slate-400 dark:text-[#475569]" />
                      </div>
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-[#1E293B] rounded-lg leading-5 bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0EA5E9]/10 file:text-[#0EA5E9] hover:file:bg-[#0EA5E9]/20 focus:outline-none sm:text-sm transition-all"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] hover:from-[#0284C7] hover:to-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0EA5E9] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'SUBMITTING...' : 'REQUEST CLEARANCE'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center mt-4 text-sm text-slate-500 dark:text-[#94A3B8]">
                Already have clearance?{' '}
                <a href="/login" className="text-[#0EA5E9] hover:underline font-semibold">
                  Log in
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
