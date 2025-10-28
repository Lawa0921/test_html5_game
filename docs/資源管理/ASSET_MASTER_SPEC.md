# 遊戲資產管理規範

> **文檔版本**: v1.0
> **最後更新**: 2025-10-28
> **維護者**: 開發團隊

## 📋 文檔說明

本文檔是**遊戲資產管理的唯一權威來源**，整合了所有資產規格、清單、工作流程和狀態追蹤。

### 整合來源

本文檔整合了以下 8 個文檔：
- ASSET_CHECKLIST.md - 遊戲流程素材檢核清單
- ASSET_WORKFLOW.md - 素材工作流程指南
- ASSET_SCHEMA.md - 資源結構規範
- ASSETS_SUMMARY.md - 已生成資源總覽
- ASSET_AUDIT_SUMMARY.md - 資源完整性審計報告
- MISSING_ASSETS_DETAILED.md - 缺失資源詳細清單
- ADDITIONAL_MISSING_ASSETS.md - 補充缺失資源報告
- COMPLETE_ASSET_LIST.md - 完整素材清單

---

## 第一部分：資產規格定義

<!-- 來自 ASSET_SCHEMA.md -->

### 設計原則

> "好品味是一種直覺：消除特殊情況,讓所有東西都遵循統一的模式。" - Linus Torvalds

1. **一致性** - 同類實體使用相同的資源結構
2. **可預測性** - 資源路徑和命名遵循統一規則
3. **最小化** - 只定義必需的資源,避免冗餘
4. **可擴展性** - 結構允許未來添加可選資源

---

### 1.1 角色資源（Character）

#### 1.1.1 角色立繪（Portraits）

**用途**: 視覺小說對話場景
**尺寸**: 800×1200px（統一標準）⚠️
**格式**: PNG（透明背景）/ SVG（開發階段）
**數量**: 每角色 3-6 個表情
**命名**: `{characterId}_{characterName}_portrait_{emotion}.svg`
**路徑**: `assets/characters/portraits/`

> ⚠️ **規格統一說明**：採用 800×1200px 作為立繪標準尺寸（ASSET_CHECKLIST 中的 400×600px 已廢棄）。800×1200px 符合視覺小說業界標準,提供更好的視覺質量。

**必需表情**:
- `normal` - 普通表情（必需）
- `smile` - 微笑（必需）
- `sad` - 悲傷（必需）

**可選表情**:
- `angry`, `happy`, `surprised`, `shy`, `serious`, `determined`, `crying`, 等

**範例**:
```
assets/characters/portraits/001_林修然_portrait_normal.svg
assets/characters/portraits/001_林修然_portrait_smile.svg
assets/characters/portraits/001_林修然_portrait_sad.svg
```

---

#### 1.1.2 角色頭像（Avatar）

**用途**: 對話框、員工列表、UI 顯示
**數量**: 1 個
**尺寸**: 64×64px
**格式**: PNG / SVG
**命名**: `{characterId}_{characterName}_avatar.svg`
**路徑**: `assets/characters/avatars/`

**範例**:
```
assets/characters/avatars/001_林修然_avatar.svg
```

---

#### 1.1.3 角色動畫幀（Animations）

**用途**: 遊戲場景中的角色移動和動作
**數量**: 8 種基礎動作 × 6 幀 = 48 個文件
**尺寸**: 64×64px
**格式**: PNG / SVG
**命名**: `{action}_{frameNumber}.svg`
**路徑**: `assets/animations/{characterId}/{action}/`

**必需動作類型**:
```
idle/       - 待機（6幀）
work/       - 工作（6幀）
rest/       - 休息（6幀）
sleep/      - 睡覺（6幀）
walk_up/    - 向上行走（6幀）
walk_down/  - 向下行走（6幀）
walk_left/  - 向左行走（6幀）
walk_right/ - 向右行走（6幀）
```

**範例**:
```
assets/animations/001/idle/idle_0.svg
assets/animations/001/idle/idle_1.svg
...
assets/animations/001/work/work_0.svg
...
```

---

#### 1.1.4 任務動畫（Task Animations）⭐ 可選擴展

<!-- 來自 ASSET_SCHEMA.md + ADDITIONAL_MISSING_ASSETS.md -->

**說明**: 除了基礎 8 種動作外,遊戲支持以下任務專用動畫。這些動畫用於客棧經營系統中的特定任務表現。

**廚房任務動畫**（核心優先級 🔴）:
```
cooking/    - 烹飪（6幀）
prep/       - 備菜（6幀）
serving/    - 端菜（6幀）
```

**服務任務動畫**（建議優先級 🟡）:
```
greeting/   - 迎賓（3幀）
cleaning/   - 打掃（6幀）
tidying/    - 整理房間（6幀）
```

**特殊任務動畫**（可選優先級 🟢）:
```
performing/  - 演奏（6幀）
healing/     - 治療（6幀）
security/    - 保安（6幀）
accounting/  - 記賬（6幀）
```

**總需求計算**:
- 核心任務: 3種 × 6幀 × 11角色 = **198 幀**
- 全部任務: 10種 × 平均6幀 × 11角色 = **660 幀**

**代碼引用**: `src/managers/CharacterDispatchManager.js:30-129`

---

#### 1.1.5 角色小圖標（Sprite）

**用途**: 工作站角色顯示、小地圖
**數量**: 1 個
**尺寸**: 32×32px
**格式**: PNG / SVG
**命名**: `sprite-{index}.svg`
**路徑**: `assets/sprites/`

---

### 1.2 場景資源（Scene）

#### 1.2.1 大場景背景（視覺小說用）

**用途**: 視覺小說對話場景背景
**數量**: 1-2 張（日/夜版本）
**尺寸**: 1920×1080px
**格式**: PNG / JPG
**命名**: `{category}_{sceneName}_{variant}.svg`
**路徑**: `assets/backgrounds/{category}/`

**場景分類**:
- `inn/` - 客棧場景（lobby, kitchen, room等）
- `town/` - 城鎮場景（street, market等）
- `special/` - 特殊場景（fire_ruins, mansion等）

**可選變體**:
- `_day` - 白天版本
- `_night` - 夜晚版本

**範例**:
```
assets/backgrounds/inn/lobby_day.svg
assets/backgrounds/inn/lobby_night.svg
assets/backgrounds/town/street_day.svg
```

---

#### 1.2.2 遊戲場景背景（經營系統用）

**用途**: 經營玩法的場景主背景
**數量**: 1 張
**尺寸**: 900×650px
**格式**: PNG / SVG
**命名**: `{sceneName}.svg`
**路徑**: `assets/scenes/`

**範例**:
```
assets/scenes/lobby.svg
assets/scenes/kitchen.svg
assets/scenes/storage.svg
```

---

#### 1.2.3 場景切換按鈕

**用途**: 場景間切換的 UI 按鈕
**數量**: 2 張（normal + hover 狀態）
**尺寸**: 120×40px
**格式**: PNG / SVG
**命名**: `btn-{sceneName}-{state}.svg`
**路徑**: `assets/ui/buttons/`

**必需狀態**:
- `normal` - 正常狀態
- `hover` - 滑鼠懸停狀態

---

#### 1.2.4 場景物件（Scene Objects）

**用途**: 場景中可互動的物件圖標
**數量**: 根據場景類型,通常 8-12 個
**尺寸**: 64×64px
**格式**: PNG / SVG
**命名**: `obj_{objectName}.svg`
**路徑**: `assets/objects/{sceneType}/`

**場景類型**:
- `kitchen/` - 廚房物件（灶台、砧板、鐵鍋等）
- `storage/` - 儲藏室物件（米缸、酒罈、藥櫃等）
- `room/` - 房間物件（床鋪、桌子、衣櫃等）

**範例**:
```
assets/objects/kitchen/obj_stove.svg        [可互動]
assets/objects/kitchen/obj_cutting_board.svg [可互動]
assets/objects/kitchen/obj_firewood.svg      [裝飾]
```

---

### 1.3 UI 資源

<!-- 來自 ASSET_CHECKLIST.md -->

#### 1.3.1 通用 UI 元素

| UI 元素類型 | 尺寸 | 路徑 | 命名規則 |
|------------|------|------|---------|
| 對話框背景 | 1600×300px | `assets/ui/windows/` | `ui_dialogue_box.svg` |
| 按鈕（normal） | 200×60px | `assets/ui/windows/` | `ui_button_normal.svg` |
| 按鈕（hover） | 200×60px | `assets/ui/windows/` | `ui_button_hover.svg` |
| 名牌 | 300×80px | `assets/ui/windows/` | `ui_name_plate.svg` |
| 通知背景 | 280×80px | `assets/ui/notifications/` | `notification-bg.svg` |
| 通知圖標 | 24×24px | `assets/ui/notifications/` | `icon-{type}.svg` |
| 工作站圖標 | 48×48px | `assets/ui/icons/` | `station-{name}.svg` |
| 狀態圖標 | 24×24px | `assets/ui/icons/` | `icon-{status}.svg` |

#### 1.3.2 按鈕規範

**標準尺寸**: 200×60px
**格式**: PNG（支持 9-Slice Scaling）
**必需狀態**:
- Normal（正常）
- Hover（懸停）
- Pressed（按下）- 可選
- Disabled（禁用）- 可選

**範例**:
```
assets/ui/button-confirm.png
assets/ui/button-cancel.png
assets/ui/button-back.png
```

---

### 1.4 物品資源（Item）

#### 1.4.1 物品圖標

**尺寸**: 128×128px
**格式**: PNG / SVG
**命名**: 根據物品類型

**物品分類與路徑**:

##### 食材（Ingredients）
- **路徑**: `assets/items/food/`
- **命名**: `food_{itemId}.svg`

##### 裝備（Equipment）
- **路徑**: `assets/items/equipment/`
- **命名**: `equip_{itemId}.svg`

##### 材料（Materials）
- **路徑**: `assets/items/materials/`
- **命名**: `mat_{itemId}.svg`

##### 任務道具（Quest Items）
- **路徑**: `assets/items/quest/`
- **命名**: `quest_{itemId}.svg`
- **特殊屬性**: 支持稀有度邊框顏色
  - 普通: 灰色 `#9E9E9E`
  - 優良: 綠色 `#4CAF50`
  - 稀有: 藍色 `#2196F3`
  - 史詩: 紫色 `#9C27B0`
  - 傳說: 橙色 `#FF9800`

---

### 1.5 戰鬥資源

<!-- 來自 ASSET_SCHEMA.md -->

#### 1.5.1 敵人圖像

**尺寸**: 256×256px
**格式**: PNG / SVG
**命名**: `enemy_{enemyId}.svg`
**路徑**: `assets/enemies/`

#### 1.5.2 技能圖標

**尺寸**: 64×64px
**格式**: PNG / SVG
**命名**: `skill_{skillId}.svg`
**路徑**: `assets/ui/combat/skills/`

#### 1.5.3 狀態效果圖標

**尺寸**: 32×32px
**格式**: PNG / SVG
**命名**: `{type}_{statusId}.svg`
**路徑**: `assets/ui/combat/buffs/`

**類型前綴**:
- `buff_` - 增益效果（綠色邊框）
- `debuff_` - 減益效果（紅色邊框）

#### 1.5.4 戰鬥 UI

| 元素 | 尺寸 | 路徑 |
|-----|------|------|
| 生命條 | 200×20px | `assets/ui/combat/ui_health_bar.svg` |
| 戰鬥背景 | 1920×1080px | `assets/ui/combat/ui_combat_bg.svg` |

---

### 1.6 特效資源（Effect）

#### 1.6.1 動畫特效

**用途**: 戰鬥打擊、治療、升級等動畫效果
**數量**: 6 幀（標準動畫循環）
**尺寸**: 128×128px
**格式**: PNG / SVG
**命名**: `{effectName}_frame_{frameNumber}.svg`
**路徑**: `assets/effects/{category}/{effectName}/`

**特效分類**:
- `combat/` - 戰鬥特效（hit, slash, explosion等）
- `status/` - 狀態特效（heal, level_up等）
- `items/` - 物品特效（coin, sparkle等）
- `particles/` - 粒子特效（smoke, fire等）

---

### 1.7 音頻資源（Audio）

<!-- 來自 ASSET_CHECKLIST.md + ADDITIONAL_MISSING_ASSETS.md -->

#### 1.7.1 背景音樂（BGM）

**格式**: MP3 (128-192kbps) / OGG
**特性**: 支持無縫循環
**命名**: `bgm_{sceneName}.mp3`
**路徑**: `assets/audio/bgm/`

**必需BGM清單**:

| 場景 | 文件名 | 長度建議 | 氛圍 | 狀態 |
|------|--------|---------|------|------|
| 開場劇情 | `intro-story.mp3` | 2-3分鐘 | 感人、希望 | ❌ |
| 工作分配 | `work-assignment.mp3` | 循環 | 輕快、計劃感 | ❌ |
| 白天營業 | `day-operation.mp3` | 循環 | 歡快、忙碌 | ❌ |
| 結算 | `settlement.mp3` | 1-2分鐘 | 成就、總結 | ❌ |
| 夜晚 | `night-time.mp3` | 循環 | 溫馨、放鬆 | ❌ |

**音樂要求**:
- 比特率：128kbps 以上
- 循環：無縫循環設計
- 音量：統一音量,避免突兀

---

#### 1.7.2 音效（SFX）

**格式**: MP3 / OGG / WAV
**長度**: < 3秒（UI音效 < 0.5秒）
**命名**: `sfx_{actionName}.mp3`
**路徑**: `assets/audio/sfx/`

**核心SFX清單**:

| 類別 | 文件名 | 觸發時機 | 狀態 |
|------|--------|---------|------|
| UI | `click.mp3` | 按鈕點擊 | ❌ |
| UI | `confirm.mp3` | 確認操作 | ❌ |
| UI | `cancel.mp3` | 取消/返回 | ❌ |
| UI | `coin.mp3` | 獲得金錢 | ❌ |
| 環境 | `guest-arrive.mp3` | NPC 進門 | ❌ |
| 環境 | `guest-leave.mp3` | NPC 離開 | ❌ |
| 廚房 | `cooking.mp3` | 烹飪動作 | ❌ |
| 系統 | `notification.mp3` | 系統通知 | ❌ |
| 系統 | `level-up.mp3` | 技能/等級提升 | ❌ |
| 系統 | `affection-up.mp3` | 好感度增加 | ❌ |

---

### 1.8 字體資源

<!-- 來自 ASSET_CHECKLIST.md -->

| 字體用途 | 建議字體 | 格式 | 狀態 | 備註 |
|---------|---------|------|------|------|
| 標題字體 | 思源黑體 Bold | TTF/OTF | ❌ | 遊戲標題、場景標題 |
| 正文字體 | 思源黑體 Regular | TTF/OTF | ❌ | 對話、UI 文字 |
| 數字字體 | Roboto Mono | TTF/OTF | ❌ | 金錢、時間顯示 |

**字體授權**:
- 確保商業使用授權
- 支持完整中文字符集
- 文件大小 < 5MB

---

## 第二部分：完整資產清單

### 2.1 資源狀態總覽

<!-- 來自 ASSET_AUDIT_SUMMARY.md -->

| 分類 | 已生成 | 缺失 | 完成度 |
|------|--------|------|--------|
| 角色立繪 | 49 | 0 | ✅ 100% |
| 角色頭像 | 11 | 0 | ✅ 100% |
| 基礎動畫 | 528 | 0 | ✅ 100% |
| 任務動畫（核心） | 0 | 198 | ❌ 0% |
| 任務動畫（擴展） | 0 | 462 | ❌ 0% |
| 角色小圖標 | 11 | 0 | ✅ 100% |
| 大場景背景 | 12 | 0 | ✅ 100% |
| 遊戲場景背景 | 6 | 0 | ✅ 100% |
| UI元素 | 40 | 0 | ✅ 100% |
| 物品圖標 | 39 | 60 | 🟡 39% |
| 戰鬥UI | 14 | 0 | ✅ 100% |
| 場景物件 | 30 | 0 | ✅ 100% |
| CG 圖 | 0 | 72 | ❌ 0% |
| 音頻BGM | 0 | 5 | ❌ 0% |
| 音頻SFX | 0 | 10 | ❌ 0% |
| **總計** | **740** | **807** | **48%** |

---

### 2.2 按場景分類

<!-- 來自 ASSET_CHECKLIST.md -->

#### 2.2.1 開場劇情場景（IntroStoryScene）

##### 背景圖片

| 素材名稱 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|---------|------|------|------|------|--------|
| 破舊客棧外觀 | `assets/scenes/intro/inn-exterior-rundown.png` | 1280x720 | PNG | 🚧 | P0 |
| 客棧內部荒廢 | `assets/scenes/intro/inn-interior-abandoned.png` | 1280x720 | PNG | 🚧 | P0 |

##### 角色立繪（對話場景用）

| 角色 | 路徑 | 尺寸 | 格式 | 表情/姿勢 | 狀態 | 優先級 |
|------|------|------|------|-----------|------|--------|
| 林修然 | `assets/characters/portraits/001_林修然_portrait_normal.svg` | 800x1200 | SVG | 中性/思考 | 🚧 | P0 |
| 林修然 | `assets/characters/portraits/001_林修然_portrait_surprised.svg` | 800x1200 | SVG | 驚訝 | 🚧 | P0 |
| 林修然 | `assets/characters/portraits/001_林修然_portrait_determined.svg` | 800x1200 | SVG | 堅定 | 🚧 | P0 |
| 林語嫣 | `assets/characters/portraits/002_林語嫣_portrait_normal.svg` | 800x1200 | SVG | 中性/期待 | 🚧 | P0 |
| 林語嫣 | `assets/characters/portraits/002_林語嫣_portrait_smile.svg` | 800x1200 | SVG | 微笑 | 🚧 | P0 |
| 林語嫣 | `assets/characters/portraits/002_林語嫣_portrait_worried.svg` | 800x1200 | SVG | 擔心 | 🚧 | P0 |

##### UI 元素

| 素材名稱 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|---------|------|------|------|------|--------|
| 對話框背景 | `assets/ui/dialogue-box.png` | 1200x200 | PNG | 🚧 | P0 |
| 繼續按鈕 | `assets/ui/button-continue.png` | 100x100 | PNG | 🚧 | P0 |
| 跳過按鈕 | `assets/ui/button-skip.png` | 100x100 | PNG | 🚧 | P0 |

---

#### 2.2.2 工作分配場景（WorkAssignmentScene）

##### 場景背景

| 素材名稱 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|---------|------|------|------|------|--------|
| 工作分配界面背景 | `assets/scenes/work-assignment/background.png` | 1280x720 | PNG | 🚧 | P0 |

##### 工作類型圖標

| 工作類型 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|---------|------|------|------|------|--------|
| 烹飪 | `assets/icons/jobs/cooking-icon.png` | 64x64 | PNG | 🚧 | P0 |
| 服務 | `assets/icons/jobs/serving-icon.png` | 64x64 | PNG | 🚧 | P0 |
| 清潔 | `assets/icons/jobs/cleaning-icon.png` | 64x64 | PNG | 🚧 | P0 |
| 記賬 | `assets/icons/jobs/accounting-icon.png` | 64x64 | PNG | 🚧 | P0 |
| 迎賓 | `assets/icons/jobs/greeting-icon.png` | 64x64 | PNG | 🚧 | P0 |
| 保安 | `assets/icons/jobs/security-icon.png` | 64x64 | PNG | 🚧 | P0 |
| 備菜 | `assets/icons/jobs/prep-icon.png` | 64x64 | PNG | 🚧 | P0 |
| 表演 | `assets/icons/jobs/performing-icon.png` | 64x64 | PNG | 🚧 | P0 |

---

#### 2.2.3 主遊戲場景（MainOperationScene）

##### 客棧區域背景

| 區域 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|------|------|------|------|------|--------|
| 客棧大廳 | `assets/scenes/main-game/lobby.png` | 1280x720 | PNG | 🚧 | P0 |
| 廚房區域 | `assets/scenes/main-game/kitchen.png` | 1280x720 | PNG | 🚧 | P0 |
| 客房區域 | `assets/scenes/main-game/rooms.png` | 1280x720 | PNG | 🚧 | P0 |
| 後院 | `assets/scenes/main-game/backyard.png` | 1280x720 | PNG | 🚧 | P1 |

##### NPC 客人 Sprites

| NPC 類型 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|---------|------|------|------|------|--------|
| 普通客人 1 | `assets/sprites/npcs/guest-01-walk.png` | 192x64 | PNG | 🚧 | P0 |
| 普通客人 2 | `assets/sprites/npcs/guest-02-walk.png` | 192x64 | PNG | 🚧 | P0 |
| VIP 客人 | `assets/sprites/npcs/guest-vip-walk.png` | 192x64 | PNG | 🚧 | P1 |

---

#### 2.2.4 結算場景（SettlementScene）

| 素材名稱 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|---------|------|------|------|------|--------|
| 結算背景 | `assets/scenes/settlement/background.png` | 1280x720 | PNG | 🚧 | P0 |
| 結算面板 | `assets/scenes/settlement/settlement-panel.png` | 800x600 | PNG | 🚧 | P0 |
| 收支圖表背景 | `assets/scenes/settlement/chart-background.png` | 600x300 | PNG | 🚧 | P0 |
| 收入圖標 | `assets/scenes/settlement/icon-income.png` | 64x64 | PNG | 🚧 | P0 |
| 支出圖標 | `assets/scenes/settlement/icon-expense.png` | 64x64 | PNG | 🚧 | P0 |

---

#### 2.2.5 夜晚場景（NightScene）

| 素材名稱 | 路徑 | 尺寸 | 格式 | 狀態 | 優先級 |
|---------|------|------|------|------|--------|
| 夜晚客棧內部 | `assets/scenes/night/inn-interior-night.png` | 1280x720 | PNG | 🚧 | P0 |
| 月光庭院 | `assets/scenes/night/courtyard-night.png` | 1280x720 | PNG | 🚧 | P1 |
| 聊天選項卡 | `assets/ui/card-chat.png` | 400x120 | PNG | 🚧 | P0 |
| 教學相長卡 | `assets/ui/card-learning.png` | 400x120 | PNG | 🚧 | P0 |
| 休息選項卡 | `assets/ui/card-rest.png` | 400x120 | PNG | 🚧 | P0 |
| 睡覺按鈕 | `assets/ui/button-sleep.png` | 300x80 | PNG | 🚧 | P0 |

---

### 2.3 按優先級分類

<!-- 來自 MISSING_ASSETS_DETAILED.md + ASSET_AUDIT_SUMMARY.md -->

#### P0 - 核心資產（阻塞開發）

**定義**: 沒有這些資產,遊戲無法運行或核心玩法無法體驗

##### 場景背景（必需）
- 開場劇情背景 × 2
- 工作分配背景 × 1
- 主遊戲場景背景 × 4
- 結算場景背景 × 1
- 夜晚場景背景 × 1

##### 角色資源（必需）
- 林修然立繪 3 張（normal, surprised, determined）
- 林語嫣立繪 3 張（normal, smile, worried）
- 角色頭像 11 張（所有角色）
- 基礎動畫幀 528 張（8動作 × 6幀 × 11角色）✅ 已完成

##### UI 元素（必需）
- 對話框背景 × 1
- 核心按鈕 × 8（確認、取消、返回等）
- HUD 元素 × 4（頂部條、金錢、聲譽、時間圖標）
- 通知框 × 3（成功、警告、錯誤）

##### 工作系統（必需）
- 工作圖標 × 8（烹飪、服務、清潔等）
- 工作卡片背景 × 1

**P0 總計**: 約 57 張

---

#### P1 - 重要資產（影響體驗）

**定義**: 影響遊戲體驗質量,但不阻塞核心玩法

##### 任務動畫（核心經營玩法）
- 烹飪動畫 66 幀（6幀 × 11角色）
- 備菜動畫 66 幀
- 端菜動畫 66 幀
**小計**: 198 幀

##### 音頻資源
- BGM × 5（開場、工作分配、白天營業、結算、夜晚）
- 核心SFX × 10（點擊、確認、金幣等）

##### 擴展角色資源
- 其他角色立繪 × 40（秦婉柔、溫如玉等）
- NPC 變體 × 5

##### 場景物件
- 廚房物件 × 10 ✅ 已完成
- 儲藏室物件 × 10 ✅ 已完成
- 房間物件 × 10 ✅ 已完成

**P1 總計**: 約 293 項

---

#### P2 - 次要資產（可後補）

**定義**: 錦上添花,可在後期補充

##### 任務動畫（擴展玩法）
- 擴展任務動畫 462 幀（7種 × 6幀 × 11角色）

##### CG 圖（劇情沉浸感）
- 角色戀愛 CG × 10
- 角色專屬 CG × 30
- 通用場景 CG × 15
- 結局 CG × 17
**小計**: 72 張

##### 烹飪系統擴展
- 食材擴展 × 33
- 菜餚擴展 × 30
**小計**: 63 張

##### 其他擴展
- 裝備圖標 × 9
- 藥材藥品 × 16
- 經營道具 × 23
- 成就收藏 × 9
- 季節變體背景 × 30

**P2 總計**: 約 684 項

---

## 第三部分：資產狀態追蹤

### 3.1 已生成資源詳情

<!-- 來自 ASSETS_SUMMARY.md -->

#### 角色資源（已完成 ✅）

##### 角色立繪
- **位置**: `assets/characters/portraits/`
- **數量**: 49 張（800×1200px）
- **內容**: 11個角色 × 多個表情狀態
  - 林修然（001）: normal, smile, serious, sad, angry
  - 林語嫣（002）: normal, scared, cooking, crying, smile
  - 溫如玉（003）: normal, smile, sad, shy, determined
  - 顧青鸞（004）: normal, cold, smile, serious, angry
  - 蘇妙音（005）: normal, playing, smile, sad, killer
  - 翠兒（006）: normal, happy, pout, excited, shy
  - 沈青山（007）: normal, smile, serious
  - 蕭鐵峰（008）: normal, serious, angry, fighting
  - 方無忌（009）: normal, smile, storytelling
  - 李默然（010）: normal, calculating, smile
  - 秦婉柔（011）: normal, playing, crying, smile, afraid, determined

##### 角色頭像
- **位置**: `assets/characters/avatars/`
- **數量**: 11 張（64×64px）
- **用途**: 對話框、員工列表、UI 顯示

##### 角色動畫幀（基礎）
- **位置**: `assets/animations/001/` ~ `assets/animations/011/`
- **數量**: 528 幀（64×64px）
- **每個角色**: 48 幀
- **動作類型**: idle, work, rest, sleep, walk_up, walk_down, walk_left, walk_right

##### 角色小圖標
- **位置**: `assets/sprites/`
- **數量**: 11 張（32×32px）

---

#### 場景資源（已完成 ✅）

##### 大場景背景（視覺小說用）
- **位置**: `assets/backgrounds/`
- **數量**: 12 張（1920×1080px）
- **分類**:
  - **inn/** - 客棧場景（7張）: exterior_day, exterior_night, lobby, kitchen, room_mc, room_yuyan, courtyard
  - **town/** - 城鎮場景（3張）: street_day, street_night, market
  - **special/** - 特殊場景（2張）: fire_ruins, qin_mansion

##### 遊戲場景背景（經營系統用）
- **位置**: `assets/scenes/`
- **數量**: 6 張（900×650px）
- **內容**: lobby, kitchen, storage, room-a, room-b, exterior

---

#### UI 資源（已完成 ✅）

##### 場景切換按鈕
- **位置**: `assets/ui/buttons/`
- **數量**: 12 張（120×40px）
- **內容**: 6個場景 × 2種狀態（normal, hover）

##### 通知系統 UI
- **位置**: `assets/ui/notifications/`
- **數量**: 6 張
- **內容**: notification-bg, icon-info, icon-success, icon-warning, icon-error, icon-event

##### 工作站圖標
- **位置**: `assets/ui/icons/`
- **數量**: 6 張（48×48px）
- **內容**: station-management, station-lobby, station-kitchen, station-security, station-entertainment, station-medicine

##### 狀態圖標
- **位置**: `assets/ui/icons/`
- **數量**: 6 張（24×24px）
- **內容**: icon-fatigue, icon-health, icon-mood, icon-silver, icon-reputation, icon-time

##### 對話框和窗口
- **位置**: `assets/ui/windows/`
- **數量**: 4 張
- **內容**: ui_dialogue_box, ui_button_normal, ui_button_hover, ui_name_plate

---

#### 物品資源（部分完成 🟡）

##### 食物圖標
- **位置**: `assets/items/food/`
- **數量**: 10 張（128×128px）✅
- **內容**: 米飯、麵條、包子、魚、肉、蔬菜、茶、酒、點心、水果

##### 任務物品
- **位置**: `assets/items/quest/`
- **數量**: 13 張（128×128px）✅
- **內容**: 秦家玉佩、林家家譜、岳家軍令牌等（含稀有度系統）

##### 需要補充
- 食材擴展 × 33 ❌
- 菜餚擴展 × 30 ❌

---

#### 戰鬥系統資源（已完成 ✅）

##### 戰鬥 UI
- **位置**: `assets/ui/combat/`
- **數量**: 2 張
- **內容**: ui_health_bar（200×20px）, ui_combat_bg（1920×1080px）

##### 敵人圖像
- **位置**: `assets/enemies/`
- **數量**: 4 張（256×256px）
- **內容**: enemy_robber, enemy_drunk, enemy_beast, enemy_soldier

##### 技能圖標
- **位置**: `assets/ui/combat/skills/`
- **數量**: 3 張（64×64px）
- **內容**: skill_attack, skill_defend, skill_heal

##### Buff/Debuff 圖標
- **位置**: `assets/ui/combat/buffs/`
- **數量**: 5 張（32×32px）
- **內容**: buff_strength, buff_defense, buff_speed, debuff_poison, debuff_stun

---

#### 場景物件資源（已完成 ✅）

##### 廚房物件
- **位置**: `assets/objects/kitchen/`
- **數量**: 10 張（64×64px）
- **可互動**: 9 個 | **裝飾**: 1 個

##### 儲藏室物件
- **位置**: `assets/objects/storage/`
- **數量**: 10 張（64×64px）
- **可互動**: 10 個

##### 房間物件
- **位置**: `assets/objects/room/`
- **數量**: 10 張（64×64px）
- **可互動**: 9 個 | **裝飾**: 1 個

---

#### 特效資源（已完成 ✅）

##### 戰鬥特效
- **位置**: `assets/effects/combat/hit/`
- **數量**: 6 幀（128×128px）

##### 狀態特效
- **位置**: `assets/effects/status/`
- **數量**: 12 幀（heal 6幀 + level_up 6幀）

##### 物品特效
- **位置**: `assets/effects/items/coin/`
- **數量**: 6 幀（128×128px）

##### 粒子特效
- **位置**: `assets/effects/particles/`
- **數量**: 12 幀（sparkle 6幀 + smoke 6幀）

---

### 3.2 缺失資源詳情

<!-- 來自 MISSING_ASSETS_DETAILED.md + ADDITIONAL_MISSING_ASSETS.md -->

#### 高優先級缺失（P0-P1）

##### 任務動畫（核心 🔴）

**狀態**: 完全缺失
**總需求**: 198 幀（3種 × 6幀 × 11角色）

| 任務ID | 任務名稱 | 動畫幀數 | 優先級 |
|--------|---------|---------|--------|
| cooking | 烹飪 | 66幀 | 🔴 必需 |
| prep | 備菜 | 66幀 | 🔴 必需 |
| serving | 端菜 | 66幀 | 🔴 必需 |

**代碼位置**: `src/managers/CharacterDispatchManager.js:30-129`

**路徑規範**: `assets/animations/{characterId}/{taskId}/`
**命名規範**: `{taskId}_{frameNumber}.svg`

---

##### 音頻資源（中優先級 🟡）

**背景音樂（5首）**:

| 場景 | 文件路徑 | 時長建議 | 狀態 |
|------|---------|---------|------|
| 開場劇情 | `assets/audio/bgm/intro-story.mp3` | 2-3分鐘 | ❌ |
| 工作分配 | `assets/audio/bgm/work-assignment.mp3` | 循環 | ❌ |
| 白天營業 | `assets/audio/bgm/day-operation.mp3` | 循環 | ❌ |
| 結算 | `assets/audio/bgm/settlement.mp3` | 1-2分鐘 | ❌ |
| 夜晚 | `assets/audio/bgm/night-time.mp3` | 循環 | ❌ |

**音效（10個核心）**:

| 類別 | 文件路徑 | 狀態 |
|------|---------|------|
| UI | `assets/audio/sfx/click.mp3` | ❌ |
| UI | `assets/audio/sfx/confirm.mp3` | ❌ |
| UI | `assets/audio/sfx/cancel.mp3` | ❌ |
| UI | `assets/audio/sfx/coin.mp3` | ❌ |
| 環境 | `assets/audio/sfx/guest-arrive.mp3` | ❌ |
| 環境 | `assets/audio/sfx/guest-leave.mp3` | ❌ |
| 廚房 | `assets/audio/sfx/cooking.mp3` | ❌ |
| 系統 | `assets/audio/sfx/notification.mp3` | ❌ |
| 系統 | `assets/audio/sfx/level-up.mp3` | ❌ |
| 系統 | `assets/audio/sfx/affection-up.mp3` | ❌ |

---

#### 中優先級缺失（P2）

##### CG 圖（劇情沉浸感）

**總需求**: 72 張（1920×1080px）

###### 角色戀愛 CG（10 張必需）

| 文件名 | 角色 | 場景描述 | 關鍵劇情點 |
|--------|------|---------|-----------|
| `cg_romance_lingyuyan.png` | 林語嫣 | 客棧天台夜景,星光下相擁 | 妹妹線結局 |
| `cg_romance_wenruyu.png` | 溫如玉 | 書房讀書,溫柔互動 | 溫柔大姐線 |
| `cg_romance_guqingluan.png` | 顧青鸞 | 藥房煎藥,並肩而立 | 冰山醫師線 |
| `cg_romance_sumiaoyin.png` | 蘇妙音 | 月下古琴,琴劍合璧 | 殺手音樂家線 |
| `cg_romance_cuier.png` | 翠兒 | 庭院練劍,師徒情深 | 小師妹線 |
| `cg_romance_qinwanrou.png` | 秦婉柔 | 江邊放燈,救贖與寬恕 | 悲劇少女線 |
| `cg_fire_escape.png` | 林語嫣 | 火災中被救出 | 開場關鍵劇情 |
| `cg_qin_reveal.png` | 秦婉柔 | 身份揭露時刻 | 秦婉柔線轉折 |
| `cg_battle_rivalry.png` | 通用 | 客棧前武林決鬥 | 戰鬥事件 |
| `cg_inn_opening.png` | 通用 | 客棧開業慶典 | 遊戲開場 |

###### 其他 CG
- 角色專屬 CG × 30
- 通用場景 CG × 15
- 結局 CG × 17

---

##### 烹飪系統擴展（63 張）

**食材擴展（33 張,128×128px）**:
- 穀物類 × 6
- 肉類 × 8
- 蔬菜類 × 10
- 調味料 × 9

**菜餚擴展（30 張,128×128px）**:
- 主食類 × 5
- 熱菜類 × 10
- 湯品類 × 5
- 點心類 × 10

---

##### 任務動畫（擴展玩法）

**總需求**: 462 幀（7種 × 平均6幀 × 11角色）

| 任務ID | 任務名稱 | 動畫幀數 | 優先級 |
|--------|---------|---------|--------|
| greeting | 迎賓 | 33幀 | 🟡 建議 |
| cleaning | 打掃 | 66幀 | 🟡 建議 |
| tidying | 整理房間 | 66幀 | 🟡 建議 |
| performing | 演奏 | 66幀 | 🟡 建議 |
| healing | 治療 | 66幀 | 🟡 建議 |
| security | 保安 | 66幀 | 🟢 可選 |
| accounting | 記賬 | 66幀 | 🟢 可選 |

---

##### 其他擴展資源

**裝備系統擴展（9 張,128×128px）**:
- 峨眉劍、古琴、銀針、匕首、長槍等角色專屬裝備

**藥材藥品系統（16 張,128×128px）**:
- 藥材 × 10（人參、靈芝、當歸等）
- 藥品 × 6（金創藥、解毒丹、補氣丸等）

**經營道具（23 張）**:
- 設施 × 9（桌椅、床鋪、灶台等）
- 工具 × 14（菜刀、碗盤、茶具等）

**成就與收藏品（9 張）**:
- 成就徽章 × 5
- 收藏品 × 4

**季節變體背景（30 張）**:
- 6 個場景 × 5 個版本（春夏秋冬 + 節日）

---

## 第四部分：工作流程

<!-- 來自 ASSET_WORKFLOW.md -->

### 4.1 佔位符生成流程

#### 步驟 1: 確認資產規格

參考本文檔「第一部分：資產規格定義」,確認需要生成的資產類型、尺寸、格式。

#### 步驟 2: 運行生成腳本

```bash
# 生成所有佔位符資源
npm run assets:generate

# 或分別生成特定類型
npm run assets:placeholders     # 角色立繪與背景
npm run assets:animations       # 角色動畫幀
npm run assets:combat          # 戰鬥系統資源
npm run assets:quest           # 任務物品
npm run assets:scenes          # 場景物件
```

#### 步驟 3: 驗證生成結果

```bash
# 檢查素材完整性
node scripts/check-assets.js
```

---

### 4.2 真實素材替換流程

#### 步驟 1: 美術製作

- 查看本文檔「第一部分：資產規格定義」了解規格要求
- 根據規格設計素材
- 確保命名符合規範

#### 步驟 2: 格式檢查

檢查清單:
- [ ] 尺寸符合規格
- [ ] 格式正確（PNG/SVG/MP3等）
- [ ] 命名規範正確
- [ ] 透明背景（如需要）
- [ ] 檔案大小合理

#### 步驟 3: 替換佔位符

```bash
# 直接覆蓋對應的佔位符文件
cp /path/to/your/real-asset.png assets/scenes/intro/inn-exterior-rundown.png

# 檢查替換結果
npm run check-assets
```

#### 步驟 4: 遊戲測試

```bash
# 運行遊戲測試
npm start
```

---

### 4.3 資產驗證清單

**圖片資產**:
- [ ] 尺寸符合規格
- [ ] 格式正確（PNG/SVG）
- [ ] 命名規範
- [ ] 透明背景（如需要）
- [ ] 檔案大小 < 限制值

**音頻資產**:
- [ ] 格式正確（MP3/OGG/WAV）
- [ ] 比特率符合要求
- [ ] 循環設計（BGM）
- [ ] 音量標準化
- [ ] 長度符合要求

**動畫資產**:
- [ ] 幀數正確（通常6幀）
- [ ] 每幀尺寸一致
- [ ] 命名序號連續
- [ ] 動畫流暢度測試

---

### 4.4 命名規範

<!-- 來自 ASSET_SCHEMA.md + ASSET_WORKFLOW.md -->

**遵循規則**:
- 全小寫字母
- 使用底線 `_` 分隔單詞（角色資源）
- 使用連字符 `-` 分隔單詞（UI/場景資源）
- 語意清晰
- 有序編號使用 `_01`, `_02` 格式

**範例**:
```
✓ 001_林修然_portrait_normal.svg    # 角色資源
✓ inn-exterior-rundown.png          # 場景資源
✓ button-confirm-assignment.png     # UI資源
✓ cooking_0.svg                      # 動畫幀

✗ InnExterior.png                    # 駝峰命名
✗ inn_exterior.png                   # UI用底線
✗ img1.png                           # 不具語意
```

---

## 第五部分：生成腳本

<!-- 來自 ASSETS_SUMMARY.md -->

### 5.1 可用的生成腳本

#### 基礎資源腳本

##### 1. `scripts/generate-placeholders.js`
**功能**: 生成角色立繪、背景、UI 元素
**生成數量**: 76 個文件
**執行**: `node scripts/generate-placeholders.js`

##### 2. `scripts/generate-game-assets.js`
**功能**: 生成遊戲經營系統素材
**生成數量**: 51 個文件
**執行**: `node scripts/generate-game-assets.js`

##### 3. `scripts/generate-character-animations.js`
**功能**: 生成角色動畫幀（8種動作 × 6幀）
**生成數量**: 528 個文件
**執行**: `node scripts/generate-character-animations.js`

##### 4. `scripts/generate-items-and-effects.js`
**功能**: 生成物品圖標和特效動畫
**生成數量**: 62 個文件
**執行**: `node scripts/generate-items-and-effects.js`

---

#### Phase 1 核心資源腳本

##### 5. `scripts/generate-combat-ui.js`
**功能**: 生成戰鬥系統 UI、敵人、技能、Buff/Debuff
**生成數量**: 14 個文件
**npm 腳本**: `npm run assets:combat`

##### 6. `scripts/generate-quest-items.js`
**功能**: 生成劇情任務道具（含稀有度系統）
**生成數量**: 13 個文件
**npm 腳本**: `npm run assets:quest`

##### 7. `scripts/generate-scene-objects.js`
**功能**: 生成可互動場景物件（廚房、儲藏室、房間）
**生成數量**: 30 個文件
**npm 腳本**: `npm run assets:scenes`

---

#### 總生成腳本

##### `scripts/generate-all-assets.js`
**功能**: 一鍵生成所有資源（執行全部7個腳本）
**總生成數量**: 770+ 個文件
**npm 腳本**: `npm run assets:generate`

---

### 5.2 驗證指令

```bash
# 驗證單個角色資源
npm run validate:character {characterId}

# 檢查所有資源完整性
node scripts/check-assets.js

# 驗證動畫幀連續性
node scripts/validate-animations.js
```

---

### 5.3 待創建的生成腳本

以下腳本尚未實作,需要後續開發:

#### 任務動畫生成腳本（高優先級）

**核心任務動畫**:
```bash
# 生成 cooking, prep, serving
npm run assets:task-core
```
**需要**: 創建 `scripts/generate-task-animations-core.js`
**生成數量**: 198 幀

**完整任務動畫**:
```bash
# 生成所有任務動畫
npm run assets:task-extended
```
**需要**: 創建 `scripts/generate-task-animations-extended.js`
**生成數量**: 660 幀

---

## 第六部分：已知問題與修復

<!-- 來自 ADDITIONAL_MISSING_ASSETS.md + ASSET_AUDIT_SUMMARY.md -->

### 6.1 代碼層面問題

#### 問題 1: 動畫路徑不一致 🚨

**位置**: `src/managers/CharacterDispatchManager.js:315`

**問題描述**:
```javascript
// 代碼使用的路徑（錯誤）
const animPath = `assets/characters/animations/${character.id}_${character.name}/${taskDef.animation}/`;

// 實際資源路徑（正確）
assets/animations/{characterId}/{action}/
```

**影響**: 所有任務動畫無法載入

**修復方案**:
```javascript
// 修改為
const animPath = `assets/animations/${character.id}/${taskDef.animation}/`;
```

---

#### 問題 2: 員工模板資源引用錯誤 🚨

**位置**: `src/data/employeeTemplates.js:13-14`

**問題描述**:
```javascript
// 引用不存在的路徑
portrait: 'assets/portraits/manager.png'
avatar: 'assets/avatars/manager.png'

// 且格式錯誤（.png vs .svg）
```

**影響**: 員工肖像無法正確載入

**修復方案 A** （推薦）:
```javascript
// 直接引用對應角色資源
{
  id: 0,
  name: '掌櫃',
  characterId: '007',  // 沈青山
  // 運行時從 AssetLoader 獲取資源
}
```

**修復方案 B**:
```javascript
// 修正路徑和格式
portrait: 'assets/characters/portraits/007_沈青山_portrait_normal.svg',
avatar: 'assets/characters/avatars/007_沈青山_avatar.svg',
```

---

### 6.2 修復優先級

| 問題 | 位置 | 影響 | 優先級 | 預估時間 |
|-----|------|------|--------|---------|
| 動畫路徑不一致 | CharacterDispatchManager.js:315 | 阻塞任務動畫載入 | 🔴 高 | 5分鐘 |
| 員工模板路徑錯誤 | employeeTemplates.js | 員工肖像無法顯示 | 🔴 高 | 10分鐘 |

---

## 第七部分：開發指南

### 7.1 美術設計指南

<!-- 來自 ASSET_WORKFLOW.md -->

#### 整體風格

**建議風格**: 輕寫實 + 溫馨治癒系
- 色調：溫暖的黃褐色為主
- 光影：柔和的光線效果
- 細節：適度細節,不過度復雜
- 情感：傳達希望、溫馨、成長

#### 場景設計要點

**開場場景**:
- 破舊客棧外觀：斑駁木質招牌、蜘蛛網細節,但仍有"希望"的感覺
- 客棧內部荒廢：灰塵、蛛網、破舊桌椅,昏暗但有一束光線透入
- 展示"潛力"而非"絕望"

**工作分配界面**:
- 類似計劃桌面/戰略地圖風格
- 暖色木紋背景
- 卡片式設計（可拖曳感）
- 清晰的視覺層級

**主遊戲場景**:
- 客棧大廳：傳統中式客棧風格,櫃台、桌椅、樓梯,標記可互動區域
- 廚房：灶台、工作台、儲物櫃,忙碌但整潔,食材細節

#### 角色設計

**立繪要求**:
- **統一風格**：所有角色同一繪師完成
- **表情豐富**：至少3種表情（中性、積極、消極）
- **服裝設計**：符合宋代背景
- **姿勢自然**：避免僵硬站立
- **光源一致**：所有立繪統一光源方向

**NPC 設計**:
- **多樣性**：不同職業、年齡、服飾
- **可辨識**：一眼能區分普通客人 vs VIP
- **動畫流暢**：行走動畫至少3幀
- **尺寸統一**：所有 NPC 使用相同基礎尺寸

#### UI 設計原則

1. **可讀性優先**：文字清晰,對比度足夠
2. **層級分明**：主要操作突出,次要操作弱化
3. **反饋明確**：按鈕有明顯的懸停/點擊狀態
4. **風格統一**：所有 UI 使用統一的圓角、間距、顏色
5. **適配考慮**：支持 1280x720 基礎分辨率

---

### 7.2 音效設計指南

<!-- 來自 ASSET_WORKFLOW.md -->

#### BGM 要求

| 場景 | 情緒 | 樂器建議 | 參考風格 |
|------|------|----------|----------|
| 開場劇情 | 感人、希望 | 鋼琴+弦樂 | 溫暖的敘事曲 |
| 工作分配 | 輕快、計劃感 | 木管+撥弦 | 輕鬆的規劃曲 |
| 白天營業 | 歡快、忙碌 | 民樂編制 | 熱鬧的市集感 |
| 結算 | 成就、總結 | 合奏 | 成就感音樂 |
| 夜晚 | 溫馨、放鬆 | 古箏+簫 | 寧靜的夜曲 |

#### SFX 要求

- **UI 音效**：輕柔、不刺耳
- **金錢音效**：清脆悅耳
- **客人音效**：融入環境
- **烹飪音效**：生動但不吵雜
- **通知音效**：溫和提醒,不打斷

---

### 7.3 協作流程

#### 美術設計師流程

1. 查看本文檔「第一部分：資產規格定義」了解需求
2. 根據規格設計素材
3. 命名符合規範
4. 將文件放置到對應路徑
5. 運行 `npm run check-assets` 確認
6. 提交到版本控制

#### 開發者流程

1. 運行 `npm run check-assets` 查看素材狀態
2. 優先開發已有真實素材的場景
3. 對缺失素材使用佔位符測試邏輯
4. 與美術溝通調整需求
5. 素材到位後進行整合測試

---

## 附錄 A：資產生成歷史

<!-- 來自 ASSETS_SUMMARY.md -->

### Phase 1（已完成）
**日期**: 2025-10-26

**生成內容**:
- 角色立繪 49 張
- 角色頭像 11 張
- 基礎動畫 528 張
- 角色小圖標 11 張
- 大場景背景 12 張
- 遊戲場景背景 6 張
- UI 元素 40 張
- 物品圖標 39 張
- 戰鬥UI 14 張
- 場景物件 30 張
- 特效 36 幀

**總計**: 740+ 個文件

---

### Phase 2（規劃中）
**目標**: 核心玩法完整性

**計劃生成**:
- 任務動畫（核心） 198 幀
- 音頻資源（BGM + SFX） 15 個

**預估時間**: 2-3 小時（不含音頻準備）

---

### Phase 3（規劃中）
**目標**: 劇情沉浸感

**計劃生成**:
- CG 圖（核心） 20 張
- 烹飪系統擴展 63 張
- 任務動畫（擴展） 462 幀

**預估時間**: 8-10 小時

---

## 附錄 B：素材規格總結

<!-- 來自 ASSET_CHECKLIST.md -->

### 圖片規格

| 類型 | 尺寸 | 格式 | 大小限制 | 特殊要求 |
|------|------|------|----------|----------|
| 場景背景（大） | 1920×1080 | PNG/JPG | < 1MB | 高質量壓縮 |
| 場景背景（小） | 900×650 | PNG | < 500KB | 經營場景用 |
| 立繪 | 800×1200 | PNG | < 500KB | 透明背景 |
| 頭像 | 64×64 | PNG | < 100KB | 透明背景,圓角 |
| 圖標（大） | 128×128 | PNG | < 100KB | 透明背景 |
| 圖標（中） | 64×64 | PNG | < 50KB | 透明背景 |
| 圖標（小） | 32×32 | PNG | < 30KB | 透明背景 |
| UI 元素 | 可變 | PNG | < 200KB | 支持 9-Slice |
| 動畫幀 | 64×64 | PNG/SVG | < 50KB/幀 | 透明背景 |
| CG 圖 | 1920×1080 | PNG | < 2MB | 高質量 |

### 音頻規格

| 類型 | 格式 | 比特率 | 時長 | 特殊要求 |
|------|------|--------|------|----------|
| BGM | MP3/OGG | 128kbps+ | 2-5分鐘 | 無縫循環 |
| SFX | MP3/OGG/WAV | 標準 | 0.5-2秒 | 統一音量 |

---

## 附錄 C：常見問題

<!-- 來自 ASSET_WORKFLOW.md -->

### Q: 佔位符可以用於最終產品嗎？
**A**: **絕對不行！** 佔位符僅用於開發測試,必須全部替換為正式素材。

### Q: 如何快速找到某個場景需要的所有素材？
**A**: 查看本文檔「第二部分：完整資產清單 → 2.2 按場景分類」。

### Q: 素材文件大小超標怎麼辦？
**A**: 使用圖片壓縮工具：
```bash
# 壓縮圖片（未來實作）
npm run optimize-assets
```

### Q: 可以使用 AI 生成的素材嗎？
**A**: 可以,但需要：
1. 確保符合授權要求
2. 保持風格統一
3. 手動調整以符合規格
4. 標註素材來源（版權追蹤）

### Q: 音效找不到合適的怎麼辦？
**A**: 推薦免費音效網站：
- Freesound.org
- Zapsplat.com
- Pixabay（音效區）

注意確認授權可商業使用。

### Q: 為什麼立繪尺寸是 800×1200 而不是 400×600？
**A**: 800×1200px 是視覺小說業界標準,提供更好的視覺質量。ASSET_CHECKLIST.md 中的 400×600px 規格已廢棄。

### Q: 任務動畫是必需的嗎？
**A**:
- **核心任務動畫**（cooking, prep, serving）是**必需的**,沒有它們客棧經營系統的視覺反饋不完整。
- **擴展任務動畫**（cleaning, performing等）是**可選的**,但會大幅提升體驗。

---

## 附錄 D：快速參考

### 資源路徑速查

```
assets/
├── characters/
│   ├── portraits/           # 角色立繪（800×1200）
│   └── avatars/             # 角色頭像（64×64）
├── animations/              # 角色動畫幀（64×64）
│   └── {characterId}/
│       ├── idle/
│       ├── work/
│       ├── cooking/         # 任務動畫（可選）
│       └── ...
├── backgrounds/             # 大場景背景（1920×1080）
│   ├── inn/
│   ├── town/
│   └── special/
├── scenes/                  # 遊戲場景背景（900×650）
├── ui/                      # UI 元素
│   ├── windows/
│   ├── buttons/
│   ├── icons/
│   ├── notifications/
│   └── combat/
├── objects/                 # 場景物件（64×64）
│   ├── kitchen/
│   ├── storage/
│   └── room/
├── items/                   # 物品圖標（128×128）
│   ├── food/
│   ├── equipment/
│   ├── materials/
│   └── quest/
├── enemies/                 # 敵人圖像（256×256）
├── effects/                 # 特效幀（128×128）
│   ├── combat/
│   ├── status/
│   ├── items/
│   └── particles/
├── sprites/                 # 角色小圖標（32×32）
└── audio/
    ├── bgm/                 # 背景音樂（MP3/OGG）
    └── sfx/                 # 音效（MP3/OGG/WAV）
```

### 命令速查

```bash
# 資源生成
npm run assets:generate          # 生成所有資源
npm run assets:placeholders      # 角色立繪與背景
npm run assets:animations        # 角色動畫幀
npm run assets:combat           # 戰鬥系統資源
npm run assets:quest            # 任務物品
npm run assets:scenes           # 場景物件

# 資源驗證
node scripts/check-assets.js    # 檢查資源完整性
npm run validate:character {id} # 驗證角色資源

# 資源優化
npm run optimize-assets         # 壓縮圖片（未來實作）
```

---

## 文檔維護

### 更新記錄

| 日期 | 版本 | 更新內容 | 維護者 |
|------|------|---------|--------|
| 2025-10-28 | v1.0 | 初版發布,整合 8 個資產文檔 | Claude Code |

### 後續維護計劃

- **每週更新**: 資源生成進度（第三部分）
- **每月審查**: 規格定義是否需要調整（第一部分）
- **發現問題時**: 立即更新「第六部分：已知問題與修復」

### 聯絡資訊

如有資產規格問題或建議,請聯繫：
- **開發團隊**: [項目 GitHub Issues](https://github.com/your-repo/issues)
- **美術負責人**: [待定]

---

**文檔版本**: v1.0
**最後更新**: 2025-10-28
**維護者**: 開發團隊
**整合來源**: 8 個資產管理文檔

---

## 圖例說明

- ✅ **已完成** - 資源已生成且可用
- 🚧 **佔位符** - 使用佔位符,待替換
- ❌ **缺失** - 尚未生成
- 🔴 **高優先級** - 必需,阻塞開發
- 🟡 **中優先級** - 重要,影響體驗
- 🟢 **低優先級** - 可選,錦上添花
