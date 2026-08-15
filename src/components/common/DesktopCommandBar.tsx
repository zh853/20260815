import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Clock, Briefcase, UserCheck, Calculator, Shield, Users, FolderKanban, X, ArrowRight } from 'lucide-react';
import { User, Project } from '../../types';

interface DesktopCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  projects: Project[];
  onSelectUser: (user: User) => void;
  onNavigateTab: (tab: string) => void;
  onOpenUserEdit: (userId?: string) => void;
  onOpenProjectEdit: (projectId?: string) => void;
}

export const DesktopCommandBar: React.FC<DesktopCommandBarProps> = ({
  isOpen,
  onClose,
  allUsers,
  projects,
  onSelectUser,
  onNavigateTab,
  onOpenUserEdit,
  onOpenProjectEdit
}) => {
  const [query, setQuery] = useState('');

  // Handle ESC key or Alt+K key toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.role.toLowerCase().includes(query.toLowerCase()) ||
    u.department.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.code.toLowerCase().includes(query.toLowerCase()) ||
    p.client.toLowerCase().includes(query.toLowerCase())
  );

  const navActions = [
    { id: 'workflow', label: '三位一體數據流總覽', icon: Sparkles, color: 'text-blue-400' },
    { id: 'attendance', label: '智慧出勤與外勤 GPS 打卡', icon: Clock, color: 'text-emerald-400' },
    { id: 'timesheet', label: '工時與專案成本核算', icon: Briefcase, color: 'text-amber-400' },
    { id: 'performance', label: '專案型績效考核與獎金', icon: UserCheck, color: 'text-indigo-400' },
    { id: 'payroll', label: '勞基法薪資與提成引擎', icon: Calculator, color: 'text-purple-400' },
    { id: 'director', label: '主持建築師總覽儀表板', icon: Shield, color: 'text-red-400' },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Search Input Box */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋系統功能、專案名稱、同仁姓名、或按下 Esc 關閉..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-800 rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="bg-slate-800 border border-slate-700 text-[10px] text-slate-400 px-2 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 font-sans text-xs">
          {/* Quick Admin Actions */}
          <div className="space-y-1">
            <p className="text-[10px] font-mono uppercase text-slate-400 px-2 tracking-wider">管理操作快捷通道</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenUserEdit(); onClose(); }}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-semibold">管理與編輯人員名冊</div>
                  <div className="text-[10px] text-slate-400">新增同仁/修改薪資職等</div>
                </div>
              </button>

              <button
                onClick={() => { onOpenProjectEdit(); onClose(); }}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-colors text-left"
              >
                <FolderKanban className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">管理與編輯專案案件</div>
                  <div className="text-[10px] text-slate-400">修改預算/座標GPS</div>
                </div>
              </button>
            </div>
          </div>

          {/* Module Navigation */}
          {navActions.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400 px-2 tracking-wider">系統功能頁面跳轉</p>
              <div className="space-y-1">
                {navActions.map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <button
                      key={nav.id}
                      onClick={() => { onNavigateTab(nav.id); onClose(); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${nav.color}`} />
                        <span className="font-medium">{nav.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Users List Match */}
          {filteredUsers.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400 px-2 tracking-wider">切換登入同仁角色 ({filteredUsers.length})</p>
              <div className="grid grid-cols-2 gap-1.5">
                {filteredUsers.slice(0, 6).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { onSelectUser(u); onClose(); }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 text-left transition-colors"
                  >
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-600" />
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.role.replace('ROLE_', '')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Match */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-400 px-2 tracking-wider">專案案件快速檢視 ({filteredProjects.length})</p>
              <div className="space-y-1">
                {filteredProjects.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { onOpenProjectEdit(p.id); onClose(); }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <div>
                      <span className="font-mono text-blue-400 font-bold mr-2">[{p.code}]</span>
                      <span className="font-semibold text-slate-200">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">預算: ${p.totalFeeBudget.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>ArchSystems 桌面快捷搜尋</span>
          <span className="hidden sm:inline">Use ↑↓ to navigate · Enter to select</span>
        </div>
      </div>
    </div>
  );
};
