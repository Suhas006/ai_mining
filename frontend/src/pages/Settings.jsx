import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, Shield, Settings2, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-4xl mx-auto z-10 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <SettingsIcon className="w-8 h-8 text-[#0EA5E9]" />
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-[#94A3B8] mt-2 text-sm sm:text-base">Manage your Enterprise Grid preferences and configurations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme Appearance Card */}
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none dark:backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Theme Appearance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Dark Theme Toggle */}
              <button
                onClick={() => toggleTheme('dark')}
                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#0EA5E9]/10 border-[#0EA5E9] shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                    : 'bg-slate-50 dark:bg-[#0B0F17] border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-[#475569]'
                }`}
              >
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-[#0EA5E9]/20 text-[#0EA5E9]' : 'bg-slate-200 dark:bg-[#1E293B] text-slate-500 dark:text-[#94A3B8]'}`}>
                  <Moon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className={`font-bold ${theme === 'dark' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-[#94A3B8]'}`}>Dark Grid</div>
                  <div className="text-xs text-slate-400 dark:text-[#64748B]">Default Enterprise UI</div>
                </div>
                {theme === 'dark' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0EA5E9] shadow-[0_0_5px_rgba(14,165,233,1)]"></div>
                )}
              </button>

              {/* Light Theme Toggle */}
              <button
                onClick={() => toggleTheme('light')}
                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  theme === 'light' 
                    ? 'bg-[#0EA5E9]/10 border-[#0EA5E9] shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
                    : 'bg-slate-50 dark:bg-[#0B0F17] border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-[#475569]'
                }`}
              >
                <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-slate-200 dark:bg-[#1E293B] text-slate-500 dark:text-[#94A3B8]'}`}>
                  <Sun className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className={`font-bold ${theme === 'light' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-[#94A3B8]'}`}>Light Terrain Mode</div>
                  <div className="text-xs text-slate-400 dark:text-[#64748B]">High Contrast Field UI</div>
                </div>
                {theme === 'light' && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_5px_rgba(245,158,11,1)]"></div>
                )}
              </button>
            </div>
          </div>
          
          {/* Admin-Only Settings */}
          {user?.role === 'admin' && (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none dark:backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" /> Enterprise Security & API
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Enforce 2FA for Field Surveyors</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#0EA5E9]"></div>
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Primary DEM API Source</span>
                  <select className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 text-sm md:text-base rounded p-2 text-slate-900 dark:text-white">
                    <option>Copernicus</option>
                    <option>OpenTopoData</option>
                    <option>Custom Endpoint</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Strict Audit Logging Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#0EA5E9]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Employee-Only Settings */}
          {user?.role === 'emp' && (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none dark:backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-[#F59E0B]" /> Field Surveyor Preferences
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">GPS Precision Mode</span>
                  <select className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-700 text-sm md:text-base rounded p-2 text-slate-900 dark:text-white">
                    <option>High Accuracy (High Battery)</option>
                    <option>Balanced</option>
                    <option>Battery Saver</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Enable Offline Map Caching</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#F59E0B]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* User-Only Settings */}
          {user?.role === 'user' && (
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none dark:backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#10B981]" /> Account & Notifications
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">Email Alerts for ULPIN Status Changes</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#10B981]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
