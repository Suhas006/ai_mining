import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Cuboid, Settings, User, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[2000] p-2 bg-[#131B2B] hover:bg-[#1E293B] border border-[#1E293B] rounded-lg text-white shadow-xl transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      
      <div className={`${isOpen ? 'w-64 border-r border-[#1E293B]' : 'w-0 border-r-0'} h-screen bg-[#0B0F17] flex flex-col text-[#94A3B8] transition-all duration-300 flex-shrink-0 overflow-hidden relative z-[2001]`}>
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between min-w-[16rem]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(14,165,233,0.5)]">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide">DepthFence</h1>
              <p className="text-[10px] text-[#0EA5E9] font-mono">Enterprise Grid</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[#94A3B8] hover:text-white hover:bg-[#1E293B] p-1.5 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 min-w-[16rem]">
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-4 px-2">
            Surveillance Modules
          </div>

          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#0EA5E9]/10 text-white border border-[#0EA5E9]/30 shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]'
                  : 'hover:bg-[#1E293B] hover:text-white border border-transparent'
              }`
            }
          >
            <Map className="w-5 h-5 text-[#0EA5E9]" />
            2D AI Scanner
          </NavLink>

          <NavLink
            to="/3d-mapping"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#10B981]/10 text-white border border-[#10B981]/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
                  : 'hover:bg-[#1E293B] hover:text-white border border-transparent'
              }`
            }
          >
            <Cuboid className="w-5 h-5 text-[#10B981]" />
            3D Depth Mapping
          </NavLink>
        </nav>

        <div className="p-4 border-t border-[#1E293B] space-y-2 min-w-[16rem]">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1E293B] hover:text-white transition-all text-sm font-medium border border-transparent">
            <Settings className="w-5 h-5 text-[#94A3B8]" />
            System Settings
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1E293B] hover:text-white transition-all text-sm font-medium border border-transparent">
            <User className="w-5 h-5 text-[#94A3B8]" />
            Admin Profile
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
