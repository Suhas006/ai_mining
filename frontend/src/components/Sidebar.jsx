import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Cuboid, Settings, User } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-[#0B0F17] border-r border-[#1E293B] flex flex-col text-[#94A3B8] transition-all flex-shrink-0">
      <div className="p-6 border-b border-[#1E293B] flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(14,165,233,0.5)]">
          G
        </div>
        <div>
          <h1 className="text-white font-bold text-sm tracking-wide">DepthFence</h1>
          <p className="text-[10px] text-[#0EA5E9] font-mono">Enterprise Grid</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
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

      <div className="p-4 border-t border-[#1E293B] space-y-2">
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
  );
};

export default Sidebar;
