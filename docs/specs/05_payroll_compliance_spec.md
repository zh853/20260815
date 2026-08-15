# 05. 勞基法合規二分法薪資與車資補貼規格 (Payroll Compliance Specification)

## 5.1 功能範圍
本模組負責進行勞基法合規驗證、一例一休加班費倍率計算、勞保/健保/勞退提繳與交通車資補貼核算，並產出清晰之「固定薪 vs 變動薪」二分法薪資單。

---

## 5.2 薪資架構二分法 (Fixed & Variable Split Architecture)

```
應發薪資總額 (Gross Salary) = 固定薪資總額 (Fixed Pay) + 變動薪資總額 (Variable Pay)
實發薪資總額 (Net Pay)     = 應發薪資總額 - 法定自負額與扣款 (Statutory Deductions)
```

### 1. 固定薪資項目 (Fixed Pay Items)
- **本薪/底薪 (Base Salary)**：基本應得薪資。
- **職務加給 (Position Allowance)**：依職級與主管職給付。
- **建築師/專業證照津貼 (License Allowance)**：開業建築師、結構/機電技師等證照加給。
- **伙食津貼 (Meal Allowance)**：免稅伙食費上限 **NT$ 3,000 / 月**（全額免列入個人綜合所得稅）。

### 2. 變動薪資項目 (Variable Pay Items)
- **勞基法平日加班費 (Weekday Overtime Pay)**：
  - 前 2 小時：按平日每小時工額加給 $\frac{1}{3}$ 以上（乘以 **1.34** 倍）。
  - 後 2 小時：按平日每小時工額加給 $\frac{2}{3}$ 以上（乘以 **1.67** 倍）。
- **休息日加班費 (Rest Day Overtime Pay)**：
  - 前 2 小時乘以 **1.34**，第 3 至 8 小時乘以 **1.67**，第 9 小時起乘以 **2.67**。
- **績效獎金 (Performance Bonus)**：$\text{Base} \times k_{perf}$。
- **專案結案盈餘獎金 (Project Closeout Bonus)**：專案結案提撥金額。
- **交通車資與里程補貼 (Transport Allowance)**：
  - 公出固定按次補貼：如台北市都發局/建管處跑照一次補貼 **NT$ 150**。
  - 自駕私車公用公里數補貼：每公里 **NT$ 8 / km**（自訂費率）。

---

## 5.3 法定自負額與雇主負擔算式 (Statutory Burden Calculation)

### 1. 同仁自負額扣項 (Employee Deductions)
- **勞工保險自負額 (Labor Insurance Share)**：依申報級距 calculated (員工 20%)。
- **全民健康保險自負額 (Health Insurance Share)**：依申報級距 calculated (員工 30% + 眷屬人數)。
- **勞退自提 (Labor Pension Self-Contribution)**：可自由選擇 **0% ~ 6%**，自提金額全額自「可課稅所得額 (Taxable Income)」中扣除免稅。

### 2. 雇主負擔成本 (Employer Burden)
- **雇主負擔勞保 (Employer Labor Share)**：70%。
- **雇主負擔健保 (Employer Health Share)**：60%。
- **雇主強制提繳勞退 6% (Employer Pension 6%)**：由事務所全額負擔，不可從員工底薪扣除。
- **就業保險與職災保險**：按規定全額提繳。

---

## 5.4 應課稅所得與扣繳機制 (Taxable Income Calculation)

$$\text{TaxableIncome} = \text{GrossSalary} - \text{MealAllowance (NT\$ 3,000)} - \text{LaborPensionSelf}$$

- 系統依據 `TaxableIncome` 自動試算並預扣個人所得稅 (`incomeTaxWithheld`)。
