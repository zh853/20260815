import React, { useState } from 'react';
import { User, Project, PerformanceReview, TimesheetRecord } from '../../types';
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Sliders, 
  Building2, 
  Star, 
  Sparkles, 
  ChevronRight, 
  FileCheck, 
  UserCheck, 
  Scale, 
  ShieldCheck,
  Send,
  Zap,
  Info
} from 'lucide-react';
import { calculateKPerf, calculateProjectBonus } from '../../utils/calculations';
import confetti from 'canvas-confetti';

interface PerformanceReviewProps {
  currentUser: User;
  allUsers: User[];
  projects: Project[];
  timesheets: TimesheetRecord[];
  performanceReviews: PerformanceReview[];
  onUpdatePerformanceReview: (review: PerformanceReview) => void;
  onDistributeProjectBonus: (projectId: string, bonusAllocations: any[]) => void;
  onOpenProjectEdit?: (projectId?: string) => void;
  onOpenUserEdit?: (userId?: string) => void;
}

export const PerformanceReviewPanel: React.FC<PerformanceReviewProps> = ({
  currentUser,
  allUsers,
  projects,
  timesheets,
  performanceReviews,
  onUpdatePerformanceReview,
  onDistributeProjectBonus,
  onOpenProjectEdit,
  onOpenUserEdit
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'KPI_MATRIX' | 'PROJECT_BONUS_POOL'>('KPI_MATRIX');

  // Selected User for KPI evaluation
  const [targetUserId, setTargetUserId] = useState<string>('EMP_042');
  const targetUser = allUsers.find(u => u.id === targetUserId) || allUsers[0];

  // Current user's or target user's review
  const existingReview = performanceReviews.find(r => r.userId === targetUserId) || {
    id: `PERF_${Date.now()}_${targetUserId}`,
    userId: targetUserId,
    userName: targetUser.name,
    period: '2026-Q2 (第二季)',
    scores: {
      quality: {
        score: 92,
        weight: 0.40,
        reviewer: '陳品睿 (專案主持人 PM)',
        notes: '執照圖繪製一次通過幹事會審查'
      },
      schedule: {
        score: 90,
        weight: 0.30,
        milestonePassRate: 95,
        reviewer: '陳品睿 (PM / 甘特圖比對)'
      },
      collaboration: {
        score: 86,
        weight: 0.15,
        attendancePunctuality: 94,
        peerScore: 82,
        reviewer: '系統勤怠 + 同儕評分'
      },
      contribution: {
        score: 92,
        weight: 0.15,
        bimAiInnovation: 92,
        competitionAssistance: 90,
        reviewer: '王漢卿 (主持建築師直評)'
      }
    },
    totalWeightedScore: 90.5,
    grade: 'S',
    kPerf: 1.5,
    directorSignOff: true
  };

  // Editable scores
  const [qualityScore, setQualityScore] = useState<number>(existingReview.scores.quality.score);
  const [scheduleScore, setScheduleScore] = useState<number>(existingReview.scores.schedule.score);
  const [collabScore, setCollabScore] = useState<number>(existingReview.scores.collaboration.score);
  const [contributionScore, setContributionScore] = useState<number>(existingReview.scores.contribution.score);
  const [qualityNotes, setQualityNotes] = useState<string>(existingReview.scores.quality.notes);

  // Re-compute weighted score
  const totalScore = Number((
    qualityScore * 0.40 +
    scheduleScore * 0.30 +
    collabScore * 0.15 +
    contributionScore * 0.15
  ).toFixed(1));

  const { grade, kPerf } = calculateKPerf(totalScore);

  // Project Post-mortem Bonus simulation state
  const [selectedBonusProjectId, setSelectedBonusProjectId] = useState<string>(projects[1]?.id || projects[0]?.id);
  const bonusProject = projects.find(p => p.id === selectedBonusProjectId) || projects[0];

  // Team contribution weights for the bonus project
  const [pmWeights, setPmWeights] = useState<Record<string, number>>({
    EMP_042: 1.25, // 林哲宇 (主繪設計師)
    EMP_008: 1.10, // 陳品睿 (PM)
    EMP_088: 1.00  // 許詠涵 (監造)
  });

  // Calculate project hours per team member
  const projectTimesheets = timesheets.filter(t => t.projectId === bonusProject.id && t.approvalStatus === 'APPROVED');
  const teamMemberStats = (bonusProject.teamMemberIds || ['EMP_042', 'EMP_008']).map(memId => {
    const user = allUsers.find(u => u.id === memId);
    const userHours = projectTimesheets
      .filter(t => t.userId === memId)
      .reduce((sum, t) => sum + t.hoursSpent, 0) || (memId === 'EMP_042' ? 14.5 : 8.0);
    const weight = pmWeights[memId] || 1.0;
    return {
      userId: memId,
      userName: user?.name || memId,
      hoursOnProject: userHours,
      scoreWeight: weight
    };
  });

  const bonusAllocations = calculateProjectBonus(bonusProject.totalBonusPool, teamMemberStats);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveReview = () => {
    const updated: PerformanceReview = {
      ...existingReview,
      userId: targetUserId,
      userName: targetUser.name,
      scores: {
        quality: { ...existingReview.scores.quality, score: qualityScore, notes: qualityNotes },
        schedule: { ...existingReview.scores.schedule, score: scheduleScore },
        collaboration: { ...existingReview.scores.collaboration, score: collabScore },
        contribution: { ...existingReview.scores.contribution, score: contributionScore }
      },
      totalWeightedScore: totalScore,
      grade,
      kPerf,
      directorSignOff: currentUser.role === 'ROLE_DIRECTOR' || existingReview.directorSignOff
    };

    onUpdatePerformanceReview(updated);
    showToast(`🎯 績效考評已更新！綜合得分 ${totalScore} 分 (評定等第: ${grade} 級，連動加成係數 K_perf = ${kPerf})`);
  };

  const handleTriggerBonusPayout = () => {
    onDistributeProjectBonus(bonusProject.id, bonusAllocations);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    showToast(`🎉 專案結案提成 NT$ ${bonusProject.totalBonusPool.toLocaleString()} 已成功結算並自動匯入同仁薪資模組！`);
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

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            id="perf-tab-kpi"
            onClick={() => setActiveSubTab('KPI_MATRIX')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'KPI_MATRIX'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>4.1 多維度考核指標與 K_perf (KPI Matrix)</span>
          </button>

          <button
            id="perf-tab-bonus"
            onClick={() => setActiveSubTab('PROJECT_BONUS_POOL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'PROJECT_BONUS_POOL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>4.2 B 專案結案提成算式 (Bonus Pool)</span>
          </button>
        </div>

        {/* Selected target user dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">受評同仁:</span>
          <select
            value={targetUserId}
            onChange={(e) => {
              setTargetUserId(e.target.value);
              const uReview = performanceReviews.find(r => r.userId === e.target.value);
              if (uReview) {
                setQualityScore(uReview.scores.quality.score);
                setScheduleScore(uReview.scores.schedule.score);
                setCollabScore(uReview.scores.collaboration.score);
                setContributionScore(uReview.scores.contribution.score);
                setQualityNotes(uReview.scores.quality.notes);
              }
            }}
            className="text-xs font-semibold py-1 px-2.5 rounded border border-slate-300 bg-white text-slate-800"
          >
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
            ))}
          </select>
          {onOpenUserEdit && (
            <button
              type="button"
              id="btn-perf-edit-user"
              onClick={() => onOpenUserEdit(targetUserId)}
              className="text-[10px] text-blue-700 hover:text-blue-800 font-mono font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>✏️ 編輯人員</span>
            </button>
          )}
        </div>
      </div>

      {/* View 1: Multi-Dimensional KPI Matrix */}
      {activeSubTab === 'KPI_MATRIX' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: 4 Dimension Scoring Matrix */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                    <span>多維度考核指標 (KPI / OKR) 結構 (SRS 4.1)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    專案品質(40%) + 時程進度(30%) + 出勤協作(15%) + 專業貢獻(15%)
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                  2026-Q2 考核期
                </span>
              </div>

              {/* 4 Dimension Sliders & Evaluator Rows */}
              <div className="space-y-3">
                {/* Dim 1: Quality (40%) */}
                <div className="p-3 rounded border border-slate-200 bg-slate-50/70 space-y-1.5 border-l-3 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        1. 專案執行品質 (Quality - 40% 權重)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        繪圖精準度、退件/變更率、送審一次通過率、監造缺失紀錄 (專案主持人/複審建築師)
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {qualityScore} 分
                    </span>
                  </div>

                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={qualityScore}
                    onChange={(e) => setQualityScore(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <input
                    type="text"
                    value={qualityNotes}
                    onChange={(e) => setQualityNotes(e.target.value)}
                    placeholder="PM 評核意見：如執照一次通過、細部大樣繪製精準..."
                    className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white text-slate-700"
                  />
                </div>

                {/* Dim 2: Schedule (30%) */}
                <div className="p-3 rounded border border-slate-200 bg-slate-50/70 space-y-1.5 border-l-3 border-l-emerald-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        2. 時程與進度 (Schedule - 30% 權重)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        方案/執照/施工圖各階段里程碑 (Milestone) 如期交付率 (PM 評分 + 甘特圖比對)
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {scheduleScore} 分
                    </span>
                  </div>

                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={scheduleScore}
                    onChange={(e) => setScheduleScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Dim 3: Attendance & Collab (15%) */}
                <div className="p-3 rounded border border-slate-200 bg-slate-50/70 space-y-1.5 border-l-3 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        3. 出勤與協作 (Attendance & Collaboration - 15% 權重)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        勤怠準時率、工時填報完整度、跨組別 (建築/結構/機電) 溝通 (系統數據50% + 同儕50%)
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {collabScore} 分
                    </span>
                  </div>

                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={collabScore}
                    onChange={(e) => setCollabScore(Number(e.target.value))}
                    className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Dim 4: Contribution (15%) */}
                <div className="p-3 rounded border border-slate-200 bg-slate-50/70 space-y-1.5 border-l-3 border-l-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        4. 專業與業務貢獻 (Contribution - 15% 權重)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        新技術導入 (BIM/AI)、公開競圖獲獎、協助事務所簡報/接案 (主持建築師直評)
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {contributionScore} 分
                    </span>
                  </div>

                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={contributionScore}
                    onChange={(e) => setContributionScore(Number(e.target.value))}
                    className="w-full accent-slate-800 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                id="btn-save-performance-review"
                type="button"
                onClick={handleSaveReview}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>儲存考評並連動薪資加成係數 (K_perf)</span>
              </button>
            </div>
          </div>

          {/* Right 1 Col: Grade & K_perf Conversion Box (SRS 4.2 A) */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>考評等第與 K_perf 轉換 (SRS 4.2 A)</span>
              </h4>

              {/* Score Display Card */}
              <div className="p-4 rounded-lg bg-slate-900 text-white text-center space-y-1.5 shadow-sm border border-slate-800">
                <div className="text-[11px] text-slate-400 font-medium">多維度加權總分 (Total Score)</div>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {totalScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>

                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-around">
                  <div>
                    <div className="text-[10px] text-slate-400">評定等第</div>
                    <div className="text-xl font-bold text-blue-400 mt-0.5 font-mono">{grade} 級</div>
                  </div>
                  <div className="w-px h-7 bg-slate-800"></div>
                  <div>
                    <div className="text-[10px] text-slate-400">等第加成係數 (K_perf)</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                      × {kPerf}
                    </div>
                  </div>
                </div>
              </div>

              {/* K_perf Reference Table */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SRS 4.2 評分等第轉換表</div>
                <div className="space-y-1 text-xs font-mono">
                  <div className={`p-1.5 rounded border flex items-center justify-between text-[11px] ${grade === 'S' ? 'bg-amber-50 border-amber-300 font-bold text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>S 級 (≥ 90 分)</span>
                    <span>K_perf = 1.5 (150%)</span>
                  </div>
                  <div className={`p-1.5 rounded border flex items-center justify-between text-[11px] ${grade === 'A' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>A 級 (80 - 89 分)</span>
                    <span>K_perf = 1.2 (120%)</span>
                  </div>
                  <div className={`p-1.5 rounded border flex items-center justify-between text-[11px] ${grade === 'B' ? 'bg-blue-50 border-blue-300 font-bold text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>B 級 (70 - 79 分)</span>
                    <span>K_perf = 1.0 (100%)</span>
                  </div>
                  <div className={`p-1.5 rounded border flex items-center justify-between text-[11px] ${grade === 'C' ? 'bg-orange-50 border-orange-300 font-bold text-orange-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>C 級 (60 - 69 分)</span>
                    <span>K_perf = 0.8 (80%)</span>
                  </div>
                  <div className={`p-1.5 rounded border flex items-center justify-between text-[11px] ${grade === 'D' ? 'bg-rose-50 border-rose-300 font-bold text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span>D 級 (&lt; 60 分)</span>
                    <span>K_perf = 0.0 (0%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Project Post-mortem Bonus Pool Allocator (SRS 4.2 B) */}
      {activeSubTab === 'PROJECT_BONUS_POOL' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>專案結案提成算式與分流試算 (Project Post-mortem Bonus - SRS 4.2 B)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                觸發時機：建造執照、使用執照取得或竣工結算。自動依同仁專案工時佔比與 PM 貢獻權重分配提成獎金池。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">結案專案:</span>
              <select
                id="select-bonus-project"
                value={selectedBonusProjectId}
                onChange={(e) => setSelectedBonusProjectId(e.target.value)}
                className="text-xs font-semibold py-1 px-2.5 rounded border border-slate-300 bg-white text-slate-800"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} (NT${p.totalBonusPool.toLocaleString()})
                  </option>
                ))}
              </select>
              {onOpenProjectEdit && (
                <button
                  type="button"
                  id="btn-perf-edit-project"
                  onClick={() => onOpenProjectEdit(selectedBonusProjectId)}
                  className="text-[10px] text-emerald-700 hover:text-emerald-800 font-mono font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>✏️ 編輯案件/獎金池</span>
                </button>
              )}
            </div>
          </div>

          {/* Formula Banner */}
          <div className="p-3 rounded-lg bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-3 border border-slate-800">
            <div className="space-y-0.5 text-center md:text-left">
              <div className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">
                SRS 4.2 B 核心分配算式 (Post-mortem Bonus Formula)
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-white">
                Bonus<sub>i, P</sub> = Total_Bonus_Pool<sub>P</sub> × ( Hours<sub>i, P</sub> / Total_Hours<sub>P</sub> ) × Score_Weight<sub>i, P</sub>
              </div>
            </div>

            <div className="bg-slate-800/80 px-3.5 py-2 rounded text-center border border-slate-700 font-mono">
              <div className="text-[10px] text-slate-400">專案提成獎金池</div>
              <div className="text-base font-bold text-emerald-400">
                NT$ {bonusProject.totalBonusPool.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Allocation Table with Interactive Weight Adjusters */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="py-2 px-2.5">專案參與同仁</th>
                  <th className="py-2 px-2.5 text-right">已審核工時 (Hours_i)</th>
                  <th className="py-2 px-2.5 text-right">工時佔比</th>
                  <th className="py-2 px-2.5">PM 貢獻度權重 (Score_Weight)</th>
                  <th className="py-2 px-2.5 text-right">結算分配提成 (Bonus_i,P)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {bonusAllocations.map((item) => (
                  <tr key={item.userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-2.5 font-sans">
                      <div className="font-bold text-slate-800">{item.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.userId}</div>
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-semibold text-slate-800">
                      {item.hoursOnProject}h
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-slate-600">
                      {item.hoursRatio}%
                    </td>
                    <td className="py-2.5 px-2.5 font-sans">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.05"
                          min="0.5"
                          max="2.0"
                          value={pmWeights[item.userId] || 1.0}
                          onChange={(e) => {
                            setPmWeights({
                              ...pmWeights,
                              [item.userId]: Number(e.target.value)
                            });
                          }}
                          className="w-16 text-xs font-mono font-bold py-1 px-1.5 rounded border border-slate-300 bg-white"
                        />
                        <span className="text-[10px] text-slate-400">
                          (0.8~1.5)
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-emerald-700 font-extrabold text-xs">
                      NT$ {item.calculatedBonus.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trigger Post-mortem Payout */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              📌 點擊確認結案後，提成金額將自動匯入同仁「模組三：薪資與獎金結算」之當月發薪清冊。
            </div>

            <button
              id="btn-distribute-project-bonus"
              type="button"
              onClick={handleTriggerBonusPayout}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap font-mono"
            >
              <Award className="w-3.5 h-3.5" />
              <span>確認執照取得 / 結案提成撥發入薪資 (Payout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
