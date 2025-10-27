# 遊戲資源結構規範

本文檔定義了遊戲中所有實體類型的資源需求規範。當擴充新內容時，請按照此規範準備對應的資源文件。

---

## 📐 設計原則

> "好品味是一種直覺：消除特殊情況，讓所有東西都遵循統一的模式。" - Linus Torvalds

1. **一致性** - 同類實體使用相同的資源結構
2. **可預測性** - 資源路徑和命名遵循統一規則
3. **最小化** - 只定義必需的資源，避免冗餘
4. **可擴展性** - 結構允許未來添加可選資源

---

## 🎭 角色（Character）

### 必需資源

一個可雇用到客棧工作的角色需要以下資源：

#### 1. 角色立繪（Portraits）
- **用途**: 視覺小說對話場景
- **數量**: 至少 3-6 個表情狀態
- **尺寸**: 800×1200px
- **格式**: SVG（開發階段）/ PNG（正式美術）
- **命名規則**: `{characterId}_{characterName}_portrait_{emotion}.svg`
- **路徑**: `assets/characters/portraits/`

**必需表情狀態**:
- `normal` - 普通表情（必需）
- `smile` - 微笑（必需）
- `sad` - 悲傷（必需）

**可選表情狀態**:
- `angry`, `happy`, `surprised`, `shy`, `serious`, `determined`, `crying`, 等

**範例**:
```
assets/characters/portraits/001_林修然_portrait_normal.svg
assets/characters/portraits/001_林修然_portrait_smile.svg
assets/characters/portraits/001_林修然_portrait_sad.svg
```

#### 2. 角色頭像（Avatar）
- **用途**: 對話框、員工列表、UI 顯示
- **數量**: 1 個
- **尺寸**: 64×64px
- **格式**: SVG / PNG
- **命名規則**: `{characterId}_{characterName}_avatar.svg`
- **路徑**: `assets/characters/avatars/`

**範例**:
```
assets/characters/avatars/001_林修然_avatar.svg
```

#### 3. 角色動畫幀（Animations）
- **用途**: 遊戲場景中的角色移動和動作
- **數量**: 8 種動作 × 6 幀 = 48 個文件
- **尺寸**: 64×64px
- **格式**: SVG / PNG
- **命名規則**: `{action}_{frameNumber}.svg`
- **路徑**: `assets/animations/{characterId}/{action}/`

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

#### 3.1 擴展：任務動畫（Task Animations）⭐ 可選

除了基礎 8 種動作外，遊戲支持以下任務專用動畫：

**廚房任務動畫**:
```
cooking/    - 烹飪（6幀）🔴 核心
prep/       - 備菜（6幀）🔴 核心
serving/    - 端菜（6幀）🔴 核心
```

**服務任務動畫**:
```
greeting/   - 迎賓（3幀）🟡 建議
cleaning/   - 打掃（6幀）🟡 建議
tidying/    - 整理房間（6幀）🟡 建議
```

**特殊任務動畫**:
```
performing/  - 演奏（6幀）🟡 建議
healing/     - 治療（6幀）🟡 建議
security/    - 保安（6幀）🟢 可選
accounting/  - 記賬（6幀）🟢 可選
```

**代碼引用**: `src/managers/CharacterDispatchManager.js:30-129`

**優先級說明**:
- 🔴 核心（cooking, prep, serving）: 客棧經營核心玩法必需
- 🟡 建議（cleaning, tidying, performing）: 大幅增強遊戲體驗
- 🟢 可選（greeting, healing, security, accounting）: 完整性補充

**總需求計算**:
- 核心任務: 3種 × 6幀 × 11角色 = **198 幀**
- 全部任務: 10種 × 平均6幀 × 11角色 = **660 幀**

**範例**:
```
assets/animations/001/cooking/cooking_0.svg
assets/animations/001/cooking/cooking_1.svg
...
assets/animations/002/serving/serving_0.svg
...
```

#### 4. 角色小圖標（Sprite）
- **用途**: 工作站角色顯示、小地圖
- **數量**: 1 個
- **尺寸**: 32×32px
- **格式**: SVG / PNG
- **命名規則**: `sprite-{index}.svg`
- **路徑**: `assets/sprites/`

**範例**:
```
assets/sprites/sprite-0.svg  (對應角色 001)
```

---

### 角色資源總結

| 資源類型 | 數量 | 尺寸 | 必需/可選 |
|---------|------|------|----------|
| 立繪（portraits） | 3-6 張 | 800×1200px | 必需 |
| 頭像（avatar） | 1 張 | 64×64px | 必需 |
| 動畫幀（animations） | 48 張 | 64×64px | 必需 |
| 小圖標（sprite） | 1 張 | 32×32px | 必需 |
| **總計** | **53-56 張** | - | - |

---

## 📦 物品（Item）

### 必需資源

一個可在遊戲中使用的物品需要以下資源：

#### 1. 物品圖標（Icon）
- **用途**: 背包UI、商店、配方顯示
- **數量**: 1 個
- **尺寸**: 128×128px
- **格式**: SVG / PNG
- **命名規則**: 根據物品類型
- **路徑**: 根據物品類型分類

**物品分類與路徑**:

##### 食材（Ingredients）
- **路徑**: `assets/items/food/`
- **命名**: `food_{itemId}.svg`
- **範例**: `food_rice.svg`, `food_fish.svg`

##### 裝備（Equipment）
- **路徑**: `assets/items/equipment/`
- **命名**: `equip_{itemId}.svg`
- **範例**: `equip_sword.svg`, `equip_armor.svg`

##### 材料（Materials）
- **路徑**: `assets/items/materials/`
- **命名**: `mat_{itemId}.svg`
- **範例**: `mat_wood.svg`, `mat_metal.svg`

##### 任務道具（Quest Items）
- **路徑**: `assets/items/quest/`
- **命名**: `quest_{itemId}.svg`
- **範例**: `quest_qin_jade.svg`, `quest_lin_genealogy.svg`

**特殊屬性 - 稀有度系統**:

任務道具支持稀有度邊框顏色：
- **普通（Common）**: 灰色邊框 `#9E9E9E`
- **優良（Uncommon）**: 綠色邊框 `#4CAF50`
- **稀有（Rare）**: 藍色邊框 `#2196F3`
- **史詩（Epic）**: 紫色邊框 `#9C27B0`
- **傳說（Legendary）**: 橙色邊框 `#FF9800`

---

### 物品資源總結

| 資源類型 | 數量 | 尺寸 | 必需/可選 |
|---------|------|------|----------|
| 圖標（icon） | 1 張 | 128×128px | 必需 |
| 稀有度邊框 | - | - | 可選（任務道具） |
| **總計** | **1 張** | - | - |

---

## 🏠 場景（Scene）

### 必需資源

一個完整的遊戲場景需要以下資源：

#### 1. 大場景背景（Background - 視覺小說用）
- **用途**: 視覺小說對話場景背景
- **數量**: 1-2 張（日/夜版本）
- **尺寸**: 1920×1080px
- **格式**: SVG / JPG
- **命名規則**: `{category}_{sceneName}_{variant}.svg`
- **路徑**: `assets/backgrounds/{category}/`

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

#### 2. 遊戲場景背景（Scene Background - 經營系統用）
- **用途**: 經營玩法的場景主背景
- **數量**: 1 張
- **尺寸**: 900×650px
- **格式**: SVG / PNG
- **命名規則**: `{sceneName}.svg`
- **路徑**: `assets/scenes/`

**範例**:
```
assets/scenes/lobby.svg
assets/scenes/kitchen.svg
assets/scenes/storage.svg
```

#### 3. 場景切換按鈕（Scene Buttons）
- **用途**: 場景間切換的 UI 按鈕
- **數量**: 2 張（normal + hover 狀態）
- **尺寸**: 120×40px
- **格式**: SVG / PNG
- **命名規則**: `btn-{sceneName}-{state}.svg`
- **路徑**: `assets/ui/buttons/`

**必需狀態**:
- `normal` - 正常狀態
- `hover` - 滑鼠懸停狀態

**範例**:
```
assets/ui/buttons/btn-lobby-normal.svg
assets/ui/buttons/btn-lobby-hover.svg
```

#### 4. 場景物件（Scene Objects）
- **用途**: 場景中可互動的物件圖標
- **數量**: 根據場景類型，通常 8-12 個
- **尺寸**: 64×64px
- **格式**: SVG / PNG
- **命名規則**: `obj_{objectName}.svg`
- **路徑**: `assets/objects/{sceneType}/`

**場景類型**:
- `kitchen/` - 廚房物件（灶台、砧板、鐵鍋等）
- `storage/` - 儲藏室物件（米缸、酒罈、藥櫃等）
- `room/` - 房間物件（床鋪、桌子、衣櫃等）

**物件屬性**:
- 可互動物件：帶金色閃光動畫邊框
- 裝飾物件：無特殊效果

**範例**:
```
assets/objects/kitchen/obj_stove.svg        [可互動]
assets/objects/kitchen/obj_cutting_board.svg [可互動]
assets/objects/kitchen/obj_firewood.svg      [裝飾]
```

---

### 場景資源總結

| 資源類型 | 數量 | 尺寸 | 必需/可選 |
|---------|------|------|----------|
| 大背景（background） | 1-2 張 | 1920×1080px | 必需 |
| 遊戲背景（scene_bg） | 1 張 | 900×650px | 必需 |
| 切換按鈕（buttons） | 2 張 | 120×40px | 必需 |
| 場景物件（objects） | 8-12 張 | 64×64px | 可選 |
| **總計** | **12-17 張** | - | - |

---

## ⚔️ 戰鬥相關實體

### 敵人（Enemy）

#### 必需資源

##### 1. 敵人圖像（Enemy Sprite）
- **用途**: 戰鬥場景中的敵人顯示
- **數量**: 1 張
- **尺寸**: 256×256px
- **格式**: SVG / PNG
- **命名規則**: `enemy_{enemyId}.svg`
- **路徑**: `assets/enemies/`

**範例**:
```
assets/enemies/enemy_robber.svg
assets/enemies/enemy_drunk.svg
assets/enemies/enemy_beast.svg
```

**資源總結**:
| 資源類型 | 數量 | 尺寸 | 必需/可選 |
|---------|------|------|----------|
| 圖像（sprite） | 1 張 | 256×256px | 必需 |

---

### 技能（Skill）

#### 必需資源

##### 1. 技能圖標（Skill Icon）
- **用途**: 戰鬥UI中的技能按鈕
- **數量**: 1 張
- **尺寸**: 64×64px
- **格式**: SVG / PNG
- **命名規則**: `skill_{skillId}.svg`
- **路徑**: `assets/ui/combat/skills/`

**範例**:
```
assets/ui/combat/skills/skill_attack.svg
assets/ui/combat/skills/skill_defend.svg
assets/ui/combat/skills/skill_heal.svg
```

**資源總結**:
| 資源類型 | 數量 | 尺寸 | 必需/可選 |
|---------|------|------|----------|
| 圖標（icon） | 1 張 | 64×64px | 必需 |

---

### 狀態效果（Buff/Debuff）

#### 必需資源

##### 1. 狀態圖標（Status Icon）
- **用途**: 角色/敵人身上顯示的狀態效果
- **數量**: 1 張
- **尺寸**: 32×32px
- **格式**: SVG / PNG
- **命名規則**: `{type}_{statusId}.svg`
- **路徑**: `assets/ui/combat/buffs/`

**類型前綴**:
- `buff_` - 增益效果（綠色邊框）
- `debuff_` - 減益效果（紅色邊框）

**範例**:
```
assets/ui/combat/buffs/buff_strength.svg
assets/ui/combat/buffs/buff_defense.svg
assets/ui/combat/buffs/debuff_poison.svg
assets/ui/combat/buffs/debuff_stun.svg
```

**資源總結**:
| 資源類型 | 數量 | 尺寸 | 必需/可選 |
|---------|------|------|----------|
| 圖標（icon） | 1 張 | 32×32px | 必需 |

---

## ✨ 特效（Effect）

### 動畫特效

#### 必需資源

##### 1. 特效幀序列（Effect Frames）
- **用途**: 戰鬥打擊、治療、升級等動畫效果
- **數量**: 6 幀（標準動畫循環）
- **尺寸**: 128×128px
- **格式**: SVG / PNG
- **命名規則**: `{effectName}_frame_{frameNumber}.svg`
- **路徑**: `assets/effects/{category}/{effectName}/`

**特效分類**:
- `combat/` - 戰鬥特效（hit, slash, explosion等）
- `status/` - 狀態特效（heal, level_up等）
- `items/` - 物品特效（coin, sparkle等）
- `particles/` - 粒子特效（smoke, fire等）

**範例**:
```
assets/effects/combat/hit/hit_frame_0.svg
assets/effects/combat/hit/hit_frame_1.svg
...
assets/effects/combat/hit/hit_frame_5.svg
```

**資源總結**:
| 資源類型 | 數量 | 尺寸 | 必需/可選 |
|---------|------|------|----------|
| 動畫幀（frames） | 6 張 | 128×128px | 必需 |

---

## 🎨 UI 元素

### 通用 UI 元素規範

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
| 生命條 | 200×20px | `assets/ui/combat/` | `ui_health_bar.svg` |
| 戰鬥背景 | 1920×1080px | `assets/ui/combat/` | `ui_combat_bg.svg` |

---

## 🎵 音頻資源（Audio）

### 必需資源

遊戲音頻分為背景音樂（BGM）和音效（SFX）兩大類。

#### 1. 背景音樂（Background Music）

- **用途**: 場景氛圍營造
- **數量**: 6-10 首
- **格式**: MP3 (128-192kbps) / OGG
- **特性**: 支持無縫循環
- **命名規則**: `bgm_{sceneName}.mp3`
- **路徑**: `assets/audio/bgm/`

**必需BGM清單**:

| 場景 | 文件名 | 長度建議 | 氛圍 |
|------|--------|---------|------|
| 主菜單 | `bgm_menu.mp3` | 2-3分鐘 | 輕鬆、歡迎 |
| 客棧日間 | `bgm_inn_day.mp3` | 3-4分鐘 | 明快、忙碌 |
| 客棧夜間 | `bgm_inn_night.mp3` | 3-4分鐘 | 寧靜、溫馨 |
| 戰鬥 | `bgm_battle.mp3` | 2-3分鐘 | 緊張、動感 |
| 劇情對話 | `bgm_story.mp3` | 3-5分鐘 | 抒情、敘事 |
| 城鎮街道 | `bgm_town.mp3` | 3-4分鐘 | 熱鬧、探索 |

**範例**:
```
assets/audio/bgm/bgm_menu.mp3
assets/audio/bgm/bgm_inn_day.mp3
assets/audio/bgm/bgm_battle.mp3
```

#### 2. 音效（Sound Effects）

- **用途**: 交互反饋、環境音效
- **數量**: 10-30 個
- **格式**: MP3 / OGG / WAV
- **長度**: 建議 < 3秒（UI音效 < 0.5秒）
- **命名規則**: `sfx_{actionName}.mp3`
- **路徑**: `assets/audio/sfx/`

**核心SFX清單**:

| 類別 | 文件名 | 觸發時機 |
|------|--------|---------|
| **UI** | `sfx_button_click.mp3` | 按鈕點擊 |
| **UI** | `sfx_menu_open.mp3` | 選單開啟 |
| **UI** | `sfx_notification.mp3` | 通知彈出 |
| **UI** | `sfx_coin.mp3` | 獲得金錢 |
| **廚房** | `sfx_cooking.mp3` | 烹飪動作 |
| **廚房** | `sfx_chopping.mp3` | 切菜音效 |
| **戰鬥** | `sfx_attack.mp3` | 攻擊動作 |
| **戰鬥** | `sfx_hit.mp3` | 受到傷害 |
| **戰鬥** | `sfx_heal.mp3` | 治療效果 |
| **環境** | `sfx_footstep.mp3` | 走路聲 |
| **環境** | `sfx_door.mp3` | 開門/關門 |

**範例**:
```
assets/audio/sfx/sfx_button_click.mp3
assets/audio/sfx/sfx_cooking.mp3
assets/audio/sfx/sfx_attack.mp3
```

---

### 音頻資源總結

| 資源類型 | 數量 | 格式 | 必需/可選 |
|---------|------|------|----------|
| 背景音樂（BGM） | 6-10 首 | MP3/OGG | 必需 |
| UI音效 | 4 個 | MP3/OGG/WAV | 必需 |
| 遊戲音效 | 7+ 個 | MP3/OGG/WAV | 建議 |
| **總計** | **17-21 個** | - | - |

---

## 📋 資源檢查清單

### 新增角色時需要準備：
- [ ] 3-6 個表情立繪（800×1200px）
- [ ] 1 個頭像（64×64px）
- [ ] 48 個動畫幀（8動作 × 6幀，64×64px）
- [ ] 1 個小圖標（32×32px）
- [ ] 在 `asset-manifest.json` 中註冊

### 新增物品時需要準備：
- [ ] 1 個物品圖標（128×128px）
- [ ] 確定物品類型（食材/裝備/材料/任務）
- [ ] 如果是任務道具，設定稀有度

### 新增場景時需要準備：
- [ ] 1-2 個大場景背景（1920×1080px）
- [ ] 1 個遊戲場景背景（900×650px）
- [ ] 2 個切換按鈕（120×40px，normal + hover）
- [ ] 8-12 個場景物件（64×64px，可選）

### 新增敵人時需要準備：
- [ ] 1 個敵人圖像（256×256px）
- [ ] 在 CombatManager 中定義敵人數據

### 新增技能時需要準備：
- [ ] 1 個技能圖標（64×64px）

### 新增狀態效果時需要準備：
- [ ] 1 個狀態圖標（32×32px）
- [ ] 確定類型（buff/debuff）

### 新增特效時需要準備：
- [ ] 6 個動畫幀（128×128px）
- [ ] 確定特效分類（combat/status/items/particles）

---

## 🔧 資源驗證工具

使用以下命令檢查資源完整性：

```bash
# 驗證角色資源完整性
node scripts/validate-character-assets.js {characterId}

# 驗證所有資源完整性（未來實作）
node scripts/validate-all-assets.js
```

---

## 📌 重要提醒

1. **命名一致性**: 所有資源文件必須使用**小寫字母**和**底線**，不要使用空格或特殊字符
2. **ID 規則**: 角色 ID 使用 3 位數字（001, 002...），其他實體使用語義化字串（rice, sword, lobby）
3. **尺寸嚴格**: SVG 佔位圖可以彈性，但正式美術資源必須嚴格遵守尺寸規範
4. **路徑規範**: 所有路徑使用相對於專案根目錄的路徑
5. **版本控制**: 所有資源文件都應提交到 Git，確保團隊同步

---

**最後更新**: 2025-10-26
**文檔版本**: 1.0.0
**維護者**: Claude Code
