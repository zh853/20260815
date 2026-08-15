import React, { useState } from 'react';
import { User, Project, TimesheetRecord, TaskCategory } from '../../types';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Filter, 
  Plus, 
  Calendar, 
  DollarSign, 
  Layers, 
  Check, 
  Info,
  Sparkles,
  Search
} from 'lucide-react';
import { calculateProjectCostSummary } from '../../utils/calculations';

interface TimesheetPanelProps {
  currentUser: User;
  allUsers: User[];
  projects: Project[];
  timesheets: TimesheetRecord[];
  onAddTimesheet: (record: TimesheetRecord) => void;
  onApproveTimesheet: (recordId: string, approverName: string) => void;
  onRejectTimesheet: (recordId: string) => void;
  onBatchApprove: (approverName: string) => void;
  onOpenProjectEdit?: (projectId?: string) => void;
  onOpenUserEdit?: (userId?: string) => void;
}

export const TimesheetPanel: React.FC<TimesheetPanelProps> = ({
  currentUser,
  allUsers,
  projects,
  timesheets,
  onAddTimesheet,
  onApproveTimesheet,
  onRejectTimesheet,
  onBatchApprove,
  onOpenProjectEdit,
  onOpenUserEdit
}) => {
  // Filter states
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [activeTab, setActiveTab] = useState<'LOG_ENTRY' | 'PM_REVIEW' | 'COST_ANALYSIS'>('LOG_ENTRY');

  // Form states for new timesheet record
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetProjectId, setTargetProjectId] = useState<string>(projects[0]?.id || 'NON_PROJECT');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('PERMIT_DRAWINGS');
  const [hoursSpent, setHoursSpent] = useState<number>(4.0);
  const [isOvertime, setIsOvertime] = useState<boolean>(false);
  const [overtimeType, setOvertimeType] = useState<'WEEKDAY_OT1' | 'WEEKDAY_OT2' | 'REST_DAY'>('WEEKDAY_OT1');
  const [description, setDescription] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form submission
  const handleSubmitTimesheet = (e: React.FormEvent) => {
    e.preventDefault();

    if (hoursSpent <= 0) {
      alert('請填寫大於 0 的工時 (最小 0.5 小時)');
      return;
    }

    const proj = projects.find(p => p.id === targetProjectId);
    const projectName = targetProjectId === 'NON_PROJECT' 
      ? '【非專案】事務所公共行政/培訓/競圖' 
      : proj?.name || '專案工項';

    const hourlyRate = currentUser.hourlyCostRate;
    const laborCost = Math.round(hoursSpent * hourlyRate);

    const newRecord: TimesheetRecord = {
      id: `TS_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      date: selectedDate,
      projectId: targetProjectId,
      projectName,
      taskCategory: selectedCategory,
      hoursSpent: Number(hoursSpent),
      hourlyCostRate: hourlyRate,
      laborCost,
      isOvertime,
      overtimeType: isOvertime ? overtimeType : undefined,
      approvalStatus: currentUser.role === 'ROLE_PM' || currentUser.role === 'ROLE_DIRECTOR' ? 'APPROVED' : 'PENDING',
      approvedBy: (currentUser.role === 'ROLE_PM' || currentUser.role === 'ROLE_DIRECTOR') ? `${currentUser.name} (即時自審)` : undefined,
      approvedAt: (currentUser.role === 'ROLE_PM' || currentUser.role === 'ROLE_DIRECTOR') ? new Date().toLocaleString('zh-TW') : undefined,
      description: description || '日常專案圖說編修與會議工時填報'
    };

    onAddTimesheet(newRecord);
    showToast(`📝 工時已成功登錄！自動換算專案人力成本 NT$ ${laborCost.toLocaleString()} (時薪基準 NT$ ${hourlyRate}/hr)`);
    setDescription('');
  };

  // Filtered timesheets
  const filteredTimesheets = timesheets.filter(t => {
    if (selectedProjectFilter !== 'ALL' && t.projectId !== selectedProjectFilter) return false;
    if (selectedStatusFilter !== 'ALL' && t.approvalStatus !== selectedStatusFilter) return false;
    return true;
  });

  const pendingCount = timesheets.filter(t => t.approvalStatus === 'PENDING').length;
  const isApprover = currentUser.role === 'ROLE_PM' || currentUser.role === 'ROLE_DIRECTOR' || currentUser.role === 'ROLE_HR_FIN';

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium font-mono">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            id="timesheet-tab-entry"
            onClick={() => setActiveTab('LOG_ENTRY')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'LOG_ENTRY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>0.5h 專案工時填報 (Timesheet)</span>
          </button>

          <button
            id="timesheet-tab-review"
            onClick={() => setActiveTab('PM_REVIEW')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'PM_REVIEW'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PM 專案工時審核看板</span>
            {pendingCount > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            id="timesheet-tab-costing"
            onClick={() => setActiveTab('COST_ANALYSIS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'COST_ANALYSIS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>專案人力成本與警報</span>
          </button>
        </div>

        {/* Current user hourly rate info */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200 font-mono">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">人員時薪基準:</span>
          <span className="font-bold text-slate-900">NT$ {currentUser.hourlyCostRate}/h</span>
          <span className="text-[10px] text-slate-400 font-sans">(含法定負擔)</span>
        </div>
      </div>

      {/* Sub-View 1: Timesheet Entry Form & Logs */}
      {activeTab === 'LOG_ENTRY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Timesheet Form */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3.5">
              <div className="pb-2.5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>工時填報 (顆粒度 0.5h)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  填報工時自動乘載個人時薪基準換算專案成本
                </p>
              </div>

              <form onSubmit={handleSubmitTimesheet} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    填報日期 (Date)
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      歸屬專案 (Project)
                    </label>
                    {onOpenProjectEdit && targetProjectId !== 'NON_PROJECT' && (
                      <button
                        type="button"
                        id="btn-ts-edit-project"
                        onClick={() => onOpenProjectEdit(targetProjectId)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-800 font-mono font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>✏️ 編輯案件預算</span>
                      </button>
                    )}
                  </div>
                  <select
                    id="ts-project-select"
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <optgroup label="建築事務所進行中專案">
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.code}] {p.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="非專案工項">
                      <option value="NON_PROJECT">【非專案】公共業務 / 行政 / 培訓 / 提案</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    標準工項目錄 (Task Taxonomy - SRS 3.2)
                  </label>
                  <select
                    id="ts-task-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TaskCategory)}
                    className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <optgroup label="專案工項 (Project Tasks)">
                      <option value="SCHEMATIC_DESIGN">📐 方案設計 (SD - Schematic Design)</option>
                      <option value="PERMIT_DRAWINGS">🏛️ 送審執照圖 (Permit Drawings)</option>
                      <option value="CONSTRUCTION_DOCS">🏗️ 施工圖繪製 (CD - Construction Docs)</option>
                      <option value="INTERFACE_COORD">⚡ 界面協調 / BIM 碰撞檢討</option>
                      <option value="SITE_SUPERVISION">🔍 工地監造 (Site Supervision)</option>
                      <option value="CLIENT_MEETINGS">🤝 業主 / 協調會議</option>
                    </optgroup>
                    <optgroup label="非專案工項 (Non-Project Tasks)">
                      <option value="PITCHING">🏆 競圖 / 提案 (Pitching)</option>
                      <option value="INTERNAL_TRAINING">🎓 內部培訓 / AI 技術研討</option>
                      <option value="FIRM_ADMIN">💼 事務所一般行政</option>
                      <option value="SYSTEM_MAINTENANCE">💻 系統維護 / 樣板庫建置</option>
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      投入時數 (0.5h)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="16"
                      value={hoursSpent}
                      onChange={(e) => setHoursSpent(Number(e.target.value))}
                      className="w-full text-xs font-medium py-2 px-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      換算直接成本
                    </label>
                    <div className="w-full text-xs font-mono font-bold py-2 px-2.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between">
                      <span>NT$</span>
                      <span>{Math.round(hoursSpent * currentUser.hourlyCostRate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Overtime Selector */}
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOvertime}
                        onChange={(e) => setIsOvertime(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>延長工時 / 加班 (OT)</span>
                    </label>
                    {isOvertime && (
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                        勞基法連動
                      </span>
                    )}
                  </div>

                  {isOvertime && (
                    <div className="pt-1">
                      <select
                        value={overtimeType}
                        onChange={(e) => setOvertimeType(e.target.value as any)}
                        className="w-full text-xs font-medium py-1.5 px-2 rounded border border-slate-300 bg-white"
                      >
                        <option value="WEEKDAY_OT1">平日加班 前 2 小時 (× 1.34)</option>
                        <option value="WEEKDAY_OT2">平日加班 後 2 小時 (× 1.67)</option>
                        <option value="REST_DAY">休息日加班 (前2h × 1.34，3-8h × 1.67)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    工作內容細部描述
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="例如：B1-3F 停車動線與無障礙電梯昇位施工大樣圖繪製..."
                    className="w-full text-xs font-medium p-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  id="btn-submit-timesheet"
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>登錄 Timesheet 工時紀錄</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right 2 Cols: Timesheet Logs Stream */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-700" />
                    <span>工時填報日誌 (Timesheet Records - SRS 6.1)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    依專案與工項分類，即時呈現換算直接成本與審核狀態
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedProjectFilter}
                    onChange={(e) => setSelectedProjectFilter(e.target.value)}
                    className="text-xs font-medium py-1 px-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="ALL">全部專案</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.code}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                    className="text-xs font-medium py-1 px-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="ALL">全部狀態</option>
                    <option value="PENDING">待審核</option>
                    <option value="APPROVED">已核准</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <th className="py-2 px-2.5">日期 / ID</th>
                      <th className="py-2 px-2.5">同仁</th>
                      <th className="py-2 px-2.5">專案 / 工項</th>
                      <th className="py-2 px-2.5 text-right">工時</th>
                      <th className="py-2 px-2.5 text-right">直接成本</th>
                      <th className="py-2 px-2.5">審核狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredTimesheets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-2.5 text-slate-500">
                          <div className="font-bold text-slate-700">{t.date}</div>
                          <div className="text-[10px]">{t.id}</div>
                        </td>
                        <td className="py-2 px-2.5 font-sans font-medium text-slate-800">
                          {t.userName}
                        </td>
                        <td className="py-2 px-2.5 max-w-xs font-sans">
                          <div className="font-semibold text-slate-800 truncate">{t.projectName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="font-mono bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[10px] border border-slate-200">
                              {t.taskCategory}
                            </span>
                            <span className="truncate text-slate-600">{t.description}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                          {t.hoursSpent}h
                          {t.isOvertime && (
                            <span className="block text-[10px] text-amber-600 font-normal">
                              {t.overtimeType || '加班'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-right text-emerald-700 font-bold">
                          NT$ {t.laborCost.toLocaleString()}
                          <div className="text-[10px] text-slate-400 font-normal font-sans">
                            @NT${t.hourlyCostRate}/h
                          </div>
                        </td>
                        <td className="py-2 px-2.5 font-sans">
                          {t.approvalStatus === 'APPROVED' ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[10px] inline-flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> 已核准
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200 text-[10px]">
                              待 PM 審核
                            </span>
                          )}
                          {t.approvedBy && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">
                              {t.approvedBy}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 2: PM Audit Dashboard */}
      {activeTab === 'PM_REVIEW' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>專案主持人 / PM 工時審核管理看板 (PM Audit Console)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                審核同仁 Timesheet，確認工項真實性，核准後即時歸算至各專案直接成本
              </p>
            </div>

            {isApprover && pendingCount > 0 && (
              <button
                id="btn-batch-approve"
                type="button"
                onClick={() => {
                  onBatchApprove(`${currentUser.name} (${currentUser.title})`);
                  showToast(`⚡ 批次審核成功！已一鍵核准全部 ${pendingCount} 筆待審工時紀錄。`);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer font-mono"
              >
                <Check className="w-3.5 h-3.5" />
                <span>批次全數核准 ({pendingCount} 筆)</span>
              </button>
            )}
          </div>

          {/* Pending items list */}
          <div className="space-y-2.5">
            {timesheets.filter(t => t.approvalStatus === 'PENDING').length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <div className="text-xs font-bold text-slate-800">全部工時紀錄皆已審核完畢</div>
                <div className="text-[11px] text-slate-500 mt-0.5">目前無待審核之 Timesheet 項目</div>
              </div>
            ) : (
              timesheets
                .filter(t => t.approvalStatus === 'PENDING')
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:bg-slate-100/60 border-l-3 border-l-amber-500"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{item.userName}</span>
                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-300 text-slate-700 font-semibold">
                          {item.date}
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-mono">
                          {item.taskCategory}
                        </span>
                        {item.isOvertime && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-mono">
                            加班 ({item.overtimeType})
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-800">{item.projectName}</div>
                      <div className="text-[11px] text-slate-600 italic">"{item.description}"</div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-slate-900">{item.hoursSpent}h</div>
                        <div className="text-[11px] font-mono font-semibold text-emerald-700">
                          NT$ {item.laborCost.toLocaleString()}
                        </div>
                      </div>

                      {isApprover && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onApproveTimesheet(item.id, `${currentUser.name} (PM)`);
                              showToast(`✅ 已核准 ${item.userName} 的 ${item.hoursSpent}h 工時紀錄`);
                            }}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            title="核准通過"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onRejectTimesheet(item.id);
                              showToast(`❌ 已駁回 ${item.userName} 的工時紀錄`);
                            }}
                            className="p-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded text-xs font-bold transition-colors cursor-pointer"
                            title="駁回退件"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Sub-View 3: Workload Heatmap & Project Costing (SRS 3.2) */}
      {activeTab === 'COST_ANALYSIS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>專案人力負載熱點與預算警報 (Workload Heatmap - SRS 3.2)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  即時監控專案直接人力成本與工時消耗：達 85% 發出黃色警告，達 100% 發出紅色警戒
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((proj) => {
                const summary = calculateProjectCostSummary(proj, timesheets);
                return (
                  <div
                    key={proj.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      summary.statusAlert === 'CRITICAL_100'
                        ? 'bg-rose-50/40 border-rose-300 border-l-3 border-l-rose-600'
                        : summary.statusAlert === 'WARNING_85'
                        ? 'bg-amber-50/40 border-amber-300 border-l-3 border-l-amber-500'
                        : 'bg-slate-50 border-slate-200 border-l-3 border-l-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            {proj.code}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            PM: {proj.pmName}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">{proj.name}</h4>
                        <div className="text-[10px] text-slate-500">業主：{proj.client}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {summary.statusAlert === 'CRITICAL_100' && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-2.5 h-2.5" /> 100% 預算超標
                          </span>
                        )}
                        {summary.statusAlert === 'WARNING_85' && (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-2.5 h-2.5" /> 85% 預警
                          </span>
                        )}
                        {summary.statusAlert === 'NORMAL' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px] font-mono">
                            預算正常
                          </span>
                        )}
                        {onOpenProjectEdit && (
                          <button
                            type="button"
                            onClick={() => onOpenProjectEdit(proj.id)}
                            className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                            title="編輯專案與預算"
                          >
                            ✏️ 編輯
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="text-slate-600 text-[11px]">工時消耗進度</span>
                          <span className="font-mono font-bold text-slate-800 text-[11px]">
                            {summary.actualHours} / {proj.totalBudgetHours}h ({summary.hoursBurnRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              summary.hoursBurnRate >= 100
                                ? 'bg-rose-600'
                                : summary.hoursBurnRate >= 85
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, summary.hoursBurnRate)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="text-slate-600 text-[11px]">直接人力成本 (Cost_P)</span>
                          <span className="font-mono font-bold text-slate-800 text-[11px]">
                            NT$ {summary.actualLaborCost.toLocaleString()} / {proj.totalBudgetLaborCost.toLocaleString()} ({summary.costBurnRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              summary.costBurnRate >= 100
                                ? 'bg-rose-600'
                                : summary.costBurnRate >= 85
                                ? 'bg-amber-500'
                                : 'bg-slate-900'
                            }`}
                            style={{ width: `${Math.min(100, summary.costBurnRate)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Milestones Breakdown */}
                    <div className="mt-3 pt-2 border-t border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">里程碑工時進度 (Milestones)</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {proj.milestones.map((m) => (
                          <div key={m.id} className="p-1.5 rounded bg-white border border-slate-200 text-[10px]">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="font-mono">{m.code}</span>
                              <span className={`${m.status === 'COMPLETED' ? 'text-emerald-600' : 'text-blue-600'} font-mono`}>
                                {m.status}
                              </span>
                            </div>
                            <div className="text-slate-500 truncate">{m.name}</div>
                            <div className="text-slate-700 font-mono mt-0.5">
                              {m.actualHours}h / 預算 {m.budgetHours}h
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
