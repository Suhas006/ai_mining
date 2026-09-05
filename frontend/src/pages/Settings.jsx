import React from 'react';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      <div className="max-w-4xl mx-auto z-10 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <SettingsIcon className="w-8 h-8 text-[#0EA5E9]" />
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-[#94A3B8] mt-2">Manage your Enterprise Grid preferences and configurations.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
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
          
        </div>
      </div>
    </div>
  );
};

export default Settings;
