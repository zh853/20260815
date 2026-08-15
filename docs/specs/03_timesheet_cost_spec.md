# 03. 專案工時填報與人員小時成本分攤規格 (Timesheet & Labor Cost Specification)

## 3.1 功能範圍
本模組提供同仁每日/每週填報專案工時，自動記錄工時投載於各建築專案階段 (SD/Permit/CD/Supervision)，並依人員「小時成本率」算帳，即時預警專案成本超支。

---

## 3.2 人員小時成本率 (Hourly Cost Rate) 計算公式

為精準算帳，同仁每小時成本率包含「固定薪資」、「固定津貼」與「雇主負擔之法定負擔 (勞健保+勞退 6%)」：

$$HourlyCostRate = \frac{\text{底薪} + \text{職務加給} + \text{證照津貼} + \text{伙食費} + \text{雇主法定負擔總額}}{\text{法定每月工時 (160 小時)}}$$

- 每次填報工時紀錄 (`TimesheetRecord`) 時，系統自動快照 (Snapshot) 當下之 `hourlyCostRate`。
- 人力成本計算：$$\text{LaborCost} = \text{hoursSpent} \times \text{hourlyCostRate}$$

---

## 3.3 專案階段與工項分類 (Task Categories)

### 1. 專案階段工項 (Project Tasks)
- `SCHEMATIC_DESIGN` (SD)：方案設計與空間規劃。
- `PERMIT_DRAWINGS` (Permit)：都發局/建管處送審執照圖繪製與跑照。
- `CONSTRUCTION_DOCS` (CD)：施工圖與細部圖面繪製。
- `INTERFACE_COORD`：結構/機電/室內界面協調會議。
- `SITE_SUPERVISION` (Supervision)：工地監造與查驗。
- `CLIENT_MEETINGS`：業主簡報與定期協調會。

### 2. 非專案工項 (Non-Project Tasks)
- `FIRM_ADMIN`：事務所行政管理。
- `PITCHING`：競圖與新案提案 (Pitching)。
- `INTERNAL_TRAINING`：內部培訓與 BIM 課程。
- `SYSTEM_MAINTENANCE`：系統維護與圖庫整理。

---

## 3.4 預算超支警示與審核機制 (Overrun Alert & Approval)

1. **里程碑階段預算警示 (Milestone Budget Alert)**：
   - 專案各階段設有預算工時 (`budgetHours`)。
   - 當實際累計工時超過預算 85% 時，系統觸發 **黃色警示**。
   - 當實際累計工時超過預算 100% 時，系統觸發 **紅色超支警示**。
2. **多級審核流程**：
   - **週工時填報**：同仁於每週五前完成填報。
   - **PM 審核**：專案經理 (PM) 審核專案工時合理性與階段進度。
   - **主持建築師復核**：主持建築師可抽查全所工時成本分攤狀況。
