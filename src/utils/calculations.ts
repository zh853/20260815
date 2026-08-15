import { User, Project, TimesheetRecord } from '../types';

export const MONTHLY_LEGAL_HOURS = 174; // 30天 / 7天 * 40小時/週 ≈ 174小時 (台灣勞基法常用工時標準)
export const OFFICE_COORDINATES = {
  latitude: 25.033964,
  longitude: 121.564468, // 台北總所 (信義區建築師事務所)
  radiusMeters: 200,
  name: '台北總所辦公室 (信義事務所)',
  allowedWifiBSSIDs: ['9c:a2:f4:11:8b:20', '9c:a2:f4:11:8b:21', 'ARCH_OFFICE_5G']
};

export const TAICHUNG_SITE_COORDINATES = {
  latitude: 24.1631,
  longitude: 120.6403, // 台中七期商辦新建工地
  radiusMeters: 200,
  name: '台中七期商辦新建大樓工地'
};

export const KAOHSIUNG_SITE_COORDINATES = {
  latitude: 22.6139,
  longitude: 120.3015, // 高雄亞洲新灣區住宅大樓
  radiusMeters: 250,
  name: '高雄亞灣住宅大樓工地'
};

// 台灣勞工保險投保薪資分級表 (2025/2026 常見級距)
export const LABOR_INSURANCE_TABLE = [
  { maxGross: 27470, insuredSalary: 27470, employeeShare: 659, employerShare: 2307 },
  { maxGross: 28800, insuredSalary: 28800, employeeShare: 691, employerShare: 2419 },
  { maxGross: 30300, insuredSalary: 30300, employeeShare: 727, employerShare: 2545 },
  { maxGross: 31800, insuredSalary: 31800, employeeShare: 763, employerShare: 2671 },
  { maxGross: 33300, insuredSalary: 33300, employeeShare: 799, employerShare: 2797 },
  { maxGross: 34800, insuredSalary: 34800, employeeShare: 835, employerShare: 2923 },
  { maxGross: 36300, insuredSalary: 36300, employeeShare: 871, employerShare: 3049 },
  { maxGross: 38200, insuredSalary: 38200, employeeShare: 917, employerShare: 3209 },
  { maxGross: 40100, insuredSalary: 40100, employeeShare: 962, employerShare: 3368 },
  { maxGross: 42000, insuredSalary: 42000, employeeShare: 1008, employerShare: 3528 },
  { maxGross: 43900, insuredSalary: 43900, employeeShare: 1054, employerShare: 3688 },
  { maxGross: Infinity, insuredSalary: 45800, employeeShare: 1100, employerShare: 3847 } // 勞保最高上限
];

// 台灣全民健保投保金額分級表 (常見級距)
export const HEALTH_INSURANCE_TABLE = [
  { maxGross: 27470, insuredSalary: 27470, employeeShare: 426, employerShare: 1338 },
  { maxGross: 30300, insuredSalary: 30300, employeeShare: 470, employerShare: 1475 },
  { maxGross: 34800, insuredSalary: 34800, employeeShare: 540, employerShare: 1695 },
  { maxGross: 40100, insuredSalary: 40100, employeeShare: 622, employerShare: 1953 },
  { maxGross: 45800, insuredSalary: 45800, employeeShare: 710, employerShare: 2230 },
  { maxGross: 53000, insuredSalary: 53000, employeeShare: 822, employerShare: 2581 },
  { maxGross: 60800, insuredSalary: 60800, employeeShare: 943, employerShare: 2961 },
  { maxGross: 72800, insuredSalary: 72800, employeeShare: 1129, employerShare: 3545 },
  { maxGross: 87600, insuredSalary: 87600, employeeShare: 1359, employerShare: 4266 },
  { maxGross: 101100, insuredSalary: 101100, employeeShare: 1568, employerShare: 4924 },
  { maxGross: 121300, insuredSalary: 121300, employeeShare: 1881, employerShare: 5907 },
  { maxGross: Infinity, insuredSalary: 150000, employeeShare: 2327, employerShare: 7305 }
];

// 勞退 6% 級距對照
export function getPensionInsuredSalary(gross: number): number {
  if (gross <= 27470) return 27470;
  if (gross <= 30300) return 30300;
  if (gross <= 36300) return 36300;
  if (gross <= 45800) return 45800;
  if (gross <= 55400) return 55400;
  if (gross <= 69800) return 69800;
  if (gross <= 87600) return 87600;
  if (gross <= 110100) return 110100;
  if (gross <= 150000) return 150000;
  return 150000;
}

// 尋找勞保級距
export function getLaborInsurance(gross: number) {
  const bracket = LABOR_INSURANCE_TABLE.find(b => gross <= b.maxGross) || LABOR_INSURANCE_TABLE[LABOR_INSURANCE_TABLE.length - 1];
  return bracket;
}

// 尋找健保級距
export function getHealthInsurance(gross: number) {
  const bracket = HEALTH_INSURANCE_TABLE.find(b => gross <= b.maxGross) || HEALTH_INSURANCE_TABLE[HEALTH_INSURANCE_TABLE.length - 1];
  return bracket;
}

/**
 * 依據 SRS 計算員工個人時薪基準 (Hourly Rate_i)
 * Hourly_Rate_i = (Base_Salary + Fixed_Allowance + Statutory_Burden) / Monthly_Legal_Work_Hours
 */
export function calculateUserHourlyRate(user: Partial<User>): {
  baseHourlyRate: number; // 單純 (底薪+固定津貼)/174 (用於算勞基法加班費)
  statutoryBurden: number;
  totalHourlyCostRate: number; // 事務所專案成本換算費率
} {
  const baseSalary = user.baseSalary || 0;
  const positionAllowance = user.positionAllowance || 0;
  const licenseAllowance = (user.licenses || []).reduce((sum, l) => sum + l.allowance, 0);
  const fixedPay = baseSalary + positionAllowance + licenseAllowance;

  // 基本時薪 (計算勞基法平日與休息日加班費基準)
  const baseHourlyRate = Math.round(fixedPay / MONTHLY_LEGAL_HOURS);

  // 雇主法定負擔 (Statutory Burden: 雇主勞保 + 雇主健保 + 勞退6% + 職災等)
  const labor = getLaborInsurance(fixedPay);
  const health = getHealthInsurance(fixedPay);
  const pensionInsured = getPensionInsuredSalary(fixedPay);
  const employerPension6Pct = Math.round(pensionInsured * 0.06);
  const statutoryBurden = labor.employerShare + health.employerShare + employerPension6Pct + 150; // +150 職災/就保

  // 事務所專案成本時薪基準
  const totalHourlyCostRate = Math.round((fixedPay + statutoryBurden) / MONTHLY_LEGAL_HOURS);

  return {
    baseHourlyRate,
    statutoryBurden,
    totalHourlyCostRate
  };
}

/**
 * 依據台灣《勞動基準法》第24條計算加班費
 */
export function calculateOvertimePay(
  baseHourlyRate: number,
  weekdayHours1: number, // 平日前 2 小時 (x 1.34)
  weekdayHours2: number, // 平日後 2 小時 (x 1.67)
  restDayHours: number    // 休息日加班
): {
  weekdayPay1: number;
  weekdayPay2: number;
  restDayPay: number;
  totalOvertimePay: number;
} {
  const weekdayPay1 = Math.round(baseHourlyRate * 1.34 * weekdayHours1);
  const weekdayPay2 = Math.round(baseHourlyRate * 1.67 * weekdayHours2);

  // 休息日計算：前2小時 1.34，第3-8小時 1.67，第9-12小時 2.67
  let restDayPay = 0;
  if (restDayHours > 0) {
    const h1 = Math.min(restDayHours, 2);
    const h2 = Math.max(0, Math.min(restDayHours - 2, 6));
    const h3 = Math.max(0, restDayHours - 8);
    restDayPay = Math.round(
      baseHourlyRate * 1.34 * h1 +
      baseHourlyRate * 1.67 * h2 +
      baseHourlyRate * 2.67 * h3
    );
  }

  return {
    weekdayPay1,
    weekdayPay2,
    restDayPay,
    totalOvertimePay: weekdayPay1 + weekdayPay2 + restDayPay
  };
}

/**
 * 依據 SRS 4.2 週期性考評等第換算 K_perf 係數
 */
export function calculateKPerf(score: number): { grade: 'S' | 'A' | 'B' | 'C' | 'D'; kPerf: number } {
  if (score >= 90) return { grade: 'S', kPerf: 1.5 };
  if (score >= 80) return { grade: 'A', kPerf: 1.2 };
  if (score >= 70) return { grade: 'B', kPerf: 1.0 };
  if (score >= 60) return { grade: 'C', kPerf: 0.8 };
  return { grade: 'D', kPerf: 0.0 };
}

/**
 * 依據 SRS 4.2 B 專案結案提成分配算式
 * Bonus_{i, P} = Total_Bonus_Pool_P * (Hours_{i, P} / Total_Hours_P) * Score_Weight_{i, P}
 */
export function calculateProjectBonus(
  totalBonusPool: number,
  teamMembers: {
    userId: string;
    userName: string;
    hoursOnProject: number;
    scoreWeight: number; // PM 貢獻評分權重 (0.8 - 1.5)
  }[]
) {
  const totalHours = teamMembers.reduce((sum, m) => sum + m.hoursOnProject, 0);
  if (totalHours === 0) return [];

  // 計算每個人的加權分配因子 (Hours/TotalHours * ScoreWeight)
  const weightedShares = teamMembers.map(m => {
    const hoursRatio = m.hoursOnProject / totalHours;
    const rawBonus = totalBonusPool * hoursRatio * m.scoreWeight;
    return {
      userId: m.userId,
      userName: m.userName,
      hoursOnProject: m.hoursOnProject,
      totalProjectHours: totalHours,
      hoursRatio: Number((hoursRatio * 100).toFixed(1)),
      scoreWeight: m.scoreWeight,
      calculatedBonus: Math.round(rawBonus),
      isPaid: false
    };
  });

  return weightedShares;
}

/**
 * 外勤 / 交通津貼計算
 * Transport Allowance = Count_Outing * Fixed_Rate + Mileage * Rate_per_km
 */
export function calculateTransportAllowance(
  outingCount: number,
  fixedRate = 150, // 每次外勤固定餐茶/停車基數 NT$ 150
  mileageKm = 0,
  mileageRate = 8 // 每公里 NT$ 8
): number {
  return outingCount * fixedRate + mileageKm * mileageRate;
}

/**
 * 計算專案累積人力成本與預算消耗率 (Workload & Costing)
 */
export function calculateProjectCostSummary(project: Project, timesheets: TimesheetRecord[]) {
  const projectTimesheets = timesheets.filter(t => t.projectId === project.id && t.approvalStatus === 'APPROVED');
  const actualHours = projectTimesheets.reduce((sum, t) => sum + t.hoursSpent, 0);
  const actualLaborCost = projectTimesheets.reduce((sum, t) => sum + t.laborCost, 0);

  const hoursBurnRate = project.totalBudgetHours > 0 ? (actualHours / project.totalBudgetHours) * 100 : 0;
  const costBurnRate = project.totalBudgetLaborCost > 0 ? (actualLaborCost / project.totalBudgetLaborCost) * 100 : 0;

  // 警示判定：85% 黃色警報, 100% 紅色警報
  let statusAlert: 'NORMAL' | 'WARNING_85' | 'CRITICAL_100' = 'NORMAL';
  if (hoursBurnRate >= 100 || costBurnRate >= 100) {
    statusAlert = 'CRITICAL_100';
  } else if (hoursBurnRate >= 85 || costBurnRate >= 85) {
    statusAlert = 'WARNING_85';
  }

  return {
    actualHours,
    actualLaborCost,
    hoursBurnRate: Number(hoursBurnRate.toFixed(1)),
    costBurnRate: Number(costBurnRate.toFixed(1)),
    statusAlert,
    timesheetsCount: projectTimesheets.length
  };
}

/**
 * 計算兩經緯度點之距離 (Haversine formula, 單位：公尺)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 地球半徑 (公尺)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
