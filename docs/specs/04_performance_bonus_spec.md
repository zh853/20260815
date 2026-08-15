# 04. 360 績效考核與專案盈餘獎金規格 (Performance & Bonus Specification)

## 4.1 功能範圍
本模組提供 quarterly/monthly 之 360 度四維權重績效考核評估，並結合專案結案盈餘，自動計算並分派同仁專案盈餘獎金池。

---

## 4.2 360 度四維權重考核架構 (4-Dimensional Evaluation)

總加權評分 ($TotalScore$) 採用以下四維指標與固定權重：

$$TotalScore = (Quality \times 0.40) + (Schedule \times 0.30) + (Collaboration \times 0.15) + (Innovation \times 0.15)$$

| 考核維度 | 權重 | 評分內容與標準 | 評分者 |
| :--- | :--- | :--- | :--- |
| **品質 (Quality)** | **40%** | 圖面品質、BIM 模型精確度、建管退件率、施工圖界面衝突次數 | 專案經理 (PM) |
| **進度 (Schedule)** | **30%** | 里程碑 (SD/Permit/CD) 按時完成率、預算工時控制率 | 系統自動採計 + PM |
| **協作 (Collaboration)**| **15%** | 出勤準時度 (系統自動算)、跨組溝通、同儕互評分數 | 同儕 + HR |
| **創新與貢獻 (Innovation)**| **15%** | BIM/AI 自動化工具研發、競圖支援度、事務所特殊貢獻 | 主持建築師 |

---

## 4.3 績效等第與績效係數 ($k_{perf}$) 對照表

系統依總加權評分自動核算等第與獎金加成係數 ($k_{perf}$)：

| 加權總分 | 績效等第 (Grade) | 績效加成係數 ($k_{perf}$) | 說明 |
| :--- | :--- | :--- | :--- |
| 90 ~ 100 分 | **S 級 (卓越)** | **1.50** | 卓越展現，發放 150% 績效獎金 |
| 80 ~ 89 分 | **A 級 (優秀)** | **1.20** | 優秀展現，發放 120% 績效獎金 |
| 70 ~ 79 分 | **B 級 (良好)** | **1.00** | 符合預期，發放 100% 基準獎金 |
| 60 ~ 69 分 | **C 級 (待改進)**| **0.80** | 需改進，發放 80% 基準獎金 |
| < 60 分 | **D 級 (不合格)**| **0.00** | 不合格，不發放績效獎金 |

---

## 4.4 專案結案盈餘獎金池分派算式 (Bonus Pool Allocation)

專案完成結案 (Closeout) 後，系統依據專案淨盈餘提撥獎金池 ($TotalBonusPool$)，並按同仁投載工時比例與個人貢獻加權進行分配：

### 1. 工時貢獻比例 ($Ratio_i$)
$$Ratio_i = \frac{HoursOnProject_i}{\sum HoursOnProject}$$

### 2. 同仁個人分配金額 ($Bonus_i$)
$$Bonus_i = TotalBonusPool \times Ratio_i \times ScoreWeight_i$$

其中 $ScoreWeight_i$ 為 PM 與主持建築師針對同仁在此專案之關鍵貢獻度給予之調幅槓桿 (0.80 ~ 1.50)。
