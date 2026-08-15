# DESIGN.md - ArchSystems 建築師事務所系統設計規範

本文件為 **ArchSystems 建築師事務所三位一體整合系統 (ERP)** 之 UI/UX 設計系統、視覺風格指引與雙頁面 (Desktop/Mobile) 互動架構規範。

---

## 1. 設計哲學與美學定位 (Design Philosophy)

* **建築師事務所質感 (Modern Architectural Studio Aesthetic)**：
  結合沉穩鋼構灰 (Steel Slate)、精密數據密度 (High Data Density) 與科技玻璃擬態 (Glassmorphism)。全系統採用深邃黑暗模式 (Dark Theme)，突顯建築圖資與財務分析數據的清晰度與權威感。
* **高效率與高對比**：
  運用高對比度的深灰 Slate-950 底色襯托翡翠綠 (盈餘/通過)、琥珀橘 (審核中/加班) 與藍色 (專案進度)，達到極佳視覺識別度。
* **雙視圖無縫體驗 (Dual-View Adaptive Experience)**：
  同時提供 **「100% 寬度電腦桌面大螢幕儀表板」** 與 **「390px 擬真 Smartphone 行動觸控體驗」**，確保事務所同仁出差外勤打卡與主持建築師在桌機前審算成本皆有頂級體驗。

---

## 2. 色彩系統 (Color Palette & Semantic System)

### 2.1 結構與背景色 (Structural & Base Colors)
| 用途 | Tailwind 類別 | Hex 色碼 (估計) | 視覺效果 |
| :--- | :--- | :--- | :--- |
| 全域背景 (Body Background) | `bg-slate-950` | `#020617` | 深邃極致黑灰底色 |
| 主卡片 / 面板 (Card Container) | `bg-slate-900/90` | `#0f172a` | 玻璃擬態高質感深色卡片 |
| 邊框與分割線 (Border & Divider) | `border-slate-800/80` | `#1e293b` | 隱約光澤微線條 |
| Hover 亮感 (Hover State) | `hover:bg-slate-800/60` | `#1e293b` | 沉穩平滑 hover 回饋 |

### 2.2 業務語意與狀態強調色 (Semantic Accents)
| 狀態 / 業務模組 | 顏色名稱 | Tailwind 標籤範例 | 代表意涵 |
| :--- | :--- | :--- | :--- |
| **主要動作 / 送審** | 經典科技藍 (Blue) | `bg-blue-600` / `text-blue-400` | 預設操作、SD/Permit 專案階段 |
| **完成 / 盈餘 / 通過** | 翡翠綠 (Emerald) | `bg-emerald-600` / `text-emerald-400` | 打卡成功、審核通過、結案獎金分配 |
| **待辦 / 加班 / 警示** | 暖琥珀橘 (Amber) | `bg-amber-500` / `text-amber-400` | 待審核、勞基法加班 1.34/1.67 倍率 |
| **退回 / 扣款 / 異常** | 玫瑰紅 (Rose) | `bg-rose-600` / `text-rose-400` | 簽退異常、請假扣款、審核退回 |
| **主持建築師 / AI / 創新**| 靛藍紫 (Indigo/Purple) | `bg-indigo-600` / `text-purple-400` | 360 績效創新項、主持建築師全所儀表板 |

---

## 3. 字型與數據對齊 (Typography & Tabular System)

* **主字型 (Sans-Serif Font)**：
  使用 `Inter, system-ui, sans-serif`，確保在 Windows Chrome/Edge 與 macOS Safari 皆呈現銳利清晰的字體邊緣。
* **數據與金額對齊 (Monospace & Tabular Numbers)**：
  所有財務金額 (NT$)、工時時數 (Hours)、GPS 座標與勞保費計算，一律套用 `font-mono`，確保數字位數嚴格對齊，便於進行縱向累計與比對。

### 階層規範 (Typography Scale)
```css
Page Heading:    text-2xl font-bold tracking-tight text-white
Section Header:  text-lg font-semibold text-slate-100
Card Label:      text-xs font-medium text-slate-400 uppercase tracking-wider
Value Metric:    text-2xl font-extrabold font-mono text-emerald-400
```

---

## 4. 雙頁面切換與組件設計 (Dual-View Component UX)

### 📱 1. 擬真手機模擬器 (`MobilePhoneSimulator.tsx`)
- **裝置邊框**：390px 寬度、高質感金屬圓角邊框與動態島 (Dynamic Notch)。
- **頂部狀態列**：實體電量圖示、WiFi 圖示與動態更新的 24 小時制時間。
- **底端觸控導覽列**：大尺寸 Touch-friendly Icon 圖示選單（差勤打卡、週工時、績效、薪資）。

### 🖥️ 2. 全寬桌面模式 (`Desktop Mode - 100% Width`)
- **高密度資訊平鋪**：善用多欄位 (3-Column Grid) Layout，將左側選擇器、中央數據分析圖表與右側動作核准列一目了然展現。
- **快捷搜尋命令對話盒 (`DesktopCommandBar.tsx`)**：按下 `Alt + K` 跳出全域搜尋與快捷角色切換 Modal，支援鍵盤導航。

### 🔄 3. 裝置切換器 (`DeviceSwitcher.tsx`)
- 位於畫面最頂部固定列 (Fixed Top-0)，提供三態 Toggle 按鈕：
  - `🖥️ 電腦桌面` (Desktop Mode)
  - `📱 手機頁面` (Mobile Simulator Mode)
  - `💻 自動響應` (Auto Responsive Mode)

---

## 5. 五大業務模組 UI 設計細節

### 1. 差勤打卡模組 (`AttendancePanel.tsx`)
- **GPS 驗證波紋卡片**：帶有脈衝動畫 (Pulse Effect) 的大型 GPS 打卡按鈕。
- **200m 地理圍欄指示器**：顯示工地/事務所即時距離與 BSSID 驗證 Badge。
- **公出免簽退卡片**：亮藍色自動判定標籤。

### 2. 工時算帳模組 (`TimesheetPanel.tsx`)
- **週曆矩陣表 (Weekly Matrix Grid)**：可切換填報日期與填寫專案工項 (SD/CD/Permit)。
- **階段進度條 (Progress Bar)**：以顏色區分專案階段工時預算與實耗工時，過載時顯示 Rose 色警示。

### 3. 360 績效與獎金模組 (`PerformanceReviewPanel.tsx`)
- **四維權重卡片**：品質 (40%)、進度 (30%)、協作 (15%)、創新 (15%) 分項分數卡。
- **專案盈餘分配槓桿**：動態計算專案結案盈餘與同仁貢獻度比例條。

### 4. 薪資明細模組 (`PayrollPanel.tsx`)
- **二分法薪資卡 (Split Salary Layout)**：
  - 固定薪 (底薪 + 職務加給 + 證照津貼 + NT$3,000 免稅伙食費)
  - 變動薪 (勞基法一例一休加班費 + 績效獎金 + 車資里程補貼)
- **勞健保提繳明細**：同仁自負額 vs 雇主負擔法定成本對照表。

### 5. 主持建築師儀表板 (`DirectorDashboard.tsx`)
- **經營 KPI 總覽卡**：全所專案總合約金額、總預算工時、利潤率與人均產值分析卡。

---

## 6. 微互動與動畫規範 (Micro-Interactions)

1. **Modal 浮現與遮罩**：`backdrop-blur-sm bg-slate-950/80`，帶有 `transition-all duration-200` 平滑淡入。
2. **按鈕點擊反饋**：`active:scale-95 transition-transform` 提供絕佳實體按壓體驗。
3. **狀態徽章 (Status Badges)**：採用 rounded-full 搭配圓形 status dot（如打綠點代表已核准）。
