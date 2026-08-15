# ArchSystems 建築師事務所整合系統 - 規格需求文件 (System Specifications)

本目錄包含 **ArchSystems 建築師事務所三位一體整合系統 (ERP System)** 之完整分章節規格需求說明文件 (Specifications)。

---

## 📚 章節目錄索引 (Table of Contents)

| 章節 | 規格文件 | 核心內容說明 |
| :--- | :--- | :--- |
| **01** | [系統總覽與三位一體架構](file:///c:/Users/user/Documents/生成APP/20260815/docs/specs/01_system_overview.md) | 系統整體定位、四角色權限矩陣、三位一體核心閉環業務邏輯 |
| **02** | [GPS 打卡與差勤模組規格](file:///c:/Users/user/Documents/生成APP/20260815/docs/specs/02_attendance_geofence_spec.md) | GPS 200m 地理圍欄、WiFi BSSID 雙重校驗、公出免簽退自動判定、加班時數池扣抵 |
| **03** | [專案工時與成本算帳規格](file:///c:/Users/user/Documents/生成APP/20260815/docs/specs/03_timesheet_cost_spec.md) | 專案階段 (SD/Permit/CD/Supervision) 工時填報、人員小時成本率快照與預算預警 |
| **04** | [360 績效與盈餘分配規格](file:///c:/Users/user/Documents/生成APP/20260815/docs/specs/04_performance_bonus_spec.md) | 360 度四維權重考核 (品質/進度/協作/創新)、專案結案盈餘槓桿分配 |
| **05** | [合規薪資與交通補助規格](file:///c:/Users/user/Documents/生成APP/20260815/docs/specs/05_payroll_compliance_spec.md) | 勞基法一例一休倍率 (1.34/1.67/2.67)、固定與變動薪資二分法、保費與車資補貼算號 |
| **06** | [主持建築師經營儀表板規格](file:///c:/Users/user/Documents/生成APP/20260815/docs/specs/06_director_dashboard_spec.md) | 全所經營 KPI 儀表板、專案利潤率、人均產值與管銷費用攤銷 |
| **07** | [雙視圖介面與系統規格](file:///c:/Users/user/Documents/生成APP/20260815/docs/specs/07_ui_ux_dual_view_spec.md) | 電腦桌面 (Desktop Mode) 100% 寬度、390px 擬真 Smartphone 行動模擬器與 Alt+K 快捷搜尋 |

---

## 🛠️ 技術棧與版本資訊
- **前端框架**：Vite + React 19 + TypeScript
- **樣式系統**：Tailwind CSS (Vanilla / Modern Dark Aesthetic)
- **部署模式**：Web Browser / Desktop Application (Edge/Chrome `--app` 模式)
- **相容環境**：Windows 11 / 10 (powershell ExecutionPolicy Bypass)
