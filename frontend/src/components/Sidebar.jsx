import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Map, Settings, User, Menu, X, Home, LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[2000] p-2 bg-white dark:bg-[#131B2B] hover:bg-slate-50 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-white shadow-xl transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      
      <div className={`${isOpen ? 'w-64 border-r border-slate-200 dark:border-[#1E293B]' : 'w-0 border-r-0'} h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col text-slate-500 dark:text-[#94A3B8] transition-all duration-300 flex-shrink-0 overflow-hidden relative z-[2001]`}>
        <div className="p-6 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between min-w-[16rem]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(14,165,233,0.5)]">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-white font-bold text-sm tracking-wide">DepthFence</h1>
              <p className="text-[10px] text-[#0EA5E9] font-mono">Enterprise Grid</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E293B] p-1.5 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 min-w-[16rem] overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 dark:text-[#475569] uppercase tracking-wider mb-4 px-2">
            Navigation
          </div>

          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#0EA5E9]/10 text-slate-900 dark:text-white border border-[#0EA5E9]/30 shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]'
                  : 'hover:bg-slate-200 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`
            }
          >
            <Home className="w-5 h-5 text-[#0EA5E9]" />
            Dashboard Home
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#10B981]/10 text-slate-900 dark:text-white border border-[#10B981]/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
                  : 'hover:bg-slate-200 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`
            }
          >
            <Settings className="w-5 h-5 text-[#10B981]" />
            System Settings
          </NavLink>

          {user && user.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-[#1E293B]">
              <div className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider mb-2 px-2">
                Administrator
              </div>
              <NavLink
                to="/admin-panel"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${
                    isActive
                      ? 'bg-[#F59E0B]/10 text-slate-900 dark:text-white border border-[#F59E0B]/30 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]'
                      : 'text-[#F59E0B] hover:bg-[#F59E0B]/5 hover:text-[#F59E0B] dark:hover:text-white border border-transparent'
                  }`
                }
              >
                <ShieldAlert className="w-5 h-5" />
                Admin Access
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-[#1E293B] space-y-2 min-w-[16rem]">
          {!user ? (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-[#0EA5E9]/10 text-slate-900 dark:text-white border border-[#0EA5E9]/30'
                    : 'hover:bg-slate-200 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`
              }
            >
              <LogIn className="w-5 h-5 text-slate-500 dark:text-[#94A3B8]" />
              Login
            </NavLink>
          ) : (
            <>
              <div className="px-3 mb-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
                  <div className="text-[10px] text-[#0EA5E9] font-mono uppercase">{user.role}</div>
                </div>
              </div>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-slate-200 dark:bg-[#1E293B] text-slate-900 dark:text-white border border-slate-300 dark:border-[#334155]'
                      : 'hover:bg-slate-200 dark:hover:bg-[#1E293B] hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`
                }
              >
                <User className="w-5 h-5 text-slate-500 dark:text-[#94A3B8]" />
                My Profile
              </NavLink>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-sm font-medium transition-all text-slate-500 dark:text-[#94A3B8]"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
