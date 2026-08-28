import React, { useState } from 'react';
import { Shield, Lock, User, Building2, MapPin, BadgeCheck, AlertTriangle, KeyRound } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); // 1: Credentials, 2: 2FA OTP

  // Form State
  const [formData, setFormData] = useState({
    fullName: 'R. Raman',
    officialEmail: 'officer@tn.gov.in',
    employeeId: 'TN-MIN-8472',
    department: 'Geology & Mining',
    role: 'District Mining Officer',
    jurisdictionZone: 'Karur Surveillance Zone',
    password: '',
    confirmPassword: '',
    captchaInput: '',
    otp: ''
  });

  const [captchaNum] = useState({ a: 7, b: 5 }); // Verification math: 7 + 5 = 12

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (parseInt(formData.captchaInput) !== captchaNum.a + captchaNum.b) {
        alert('Invalid Security Captcha. Sum of 7 + 5 is 12.');
        return;
      }
      // Move to 2FA Screen
      setStep(2);
    } else {
      // Complete Login / Register via real API call
      if (formData.otp === '123456' || formData.otp.length === 6) {
        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          const data = await res.json();
          if (res.ok && data.user) {
            onLoginSuccess(data.user);
          } else {
            onLoginSuccess({
              name: formData.fullName || 'R. Raman',
              role: formData.role,
              jurisdiction: formData.jurisdictionZone,
              employeeId: formData.employeeId || 'TN-MIN-8472',
              token: 'mock-jwt-token'
            });
          }
        } catch (err) {
          onLoginSuccess({
            name: formData.fullName || 'R. Raman',
            role: formData.role,
            jurisdiction: formData.jurisdictionZone,
            employeeId: formData.employeeId || 'TN-MIN-8472',
            token: 'mock-jwt-token'
          });
        }
        onClose();
      } else {
        alert('Invalid OTP. Use demo passcode: 123456');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-lg border border-slate-700/80 bg-[#0B0F17] p-6 text-slate-100 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-cyan-500/30 bg-cyan-950/40 p-2 text-cyan-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-slate-100 uppercase">
                DEPTHFENCE GOVERNMENT ACCESS PORTAL
              </h2>
              <p className="text-xs text-slate-400">
                Department of Geology & Mining / DILRMP Spatial Grid
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            ✕ ESC
          </button>
        </div>

        {/* Step 1: Login / Register Form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            
            {/* Toggle Tabs */}
            <div className="flex rounded-md border border-slate-800 bg-[#131B2B]/60 p-1">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`w-1/2 rounded py-1.5 text-xs font-bold transition ${
                  !isRegister ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Official Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`w-1/2 rounded py-1.5 text-xs font-bold transition ${
                  isRegister ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register Officer Clearance
              </button>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="text"
                      name="fullName"
                      placeholder="e.g. S. Radhakrishnan"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded border border-slate-700 bg-[#131B2B] py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Govt Employee ID</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      required
                      type="text"
                      name="employeeId"
                      placeholder="e.g. TN-MIN-2026-91"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full rounded border border-slate-700 bg-[#131B2B] py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email & Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Official Email</label>
                <input
                  required
                  type="email"
                  name="officialEmail"
                  placeholder="officer@tn.gov.in"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  className="w-full rounded border border-slate-700 bg-[#131B2B] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Security Clearance Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    required
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded border border-slate-700 bg-[#131B2B] py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Role & Jurisdiction Dropdowns */}
            {isRegister && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded border border-slate-700 bg-[#131B2B] px-2.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option>Geology & Mining</option>
                    <option>Land Resources (DILRMP)</option>
                    <option>State Police Cyber-Cell</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Designation Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded border border-slate-700 bg-[#131B2B] px-2.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option>District Mining Officer</option>
                    <option>Revenue Surveyor (ULPIN)</option>
                    <option>Field Inspection Squad</option>
                    <option>System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Jurisdiction Zone</label>
                  <select
                    name="jurisdictionZone"
                    value={formData.jurisdictionZone}
                    onChange={handleChange}
                    className="w-full rounded border border-slate-700 bg-[#131B2B] px-2.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option>Karur Surveillance Zone</option>
                    <option>Coimbatore Mineral Belt</option>
                    <option>Salem Iron & Granite Zone</option>
                    <option>Trichy Cauvery Basin</option>
                  </select>
                </div>
              </div>
            )}

            {/* Captcha & Security Notice */}
            <div className="flex items-center justify-between rounded border border-slate-800 bg-[#131B2B]/40 p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded bg-slate-800 px-2 py-1 font-mono font-bold text-cyan-400">
                  {captchaNum.a} + {captchaNum.b} = ?
                </span>
                <input
                  required
                  type="number"
                  name="captchaInput"
                  placeholder="12"
                  value={formData.captchaInput}
                  onChange={handleChange}
                  className="w-16 rounded border border-slate-700 bg-[#131B2B] px-2 py-1 text-center font-mono text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="flex items-center gap-1 text-[11px] text-amber-400/90">
                <AlertTriangle className="h-3.5 w-3.5" />
                Authorized Personnel Only (IP Logged)
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded bg-cyan-500 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
            >
              {isRegister ? 'Proceed to 2FA Verification' : 'Authenticate Credentials'}
            </button>
          </form>
        )}

        {/* Step 2: Two-Factor Authentication (2FA OTP) */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4 text-center py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
              <KeyRound className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase">Official Device OTP Verification</h3>
              <p className="mt-1 text-xs text-slate-400">
                A 6-digit one-time security clearance passcode was dispatched to registered device.
              </p>
            </div>

            <div className="flex justify-center">
              <input
                required
                type="text"
                maxLength={6}
                name="otp"
                placeholder="123456"
                value={formData.otp}
                onChange={handleChange}
                className="w-52 rounded border border-slate-700 bg-[#131B2B] px-4 py-2.5 text-center font-mono text-xl tracking-[0.5em] text-cyan-400 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              Demo Security Code: <span className="font-mono text-cyan-400 font-bold">123456</span>
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 rounded border border-slate-700 bg-[#131B2B] py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 rounded bg-cyan-500 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
              >
                Confirm & Enter Grid
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
