# PLAN-01: BIM 與 AI 自動審圖整合計劃 (BIM & AI Drawing Review Integration Plan)

## 1. 計劃背景與目標 (Background & Objectives)
建築師事務所在 SD (方案設計) 與 CD (施工圖) 階段，常因結構/機電界面衝突或法規檢視花費大量時間。本計畫擬串接 BIM (Autodesk Forge/APS API) 與 LLM/VLM 模型，實現圖面法規與界面自動預檢，並將同仁的「BIM/AI 創新應用」自動計入 360 績效中的 15% 創新分數。

---

## 2. 預計開發功能範圍 (Scope of Features)

1. **BIM 模型上傳與圖層碰撞自動標記**：
   - 支援同仁上傳 `.ifc` 或 `.rvt` 檔，線上檢視界面衝突點。
2. **AI 法規與界面預檢助理**：
   - 自動比對都發局/建管處常扣件項目 (如防火區劃、無障礙動線、容積率計算卡)。
3. **創新貢獻度自動算分**：
   - 系統紀錄同仁使用 AI/BIM 輔助工具之次數與省下的預估工時，作為 `PerformanceReviewPanel` 中 `bimAiInnovation` 評分依據。

---

## 3. 技術架構與 API 設計 (Technical Architecture)

```
[ Frontend: React 19 + Viewer ] ──> [ Webhook / Node Server ] ──> [ Autodesk APS API ]
                                            │
                                            ▼
                               [ AI Drawing Analysis Service ]
```

---

## 4. 預計時程與里程碑 (Milestones)

- **Phase 1 (Week 1-2)**：研擬 IFC 格式在網頁端 3D 渲染與碰撞分析 POC。
- **Phase 2 (Week 3-4)**：開發 AI 圖面掃描與衝突計分模組。
- **Phase 3 (Week 5)**：整合至 360 績效面板與專案工時扣抵。
