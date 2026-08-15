# AGENTS.md - ArchSystems 專案代理人指令與規範

本文件為 AI 代理人 (Antigravity / Gemini Agent) 於本專案開發、除錯、擴充與維護時之標準作業規範 (SOP) 與架構指引。

---

## 1. 專案簡介與核心業務邏輯

**ArchSystems 建築師事務所三位一體整合系統 (ERP System)**
* **技術棧**：Vite + React 19 + TypeScript + Tailwind CSS (Vanilla / Modern Aesthetic)
* **核心業務三位一體閉環**：
  1. **差勤與 GPS 定位**：GPS 200m 地理圍欄出勤打卡、公出免簽退判定、請假扣抵加班時數池。
  2. **工時與專案成本**：專案階段 (SD/Permit/CD/Supervision) 工時填寫、人員小時成本分攤、階段進度與盈餘計算。
  3. **績效與專案結算**：360度績效考核 (品質 40%/進度 30%/協作 15%/創新 15%)、專案結案盈餘獎金池分派。
  4. **合規薪資結算**：勞基法一例一休倍率計算 (1.34/1.67/2.67)、勞健保自負額與提繳、交通出差車資補貼、薪資單產出。
  5. **伺服器與連入 IP 即時監控**：Vite 中間件提供 `/api/server-status`，支援終端機 Console 與網頁視覺化視窗監控已運行時間、Port 3000、區域網路 IP 與連入 Client IP 紀錄。

---

## 2. 伺服器啟動與執行指令 (Windows PowerShell)

在 Windows 環境中執行命令時，請務必加上 `powershell -ExecutionPolicy Bypass` 避開 PowerShell 執行策略限制。

### 開發伺服器啟動 (Dev Server)
```powershell
powershell -ExecutionPolicy Bypass -Command "npx vite --port 3000 --host 0.0.0.0"
```

### 雙擊啟動腳本 (Windows Batch Launchers)
* **`啟動並自動關閉伺服器.bat`**：雙擊自動檢查並啟動網頁伺服器，顯示本機與區網 IP；終端機與網頁視窗同步印出即時連入 IP 與存取日誌，關閉後**自動終止背景伺服器 (Port 3000)**。
* **`啟動 ArchSystems 網頁.bat`**：雙擊啟動伺服器與瀏覽器，關閉後自動清除伺服器。
* **`start-desktop.bat`**：雙擊以獨立桌面 App 視窗模式 (Edge/Chrome `--app` 模式) 開啟系統，結束時自動清理伺服器。

### 專案編譯與型別檢查 (Build & Lint Verification)
```powershell
powershell -ExecutionPolicy Bypass -Command "npx vite build"
```

---

## 3. 專案目錄與重點元件架構

```
src/
├── App.tsx                        # 主應用程式進入點 (全域 State、角色切換、雙視圖與 ServerStatusModal)
├── types/
│   └── index.ts                   # 領域模型型別定義 (User, Project, Attendance, Timesheet, Payroll, Performance)
├── data/
│   └── mockData.ts                # 示範同仁、專案、打卡、工時與薪資數據
├── utils/
│   └── payrollCalculator.ts       # 勞基法加班費、保費與薪資二分法計算 logic
└── components/
    ├── common/
    │   ├── DeviceSwitcher.tsx     # 頂部【桌面 / 手機 / 響應】切換列
    │   ├── MobilePhoneSimulator.tsx# 390px 擬真 Smartphone 裝置容器與觸控底欄
    │   ├── DesktopCommandBar.tsx  # 桌面快捷搜尋對話盒 (Alt + K 呼叫)
    │   ├── ServerStatusModal.tsx  # 伺服器運作狀態與連入 Client IP 視覺化監控視窗
    │   └── Header.tsx             # 頂部角色切換器與【伺服器狀態】監控按鈕
    ├── workflow/
    │   └── SystemWorkflowPanel.tsx# 系統導覽與三位一體運作流程視圖
    ├── attendance/
    │   └── AttendancePanel.tsx    # GPS 地理圍欄打卡與差勤請假模組
    ├── timesheet/
    │   └── TimesheetPanel.tsx     # 週/日工時填寫、案名成本算帳與審核
    ├── performance/
    │   └── PerformanceReviewPanel.tsx# 360 績效與專案結案盈餘獎金分配
    ├── payroll/
    │   └── PayrollPanel.tsx       # 勞基法合規驗證與薪資單產出模組
    └── director/
        └── DirectorDashboard.tsx  # 主持建築師全所經營儀表板
```

---

## 4. Agent 開發與維護作業守則 (Mandatory Rules)

1. **Windows 指令相容性**：所有 CLI 操作必須使用 `powershell -ExecutionPolicy Bypass -Command "..."`，嚴禁原汁原味裸跑 shell 命令造成政策阻擋。
2. **雙視圖同步渲染檢驗**：每次新增或修改 UI 元件時，必須確保在 **Desktop Mode** (100% 寬度大螢幕) 與 **Mobile Simulator Mode** (390px 擬真手機視窗) 下皆能完美適應，無任何水平溢出、元件裁切或跑版情形。
3. **極致視覺品質 (Visual Excellence)**：遵守 `DESIGN.md` 所規範之建築師事務所沉穩奢華風格（深邃 Slate-900 底色、玻璃擬態卡片 Glassmorphism、微光澤邊框與漸層強調色）。
4. **嚴格型別檢查與零編譯錯誤**：每次變更程式碼後，必須執行 `npx vite build` 驗證，確保 Zero TypeScript / Vite build errors。
