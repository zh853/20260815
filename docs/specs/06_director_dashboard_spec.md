# 06. 主持建築師經營儀表板與數據分析規格 (Director Dashboard Specification)

## 6.1 功能範圍
本模組專為主持建築師 (Principal Architect) 設計，提供全所營運 KPI 總覽、專案盈餘與利潤率分析、同仁人均產值排行與經營預警機制。

---

## 6.2 全所經營核心 KPI 指標

1. **總合約金額 (Total Contract Value)**：
   全所在建專案之合約總金額 (NT$)。
2. **總預算工時 vs 實耗工時 (Total Budget vs Actual Hours)**：
   全所專案預算工時與實際投入工時總和比對，監控工時超支比率。
3. **專案平均毛利與淨利潤率 (Gross Margin & Net Profit Rate)**：
   $$\text{ProfitRate} = \frac{\text{專案合約金額} - \text{人力成本 (Labor Cost)} - \text{外包與規費}}{\text{專案合約金額}} \times 100\%$$
4. **人均產出與人均成本 (Revenue & Cost Per Capita)**：
   分析每位同仁月平均創造之專案毛利與雇主負擔成本。

---

## 6.3 經營決策圖表與視圖 (Decision Analytics)

1. **專案利潤率柱狀圖 (Project Profitability Chart)**：
   以視覺化色彩標示各案件獲利狀況：
   - **綠色**：毛利率 $\ge 40\%$ (優良案件)。
   - **黃色**：毛利率 $20\% \sim 39\%$ (正常案件)。
   - **紅色**：毛利率 $< 20\%$ 或虧損 (重點預警案件)。
2. **專案階段工時分佈 (Milestone Hours Distribution)**：
   剖析 SD 方案、Permit 送審圖、CD 施工圖與 Supervision 監造之工時佔比，幫助主持建築師調配下階段人力。
3. **終審簽核與獎金批准 (Director Sign-off)**：
   主持建築師可一鍵進行全所 360 度績效終審簽核，並批准專案結案盈餘獎金之撥付。
