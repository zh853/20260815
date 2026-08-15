import React from 'react';
import { User, Project, TimesheetRecord } from '../../types';
import { 
  ArrowRight, 
  Clock, 
  Briefcase, 
  Award, 
  Calculator, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Zap,
  TrendingUp,
  FileCheck,
  Building
} from 'lucide-react';

interface SystemWorkflowProps {
  currentUser: User;
  projects: Project[];
  timesheets: TimesheetRecord[];
  onNavigateTab: (tab: string) => void;
  onOpenUserEdit?: (userId?: string) => void;
  onOpenProjectEdit?: (projectId?: string) => void;
}

export const SystemWorkflowPanel: React.FC<SystemWorkflowProps> = ({
  currentUser,
  projects,
  timesheets,
  onNavigateTab,
  onOpenUserEdit,
  onOpenProjectEdit
}) => {
  // Aggregate statistics for workflow visualization
  const totalLoggedHours = timesheets.reduce((sum, t) => sum + t.hoursSpent, 0);
  const totalApprovedLaborCost = timesheets
    .filter(t => t.approvalStatus === 'APPROVED')
    .reduce((sum, t) => sum + t.laborCost, 0);
  const activeProjectsCount = projects.filter(p => p.status !== 'COMPLETED').length;

  return (
    <div className="space-y-4">
      {/* Top Banner introducing Tri-Integrated Philosophy */}
      <div className="bg-slate-900 rounded-lg p-4 text-white shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-400">
                Timesheet-driven Tri-Integrated Architecture
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              建築師事務所營運核心引擎 · SINGLE SOURCE OF TRUTH
            </span>
          </div>

          <h2 className="text-lg font-bold tracking-tight text-white mb-1">
            建築師事務所「出勤 - 績效 - 薪資」即時數據流覽
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-4xl mb-4">
            以「工時 (Timesheet)」為核心，自動將每日外勤 GPS/Wi-Fi 簽到與繪圖時數，即時轉化為專案成本預警、多維度績效提成與台灣《勞動基準法》合規薪資結算。
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">本月全所累計工時</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {totalLoggedHours.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">小時</span>
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">累計已審核人力成本</div>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                NT$ {totalApprovedLaborCost.toLocaleString()}
              </div>
            </div>
            <div 
              onClick={() => onOpenProjectEdit && onOpenProjectEdit()}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-lg p-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">執行中建築專案數</div>
                <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">✏️ 管理</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {activeProjectsCount} <span className="text-xs font-normal text-slate-400 font-sans">個專案</span>
              </div>
            </div>
            <div 
              onClick={() => onOpenUserEdit && onOpenUserEdit(currentUser.id)}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-lg p-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">個人時薪成本基準</div>
                <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">✏️ 編輯</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                NT$ {currentUser.hourlyCostRate} <span className="text-xs font-normal text-slate-400 font-sans">/hr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Interactive Pipeline */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              SRS 系統整合核心流程 (System Integration Workflow)
            </h3>
            <p className="text-[11px] text-slate-500">
              點擊任一階段卡片即可快速跳轉至該功能模組進行即時操作與審核
            </p>
          </div>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            PIPELINE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div 
            id="workflow-step-1"
            onClick={() => onNavigateTab('attendance')}
            className="group bg-slate-50 hover:bg-slate-100/80 rounded-lg p-3 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between border-l-3 border-l-blue-500"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  STEP 01
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  每日打卡端點
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">智慧外勤與打卡</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                GPS 200m 地理圍欄比對、辦公室 Wi-Fi MAC 認證、跑照/監造現場浮水印拍照，及 18:30 公出免簽退自動判定。
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
              <span>前往出勤打卡</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Step 2 */}
          <div 
            id="workflow-step-2"
            onClick={() => onNavigateTab('timesheet')}
            className="group bg-slate-50 hover:bg-slate-100/80 rounded-lg p-3 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between border-l-3 border-l-emerald-500"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  STEP 02
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  每週工時彙總
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900">工時歸算與成本預警</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                0.5h 最小顆粒度填報。PM 審核後自動換算直接人力成本 (<span className="font-mono text-[10px]">Hourly Rate × Hours</span>) 並觸發 85%/100% 預算警報。
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
              <span>查看工時與專案成本</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Step 3 */}
          <div 
            id="workflow-step-3"
            onClick={() => onNavigateTab('performance')}
            className="group bg-slate-50 hover:bg-slate-100/80 rounded-lg p-3 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between border-l-3 border-l-amber-500"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  STEP 03
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  週期與結案提成
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900">多維度績效與提成</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                品質40%、時程30%、出勤15%、貢獻15% 換算 <span className="font-mono text-[10px]">K_perf</span>。建照/使照取得觸發結案獎金池依工時與權重分流。
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-amber-600 font-semibold">
              <span>進行績效與提成核算</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Step 4 */}
          <div 
            id="workflow-step-4"
            onClick={() => onNavigateTab('payroll')}
            className="group bg-slate-50 hover:bg-slate-100/80 rounded-lg p-3 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between border-l-3 border-l-indigo-500"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  STEP 04
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  月末勞基法結算
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">勞基法薪資與扣繳</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                固定薪 + 勞基法第24條加班費 (1.34/1.67/2.67) + 提成 + 交通津貼 - 勞健保/勞退自提/所得稅，產出加密電子薪資單。
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-indigo-600 font-semibold">
              <span>查看薪資與試算明細</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Capabilities Reference Cards */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-600" />
            <span>事務所四重角色權限與職能矩陣 (Roles &amp; Permissions)</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">ROLE-BASED ACCESS CONTROL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg border bg-white ${currentUser.role === 'ROLE_STAFF' ? 'ring-1 ring-blue-500 border-blue-400 bg-blue-50/20' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                ROLE_STAFF
              </span>
              {currentUser.role === 'ROLE_STAFF' && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 font-mono">
                  <CheckCircle className="w-3 h-3" /> ACTIVE
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-800 mb-1">一般同仁 (繪圖/跑照/監造)</div>
            <ul className="text-[11px] text-slate-600 space-y-0.5">
              <li>• GPS &amp; Wi-Fi 彈性打卡 / 外勤簽到</li>
              <li>• 填報 0.5h 專案工時 Timesheet</li>
              <li>• 請假申請與 12 個月補休池管理</li>
              <li>• 檢視個人加密電子薪資單</li>
            </ul>
          </div>

          <div className={`p-3 rounded-lg border bg-white ${currentUser.role === 'ROLE_PM' ? 'ring-1 ring-emerald-500 border-emerald-400 bg-emerald-50/20' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ROLE_PM
              </span>
              {currentUser.role === 'ROLE_PM' && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 font-mono">
                  <CheckCircle className="w-3 h-3" /> ACTIVE
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-800 mb-1">專案主持人 / PM</div>
            <ul className="text-[11px] text-slate-600 space-y-0.5">
              <li>• 審核組員專案工時 Timesheet</li>
              <li>• 維護 SD/Permit/CD 階段里程碑</li>
              <li>• 監控 85% / 100% 人力成本熱點警報</li>
              <li>• 專案結案貢獻度評分 (Score Weight)</li>
            </ul>
          </div>

          <div className={`p-3 rounded-lg border bg-white ${currentUser.role === 'ROLE_HR_FIN' ? 'ring-1 ring-amber-500 border-amber-400 bg-amber-50/20' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ROLE_HR_FIN
              </span>
              {currentUser.role === 'ROLE_HR_FIN' && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 font-mono">
                  <CheckCircle className="w-3 h-3" /> ACTIVE
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-800 mb-1">行政 / 人資 / 會計</div>
            <ul className="text-[11px] text-slate-600 space-y-0.5">
              <li>• 全所勤怠審核與公出免簽退覆核</li>
              <li>• 薪資與勞健保/所得稅扣繳結算</li>
              <li>• 勞健保投保薪資分級表維護</li>
              <li>• 審批與發放全所電子薪資單</li>
            </ul>
          </div>

          <div className={`p-3 rounded-lg border bg-white ${currentUser.role === 'ROLE_DIRECTOR' ? 'ring-1 ring-slate-800 border-slate-700 bg-slate-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                ROLE_DIRECTOR
              </span>
              {currentUser.role === 'ROLE_DIRECTOR' && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 font-mono">
                  <CheckCircle className="w-3 h-3" /> ACTIVE
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-800 mb-1">主持建築師 (Principal)</div>
            <ul className="text-[11px] text-slate-600 space-y-0.5">
              <li>• 全系統專案利潤與人力成本總覽</li>
              <li>• 最終績效係數 (K_perf) 核算直評</li>
              <li>• 專案利潤與提成獎金池總額設置</li>
              <li>• 系統全域參數與權限管理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
