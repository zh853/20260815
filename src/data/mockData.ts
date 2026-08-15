import { User, Project, AttendanceLog, TimesheetRecord, PerformanceReview, MonthlyPayrollSummary, LeaveRequest } from '../types';
import { calculateUserHourlyRate, calculateDistanceMeters, OFFICE_COORDINATES, TAICHUNG_SITE_COORDINATES } from '../utils/calculations';

export const INITIAL_USERS: User[] = [
  {
    id: 'EMP_042',
    name: '林哲宇',
    role: 'ROLE_STAFF',
    title: '專案建築設計師 / 跑照工程師',
    department: '設計一組 (商辦與公有建築)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'cheyu.lin@architect-studio.com.tw',
    phone: '0912-345-678',
    baseSalary: 55000,
    positionAllowance: 5000,
    licenses: [
      { name: '高考建築師考試合格證書', allowance: 8000, code: 'ARCH_LICENSE_TW' }
    ],
    mealAllowance: 3000,
    pensionSelfRate: 0.06, // 自提 6%
    compTimeHours: 18.5,
    compTimeExpiringHours: 6.0,
    hourlyCostRate: 462 // auto computed
  },
  {
    id: 'EMP_008',
    name: '陳品睿',
    role: 'ROLE_PM',
    title: '資深專案協理 / 專案主持人 (PM)',
    department: '專案管理與工程監造部',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'pinrui.chen@architect-studio.com.tw',
    phone: '0928-888-123',
    baseSalary: 72000,
    positionAllowance: 12000,
    licenses: [
      { name: '台灣開業建築師執照', allowance: 12000, code: 'REGISTERED_ARCH' },
      { name: 'Autodesk Revit BIM 專業協調師', allowance: 3000, code: 'BIM_COORD' }
    ],
    mealAllowance: 3000,
    pensionSelfRate: 0.06,
    compTimeHours: 8.0,
    compTimeExpiringHours: 0.0,
    hourlyCostRate: 645
  },
  {
    id: 'EMP_015',
    name: '張雅婷',
    role: 'ROLE_HR_FIN',
    title: '行政與財務會計副理',
    department: '總管理處 (行政人事與財務)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'yating.chang@architect-studio.com.tw',
    phone: '0933-456-789',
    baseSalary: 58000,
    positionAllowance: 8000,
    licenses: [
      { name: '就業服務乙級技術士', allowance: 2000, code: 'HR_LEVEL_B' }
    ],
    mealAllowance: 3000,
    pensionSelfRate: 0.03,
    compTimeHours: 4.0,
    compTimeExpiringHours: 0.0,
    hourlyCostRate: 468
  },
  {
    id: 'EMP_001',
    name: '王漢卿',
    role: 'ROLE_DIRECTOR',
    title: '主持建築師 / 事務所負責人 (Principal)',
    department: '主持建築師辦公室',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'hank.wang@architect-studio.com.tw',
    phone: '0910-000-001',
    baseSalary: 120000,
    positionAllowance: 30000,
    licenses: [
      { name: '台灣開業建築師執照', allowance: 15000, code: 'REGISTERED_ARCH' },
      { name: '中華民國仲裁人資格', allowance: 5000, code: 'ARBITRATOR' }
    ],
    mealAllowance: 3000,
    pensionSelfRate: 0.06,
    compTimeHours: 0.0,
    compTimeExpiringHours: 0.0,
    hourlyCostRate: 1120
  },
  {
    id: 'EMP_088',
    name: '許詠涵',
    role: 'ROLE_STAFF',
    title: '施工圖工程師 / 監造副理',
    department: '工務監造組',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'yonghan.hsu@architect-studio.com.tw',
    phone: '0955-123-987',
    baseSalary: 48000,
    positionAllowance: 4000,
    licenses: [
      { name: '行政院公共工程品管人員證書', allowance: 4000, code: 'QC_ENGINEER' }
    ],
    mealAllowance: 3000,
    pensionSelfRate: 0.00,
    compTimeHours: 12.0,
    compTimeExpiringHours: 4.0,
    hourlyCostRate: 385
  }
];

// Initialize computed hourly cost rates
INITIAL_USERS.forEach(u => {
  const calc = calculateUserHourlyRate(u);
  u.hourlyCostRate = calc.totalHourlyCostRate;
});

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ_2026_TAICHUNG_01',
    code: 'PRJ-TC-01',
    name: '台中七期 32F 智慧旗艦商辦新建工程',
    client: '聯聚建設 / 富邦人壽不動產',
    type: 'COMMERCIAL',
    pmId: 'EMP_008',
    pmName: '陳品睿',
    status: 'CONSTRUCTION',
    totalContractValue: 18500000,
    totalBudgetHours: 1450,
    totalBudgetLaborCost: 820000,
    totalBonusPool: 320000,
    isBonusDistributed: false,
    location: {
      name: '台中七期市政北七路基地',
      address: '台中市西屯區市政北七路188號',
      latitude: 24.1631,
      longitude: 120.6403,
      radiusMeters: 200
    },
    milestones: [
      { id: 'M1', name: '概念與方案設計 (SD)', code: 'SD', targetDate: '2026-01-15', actualDate: '2026-01-12', budgetHours: 250, actualHours: 238, status: 'COMPLETED', qualityScore: 92 },
      { id: 'M2', name: '都市設計審議與建照掛號 (Permit)', code: 'PERMIT', targetDate: '2026-04-30', actualDate: '2026-04-25', budgetHours: 400, actualHours: 382, status: 'COMPLETED', qualityScore: 95 },
      { id: 'M3', name: '細部施工圖繪製與發包 (CD)', code: 'CD', targetDate: '2026-08-30', budgetHours: 500, actualHours: 485, status: 'IN_PROGRESS', qualityScore: 88 },
      { id: 'M4', name: '連續壁與結構體現場監造 (Supervision)', code: 'SUPERVISION', targetDate: '2027-04-30', budgetHours: 300, actualHours: 164, status: 'IN_PROGRESS' }
    ],
    teamMemberIds: ['EMP_042', 'EMP_008', 'EMP_088']
  },
  {
    id: 'PRJ_2026_TAIPEI_02',
    code: 'PRJ-TP-02',
    name: '台北南港生技園區 研發總部大樓',
    client: '中研生醫科技股份有限公司',
    type: 'INDUSTRIAL',
    pmId: 'EMP_008',
    pmName: '陳品睿',
    status: 'PERMIT_APPROVED', // 建造執照取得！可結算階段提成
    totalContractValue: 14200000,
    totalBudgetHours: 980,
    totalBudgetLaborCost: 560000,
    totalBonusPool: 250000,
    isBonusDistributed: false,
    location: {
      name: '南港經貿園區生技基地',
      address: '台北市南港區園區街3號',
      latitude: 25.0592,
      longitude: 121.6154,
      radiusMeters: 200
    },
    milestones: [
      { id: 'M21', name: '概念方案設計 (SD)', code: 'SD', targetDate: '2026-02-28', actualDate: '2026-02-20', budgetHours: 220, actualHours: 210, status: 'COMPLETED', qualityScore: 94 },
      { id: 'M22', name: '建造執照取得與綠建築黃金級標章 (Permit)', code: 'PERMIT', targetDate: '2026-07-31', actualDate: '2026-07-28', budgetHours: 460, actualHours: 442, status: 'COMPLETED', qualityScore: 96 },
      { id: 'M23', name: '施工圖出圖 (CD)', code: 'CD', targetDate: '2026-10-31', budgetHours: 300, actualHours: 85, status: 'IN_PROGRESS' }
    ],
    teamMemberIds: ['EMP_042', 'EMP_008']
  },
  {
    id: 'PRJ_2026_KAOHSIUNG_03',
    code: 'PRJ-KH-03',
    name: '高雄亞洲新灣區 24F 景觀豪宅',
    client: '國城建設實業',
    type: 'RESIDENTIAL',
    pmId: 'EMP_008',
    pmName: '陳品睿',
    status: 'ACTIVE',
    totalContractValue: 9800000,
    totalBudgetHours: 750,
    totalBudgetLaborCost: 410000,
    totalBonusPool: 180000,
    isBonusDistributed: false,
    location: {
      name: '高雄前鎮亞灣特區基地',
      address: '高雄市前鎮區成功二路88號',
      latitude: 22.6139,
      longitude: 120.3015,
      radiusMeters: 250
    },
    milestones: [
      { id: 'M31', name: '立面外觀與平面方案 (SD)', code: 'SD', targetDate: '2026-05-30', actualDate: '2026-06-05', budgetHours: 250, actualHours: 275, status: 'COMPLETED', qualityScore: 84 },
      { id: 'M32', name: '結構審查與執照送審 (Permit)', code: 'PERMIT', targetDate: '2026-09-30', budgetHours: 320, actualHours: 298, status: 'IN_PROGRESS', qualityScore: 86 }
    ],
    teamMemberIds: ['EMP_042', 'EMP_088']
  },
  {
    id: 'PRJ_2026_HSINCHU_04',
    code: 'PRJ-HC-04',
    name: '新竹竹科 半導體廠辦綠能研發中心',
    client: '台灣先進半導體股份有限公司',
    type: 'INDUSTRIAL',
    pmId: 'EMP_008',
    pmName: '陳品睿',
    status: 'ACTIVE',
    totalContractValue: 22000000,
    totalBudgetHours: 1600,
    totalBudgetLaborCost: 920000,
    totalBonusPool: 400000,
    isBonusDistributed: false,
    location: {
      name: '竹科篤行營區基地',
      address: '新竹市東區研發六路12號',
      latitude: 24.7738,
      longitude: 121.0142,
      radiusMeters: 200
    },
    milestones: [
      { id: 'M41', name: '高科技無塵室動線與方案設計 (SD)', code: 'SD', targetDate: '2026-08-15', actualDate: '2026-08-10', budgetHours: 350, actualHours: 362, status: 'COMPLETED', qualityScore: 90 },
      { id: 'M42', name: '環評與消防特種防護審查 (Permit)', code: 'PERMIT', targetDate: '2026-11-30', budgetHours: 550, actualHours: 490, status: 'IN_PROGRESS' }
    ],
    teamMemberIds: ['EMP_042', 'EMP_008', 'EMP_088']
  }
];

export const INITIAL_ATTENDANCE_LOGS: AttendanceLog[] = [
  {
    id: 'ATT_20260814_001',
    userId: 'EMP_042',
    userName: '林哲宇',
    timestamp: '2026-08-14T08:52:00',
    clockType: 'OFFICE_IN',
    locationName: '台北總所辦公室',
    gps: { latitude: 25.033964, longitude: 121.564468 },
    geofenceVerified: true,
    wifiBssidVerified: true,
    notes: '準時打卡進所',
    approvalStatus: 'APPROVED'
  },
  {
    id: 'ATT_20260814_002',
    userId: 'EMP_042',
    userName: '林哲宇',
    timestamp: '2026-08-14T14:30:00',
    clockType: 'OUT_OF_OFFICE_CHECKIN',
    projectId: 'PRJ_2026_TAICHUNG_01',
    projectName: '台中七期 32F 智慧旗艦商辦新建工程',
    locationType: 'SITE_SUPERVISION',
    locationName: '台中七期商辦新建大樓工地 (B3連續壁澆置)',
    gps: { latitude: 24.1631, longitude: 120.6403 },
    geofenceVerified: true,
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=500&auto=format&fit=crop&q=80',
    watermarkText: 'PRJ-TC-01 | 2026-08-14 14:30 | GPS: 24.1631°N, 120.6403°E | 林哲宇',
    notes: '連續壁鋼筋籠垂直度驗收及特密管水下混凝土澆置抽驗',
    approvalStatus: 'APPROVED'
  },
  {
    id: 'ATT_20260814_003',
    userId: 'EMP_042',
    userName: '林哲宇',
    timestamp: '2026-08-14T17:15:00',
    clockType: 'OUT_OF_OFFICE_CHECKIN',
    projectId: 'PRJ_2026_TAICHUNG_01',
    projectName: '台中七期 32F 智慧旗艦商辦新建工程',
    locationType: 'URBAN_REVIEW',
    locationName: '台中市政府都發局 (文心第二市政大樓)',
    gps: { latitude: 24.1620, longitude: 120.6450 },
    geofenceVerified: true,
    watermarkText: 'PRJ-TC-01 | 2026-08-14 17:15 | 都發局執照科協調會議',
    notes: '建造執照第二次變更設計審查意見會商',
    isAutoExemptApplied: true,
    approvalStatus: 'APPROVED'
  },
  {
    id: 'ATT_20260814_004',
    userId: 'EMP_042',
    userName: '林哲宇',
    timestamp: '2026-08-14T18:30:00',
    clockType: 'AUTO_EXEMPT_CHECKOUT',
    locationName: '公務外勤免簽退自動判定系統',
    gps: { latitude: 24.1620, longitude: 120.6450 },
    geofenceVerified: true,
    isAutoExemptApplied: true,
    notes: '系統依據事先核准公出公務（都發局跑照）且 17:15 於外勤現場簽到，於 18:30 自動帶入「公務免簽退」標記',
    approvalStatus: 'APPROVED'
  },
  {
    id: 'ATT_20260813_005',
    userId: 'EMP_088',
    userName: '許詠涵',
    timestamp: '2026-08-13T09:05:00',
    clockType: 'OFFICE_IN',
    locationName: '台北總所辦公室',
    gps: { latitude: 25.033964, longitude: 121.564468 },
    geofenceVerified: true,
    wifiBssidVerified: true,
    approvalStatus: 'APPROVED'
  },
  {
    id: 'ATT_20260813_006',
    userId: 'EMP_088',
    userName: '許詠涵',
    timestamp: '2026-08-13T13:45:00',
    clockType: 'OUT_OF_OFFICE_CHECKIN',
    projectId: 'PRJ_2026_TAIPEI_02',
    projectName: '台北南港生技園區 研發總部大樓',
    locationType: 'BUILDING_PERMIT',
    locationName: '台北市建管處執照管理科 (市府大樓三樓南區)',
    gps: { latitude: 25.0375, longitude: 121.5637 },
    geofenceVerified: true,
    notes: '南港生技案竣工圖說與室內裝修查驗掛件',
    approvalStatus: 'APPROVED'
  }
];

export const INITIAL_TIMESHEETS: TimesheetRecord[] = [
  {
    id: 'TS_20260814_001',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-14',
    projectId: 'PRJ_2026_TAICHUNG_01',
    projectName: '台中七期 32F 智慧旗艦商辦新建工程',
    taskCategory: 'SITE_SUPERVISION',
    hoursSpent: 4.5,
    hourlyCostRate: 462,
    laborCost: 2079,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_008 (陳品睿 PM)',
    approvedAt: '2026-08-14 18:45',
    description: '地下室連續壁垂直度超音波檢測與現場監造抽查'
  },
  {
    id: 'TS_20260814_002',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-14',
    projectId: 'PRJ_2026_TAICHUNG_01',
    projectName: '台中七期 32F 智慧旗艦商辦新建工程',
    taskCategory: 'PERMIT_DRAWINGS',
    hoursSpent: 3.5,
    hourlyCostRate: 462,
    laborCost: 1617,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_008 (陳品睿 PM)',
    approvedAt: '2026-08-14 18:45',
    description: '都發局執照科第二次變更圖說修正與會議簡報'
  },
  {
    id: 'TS_20260814_003',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-14',
    projectId: 'PRJ_2026_TAIPEI_02',
    projectName: '台北南港生技園區 研發總部大樓',
    taskCategory: 'CONSTRUCTION_DOCS',
    hoursSpent: 2.0,
    hourlyCostRate: 462,
    laborCost: 924,
    isOvertime: true,
    overtimeType: 'WEEKDAY_OT1',
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_008 (陳品睿 PM)',
    approvedAt: '2026-08-14 20:30',
    description: '平日延長工時 18:30-20:30：配合業主趕辦隔音帷幕牆細部大樣施工圖'
  },
  {
    id: 'TS_20260813_004',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-13',
    projectId: 'PRJ_2026_TAIPEI_02',
    projectName: '台北南港生技園區 研發總部大樓',
    taskCategory: 'PERMIT_DRAWINGS',
    hoursSpent: 5.0,
    hourlyCostRate: 462,
    laborCost: 2310,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_008 (陳品睿 PM)',
    description: '生技研發無塵室消防避難與排煙防火區劃圖說編修'
  },
  {
    id: 'TS_20260813_005',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-13',
    projectId: 'PRJ_2026_HSINCHU_04',
    projectName: '新竹竹科 半導體廠辦綠能研發中心',
    taskCategory: 'INTERFACE_COORD',
    hoursSpent: 3.0,
    hourlyCostRate: 462,
    laborCost: 1386,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_008 (陳品睿 PM)',
    description: '機電管線 MEP 與建築結構樑位 BIM 3D 碰撞協調會議'
  },
  {
    id: 'TS_20260812_006',
    userId: 'EMP_088',
    userName: '許詠涵',
    date: '2026-08-12',
    projectId: 'PRJ_2026_TAICHUNG_01',
    projectName: '台中七期 32F 智慧旗艦商辦新建工程',
    taskCategory: 'CONSTRUCTION_DOCS',
    hoursSpent: 7.5,
    hourlyCostRate: 385,
    laborCost: 2887,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_008 (陳品睿 PM)',
    description: '標準層廁所排水昇位圖與陶板外牆乾掛五金施工大樣圖'
  },
  {
    id: 'TS_20260812_007',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-12',
    projectId: 'PRJ_2026_TAICHUNG_01',
    projectName: '台中七期 32F 智慧旗艦商辦新建工程',
    taskCategory: 'SCHEMATIC_DESIGN',
    hoursSpent: 8.0,
    hourlyCostRate: 462,
    laborCost: 3696,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_008 (陳品睿 PM)',
    description: '一樓迎賓大廳挑高景觀雨遮方案 3D 渲染與參數化曲面建模'
  },
  {
    id: 'TS_20260811_008',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-11',
    projectId: 'NON_PROJECT',
    projectName: '【非專案】事務所公共業務',
    taskCategory: 'PITCHING',
    hoursSpent: 4.0,
    hourlyCostRate: 462,
    laborCost: 1848,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_001 (王漢卿 主持建築師)',
    description: '國家生醫園區二期公開競圖設計構想圖面排版'
  },
  {
    id: 'TS_20260811_009',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-11',
    projectId: 'NON_PROJECT',
    projectName: '【非專案】事務所公共業務',
    taskCategory: 'INTERNAL_TRAINING',
    hoursSpent: 4.0,
    hourlyCostRate: 462,
    laborCost: 1848,
    isOvertime: false,
    approvalStatus: 'APPROVED',
    approvedBy: 'EMP_001 (王漢卿 主持建築師)',
    description: '全所生成式 AI 建築渲染工作流培訓與 Rhino.Inside.Revit 實務研習'
  },
  {
    id: 'TS_20260815_010',
    userId: 'EMP_042',
    userName: '林哲宇',
    date: '2026-08-15',
    projectId: 'PRJ_2026_TAIPEI_02',
    projectName: '台北南港生技園區 研發總部大樓',
    taskCategory: 'CONSTRUCTION_DOCS',
    hoursSpent: 4.0,
    hourlyCostRate: 462,
    laborCost: 1848,
    isOvertime: true,
    overtimeType: 'REST_DAY',
    approvalStatus: 'PENDING',
    description: '週六休息日緊急趕圖：因應都審委員臨時修正意見出圖'
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LEV_202608_01',
    userId: 'EMP_042',
    userName: '林哲宇',
    leaveType: 'COMP_TIME',
    startDate: '2026-08-22 09:00',
    endDate: '2026-08-22 18:00',
    hours: 8,
    reason: '七月份竹科專案週末出勤補休抵扣',
    status: 'APPROVED',
    appliedAt: '2026-08-10'
  },
  {
    id: 'LEV_202608_02',
    userId: 'EMP_088',
    userName: '許詠涵',
    leaveType: 'ANNUAL',
    startDate: '2026-08-29 09:00',
    endDate: '2026-08-29 18:00',
    hours: 8,
    reason: '個人年度特休休假',
    status: 'PENDING',
    appliedAt: '2026-08-14'
  }
];

export const INITIAL_PERFORMANCE_REVIEWS: PerformanceReview[] = [
  {
    id: 'PERF_2026Q2_EMP042',
    userId: 'EMP_042',
    userName: '林哲宇',
    period: '2026-Q2 (第二季)',
    scores: {
      quality: {
        score: 93,
        weight: 0.40,
        reviewer: '陳品睿 (專案主持人 PM)',
        notes: '台中七期案執照圖一次通過建管處幹事會審查，細部大樣繪製精確，退件率極低。'
      },
      schedule: {
        score: 95,
        weight: 0.30,
        milestonePassRate: 98,
        reviewer: '陳品睿 (PM / 甘特圖比對)'
      },
      collaboration: {
        score: 88,
        weight: 0.15,
        attendancePunctuality: 96,
        peerScore: 80,
        reviewer: '系統勤怠 (96%) + 同儕評分 (80%)'
      },
      contribution: {
        score: 94,
        weight: 0.15,
        bimAiInnovation: 95,
        competitionAssistance: 93,
        reviewer: '王漢卿 (主持建築師直評)'
      }
    },
    totalWeightedScore: 92.8,
    grade: 'S',
    kPerf: 1.5,
    directorSignOff: true
  },
  {
    id: 'PERF_2026Q2_EMP088',
    userId: 'EMP_088',
    userName: '許詠涵',
    period: '2026-Q2 (第二季)',
    scores: {
      quality: {
        score: 84,
        weight: 0.40,
        reviewer: '陳品睿 (PM)',
        notes: '施工圖圖面表現清晰，工地現勘查驗記錄確實。'
      },
      schedule: {
        score: 86,
        weight: 0.30,
        milestonePassRate: 88,
        reviewer: '陳品睿 (PM)'
      },
      collaboration: {
        score: 82,
        weight: 0.15,
        attendancePunctuality: 90,
        peerScore: 74,
        reviewer: '系統勤怠 + 同儕評分'
      },
      contribution: {
        score: 80,
        weight: 0.15,
        bimAiInnovation: 78,
        competitionAssistance: 82,
        reviewer: '王漢卿 (主持建築師)'
      }
    },
    totalWeightedScore: 83.7,
    grade: 'A',
    kPerf: 1.2,
    directorSignOff: true
  }
];

export const INITIAL_MONTHLY_PAYROLL: MonthlyPayrollSummary[] = [
  {
    id: 'PAY_2026_08_EMP042',
    userId: 'EMP_042',
    userName: '林哲宇',
    userTitle: '專案建築設計師 / 跑照工程師',
    payPeriod: '2026-08 (八月份)',
    paymentDate: '2026-09-05',
    status: 'APPROVED',
    fixedPay: {
      baseSalary: 55000,
      positionAllowance: 5000,
      licenseAllowance: 8000,
      mealAllowance: 3000,
      totalFixedPay: 71000
    },
    variablePay: {
      weekdayOvertimeHours1: 6.0, // 前2小時 (x1.34)
      weekdayOvertimePay1: 3006,  // (68000/174)*1.34 * 6 ≈ 3,141 -> 3,006
      weekdayOvertimeHours2: 2.0, // 後2小時 (x1.67)
      weekdayOvertimePay2: 1305,
      restDayOvertimeHours: 4.0,  // 休息日
      restDayOvertimePay: 2350,
      totalOvertimePay: 6661,
      overtimeHoursConvertedToCompTime: 8.0, // 8小時轉入補休池
      performanceBonusBase: 6000,
      kPerf: 1.5,
      performanceBonus: 9000, // 6,000 * 1.5
      projectPostMortemBonus: 28500, // 南港生技案建照取得提成
      transportOutingCount: 8,
      transportOutingFixedRate: 150,
      mileageKm: 120,
      mileageRate: 8,
      transportAllowance: 2160, // 8*150 + 120*8 = 1200 + 960 = 2160
      totalVariablePay: 46321
    },
    grossSalary: 117321,
    statutoryDeductions: {
      laborInsuranceGrade: 45800,
      laborInsurance: 1100,
      healthInsuranceGrade: 121300,
      healthInsurance: 1881,
      laborPensionSelfRate: 0.06,
      laborPensionSelf: 6606, // 110,100 * 6%
      taxableIncome: 107715, // 117321 - 3000(meal) - 6606(pension)
      incomeTaxWithheld: 5386, // 5% advance withholding
      leaveDeduction: 0,
      totalDeductions: 14973
    },
    employerStatutoryBurden: {
      employerLaborInsurance: 3847,
      employerHealthInsurance: 5907,
      employerPension6Pct: 6606,
      employmentInsurance: 458,
      occupationalAccidentInsurance: 160,
      totalEmployerBurden: 16978
    },
    netPay: 102348
  }
];
