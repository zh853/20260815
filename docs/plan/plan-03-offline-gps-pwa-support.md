# PLAN-03: PWA 離線 GPS 打卡與工地網路緩存機制計畫 (Offline PWA & Site GPS Support Plan)

## 1. 計劃背景與目標 (Background & Objectives)
建築師事務所同仁進行「工地監造 (SITE_SUPERVISION)」或深入地下室/遠郊開挖區查驗時，常遇到無 4G/5G 網路訊號或網路極度不穩定之問題。本計畫旨在升級系統為 Progressive Web App (PWA)，並導入 IndexedDB 離線緩存機制，確保無網路狀況下仍能精準記錄 GPS 圍欄打卡，待恢復連網時自動同步補傳。

---

## 2. 預計開發功能範圍 (Scope of Features)

1. **Service Worker 與 Web App Manifest**：
   - 支援同仁將 ArchSystems 「新增至手機主畫面」，具備 Native App 般之全螢幕開啟體驗。
2. **IndexedDB 離線打卡佇列 (Offline Attendance Queue)**：
   - 無網路時，將打卡時間、GPS 緯度經度、離線標記與拍照照片暫存於手機 Local IndexedDB。
3. **網路由離線轉連線之自動同步 (Background Sync)**：
   - 偵測到 `window.ononline` 事件時，自動彈出提示「發現 N 筆離線打卡，正在補傳...」，並將資料送回 Server 完成校驗。

---

## 3. 預計技術與庫 (Tech Stack)

- `vite-plugin-pwa` (Workbox Service Worker 管理)
- `idb` (IndexedDB Promise Wrapper)
- HTML5 Geolocation API (`navigator.geolocation.getCurrentPosition`)
