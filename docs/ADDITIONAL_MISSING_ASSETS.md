# 補充資源缺失報告

基於代碼全面掃描，本文檔列出了**未在之前報告中標記但實際被代碼引用**的資源需求。

> **注意**: 本報告補充了 `MISSING_ASSETS_DETAILED.md`，兩份文檔應一起參考。

---

## 🚨 關鍵問題

### 1. 路徑不一致問題

**問題位置**: `src/managers/CharacterDispatchManager.js:315`

```javascript
// 代碼使用的路徑
const animPath = `assets/characters/animations/${character.id}_${character.name}/${taskDef.animation}/`;

// 實際生成的路徑
assets/animations/{characterId}/{action}/
```

**影響**: 所有任務動畫無法正確載入

**解決方案**:
- 選項 A: 修改代碼以匹配實際路徑
- 選項 B: 調整生成腳本以匹配代碼路徑（不推薦，會破壞現有結構）

**建議**: 採用選項 A，修改 `CharacterDispatchManager.js:315` 為：
```javascript
const animPath = `assets/animations/${character.id}/${taskDef.animation}/`;
```

---

### 2. 員工模板資源路徑問題

**問題位置**: `src/data/employeeTemplates.js`

```javascript
// 代碼中的路徑（不正確）
portrait: 'assets/portraits/manager.png'
avatar: 'assets/avatars/manager.png'

// 應該是
portrait: 'assets/characters/portraits/007_沈青山_portrait_normal.svg'
avatar: 'assets/characters/avatars/007_沈青山_avatar.svg'
```

**影響**: 員工肖像無法載入

**解決方案**:
- 員工應該直接引用對應的角色資源
- 沈青山(007)、林語嫣(002)等已有角色資源可直接使用

---

## 📋 缺失資源清單

### 1. 任務動畫（Task Animations）⚠️ 高優先級

**定義位置**: `src/managers/CharacterDispatchManager.js:30-129`

#### 必需的任務動畫類型

| 任務ID | 任務名稱 | 動畫幀數 | 分類 | 優先級 |
|--------|---------|---------|------|--------|
| cooking | 烹飪 | 6幀 | kitchen | 🔴 高 |
| prep | 備菜 | 6幀 | kitchen | 🔴 高 |
| serving | 端菜 | 6幀 | service | 🔴 高 |
| greeting | 迎賓 | 3幀 | service | 🟡 中 |
| cleaning | 打掃 | 6幀 | service | 🟡 中 |
| tidying | 整理房間 | 6幀 | service | 🟡 中 |
| performing | 演奏 | 6幀 | entertainment | 🟡 中 |
| healing | 治療 | 6幀 | medical | 🟡 中 |
| security | 保安 | 6幀 | security | 🟡 中 |
| accounting | 記賬 | 6幀 | management | 🟡 中 |

#### 總需求計算

```
核心任務（3種）: cooking, prep, serving
每種 6 幀 × 11 個角色 = 198 幀

可選任務（7種）: greeting, cleaning, tidying, performing, healing, security, accounting
每種平均 6 幀 × 11 個角色 = 462 幀（最多）

總計: 660 個動畫幀
```

#### 生成規範

**路徑**: `assets/animations/{characterId}/{taskId}/`
**命名**: `{taskId}_{frameNumber}.svg`
**尺寸**: 64×64px

**範例**:
```
assets/animations/001/cooking/cooking_0.svg
assets/animations/001/cooking/cooking_1.svg
...
assets/animations/001/serving/serving_0.svg
...
```

---

### 2. 音頻資源（Audio）🎵 中優先級

**引用位置**: `src/audio/AudioManager.js`
**目錄狀態**: 存在但為空（`assets/audio/`）

#### 2.1 背景音樂（BGM）

| 場景 | 文件名建議 | 用途 |
|------|-----------|------|
| 主菜單 | `bgm_menu.mp3` | 主選單背景音樂 |
| 客棧日間 | `bgm_inn_day.mp3` | 客棧白天營業 |
| 客棧夜間 | `bgm_inn_night.mp3` | 客棧夜晚氛圍 |
| 戰鬥場景 | `bgm_battle.mp3` | 戰鬥音樂 |
| 劇情對話 | `bgm_story.mp3` | 視覺小說對話 |
| 城鎮街道 | `bgm_town.mp3` | 城鎮探索 |

**格式**: MP3 / OGG
**路徑**: `assets/audio/bgm/`

#### 2.2 音效（SFX）

| 類別 | 音效名稱 | 文件名建議 |
|------|---------|-----------|
| UI | 按鈕點擊 | `sfx_button_click.mp3` |
| UI | 選單開啟 | `sfx_menu_open.mp3` |
| UI | 通知提示 | `sfx_notification.mp3` |
| UI | 金錢獲得 | `sfx_coin.mp3` |
| 廚房 | 烹飪音效 | `sfx_cooking.mp3` |
| 廚房 | 切菜音效 | `sfx_chopping.mp3` |
| 戰鬥 | 攻擊音效 | `sfx_attack.mp3` |
| 戰鬥 | 受傷音效 | `sfx_hit.mp3` |
| 戰鬥 | 治療音效 | `sfx_heal.mp3` |
| 環境 | 腳步聲 | `sfx_footstep.mp3` |
| 環境 | 開門聲 | `sfx_door.mp3` |

**格式**: MP3 / OGG
**路徑**: `assets/audio/sfx/`

#### 音頻資源總計

- BGM: 6 首（最少）
- SFX: 11 個（核心）
- **總計**: 17 個音頻文件

---

### 3. NPC/員工肖像 👥 低優先級

**問題**: `employeeTemplates.js` 中定義了獨立的員工肖像路徑，但實際應該復用角色資源。

#### 建議處理方式

**不需要生成新資源**，修改代碼以引用現有角色資源：

```javascript
// employeeTemplates.js 修改建議

// 掌櫃 - 沈青山 (007)
{
  id: 0,
  name: '掌櫃',
  realName: '沈青山',
  characterId: '007',  // 新增：關聯角色ID
  // 移除 portrait 和 avatar，改為動態獲取
}

// 在載入時動態從 asset-manifest.json 獲取對應角色資源
```

---

## 📐 資源規範補充

### 任務動畫資源規範

添加到 `docs/ASSET_SCHEMA.md` 的**角色動畫幀**章節：

#### 擴展動畫類型（可選）

除了基礎 8 種動作外，支持以下任務動畫：

**廚房任務**:
```
cooking/    - 烹飪（6幀）
prep/       - 備菜（6幀）
serving/    - 端菜（6幀）
```

**服務任務**:
```
greeting/   - 迎賓（3幀）
cleaning/   - 打掃（6幀）
tidying/    - 整理（6幀）
```

**特殊任務**:
```
performing/  - 演奏（6幀）
healing/     - 治療（6幀）
security/    - 保安（6幀）
accounting/  - 記賬（6幀）
```

**生成優先級**:
- 🔴 必需: cooking, prep, serving（核心經營玩法）
- 🟡 建議: cleaning, tidying, performing（增強體驗）
- 🟢 可選: greeting, healing, security, accounting（完整性）

---

### 音頻資源規範

添加到 `docs/ASSET_SCHEMA.md` 的新章節：

#### 背景音樂（BGM）

- **用途**: 場景氛圍營造
- **數量**: 6-10 首
- **格式**: MP3 (128-192kbps) / OGG
- **循環**: 支持無縫循環
- **命名規則**: `bgm_{sceneName}.mp3`
- **路徑**: `assets/audio/bgm/`

#### 音效（SFX）

- **用途**: 交互反饋、環境音效
- **數量**: 10-30 個
- **格式**: MP3 / OGG / WAV
- **長度**: 建議 < 3 秒
- **命名規則**: `sfx_{actionName}.mp3`
- **路徑**: `assets/audio/sfx/`

---

## 🔧 修復建議

### 立即修復（代碼層面）

#### 1. 修正動畫路徑

**文件**: `src/managers/CharacterDispatchManager.js`
**行號**: 315

```javascript
// 修改前
const animPath = `assets/characters/animations/${character.id}_${character.name}/${taskDef.animation}/`;

// 修改後
const animPath = `assets/animations/${character.id}/${taskDef.animation}/`;
```

#### 2. 修正員工模板

**文件**: `src/data/employeeTemplates.js`

**方案 A**: 直接引用角色資源
```javascript
{
  id: 0,
  name: '掌櫃',
  realName: '沈青山',
  characterId: '007',
  // 移除 portrait 和 avatar
  // 改為運行時從 AssetLoader 獲取
}
```

**方案 B**: 修正路徑和格式
```javascript
portrait: 'assets/characters/portraits/007_沈青山_portrait_normal.svg',
avatar: 'assets/characters/avatars/007_沈青山_avatar.svg',
```

---

### 資源生成優先級

#### Phase 2: 任務動畫核心（高優先級）

生成3種核心任務動畫：
```bash
# 生成 cooking, prep, serving 動畫
npm run assets:task-animations-core
```

**需要生成**: 198 幀（3 種 × 6 幀 × 11 角色）

#### Phase 3: 音頻資源（中優先級）

準備基礎音頻資源：
```bash
# 需要手動準備或使用音頻庫
```

**需要準備**: 6 首BGM + 11 個核心SFX

#### Phase 4: 任務動畫擴展（可選）

生成剩餘7種任務動畫：
```bash
# 生成所有任務動畫
npm run assets:task-animations-full
```

**需要生成**: 462 幀（7 種 × 6 幀 × 11 角色）

---

## 📊 補充資源統計

| 資源類型 | 已生成 | 缺失 | 優先級 |
|---------|--------|------|--------|
| 基礎動畫（8種） | 528幀 | 0 | ✅ 完成 |
| 核心任務動畫 | 0 | 198幀 | 🔴 高 |
| 擴展任務動畫 | 0 | 462幀 | 🟡 中 |
| 背景音樂 | 0 | 6首 | 🟡 中 |
| 音效 | 0 | 11個 | 🟡 中 |
| **總計** | **528** | **677+** | - |

---

## ✅ 檢查清單

### 代碼修正

- [ ] 修正 CharacterDispatchManager.js 動畫路徑（第315行）
- [ ] 修正 employeeTemplates.js 資源引用

### 資源生成

- [ ] 生成核心任務動畫（cooking, prep, serving）
- [ ] 準備基礎BGM（6首）
- [ ] 準備核心SFX（11個）
- [ ] （可選）生成擴展任務動畫

### 文檔更新

- [ ] 更新 ASSET_SCHEMA.md 添加任務動畫規範
- [ ] 更新 ASSET_SCHEMA.md 添加音頻資源規範
- [ ] 更新 QUICK_REFERENCE.md 添加任務動畫檢查清單

---

**創建日期**: 2025-10-27
**優先級**: 🔴 高（代碼修正）、🟡 中（資源生成）
**預估工作量**:
- 代碼修正: 30分鐘
- 核心任務動畫生成: 2小時
- 音頻資源準備: 視外部資源而定
