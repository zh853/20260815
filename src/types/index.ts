export type UserRole = 'ROLE_STAFF' | 'ROLE_PM' | 'ROLE_HR_FIN' | 'ROLE_DIRECTOR';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
  email: string;
  phone: string;
  baseSalary: number;
  positionAllowance: number;
  licenses: {
    name: string;
    allowance: number;
    code: string;
  }[];
  mealAllowance: number; // default NT$ 3,000 (tax-free limit)
  pensionSelfRate: number; // 0% - 6%
  compTimeHours: number; // Current comp-time pool in hours
  compTimeExpiringHours: number; // hours expiring within 30 days
  hourlyCostRate: number; // Computed: (Base + Fixed Allowance + Statutory Burden) / Legal Hours
}

export type LocationType = 
  | 'SITE_SUPERVISION'    // 工地監造
  | 'BUILDING_PERMIT'     // 都發局/建管處跑照
  | 'CLIENT_MEETING'      // 業主會議
  | 'URBAN_REVIEW'        // 都審/環評會議
  | 'SITE_SURVEY';        // 現場測繪

export type TaskCategory = 
  // 專案工項
  | 'SCHEMATIC_DESIGN'    // 方案設計 (SD)
  | 'PERMIT_DRAWINGS'     // 送審執照圖 (Permit)
  | 'CONSTRUCTION_DOCS'   // 施工圖繪製 (CD)
  | 'INTERFACE_COORD'     // 界面協調
  | 'SITE_SUPERVISION'    // 工地監造 (Supervision)
  | 'CLIENT_MEETINGS'     // 業主/協調會議
  // 非專案工項
  | 'FIRM_ADMIN'          // 事務所行政
  | 'PITCHING'            // 競圖/提案 (Pitching)
  | 'INTERNAL_TRAINING'   // 內部培訓
  | 'SYSTEM_MAINTENANCE'; // 系統維護

export interface ProjectLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // default 200m
}

export interface ProjectMilestone {
  id: string;
  name: string;
  code: 'SD' | 'PERMIT' | 'CD' | 'SUPERVISION' | 'CLOSEOUT';
  targetDate: string;
  actualDate?: string;
  budgetHours: number;
  actualHours: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DELAYED' | 'PENDING';
  qualityScore?: number; // 0-100
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  type: 'COMMERCIAL' | 'RESIDENTIAL' | 'PUBLIC' | 'INDUSTRIAL' | 'URBAN_DESIGN';
  pmId: string;
  pmName: string;
  status: 'ACTIVE' | 'PERMIT_APPROVED' | 'CONSTRUCTION' | 'COMPLETED';
  totalContractValue: number;
  totalBudgetHours: number;
  totalBudgetLaborCost: number;
  totalBonusPool: number; // e.g. 5% of contract or designated pool
  isBonusDistributed: boolean;
  location: ProjectLocation;
  milestones: ProjectMilestone[];
  teamMemberIds: string[];
}

export type ClockType = 
  | 'OFFICE_IN' 
  | 'OFFICE_OUT' 
  | 'OUT_OF_OFFICE_CHECKIN' 
  | 'AUTO_EXEMPT_CHECKOUT';

export interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string; // ISO String
  clockType: ClockType;
  projectId?: string;
  projectName?: string;
  locationType?: LocationType;
  locationName: string;
  gps: {
    latitude: number;
    longitude: number;
  };
  geofenceVerified: boolean;
  wifiBssidVerified?: boolean;
  photoUrl?: string;
  watermarkText?: string;
  notes?: string;
  isAutoExemptApplied?: boolean; // 公出免簽退自動判定
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: 'ANNUAL' | 'COMP_TIME' | 'SICK' | 'PERSONAL' | 'OFFICIAL' | 'MARRIAGE_BEREAVEMENT';
  startDate: string;
  endDate: string;
  hours: number;
  reason: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  appliedAt: string;
}

export interface TimesheetRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  projectId: string; // "NON_PROJECT" or project code
  projectName: string;
  taskCategory: TaskCategory;
  hoursSpent: number; // minimum 0.5 step
  hourlyCostRate: number; // snapshots the rate at time of log
  laborCost: number; // hoursSpent * hourlyCostRate
  isOvertime: boolean;
  overtimeType?: 'WEEKDAY_OT1' | 'WEEKDAY_OT2' | 'REST_DAY';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  description: string;
}

export interface PerformanceReview {
  id: string;
  userId: string;
  userName: string;
  period: string; // "2026-Q2" or "2026-08"
  scores: {
    quality: {
      score: number; // 0-100
      weight: 0.40;
      reviewer: string;
      notes: string;
    };
    schedule: {
      score: number; // 0-100
      weight: 0.30;
      milestonePassRate: number; // %
      reviewer: string;
    };
    collaboration: {
      score: number; // 0-100
      weight: 0.15;
      attendancePunctuality: number; // auto computed
      peerScore: number;
      reviewer: string;
    };
    contribution: {
      score: number; // 0-100
      weight: 0.15;
      bimAiInnovation: number;
      competitionAssistance: number;
      reviewer: string; // Principal
    };
  };
  totalWeightedScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  kPerf: number; // 1.5, 1.2, 1.0, 0.8, 0.0
  directorSignOff: boolean;
}

export interface ProjectPostMortemBonusItem {
  userId: string;
  userName: string;
  hoursOnProject: number;
  totalProjectHours: number;
  hoursRatio: number; // Hours / Total Hours
  scoreWeight: number; // PM individual contribution weight (0.8 - 1.5)
  calculatedBonus: number;
  isPaid: boolean;
}

export interface MonthlyPayrollSummary {
  id: string;
  userId: string;
  userName: string;
  userTitle: string;
  payPeriod: string; // e.g. "2026-08"
  paymentDate: string;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'DISPATCHED';
  fixedPay: {
    baseSalary: number;
    positionAllowance: number;
    licenseAllowance: number;
    mealAllowance: number; // NT$ 3,000 exempt
    totalFixedPay: number;
  };
  variablePay: {
    weekdayOvertimeHours1: number; // first 2h (x1.34)
    weekdayOvertimePay1: number;
    weekdayOvertimeHours2: number; // after 2h (x1.67)
    weekdayOvertimePay2: number;
    restDayOvertimeHours: number; // rest day (x1.34/1.67/2.67)
    restDayOvertimePay: number;
    totalOvertimePay: number;
    overtimeHoursConvertedToCompTime: number; // hours diverted to comp-time pool
    performanceBonusBase: number;
    kPerf: number;
    performanceBonus: number; // Base * kPerf
    projectPostMortemBonus: number; // Module 2 closeout bonus
    transportOutingCount: number;
    transportOutingFixedRate: number; // e.g. NT$ 150/trip
    mileageKm: number;
    mileageRate: number; // e.g. NT$ 8/km
    transportAllowance: number;
    totalVariablePay: number;
  };
  grossSalary: number; // totalFixedPay + totalVariablePay
  statutoryDeductions: {
    laborInsuranceGrade: number;
    laborInsurance: number; // Employee share
    healthInsuranceGrade: number;
    healthInsurance: number; // Employee share
    laborPensionSelfRate: number; // 0% - 6%
    laborPensionSelf: number; // Tax exempt deducted amount
    taxableIncome: number; // Gross - Meal - PensionSelf
    incomeTaxWithheld: number; // Advance tax withholding
    leaveDeduction: number; // Unpaid or half-pay sick leave
    totalDeductions: number;
  };
  employerStatutoryBurden: {
    employerLaborInsurance: number;
    employerHealthInsurance: number;
    employerPension6Pct: number;
    employmentInsurance: number;
    occupationalAccidentInsurance: number;
    totalEmployerBurden: number;
  };
  netPay: number;
}
