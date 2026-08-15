import React from 'react';
import { User, UserRole } from '../../types';
import { Building2, Shield, UserCheck, Calculator, Briefcase, Sparkles, Clock, Users, FolderKanban, Edit3, Server } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUserEdit: (userId?: string) => void;
  onOpenProjectEdit: (projectId?: string) => void;
  onOpenCommandBar?: () => void;
  onOpenServerStatus?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  setActiveTab,
  onOpenUserEdit,
  onOpenProjectEdit,
  onOpenCommandBar,
  onOpenServerStatus
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ROLE_STAFF':
        return { label: '一般同仁 (繪圖/跑照/監造)', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'ROLE_PM':
        return { label: '專案主持人 / PM', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'ROLE_HR_FIN':
        return { label: '行政 / 人資 / 會計', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ROLE_DIRECTOR':
        return { label: '主持建築師 (Principal)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: role, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800 shrink-0">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white">
                  ArchSystems <span className="font-light text-slate-400">| 三位一體整合系統</span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                  SRS 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                出勤 · 專案工時成本 · 績效提成 · 勞基法薪資引擎
              </p>
            </div>
          </div>

          {/* Right Action Buttons & Role / User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Edit Buttons */}
            <div className="flex items-center gap-1.5 font-mono">
              <button
                type="button"
                id="btn-header-edit-users"
                onClick={() => onOpenUserEdit()}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white rounded border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="管理與編輯人員名冊資料"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">人員名冊編輯</span>
                <span className="sm:hidden">人員</span>
              </button>

              <button
                type="button"
                id="btn-header-edit-projects"
                onClick={() => onOpenProjectEdit()}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white rounded border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="管理與編輯專案案件、預算與案場座標"
              >
                <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">專案案件編輯</span>
                <span className="sm:hidden">案件</span>
              </button>

              {onOpenServerStatus && (
                <button
                  type="button"
                  id="btn-header-server-status"
                  onClick={onOpenServerStatus}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="即時監控伺服器運作狀態、通訊埠與連入用戶端 IP"
                >
                  <Server className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <span className="hidden sm:inline">伺服器狀態</span>
                  <span className="sm:hidden">伺服器</span>
                </button>
              )}
            </div>

            {/* Current user info & selector */}
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  id="role-user-selector"
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = allUsers.find((user) => user.id === e.target.value);
                    if (u) onSelectUser(u);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-1.5 px-2.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer shadow-xs max-w-[130px] sm:max-w-[200px] truncate"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name} ({u.role.replace('ROLE_', '')})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                id="btn-quick-edit-current-user"
                onClick={() => onOpenUserEdit(currentUser.id)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 border border-slate-700 transition-colors cursor-pointer"
                title={`編輯當前登入同仁資料: ${currentUser.name}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/50 hidden sm:block"
              />
            </div>
          </div>
        </div>

        {/* High-density Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-800 text-xs font-medium">
          <button
            id="nav-tab-workflow"
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-1.5 px-3 py-2.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'workflow'
                ? 'text-blue-400 border-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>三位一體數據流</span>
          </button>

          <button
            id="nav-tab-attendance"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-2.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'attendance'
                ? 'text-blue-400 border-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>智慧出勤與外勤</span>
          </button>

          <button
            id="nav-tab-timesheet"
            onClick={() => setActiveTab('timesheet')}
            className={`flex items-center gap-1.5 px-3 py-2.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'timesheet'
                ? 'text-blue-400 border-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>工時與專案成本</span>
          </button>

          <button
            id="nav-tab-performance"
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-1.5 px-3 py-2.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'performance'
                ? 'text-blue-400 border-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>專案型績效考核</span>
          </button>

          <button
            id="nav-tab-payroll"
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-1.5 px-3 py-2.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'payroll'
                ? 'text-blue-400 border-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>薪資與獎金結算</span>
          </button>

          {currentUser.role === 'ROLE_DIRECTOR' && (
            <button
              id="nav-tab-director"
              onClick={() => setActiveTab('director')}
              className={`flex items-center gap-1.5 px-3 py-2.5 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'director'
                  ? 'text-amber-400 border-amber-400 font-semibold'
                  : 'text-amber-300/70 hover:text-amber-300 border-transparent'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>主持建築師總覽</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
