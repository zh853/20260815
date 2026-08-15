import React from 'react';
import { Wifi, Battery, Signal, Clock, Shield, Sparkles, MapPin, Briefcase, Calculator } from 'lucide-react';
import { User } from '../../types';

interface MobilePhoneSimulatorProps {
  children: React.ReactNode;
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobilePhoneSimulator: React.FC<MobilePhoneSimulatorProps> = ({
  children,
  currentUser,
  activeTab,
  setActiveTab
}) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="py-6 px-4 flex flex-col items-center justify-center bg-slate-900/60 min-h-[calc(100vh-100px)]">
      {/* Device Frame Header Info */}
      <div className="mb-3 text-center">
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          📱 智慧型手機行動介面模擬器 (390 x 844 Retina View)
        </span>
      </div>

      {/* Smartphone Hardware Frame */}
      <div className="relative w-[390px] h-[820px] bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-700 border-4 border-slate-800 flex flex-col overflow-hidden">
        {/* Hardware Elements: Camera Island / Dynamic Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-50 flex items-center justify-end px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800"></div>
        </div>

        {/* Mobile Status Bar */}
        <div className="h-10 pt-1.5 px-6 flex items-center justify-between text-white text-[11px] font-semibold select-none z-40 bg-slate-900/80 backdrop-blur-xs border-b border-slate-800/50">
          <span>{timeStr}</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Mobile Viewport Screen Content Container */}
        <div className="flex-1 bg-[#f8fafc] overflow-y-auto relative no-scrollbar flex flex-col">
          {/* Internal Mobile Top App Banner */}
          <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between text-xs sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full ring-1 ring-blue-400 object-cover"
              />
              <div className="leading-tight">
                <p className="font-bold text-[11px] text-white">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-mono">{currentUser.department}</p>
              </div>
            </div>

            <span className="text-[9px] bg-blue-600/30 text-blue-300 border border-blue-500/40 px-1.5 py-0.5 rounded font-mono">
              MOBILE APP
            </span>
          </div>

          {/* Children Components (Full tab panels rendered inside mobile view) */}
          <div className="flex-1 p-2 scale-[0.98] origin-top">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="h-14 bg-slate-900 text-slate-400 border-t border-slate-800 flex items-center justify-around text-[10px] select-none z-40 px-1">
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
              activeTab === 'workflow' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>總覽</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
              activeTab === 'attendance' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>外勤打卡</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timesheet')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
              activeTab === 'timesheet' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>工時申報</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
              activeTab === 'payroll' ? 'text-blue-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>薪資結算</span>
          </button>

          {currentUser.role === 'ROLE_DIRECTOR' && (
            <button
              type="button"
              onClick={() => setActiveTab('director')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
                activeTab === 'director' ? 'text-amber-400 font-bold' : 'hover:text-amber-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>建築師</span>
            </button>
          )}
        </div>

        {/* Mobile Home Bar Handle Indicator */}
        <div className="h-4 bg-slate-950 flex items-center justify-center">
          <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
