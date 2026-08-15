import React, { useState } from 'react';
import { User, Project, TimesheetRecord, PerformanceReview, MonthlyPayrollSummary } from '../../types';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Layers, 
  Users, 
  Sliders, 
  PieChart, 
  CheckCircle2, 
  Sparkles, 
  FileSpreadsheet,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { calculateProjectCostSummary } from '../../utils/calculations';

interface DirectorDashboardProps {
  currentUser: User;
  allUsers: User[];
  projects: Project[];
  timesheets: TimesheetRecord[];
  performanceReviews: PerformanceReview[];
  onUpdateProjectBonusPool: (projectId: string, newPool: number) => void;
  onOpenProjectEdit?: (projectId?: string) => void;
  onOpenUserEdit?: (userId?: string) => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  currentUser,
  allUsers,
  projects,
  timesheets,
  performanceReviews,
  onUpdateProjectBonusPool,
  onOpenProjectEdit,
  onOpenUserEdit
}) => {
  // Aggregate firm financials
  const totalContractValue = projects.reduce((sum, p) => sum + p.totalContractValue, 0);
  const totalApprovedLaborCost = timesheets
    .filter(t => t.approvalStatus === 'APPROVED')
    .reduce((sum, t) => sum + t.laborCost, 0);
  const totalBonusPools = projects.reduce((sum, p) => sum + p.totalBonusPool, 0);
  
  // Estimated firm profit (Contract - Total Labor - Bonus)
  const estimatedFirmGrossProfit = totalContractValue - totalApprovedLaborCost - totalBonusPools;
  const grossProfitMargin = totalContractValue > 0 ? (estimatedFirmGrossProfit / totalContractValue) * 100 : 0;

  // Editing Bonus Pool State
  const [editingProjectId, setEditingProjectId] = useState<string>(projects[0]?.id || '');
  const [newBonusPool, setNewBonusPool] = useState<number>(projects[0]?.totalBonusPool || 300000);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateBonusPool = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectBonusPool(editingProjectId, Number(newBonusPool));
    showToast(`💰 專案提成獎金池已更新為 NT$ ${Number(newBonusPool).toLocaleString()}！`);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-medium font-mono">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Executive Hero Overview */}
      <div className="bg-slate-900 rounded-lg p-4 text-white shadow-xs border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold mb-1 border border-blue-500/30 uppercase tracking-wider font-mono">
              <Building2 className="w-3 h-3" />
              <span>主持建築師 (Principal) 營運財務與專案利潤總攬</span>
            </div>
            <h2 className="text-base font-bold tracking-tight">
              事務所專案契約額與人力毛利分析
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              實時連動全所已審核 Timesheet 人力成本、專案提成與勞健保雇主負擔
            </p>
          </div>

          <div className="text-left md:text-right bg-slate-800/80 px-3.5 py-2 rounded border border-slate-700 font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">事務所綜合毛利率</span>
            <div className="text-2xl font-extrabold text-blue-400">
              {grossProfitMargin.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 4 Big KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
          <div className="bg-slate-800/90 rounded p-3 border border-slate-700 border-l-3 border-l-blue-500">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">專案契約總額</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              NT$ {totalContractValue.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/90 rounded p-3 border border-slate-700 border-l-3 border-l-rose-500">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">累計直接人力成本</div>
            <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
              NT$ {totalApprovedLaborCost.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/90 rounded p-3 border border-slate-700 border-l-3 border-l-emerald-500">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">已提撥專案獎金池</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              NT$ {totalBonusPools.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/90 rounded p-3 border border-slate-700 border-l-3 border-l-amber-500">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">預估專案結餘毛利</div>
            <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
              NT$ {estimatedFirmGrossProfit.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Profit Margin & Bonus Pool Setting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Profit Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>各專案工時成本與利潤結構表</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold">
                  共 {projects.length} 個大型建案
                </span>
                {onOpenProjectEdit && (
                  <button
                    type="button"
                    onClick={() => onOpenProjectEdit()}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    + 新增/編輯案件
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2 px-2.5">專案代碼 / 名稱</th>
                    <th className="py-2 px-2.5 text-right">契約總額 (NT$)</th>
                    <th className="py-2 px-2.5 text-right">已耗人力成本</th>
                    <th className="py-2 px-2.5 text-right">提成獎金池</th>
                    <th className="py-2 px-2.5 text-right">毛利率</th>
                    <th className="py-2 px-2.5 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {projects.map((proj) => {
                    const costSummary = calculateProjectCostSummary(proj, timesheets);
                    const projProfit = proj.totalContractValue - costSummary.actualLaborCost - proj.totalBonusPool;
                    const margin = (projProfit / proj.totalContractValue) * 100;
                    return (
                      <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2.5 font-sans">
                          <div className="font-bold text-slate-900">{proj.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {proj.code} | PM: {proj.pmName}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-slate-800">
                          NT$ {proj.totalContractValue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-rose-700 font-semibold">
                          NT$ {costSummary.actualLaborCost.toLocaleString()}
                          <div className="text-[10px] text-slate-400">
                            {costSummary.actualHours}h / {proj.totalBudgetHours}h
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-emerald-700 font-bold">
                          NT$ {proj.totalBonusPool.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-blue-900">
                          {margin.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          {onOpenProjectEdit && (
                            <button
                              type="button"
                              onClick={() => onOpenProjectEdit(proj.id)}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 text-[10px] font-bold font-sans transition-colors cursor-pointer"
                            >
                              ✏️ 編輯
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Adjust Bonus Pool & Parameters (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="pb-2.5 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>專案利潤與提成比例設置 (SRS 2.0)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                主持建築師可依專案議價與毛利調整結案獎金池 (Total Bonus Pool)
              </p>
            </div>

            <form onSubmit={handleUpdateBonusPool} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  選擇專案
                </label>
                <select
                  value={editingProjectId}
                  onChange={(e) => {
                    setEditingProjectId(e.target.value);
                    const p = projects.find(item => item.id === e.target.value);
                    if (p) setNewBonusPool(p.totalBonusPool);
                  }}
                  className="w-full text-xs font-medium py-1.5 px-2.5 rounded border border-slate-300 bg-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  提成獎金池金額 (NT$)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={newBonusPool}
                  onChange={(e) => setNewBonusPool(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold py-1.5 px-2.5 rounded border border-slate-300 bg-white"
                />
              </div>

              <button
                id="btn-update-bonus-pool"
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold font-mono shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                <span>更新專案提成池設定</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
