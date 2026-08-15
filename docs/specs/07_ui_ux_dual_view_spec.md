# 07. 雙視圖介面與系統軟體規格 (UI/UX & Dual-View System Specification)

## 7.1 功能範圍
本模組規範 **ArchSystems** 系統在「電腦桌面 (Desktop Mode)」與「390px 擬真 Smartphone (Mobile Simulator Mode)」兩種不同裝置情境下之渲染機制、互動模式與鍵盤快捷鍵。

---

## 7.2 雙視圖渲染與模式 (Dual View Modes)

### 1. 🖥️ 電腦桌面模式 (Desktop Mode - 100% Width)
- **排版架構**：採用全寬 100% 響應式布局與 3-Column Grid 架構。
- **資訊密度**：大螢幕同步展示經營圖表、專案清單、打卡地圖與審核明細卡片。
- **高效率操作**：提供頂部快速角色切換器 (ROLE_STAFF, ROLE_PM, ROLE_HR_FIN, ROLE_DIRECTOR) 與快捷全域搜尋。

### 2. 📱 行動手機模擬器模式 (Mobile Simulator Mode - 390px Width)
- **擬真 Smartphone 裝置外框**：
  - 390px 寬度擬真手機機殼、動態島 (Dynamic Notch) 與電量/時間狀態列。
  - 身歷其境體驗繪圖員外勤出差時手機打卡、查看工時與填寫請假之真實流程。
- **底端觸控導覽選單 (Mobile Navigation Bar)**：
  - 大型 Touch-friendly 圖示選單，支援一鍵切換打卡、工時、績效與薪資。

### 3. 💻 自動響應式 (Auto Responsive Mode)
- 隨使用者瀏覽器視窗大小自由彈性縮放適應。

---

## 7.3 全域桌面快捷指令對話盒 (`DesktopCommandBar.tsx`)

1. **快捷鍵呼叫 (Hotkeys)**：
   - 按下 **`Alt + K`** (或 `Cmd + K`) 可全域彈出桌面快捷對話盒。
   - 按下 **`Esc`** 關閉對話盒。
2. **快捷動作支援**：
   - 一鍵切換登入同仁角色。
   - 全域快速搜尋專案案件與客戶。
   - 快速跳轉五大業務模組面板。

---

## 7.4 Windows 雙擊啟動檔軟體規格

系統提供兩款雙擊批次啟動檔 (`.bat`)，免去命令列記憶：
1. **`啟動 ArchSystems 網頁.bat`**：
   - 檢測 3000 通訊埠。
   - 自動在背景呼叫 `powershell -ExecutionPolicy Bypass -Command "npx vite --port 3000 --host 0.0.0.0"`。
   - 自動啟動預設網頁瀏覽器並跳轉至 `http://localhost:3000`。
2. **`start-desktop.bat`**：
   - 啟動伺服器並自動開啟獨立桌面窗口 App 模式 (`--app=http://localhost:3000`)。
