# PLAN-02: LINE 官方帳號差勤推播與即時審核計劃 (LINE Official Account Integration Plan)

## 1. 計劃背景與目標 (Background & Objectives)
建築師事務所繪圖員與專案建築師常需赴外勤 (都發局跑照、業主會議、工地監造)，在移動過程中使用手機網頁仍有一定操作門檻。本計畫旨在導入 LINE Official Account 與 Messaging API，讓同仁可直接在 LINE 中完成 GPS 地理圍欄打卡、收到工時審核通知與月薪資單發放通知。

---

## 2. 預計開發功能範圍 (Scope of Features)

1. **LINE LIFF (LINE Front-end Framework) GPS 一鍵打卡**：
   - 同仁在 LINE 聊天室中點擊「GPS 打卡」選單，開啟 LIFF 頁面並擷取經緯度完成圍欄打卡。
2. **LINE Flex Message 即時審核卡片**：
   - 繪圖員提交週工時或請假單後，系統自動發送 Flex Message 至 PM 的 LINE，PM 點擊「同意」或「退回」即時完成簽核。
3. **加密薪資單 LINE 密封包發送**：
   - 毎月 HR 發布薪資後，自動發送身份驗證通知卡片至同仁 LINE，輸入密碼即可解鎖查看當月二分法薪資明細。

---

## 3. 預計架構與資料流 (Architecture)

```
[ Mobile LINE App / LIFF ] ──> [ LINE Messaging API ] ──> [ ArchSystems Backend Server ]
                                                                   │
                                                                   ▼
                                                       [ Attendance / Timesheet State ]
```

---

## 4. 預計時程與里程碑 (Milestones)

- **Phase 1**：申請 LINE 官方帳號 Developer Channel 並建立 LIFF 網頁嵌入模組。
- **Phase 2**：設計 Flex Message 範本（打卡成功卡、審核通知卡、薪資單密封卡）。
- **Phase 3**：進行身份綁定 (Line User ID <-> ArchSystems User ID) 與線上驗證。
