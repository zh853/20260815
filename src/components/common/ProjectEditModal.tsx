import React, { useState, useEffect } from 'react';
import { Project, User, ProjectMilestone } from '../../types';
import { X, FolderPlus, Save, MapPin, DollarSign, Calendar, Layers, Users, Building2, CheckCircle2, Shield } from 'lucide-react';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  allUsers: User[];
  initialProjectId?: string | null;
  onSaveProject: (project: Project) => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  onClose,
  projects,
  allUsers,
  initialProjectId,
  onSaveProject
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || projects[0]?.id || 'NEW');

  const defaultMilestones: ProjectMilestone[] = [
    { id: 'M1', name: '概念與方案設計 (SD)', code: 'SD', targetDate: '2026-03-31', budgetHours: 200, actualHours: 0, status: 'COMPLETED', qualityScore: 90 },
    { id: 'M2', name: '都市設計審議與建照掛號 (Permit)', code: 'PERMIT', targetDate: '2026-06-30', budgetHours: 350, actualHours: 0, status: 'IN_PROGRESS', qualityScore: 88 },
    { id: 'M3', name: '細部施工圖繪製與發包 (CD)', code: 'CD', targetDate: '2026-09-30', budgetHours: 450, actualHours: 0, status: 'PENDING', qualityScore: 85 },
    { id: 'M4', name: '工務監造與竣工驗收 (Supervision)', code: 'SUPERVISION', targetDate: '2027-06-30', budgetHours: 300, actualHours: 0, status: 'PENDING', qualityScore: 85 }
  ];

  const [formData, setFormData] = useState<Project>(() => {
    const existing = projects.find(p => p.id === (initialProjectId || projects[0]?.id));
    if (existing) return { ...existing };
    return {
      id: `PRJ_${Date.now()}`,
      code: `PRJ-NEW-${projects.length + 1}`,
      name: '',
      client: '',
      type: 'COMMERCIAL',
      pmId: allUsers[0]?.id || 'EMP_008',
      pmName: allUsers[0]?.name || '陳品睿',
      status: 'ACTIVE',
      totalContractValue: 10000000,
      totalBudgetHours: 1000,
      totalBudgetLaborCost: 500000,
      totalBonusPool: 200000,
      isBonusDistributed: false,
      location: {
        name: '新建工程案場基地',
        address: '台北市信義區松仁路100號',
        latitude: 25.0339,
        longitude: 121.5644,
        radiusMeters: 200
      },
      milestones: defaultMilestones,
      teamMemberIds: allUsers.map(u => u.id)
    };
  });

  useEffect(() => {
    if (isOpen) {
      const targetId = initialProjectId || (projects.length > 0 ? projects[0].id : 'NEW');
      setSelectedProjectId(targetId);
      const existing = projects.find(p => p.id === targetId);
      if (existing) {
        setFormData({ ...existing });
      } else {
        setFormData({
          id: `PRJ_${Date.now()}`,
          code: `PRJ-NEW-${projects.length + 1}`,
          name: '新承攬建築設計案',
          client: '委託業主建設開發',
          type: 'COMMERCIAL',
          pmId: allUsers[0]?.id || 'EMP_008',
          pmName: allUsers[0]?.name || '陳品睿',
          status: 'ACTIVE',
          totalContractValue: 12000000,
          totalBudgetHours: 1200,
          totalBudgetLaborCost: 650000,
          totalBonusPool: 250000,
          isBonusDistributed: false,
          location: {
            name: '案場基地',
            address: '台北市',
            latitude: 25.0339,
            longitude: 121.5644,
            radiusMeters: 200
          },
          milestones: defaultMilestones,
          teamMemberIds: allUsers.map(u => u.id)
        });
      }
    }
  }, [isOpen, initialProjectId, projects, allUsers]);

  if (!isOpen) return null;

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    if (id === 'NEW') {
      setFormData({
        id: `PRJ_${Date.now()}`,
        code: `PRJ-NEW-${projects.length + 1}`,
        name: '',
        client: '',
        type: 'COMMERCIAL',
        pmId: allUsers[0]?.id || 'EMP_008',
        pmName: allUsers[0]?.name || '陳品睿',
        status: 'ACTIVE',
        totalContractValue: 10000000,
        totalBudgetHours: 1000,
        totalBudgetLaborCost: 500000,
        totalBonusPool: 200000,
        isBonusDistributed: false,
        location: {
          name: '',
          address: '',
          latitude: 25.0339,
          longitude: 121.5644,
          radiusMeters: 200
        },
        milestones: defaultMilestones,
        teamMemberIds: allUsers.map(u => u.id)
      });
    } else {
      const existing = projects.find(p => p.id === id);
      if (existing) {
        setFormData({ ...existing });
      }
    }
  };

  const handlePmChange = (pmId: string) => {
    const pm = allUsers.find(u => u.id === pmId);
    setFormData(prev => ({
      ...prev,
      pmId,
      pmName: pm ? pm.name : ''
    }));
  };

  const handleToggleTeamMember = (userId: string) => {
    setFormData(prev => {
      const exists = prev.teamMemberIds.includes(userId);
      const updated = exists
        ? prev.teamMemberIds.filter(id => id !== userId)
        : [...prev.teamMemberIds, userId];
      return { ...prev, teamMemberIds: updated };
    });
  };

  const handleMilestoneChange = (index: number, field: keyof ProjectMilestone, value: any) => {
    setFormData(prev => {
      const nextMilestones = [...prev.milestones];
      nextMilestones[index] = {
        ...nextMilestones[index],
        [field]: value
      };
      return { ...prev, milestones: nextMilestones };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    onSaveProject(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 text-xs">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                事務所專案案件資料與預算管理 (Project & Case Management)
              </h3>
              <p className="text-[10px] text-slate-400">
                維護案件契約總額、預算工時、提成獎金池、案場電子圍欄座標與里程碑
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Left Project List & Right Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
          {/* Left Project List (4 Cols) */}
          <div className="md:col-span-4 bg-slate-50/70 p-3 overflow-y-auto flex flex-col gap-2 shrink-0 max-h-56 md:max-h-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                案件清單 ({projects.length} 案)
              </span>
              <button
                type="button"
                id="btn-add-new-project"
                onClick={() => handleSelectProject('NEW')}
                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer font-mono"
              >
                <FolderPlus className="w-3 h-3" />
                <span>新增案件</span>
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto pr-1">
              {projects.map((p) => {
                const isSelected = selectedProjectId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProject(p.id)}
                    className={`w-full text-left p-2 rounded transition-colors flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-400/20'
                        : 'bg-white/80 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {p.code}
                      </span>
                      <span className="text-[9px] font-semibold px-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {p.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>PM: {p.pmName}</span>
                      <span className="font-mono text-emerald-700 font-bold">NT${(p.totalContractValue / 10000).toFixed(0)}萬</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Project Editor Form (8 Cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-8 p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {selectedProjectId === 'NEW' ? '＋ 新增專案案件' : `✏️ 編輯案件：[${formData.code}] ${formData.name}`}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block">提成獎金池預算</span>
                <span className="text-xs font-bold text-emerald-700">
                  NT$ {formData.totalBonusPool.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Section 1: Basic Case Info */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>1. 案件基本資料與契約屬性</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    案件編號 (Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="如: PRJ-TC-01"
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    案件名稱 (Project Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="如: 台中七期 32F 智慧旗艦商辦新建工程"
                    className="w-full text-xs font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">業主 / 委託單位</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="如: 聯聚建設 / 富邦人壽"
                    className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">建築類型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full text-xs font-semibold p-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="COMMERCIAL">商辦 / 商業建築 (COMMERCIAL)</option>
                    <option value="RESIDENTIAL">住宅 / 集合住宅 (RESIDENTIAL)</option>
                    <option value="PUBLIC">公共 / 公有工程 (PUBLIC)</option>
                    <option value="INDUSTRIAL">工業 / 高科技廠房 (INDUSTRIAL)</option>
                    <option value="URBAN_DESIGN">都市更新 / 都市設計 (URBAN_DESIGN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">專案狀態</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-xs font-semibold p-1.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="ACTIVE">方案設計進行中 (ACTIVE)</option>
                    <option value="PERMIT_APPROVED">建照已核准 (PERMIT_APPROVED)</option>
                    <option value="CONSTRUCTION">工地施工監造中 (CONSTRUCTION)</option>
                    <option value="COMPLETED">已竣工結案 (COMPLETED)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    指派專案主持人 (PM)
                  </label>
                  <select
                    value={formData.pmId}
                    onChange={(e) => handlePmChange(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded border border-slate-300 bg-white text-emerald-800"
                  >
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    提成撥發狀態
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isBonusDistributed}
                        onChange={(e) => setFormData(prev => ({ ...prev, isBonusDistributed: e.target.checked }))}
                        className="rounded accent-emerald-600"
                      />
                      <span>已執行結案提成撥發 (Payout completed)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Financials & Hours Budgets */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>2. 契約財務總額、預算工時與提成獎金池 (SRS 2.0 & 4.2 B)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    契約總額 (Contract NT$) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={formData.totalContractValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalContractValue: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    預算總工時 (Budget Hours)
                  </label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={formData.totalBudgetHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalBudgetHours: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    結案提成獎金池 (Bonus Pool NT$)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={formData.totalBonusPool}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalBonusPool: Number(e.target.value) }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white text-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Geofencing & Site Location */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>3. 案場電子圍欄與外勤打卡座標 (Geofence Setting)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">案場/基地名稱</label>
                  <input
                    type="text"
                    value={formData.location.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, name: e.target.value }
                    }))}
                    placeholder="如: 台中七期市政北七路基地"
                    className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">案場地址</label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    placeholder="如: 台中市西屯區市政北七路188號"
                    className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">緯度 (Latitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.location.latitude}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, latitude: Number(e.target.value) }
                    }))}
                    className="w-full text-xs font-mono p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">經度 (Longitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.location.longitude}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, longitude: Number(e.target.value) }
                    }))}
                    className="w-full text-xs font-mono p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">圍欄半徑 (公尺)</label>
                  <input
                    type="number"
                    step="10"
                    min="50"
                    value={formData.location.radiusMeters}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, radiusMeters: Number(e.target.value) }
                    }))}
                    className="w-full text-xs font-mono font-bold p-1.5 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Assigned Team Members */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span>4. 參與團隊成員 ({formData.teamMemberIds.length} 人)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allUsers.map((u) => {
                  const isChecked = formData.teamMemberIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/70 border-blue-300 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTeamMember(u.id)}
                        className="rounded accent-blue-600"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.title}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Milestones */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>5. 各階段里程碑與品質標準 (Milestones & Quality)</span>
              </div>

              <div className="space-y-1.5">
                {formData.milestones.map((m, idx) => (
                  <div key={m.id || idx} className="grid grid-cols-12 gap-1.5 p-2 bg-slate-50 rounded border border-slate-200 items-center text-[11px]">
                    <div className="col-span-4 font-bold text-slate-800 truncate">
                      [{m.code}] {m.name}
                    </div>

                    <div className="col-span-3">
                      <input
                        type="date"
                        value={m.targetDate}
                        onChange={(e) => handleMilestoneChange(idx, 'targetDate', e.target.value)}
                        className="w-full text-[10px] font-mono p-1 rounded border border-slate-300 bg-white"
                      />
                    </div>

                    <div className="col-span-3">
                      <select
                        value={m.status}
                        onChange={(e) => handleMilestoneChange(idx, 'status', e.target.value)}
                        className="w-full text-[10px] p-1 rounded border border-slate-300 bg-white font-semibold"
                      >
                        <option value="COMPLETED">已完成 (COMPLETED)</option>
                        <option value="IN_PROGRESS">進行中 (IN_PROGRESS)</option>
                        <option value="PENDING">未開始 (PENDING)</option>
                        <option value="DELAYED">延誤 (DELAYED)</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="評分"
                        value={m.qualityScore || 90}
                        onChange={(e) => handleMilestoneChange(idx, 'qualityScore', Number(e.target.value))}
                        className="w-full text-[10px] font-mono font-bold p-1 rounded border border-slate-300 bg-white text-emerald-700"
                        title="品質評分 (0-100)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-[10px] text-slate-500 font-mono">
                專案契約總額 NT${formData.totalContractValue.toLocaleString()} · 提成池 NT${formData.totalBonusPool.toLocaleString()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  id="btn-save-project-profile"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer font-mono"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>儲存案件資料</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
