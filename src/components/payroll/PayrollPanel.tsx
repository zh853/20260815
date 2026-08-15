import React, { useState } from 'react';
import { User, MonthlyPayrollSummary, TimesheetRecord, PerformanceReview, Project } from '../../types';
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  Lock, 
  Unlock, 
  Printer, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  TrendingUp,
  CreditCard,
  Building,
  RefreshCw
} from 'lucide-react';
import { 
  calculateUserHourlyRate, 
  calculateOvertimePay, 
  calculateTransportAllowance,
  getLaborInsurance,
  getHealthInsurance,
  getPensionInsuredSalary,
  LABOR_INSURANCE_TABLE,
  HEALTH_INSURANCE_TABLE
} from '../../utils/calculations';

interface PayrollPanelProps {
  currentUser: User;
  allUsers: User[];
  projects: Project[];
  timesheets: TimesheetRecord[];
  performanceReviews: PerformanceReview[];
  monthlyPayrolls: MonthlyPayrollSummary[];
  onUpdatePayroll: (payroll: MonthlyPayrollSummary) => void;
  onOpenUserEdit?: (userId?: string) => void;
  onOpenProjectEdit?: (projectId?: string) => void;
}

export const PayrollPanel: React.FC<PayrollPanelProps> = ({
  currentUser,
  allUsers,
  projects,
  timesheets,
  performanceReviews,
  monthlyPayrolls,
  onUpdatePayroll,
  onOpenUserEdit,
  onOpenProjectEdit
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const targetUser = allUsers.find(u => u.id === selectedUserId) || currentUser;

  // Payslip encryption lock state (simulates electronic password protected payslip)
  const [isPayslipUnlocked, setIsPayslipUnlocked] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Print mode trigger
  const [isPrintPreview, setIsPrintPreview] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find or calculate payroll for selected user
  const existingPayroll = monthlyPayrolls.find(p => p.userId === selectedUserId) || {
    id: `PAY_2026_08_${selectedUserId}`,
    userId: selectedUserId,
    userName: targetUser.name,
    userTitle: targetUser.title,
    payPeriod: '2026-08 (八月份)',
    paymentDate: '2026-09-05',
    status: 'APPROVED' as const,
    fixedPay: {
      baseSalary: targetUser.baseSalary,
      positionAllowance: targetUser.positionAllowance,
      licenseAllowance: (targetUser.licenses || []).reduce((s, l) => s + l.allowance, 0),
      mealAllowance: 3000,
      totalFixedPay: targetUser.baseSalary + targetUser.positionAllowance + (targetUser.licenses || []).reduce((s, l) => s + l.allowance, 0)
    },
    variablePay: {
      weekdayOvertimeHours1: 4.0,
      weekdayOvertimePay1: 2000,
      weekdayOvertimeHours2: 0.0,
      weekdayOvertimePay2: 0,
      restDayOvertimeHours: 0.0,
      restDayOvertimePay: 0,
      totalOvertimePay: 2000,
      overtimeHoursConvertedToCompTime: 4.0,
      performanceBonusBase: 6000,
      kPerf: 1.2,
      performanceBonus: 7200,
      projectPostMortemBonus: 15000,
      transportOutingCount: 6,
      transportOutingFixedRate: 150,
      mileageKm: 80,
      mileageRate: 8,
      transportAllowance: 1540,
      totalVariablePay: 25740
    },
    grossSalary: 0,
    statutoryDeductions: {
      laborInsuranceGrade: 45800,
      laborInsurance: 1100,
      healthInsuranceGrade: 72800,
      healthInsurance: 1129,
      laborPensionSelfRate: targetUser.pensionSelfRate,
      laborPensionSelf: 4000,
      taxableIncome: 0,
      incomeTaxWithheld: 2500,
      leaveDeduction: 0,
      totalDeductions: 8729
    },
    employerStatutoryBurden: {
      employerLaborInsurance: 3847,
      employerHealthInsurance: 3545,
      employerPension6Pct: 4188,
      employmentInsurance: 458,
      occupationalAccidentInsurance: 150,
      totalEmployerBurden: 12188
    },
    netPay: 0
  };

  // Re-calculate live values
  const userRateCalc = calculateUserHourlyRate(targetUser);
  const userReview = performanceReviews.find(r => r.userId === selectedUserId);
  const currentKPerf = userReview?.kPerf ?? 1.2;

  // Dynamic variable components
  const [otHours1, setOtHours1] = useState<number>(existingPayroll.variablePay.weekdayOvertimeHours1);
  const [otHours2, setOtHours2] = useState<number>(existingPayroll.variablePay.weekdayOvertimeHours2);
  const [restDayHours, setRestDayHours] = useState<number>(existingPayroll.variablePay.restDayOvertimeHours);
  const [compTimeDiverted, setCompTimeDiverted] = useState<number>(existingPayroll.variablePay.overtimeHoursConvertedToCompTime);
  const [outingCount, setOutingCount] = useState<number>(existingPayroll.variablePay.transportOutingCount);
  const [mileageKm, setMileageKm] = useState<number>(existingPayroll.variablePay.mileageKm);
  const [projectBonusAmount, setProjectBonusAmount] = useState<number>(existingPayroll.variablePay.projectPostMortemBonus);

  // Compute live Overtime
  const otCalc = calculateOvertimePay(userRateCalc.baseHourlyRate, otHours1, otHours2, restDayHours);
  const transportAllowance = calculateTransportAllowance(outingCount, 150, mileageKm, 8);
  const performanceBonus = Math.round(6000 * currentKPerf);

  // Fixed Pay
  const licenseTotal = (targetUser.licenses || []).reduce((s, l) => s + l.allowance, 0);
  const totalFixed = targetUser.baseSalary + targetUser.positionAllowance + licenseTotal + 3000;

  // Variable Pay
  const totalVariable = otCalc.totalOvertimePay + performanceBonus + projectBonusAmount + transportAllowance;

  // Gross Salary
  const grossSalary = totalFixed + totalVariable;

  // Statutory Deductions
  const laborIns = getLaborInsurance(totalFixed);
  const healthIns = getHealthInsurance(grossSalary);
  const pensionInsured = getPensionInsuredSalary(grossSalary);
  const pensionSelf = Math.round(pensionInsured * targetUser.pensionSelfRate);
  
  // Taxable income (Gross - MealAllowance(3000) - PensionSelf)
  const taxableIncome = Math.max(0, grossSalary - 3000 - pensionSelf);
  // Advance tax withholding (5% if taxable exceeds standard threshold e.g. 88,500)
  const incomeTaxWithheld = taxableIncome >= 88500 ? Math.round(taxableIncome * 0.05) : 0;
  
  const totalDeductions = laborIns.employeeShare + healthIns.employeeShare + pensionSelf + incomeTaxWithheld;
  const netPay = grossSalary - totalDeductions;

  // Employer burden
  const employerPension6Pct = Math.round(pensionInsured * 0.06);
  const totalEmployerBurden = laborIns.employerShare + healthIns.employerShare + employerPension6Pct + 458 + 160;

  // Unlock electronic payslip
  const handleUnlockPayslip = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234' || passwordInput === targetUser.id || passwordInput.length >= 4) {
      setIsPayslipUnlocked(true);
      setPasswordError(null);
      showToast('🔓 電子薪資單解鎖成功！');
    } else {
      setPasswordError('密碼錯誤（預設為身分證末四碼或 1234）');
    }
  };

  const handlePrint = () => {
    window.print();
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

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>模組三：薪資與獎金自動計算引擎 (Module 3 SPEC)</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            算式：總實發薪資 = (固定薪資 + 變動薪資) - 法定扣繳項（依台灣《勞基法》第24條與勞健保分級表）
          </p>
        </div>

        {/* User select */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">結算對象:</span>
          <select
            id="payroll-user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="text-xs font-semibold py-1 px-2.5 rounded border border-slate-300 bg-white text-slate-800"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.title})
              </option>
            ))}
          </select>
          {onOpenUserEdit && (
            <button
              type="button"
              id="btn-payroll-edit-user"
              onClick={() => onOpenUserEdit(selectedUserId)}
              className="text-[10px] text-blue-700 hover:text-blue-800 font-mono font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>✏️ 編輯人員底薪與加給</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Calculation Simulator & Electronic Payslip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 6 Cols: Interactive Salary Computation Engine */}
        <div className="lg:col-span-6 space-y-4">
          {/* Section 1: Fixed Pay */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-slate-900 text-white text-[10px] font-bold font-mono flex items-center justify-center">1</span>
                固定薪資 (Fixed Pay)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900">
                  NT$ {totalFixed.toLocaleString()}
                </span>
                {onOpenUserEdit && (
                  <button
                    type="button"
                    onClick={() => onOpenUserEdit(selectedUserId)}
                    className="text-[10px] text-blue-700 hover:text-blue-800 font-mono font-bold hover:underline cursor-pointer"
                  >
                    ✏️ 編輯
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">底薪 (Base Salary)</div>
                <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                  NT$ {targetUser.baseSalary.toLocaleString()}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">職務加給 (Position Allowance)</div>
                <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                  NT$ {targetUser.positionAllowance.toLocaleString()}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">專業證照津貼 (建築師/BIM/品管)</div>
                <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                  NT$ {licenseTotal.toLocaleString()}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">伙食津貼 (免稅上限 NT$3,000)</div>
                <div className="font-mono font-bold text-emerald-700 text-[11px] mt-0.5">
                  NT$ 3,000
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Variable Pay Simulator (SRS 5.1) */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-amber-500 text-white text-[10px] font-bold font-mono flex items-center justify-center">2</span>
                變動薪資 (Variable Pay - 自動計算)
              </span>
              <span className="text-xs font-mono font-bold text-amber-700">
                NT$ {totalVariable.toLocaleString()}
              </span>
            </div>

            {/* Overtime Labor Standards Act Art 24 */}
            <div className="space-y-2 p-2.5 rounded bg-slate-50 border border-slate-200 border-l-3 border-l-blue-500">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 text-[11px]">
                  勞基法第24條加班費 (時薪 NT${userRateCalc.baseHourlyRate}/h)
                </span>
                <span className="font-mono font-bold text-blue-700 text-xs">
                  NT$ {otCalc.totalOvertimePay.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <label className="text-slate-600 block text-[10px] mb-0.5">平日前 2h (×1.34)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={otHours1}
                    onChange={(e) => setOtHours1(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-1 rounded border border-slate-300 bg-white"
                  />
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    NT$ {otCalc.weekdayPay1.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block text-[10px] mb-0.5">平日後 2h (×1.67)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={otHours2}
                    onChange={(e) => setOtHours2(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-1 rounded border border-slate-300 bg-white"
                  />
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    NT$ {otCalc.weekdayPay2.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block text-[10px] mb-0.5">休息日 (×1.34~2.67)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={restDayHours}
                    onChange={(e) => setRestDayHours(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-1 rounded border border-slate-300 bg-white"
                  />
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    NT$ {otCalc.restDayPay.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance & Post-mortem Bonus */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200 border-l-3 border-l-amber-500">
                <div className="text-slate-700 font-bold text-[11px]">
                  績效獎金 (連動 K_perf = {currentKPerf})
                </div>
                <div className="font-mono font-bold text-amber-900 text-xs mt-0.5">
                  NT$ {performanceBonus.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">基數 6,000 × {currentKPerf}</div>
              </div>

              <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200 border-l-3 border-l-emerald-500">
                <div className="text-slate-700 font-bold text-[11px]">
                  專案結案提成 (連動 Module 2)
                </div>
                <input
                  type="number"
                  step="500"
                  value={projectBonusAmount}
                  onChange={(e) => setProjectBonusAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold p-1 rounded border border-emerald-300 bg-white mt-1"
                />
                <div className="text-[10px] text-slate-500">南港生技案建照取得分流</div>
              </div>
            </div>

            {/* Transport Allowance (Count * 150 + Mileage * 8) */}
            <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200 text-xs space-y-1.5 border-l-3 border-l-blue-400">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 text-[11px]">
                  外勤 / 交通津貼 (SRS 5.1 公式)
                </span>
                <span className="font-mono font-bold text-blue-900 text-xs">
                  NT$ {transportAllowance.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="text-slate-600 text-[10px]">外勤簽到次數 (NT$150/次)</label>
                  <input
                    type="number"
                    value={outingCount}
                    onChange={(e) => setOutingCount(Number(e.target.value))}
                    className="w-full text-xs font-mono p-1 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-[10px]">外勤公里數 (NT$8/km)</label>
                  <input
                    type="number"
                    value={mileageKm}
                    onChange={(e) => setMileageKm(Number(e.target.value))}
                    className="w-full text-xs font-mono p-1 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Statutory Deductions */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-rose-600 text-white text-[10px] font-bold font-mono flex items-center justify-center">3</span>
                法定扣繳與投保 (Statutory Deductions)
              </span>
              <span className="text-xs font-mono font-bold text-rose-700">
                - NT$ {totalDeductions.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">勞保個人負擔 (級距 NT${laborIns.insuredSalary.toLocaleString()})</div>
                <div className="font-mono font-bold text-rose-700 text-[11px] mt-0.5">
                  - NT$ {laborIns.employeeShare.toLocaleString()}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">健保個人負擔 (級距 NT${healthIns.insuredSalary.toLocaleString()})</div>
                <div className="font-mono font-bold text-rose-700 text-[11px] mt-0.5">
                  - NT$ {healthIns.employeeShare.toLocaleString()}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">勞退自提 {targetUser.pensionSelfRate * 100}% (免稅扣繳)</div>
                <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                  - NT$ {pensionSelf.toLocaleString()}
                </div>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">預扣所得稅 (達標 5% 預扣)</div>
                <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                  - NT$ {incomeTaxWithheld.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Official Electronic Payslip (電子薪資單 - SRS 6.3) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4 print:shadow-none print:border-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Building className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                    建築師事務所 電子薪資發放明細單
                  </h4>
                  <div className="text-[10px] text-slate-500 font-mono">
                    PAYROLL ID: PAY_2026_08_{targetUser.id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
                  title="列印薪資單"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">列印</span>
                </button>
              </div>
            </div>

            {/* Employee Header Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">員工編號 / 姓名</span>
                <span className="font-bold text-slate-800 text-[11px]">{targetUser.id} {targetUser.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">職稱 / 所屬組別</span>
                <span className="font-medium text-slate-700 text-[11px] truncate block">{targetUser.title}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">計薪週期</span>
                <span className="font-bold text-slate-800 text-[11px] font-mono">2026-08 (八月)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">發放日期</span>
                <span className="font-mono text-slate-700 text-[11px]">2026-09-05</span>
              </div>
            </div>

            {/* Payslip Items Table */}
            <div className="space-y-3">
              {/* Earnings Table */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between uppercase tracking-wider">
                  <span>應發項目 (Earnings)</span>
                  <span className="text-slate-400 font-normal text-[10px]">固定薪資 + 變動薪資</span>
                </div>
                <table className="w-full text-xs border border-slate-200 rounded overflow-hidden">
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr className="bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-600 font-sans">本薪 (Base Salary)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-800">
                        NT$ {targetUser.baseSalary.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 text-slate-600 font-sans">職務加給 (Position Allowance)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-800">
                        NT$ {targetUser.positionAllowance.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-600 font-sans">專業證照津貼 (License)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-800">
                        NT$ {licenseTotal.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 text-slate-600 font-sans">伙食津貼 (免稅限額)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-emerald-700">
                        NT$ 3,000
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-600 font-sans">延長工時加班費 (勞基法第24條)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-blue-700">
                        NT$ {otCalc.totalOvertimePay.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 text-slate-600 font-sans">季度績效獎金 (K_perf = {currentKPerf})</td>
                      <td className="py-1 px-2.5 text-right font-medium text-amber-700">
                        NT$ {performanceBonus.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-600 font-sans">專案結案提成 (南港生技執照取得)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-emerald-700">
                        NT$ {projectBonusAmount.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 text-slate-600 font-sans">外勤交通津貼 ({outingCount}次 + {mileageKm}km)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-blue-700">
                        NT$ {transportAllowance.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td className="py-1.5 px-2.5 text-slate-900 font-sans">應發總金額 (Gross Salary)</td>
                      <td className="py-1.5 px-2.5 text-right text-slate-900">
                        NT$ {grossSalary.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions Table */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between uppercase tracking-wider">
                  <span>應扣項目 (Deductions)</span>
                  <span className="text-slate-400 font-normal text-[10px]">法定代扣項</span>
                </div>
                <table className="w-full text-xs border border-slate-200 rounded overflow-hidden">
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr className="bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-600 font-sans">勞保費 (個人負擔)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-rose-700">
                        - NT$ {laborIns.employeeShare.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 text-slate-600 font-sans">健保費 (個人負擔)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-rose-700">
                        - NT$ {healthIns.employeeShare.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-600 font-sans">勞工退休金自提 ({targetUser.pensionSelfRate * 100}%)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-800">
                        - NT$ {pensionSelf.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2.5 text-slate-600 font-sans">預扣所得稅 (薪資所得)</td>
                      <td className="py-1 px-2.5 text-right font-medium text-slate-800">
                        - NT$ {incomeTaxWithheld.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-rose-50/70 font-bold text-rose-900">
                      <td className="py-1.5 px-2.5 font-sans">應扣總金額 (Total Deductions)</td>
                      <td className="py-1.5 px-2.5 text-right">
                        - NT$ {totalDeductions.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Pay Hero Box */}
              <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between border border-slate-800">
                <div>
                  <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">本月實領淨薪資 (Net Pay)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    匯入帳戶：國泰世華銀行 (013) ****-8821
                  </div>
                </div>

                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                  NT$ {netPay.toLocaleString()}
                </div>
              </div>

              {/* Employer Statutory Burden (Transparency) */}
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                <div className="font-bold text-slate-700 flex items-center justify-between">
                  <span>雇主法定負擔金額揭露 (Employer Statutory Burden)</span>
                  <span className="font-mono font-bold text-slate-800">NT$ {totalEmployerBurden.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  包含雇主負擔之勞保 (NT${laborIns.employerShare})、健保 (NT${healthIns.employerShare})、勞退6% (NT${employerPension6Pct}) 與職災就保。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
