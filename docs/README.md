# 悅來客棧 - 專案文檔總目錄

> **文檔版本**: v2.0
> **最後更新**: 2025-10-28
> **整理狀態**: ✅ 已完成全面整合（從29個文檔整合為12個核心文檔）

## 📚 文檔導航

### 🎯 核心設計（必讀）

| 文檔 | 用途 | 內容概要 |
|------|------|----------|
| [GAME_OVERVIEW.md](核心設計/GAME_OVERVIEW.md) | **遊戲總覽** | 設計理念、故事架構、48月時間線、5種結局 |
| [CHARACTER_DATABASE.md](核心設計/CHARACTER_DATABASE.md) | **角色資料庫** | 11個可雇用角色完整設定（屬性、背景、好感度事件） |
| [SYSTEM_DESIGN.md](核心設計/SYSTEM_DESIGN.md) | **系統設計** | 場景式經營、時間系統、員工系統、烹飪系統 |
| [TECHNICAL_ARCHITECTURE.md](核心設計/TECHNICAL_ARCHITECTURE.md) | **技術架構** | 代碼結構、Manager 設計、測試覆蓋率 |

**適合對象**: 全體開發者、設計師、策劃

---

### 🛠️ 開發指南（入門必讀）

| 文檔 | 用途 | 內容概要 |
|------|------|----------|
| [QUICK_START.md](開發指南/QUICK_START.md) | **快速開始** | 環境準備、安裝運行、測試、打包、常見問題 |

**涵蓋內容**:
- ✅ Node.js 22 環境設置（使用 nvm）
- ✅ WSL2 環境配置（3種方案：WSLg / VcXsrv / Windows 直接開發）
- ✅ 開發流程（npm start / npm test / npm build）
- ✅ 打包發布（Windows / macOS / Linux）
- ✅ 故障排除清單

**適合對象**: 新加入開發者、環境配置

---

### 🎨 資源管理

| 文檔 | 用途 | 內容概要 |
|------|------|----------|
| [ASSET_MASTER_SPEC.md](資源管理/ASSET_MASTER_SPEC.md) | **資產規範總覽** | 所有遊戲資源規格、清單、狀態、工作流程 |

**整合自 8 個文檔**:
- 資產規格定義（立繪 800×1200px、動畫幀 6/action）
- 完整資產清單（按場景/類型/優先級分類）
- 資產狀態追蹤（完成/佔位符/缺失）
- 生成腳本指引（佔位符自動化）

**適合對象**: 美術、資源管理、資產生成

---

### 🎬 動畫製作

| 文檔 | 用途 | 內容概要 |
|------|------|----------|
| [2D_ANIMATION_PRODUCTION_GUIDE.md](動畫製作/2D_ANIMATION_PRODUCTION_GUIDE.md) | **製作指南** | 2D 動畫製作流程、技術規範 |
| [ANIMATION_AND_ITEMS_CHECKLIST.md](動畫製作/ANIMATION_AND_ITEMS_CHECKLIST.md) | **動畫清單** | 所有動畫與物品資源清單 |
| [CHARACTER_ACTIONS_COMPLETE_INVENTORY.md](動畫製作/CHARACTER_ACTIONS_COMPLETE_INVENTORY.md) | **角色動作庫** | 完整角色動作定義與規格 |

**適合對象**: 動畫師、角色設計、資源製作

---

### 📖 參考資料

| 文檔 | 用途 | 內容概要 |
|------|------|----------|
| [QUICK_REFERENCE.md](參考資料/QUICK_REFERENCE.md) | **快速參考** | 資產擴展速查表 |
| [CHARACTER_DISPATCH_SYSTEM.md](參考資料/CHARACTER_DISPATCH_SYSTEM.md) | **員工系統** | CharacterDispatchManager 詳細設計 |
| [GAMEFLOW_IMPLEMENTATION_SUMMARY.md](參考資料/GAMEFLOW_IMPLEMENTATION_SUMMARY.md) | **遊戲流程** | 實現狀態總結 |
| [DEVELOPMENT_ROADMAP.md](參考資料/DEVELOPMENT_ROADMAP.md) | **開發路線圖** | 開發計劃與里程碑 |

**適合對象**: 需要快速查閱特定系統設計的開發者

---

## 🚀 快速開始流程

### 新開發者入門（5分鐘）

```bash
# 1. 閱讀快速開始指南
開發指南/QUICK_START.md

# 2. 設置環境
nvm install 22
nvm use 22
cd /path/to/rpg-game
npm install

# 3. 運行遊戲
npm start

# 4. 運行測試
npm test
```

### 設計師/策劃入門（15分鐘）

1. 閱讀 [GAME_OVERVIEW.md](核心設計/GAME_OVERVIEW.md) - 了解遊戲定位與故事
2. 閱讀 [CHARACTER_DATABASE.md](核心設計/CHARACTER_DATABASE.md) - 了解角色設定
3. 閱讀 [SYSTEM_DESIGN.md](核心設計/SYSTEM_DESIGN.md) - 了解遊戲系統

### 美術/動畫師入門（10分鐘）

1. 閱讀 [ASSET_MASTER_SPEC.md](資源管理/ASSET_MASTER_SPEC.md) - 了解資源規格
2. 閱讀 [2D_ANIMATION_PRODUCTION_GUIDE.md](動畫製作/2D_ANIMATION_PRODUCTION_GUIDE.md) - 了解動畫流程
3. 查看 [ANIMATION_AND_ITEMS_CHECKLIST.md](動畫製作/ANIMATION_AND_ITEMS_CHECKLIST.md) - 當前待製作清單

---

## 📊 專案狀態

### 測試覆蓋率
- **總測試數**: 1173 個測試
- **總覆蓋率**: 83.81%
- **Managers**: 85.97%

### 文檔狀態
- ✅ 核心設計文檔已整合完成
- ✅ 開發指南已統一
- ✅ 資源管理規範已標準化
- ✅ 文檔結構已最佳化（減少 59% 冗餘）

### 開發環境
- **Node.js**: 22.21.0 或更高（必須）
- **Electron**: 38.4.0
- **Phaser**: 3.87.0
- **測試框架**: Vitest 4.0.3

---

## 🗂️ 文檔整合歷史

### v2.0 (2025-10-28) - 大規模整合

**整合前**:
- 29 個分散文檔
- 8 個 ASSET 文檔重複度 90%+
- 規格衝突（立繪尺寸 400×600 vs 800×1200）
- 命名混亂（ASSET_CHECKLIST vs COMPLETE_ASSET_LIST）

**整合後**:
- 12 個核心文檔
- 清晰的目錄結構（5個分類）
- 統一規格標準
- 單一真實來源（Single Source of Truth）

**刪除的文檔** (已備份至 `archive/`):
- 8 個舊版資源文檔
- 4 個開發設置文檔
- 2 個設計文檔
- 4 個角色文檔
- 1 個廢棄設計文檔（GAME_DESIGN.md）

---

## 🔗 外部資源

### 官方文檔
- [Node.js](https://nodejs.org/)
- [Electron](https://www.electronjs.org/)
- [Phaser 3](https://phaser.io/phaser3)
- [Vitest](https://vitest.dev/)

### 開發工具
- [nvm](https://github.com/nvm-sh/nvm) - Node.js 版本管理
- [nvm-windows](https://github.com/coreybutler/nvm-windows) - Windows 版本

---

## 📝 文檔維護指南

### 更新原則
1. **單一真實來源**: 每個主題只有一個權威文檔
2. **及時更新**: 代碼變更後立即更新相關文檔
3. **交叉引用**: 使用相對路徑連結相關文檔
4. **版本標記**: 所有重大更新需標註版本號與日期

### 新增文檔時
- 檢查是否可以整合到現有文檔
- 放入正確分類目錄
- 在本 README 中添加索引
- 使用清晰可辨識的文件名

### 廢棄文檔時
- 移動到 `archive/` 目錄
- 在 commit message 中說明原因
- 從本 README 移除索引

---

## 🤝 貢獻指南

### 文檔格式
- 使用 Markdown 語法
- 使用繁體中文
- 代碼區塊標註語言類型
- 表格使用管線符號對齊

### 提交規範
```bash
# 文檔更新
docs: 更新 QUICK_START.md 添加 macOS 安裝步驟

# 文檔新增
docs: 新增角色對話系統設計文檔

# 文檔整合
docs: 整合 3 個資源文檔為 ASSET_MASTER_SPEC.md
```

---

## 📮 聯繫方式

- **Issue 追蹤**: GitHub Issues
- **文檔問題**: 在對應文檔頂部查看維護者資訊

---

**文檔版本**: v2.0
**最後更新**: 2025-10-28
**維護者**: 開發團隊
