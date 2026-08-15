# PLAN-04: 多分所與聯合事務所分攤算帳計畫 (Multi-Branch Firm Accounting Plan)

## 1. 計劃背景與目標 (Background & Objectives)
中大型建築師事務所常於台北本館、台中分所、高雄分所設有據點，或與技師事務所進行聯合承攬。本計畫旨在支援跨分所專案合作、人力借調 (Cross-branch Staff Borrowing) 與管銷費用分攤計算，讓主持建築師能準確掌握各分所之獨立損益與聯合盈餘。

---

## 2. 預計開發功能範圍 (Scope of Features)

1. **分所架構管理 (Branch Office Hierarchy)**：
   - 支援同仁歸屬於「台北本館」、「台中分所」、「高雄辦公處」。
2. **跨分所人力借調成本結算 (Cross-Branch Labor Billing)**：
   - 當台北專案借調台中分所繪圖員時，依該同仁 `hourlyCostRate` 加上內部轉帳管理費 (如 1.15x)，自動計算分所間內部結帳金額。
3. **分所營運獨立損益表 (Branch P&L Dashboard)**：
   - 主持建築師可在 `DirectorDashboard` 按分所篩選合獲利、管銷攤銷與各所人力產值。

---

## 3. 時程規劃 (Timeline)

- **Phase 1**：資料模型擴充（User, Project, Timesheet 增加 `branchId` 欄位）。
- **Phase 2**：開發跨分所內部轉帳與人力借調計算引擎。
- **Phase 3**：主持建築師儀表板新增「分所損益比較圖」。
