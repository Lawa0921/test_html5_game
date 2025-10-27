# 遊戲資源總覽

本文檔總結了遊戲中所有已生成的佔位圖資源。

## 📊 資源統計

### 總計
- **總文件數**: 770+ 個 SVG 文件
- **生成腳本**: 7 個自動化腳本
- **最近更新**: Phase 1 核心資源（戰鬥UI + 任務物品 + 場景物件）

---

## 🎭 角色資源

### 1. 角色立繪（視覺小說用）
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

### 2. 角色頭像
- **位置**: `assets/characters/avatars/`
- **數量**: 11 張（64×64px）
- **用途**: 對話框、員工列表、UI 顯示

### 3. 角色動畫幀（遊戲場景用）
- **位置**: `assets/animations/001/` ~ `assets/animations/011/`
- **數量**: 528 幀（64×64px）
- **每個角色**: 48 幀
- **動作類型**:
  - **idle/** - 待機動畫（6幀）
  - **work/** - 工作動畫（6幀）
  - **rest/** - 休息動畫（6幀）
  - **sleep/** - 睡覺動畫（6幀）
  - **walk_up/** - 向上行走（6幀）
  - **walk_down/** - 向下行走（6幀）
  - **walk_left/** - 向左行走（6幀）
  - **walk_right/** - 向右行走（6幀）

### 4. 角色小圖標（經營系統用）
- **位置**: `assets/sprites/`
- **數量**: 11 張（32×32px）
- **用途**: 工作站角色顯示、小地圖

---

## 🏞️ 場景資源

### 1. 大場景背景（視覺小說用）
- **位置**: `assets/backgrounds/`
- **數量**: 12 張（1920×1080px）
- **分類**:
  - **inn/** - 客棧場景（7張）
    - exterior_day, exterior_night, lobby, kitchen, room_mc, room_yuyan, courtyard
  - **town/** - 城鎮場景（3張）
    - street_day, street_night, market
  - **special/** - 特殊場景（2張）
    - fire_ruins, qin_mansion

### 2. 遊戲場景背景（經營系統用）
- **位置**: `assets/scenes/`
- **數量**: 6 張（900×650px）
- **內容**:
  - lobby.svg - 客棧大廳
  - kitchen.svg - 廚房
  - storage.svg - 儲藏室
  - room-a.svg - 客房A
  - room-b.svg - 客房B
  - exterior.svg - 客棧外觀

---

## 🎮 UI 資源

### 1. 場景切換按鈕
- **位置**: `assets/ui/buttons/`
- **數量**: 12 張（120×40px）
- **內容**: 6個場景 × 2種狀態（normal, hover）
  - btn-lobby-normal/hover
  - btn-kitchen-normal/hover
  - btn-storage-normal/hover
  - btn-room-a-normal/hover
  - btn-room-b-normal/hover
  - btn-exterior-normal/hover

### 2. 通知系統 UI
- **位置**: `assets/ui/notifications/`
- **數量**: 6 張
- **內容**:
  - notification-bg.svg（280×80px）- 通知背景
  - icon-info.svg（24×24px）- 資訊圖標
  - icon-success.svg（24×24px）- 成功圖標
  - icon-warning.svg（24×24px）- 警告圖標
  - icon-error.svg（24×24px）- 錯誤圖標
  - icon-event.svg（24×24px）- 事件圖標

### 3. 工作站圖標
- **位置**: `assets/ui/icons/`
- **數量**: 6 張（48×48px）
- **內容**:
  - station-management.svg - 管理
  - station-lobby.svg - 大廳
  - station-kitchen.svg - 廚房
  - station-security.svg - 安保
  - station-entertainment.svg - 娛樂
  - station-medicine.svg - 藥房

### 4. 狀態圖標
- **位置**: `assets/ui/icons/`
- **數量**: 6 張（24×24px）
- **內容**:
  - icon-fatigue.svg - 疲勞
  - icon-health.svg - 健康
  - icon-mood.svg - 心情
  - icon-silver.svg - 銀兩
  - icon-reputation.svg - 名聲
  - icon-time.svg - 時間

### 5. 對話框和窗口
- **位置**: `assets/ui/windows/`
- **數量**: 4 張（多種尺寸）
- **內容**:
  - ui_dialogue_box.svg（1600×300px）
  - ui_button_normal.svg（200×60px）
  - ui_button_hover.svg（200×60px）
  - ui_name_plate.svg（300×80px）

---

## 🎒 物品資源

### 1. 食物圖標
- **位置**: `assets/items/food/`
- **數量**: 10 張（128×128px）
- **內容**: 米飯、麵條、包子、魚、肉、蔬菜、茶、酒、點心、水果

### 2. 裝備圖標
- **位置**: `assets/items/equipment/`
- **數量**: 8 張（128×128px）
- **內容**: 劍、盔甲、弓、衣服、鞋子、戒指、項鍊、玉佩

### 3. 材料圖標
- **位置**: `assets/items/materials/`
- **數量**: 8 張（128×128px）
- **內容**: 木材、石頭、布料、金屬、藥草、銀兩、紙張、墨水

---

## ✨ 特效資源

### 1. 戰鬥特效
- **位置**: `assets/effects/combat/hit/`
- **數量**: 6 幀（128×128px）
- **用途**: 打擊效果動畫

### 2. 狀態特效
- **位置**: `assets/effects/status/`
- **數量**: 12 幀（128×128px）
- **內容**:
  - heal/ - 治療特效（6幀）
  - level_up/ - 升級特效（6幀）

### 3. 物品特效
- **位置**: `assets/effects/items/coin/`
- **數量**: 6 幀（128×128px）
- **用途**: 金錢獲得動畫

### 4. 粒子特效
- **位置**: `assets/effects/particles/`
- **數量**: 12 幀（128×128px）
- **內容**:
  - sparkle/ - 閃光特效（6幀）
  - smoke/ - 煙霧特效（6幀）

---

## 🎮 戰鬥系統資源（Phase 1 新增）

### 1. 戰鬥 UI
- **位置**: `assets/ui/combat/`
- **數量**: 2 張
- **內容**:
  - ui_health_bar.svg（200×20px）- 生命條
  - ui_combat_bg.svg（1920×1080px）- 戰鬥背景

### 2. 敵人圖像
- **位置**: `assets/enemies/`
- **數量**: 4 張（256×256px）
- **內容**:
  - enemy_robber.svg - 強盜
  - enemy_drunk.svg - 醉漢
  - enemy_beast.svg - 野獸
  - enemy_soldier.svg - 士兵

### 3. 技能圖標
- **位置**: `assets/ui/combat/skills/`
- **數量**: 3 張（64×64px）
- **內容**:
  - skill_attack.svg - 攻擊
  - skill_defend.svg - 防禦
  - skill_heal.svg - 治療

### 4. Buff/Debuff 圖標
- **位置**: `assets/ui/combat/buffs/`
- **數量**: 5 張（32×32px）
- **內容**:
  - buff_strength.svg - 力量增益
  - buff_defense.svg - 防禦增益
  - buff_speed.svg - 速度增益
  - debuff_poison.svg - 中毒
  - debuff_stun.svg - 暈眩

---

## 📜 任務系統資源（Phase 1 新增）

### 1. 任務物品
- **位置**: `assets/items/quest/`
- **數量**: 13 張（128×128px）
- **內容**:
  - quest_qin_jade.svg - 秦家玉佩（稀有）
  - quest_lin_genealogy.svg - 林家家譜（稀有）
  - quest_yue_token.svg - 岳家軍令牌（史詩）
  - quest_medical_herbs.svg - 珍貴藥材（優良）
  - quest_ancient_scroll.svg - 古籍殘卷（稀有）
  - quest_love_letter.svg - 情書（普通）
  - quest_cooking_recipe.svg - 祖傳食譜（優良）
  - quest_mysterious_box.svg - 神秘盒子（史詩）
  - quest_tavern_deed.svg - 客棧地契（稀有）
  - quest_silver_hairpin.svg - 銀簪（優良）
  - quest_music_score.svg - 樂譜（優良）
  - quest_martial_manual.svg - 武功秘籍（史詩）
  - quest_poison_antidote.svg - 解毒劑（稀有）

**稀有度分布**:
- 史詩（紫色邊框）: 3 個
- 稀有（藍色邊框）: 5 個
- 優良（綠色邊框）: 4 個
- 普通（灰色邊框）: 1 個

---

## 🏠 場景物件資源（Phase 1 新增）

### 1. 廚房物件
- **位置**: `assets/objects/kitchen/`
- **數量**: 10 張（64×64px）
- **可互動**: 9 個 | **裝飾**: 1 個
- **內容**:
  - obj_stove.svg - 灶台 [可互動]
  - obj_cutting_board.svg - 砧板 [可互動]
  - obj_wok.svg - 鐵鍋 [可互動]
  - obj_pot.svg - 陶罐 [可互動]
  - obj_knife_set.svg - 刀具架 [可互動]
  - obj_spice_rack.svg - 調料架 [可互動]
  - obj_water_bucket.svg - 水桶 [可互動]
  - obj_firewood.svg - 柴火堆 [裝飾]
  - obj_bamboo_steamer.svg - 蒸籠 [可互動]
  - obj_oil_jar.svg - 油罐 [可互動]

### 2. 儲藏室物件
- **位置**: `assets/objects/storage/`
- **數量**: 10 張（64×64px）
- **可互動**: 10 個 | **裝飾**: 0 個
- **內容**:
  - obj_rice_jar.svg - 米缸 [可互動]
  - obj_wine_jar.svg - 酒罈 [可互動]
  - obj_tea_chest.svg - 茶箱 [可互動]
  - obj_medicine_cabinet.svg - 藥櫃 [可互動]
  - obj_fabric_roll.svg - 布匹 [可互動]
  - obj_tool_box.svg - 工具箱 [可互動]
  - obj_cash_box.svg - 錢箱 [可互動]
  - obj_account_books.svg - 帳簿 [可互動]
  - obj_seal_box.svg - 印章盒 [可互動]
  - obj_scroll_rack.svg - 卷軸架 [可互動]

### 3. 房間物件
- **位置**: `assets/objects/room/`
- **數量**: 10 張（64×64px）
- **可互動**: 9 個 | **裝飾**: 1 個
- **內容**:
  - obj_bed.svg - 床鋪 [可互動]
  - obj_table.svg - 桌子 [可互動]
  - obj_chair.svg - 椅子 [可互動]
  - obj_dresser.svg - 梳妝台 [可互動]
  - obj_wardrobe.svg - 衣櫃 [可互動]
  - obj_incense_burner.svg - 香爐 [可互動]
  - obj_tea_set.svg - 茶具 [可互動]
  - obj_zither.svg - 古琴 [可互動]
  - obj_bookshelf.svg - 書架 [可互動]
  - obj_screen.svg - 屏風 [裝飾]

---

## 🛠️ 生成腳本

### 基礎資源腳本

#### 1. `scripts/generate-placeholders.js`
- **功能**: 生成角色立繪、背景、UI 元素
- **生成數量**: 76 個文件

#### 2. `scripts/generate-game-assets.js`
- **功能**: 生成遊戲經營系統素材
- **生成數量**: 51 個文件

#### 3. `scripts/generate-character-animations.js`
- **功能**: 生成角色動畫幀（8種動作 × 6幀）
- **生成數量**: 528 個文件

#### 4. `scripts/generate-items-and-effects.js`
- **功能**: 生成物品圖標和特效動畫
- **生成數量**: 62 個文件

### Phase 1 核心資源腳本

#### 5. `scripts/generate-combat-ui.js`
- **功能**: 生成戰鬥系統 UI、敵人、技能、Buff/Debuff
- **生成數量**: 14 個文件
- **npm 腳本**: `npm run assets:combat`

#### 6. `scripts/generate-quest-items.js`
- **功能**: 生成劇情任務道具（含稀有度系統）
- **生成數量**: 13 個文件
- **npm 腳本**: `npm run assets:quest`

#### 7. `scripts/generate-scene-objects.js`
- **功能**: 生成可互動場景物件（廚房、儲藏室、房間）
- **生成數量**: 30 個文件
- **npm 腳本**: `npm run assets:scenes`

### 總生成腳本

#### `scripts/generate-all-assets.js`
- **功能**: 一鍵生成所有資源（執行全部7個腳本）
- **總生成數量**: 770+ 個文件
- **npm 腳本**: `npm run assets:generate`

---

## 📋 資源清單 JSON

所有資源的詳細信息記錄在：
- `assets/asset-manifest.json` - 主要資源清單

---

## 🔄 替換流程

當正式美術資源準備好後：

1. **保持相同的目錄結構**
2. **使用相同的文件命名**
3. **建議格式**:
   - 角色/UI: PNG（支持透明）
   - 背景: JPG（無需透明）
   - 動畫: Sprite Sheet 或 PNG 序列

---

## 📈 總結

### 基礎資源統計

| 類別 | 文件數 | 備註 |
|------|--------|------|
| 角色立繪 | 49 | 視覺小說用 |
| 角色頭像 | 11 | UI 顯示用 |
| 角色動畫幀 | 528 | 場景動作用 |
| 角色小圖標 | 11 | 經營系統用 |
| 大場景背景 | 12 | 視覺小說用 |
| 遊戲場景背景 | 6 | 經營系統用 |
| UI 按鈕 | 12 | 場景切換 |
| UI 圖標 | 18 | 通知、狀態、工作站 |
| UI 窗口 | 4 | 對話框、按鈕 |
| 物品圖標 | 26 | 食物、裝備、材料 |
| 特效幀 | 36 | 戰鬥、狀態、粒子 |
| **基礎資源小計** | **713** | **7 個類別** |

### Phase 1 核心資源統計

| 類別 | 文件數 | 備註 |
|------|--------|------|
| 戰鬥 UI | 2 | 生命條、背景 |
| 敵人圖像 | 4 | 強盜、醉漢、野獸、士兵 |
| 技能圖標 | 3 | 攻擊、防禦、治療 |
| Buff/Debuff 圖標 | 5 | 3 種增益 + 2 種減益 |
| 任務物品 | 13 | 劇情道具（含稀有度） |
| 場景物件 | 30 | 廚房 + 儲藏室 + 房間 |
| **Phase 1 小計** | **57** | **6 個類別** |

### 總計

| 類別 | 數量 |
|------|------|
| **總文件數** | **770+** |
| **生成腳本數** | **7 個** |
| **資源類別數** | **13 個** |
| **總檔案大小** | **約 4.0 MB** |

---

**最後更新**: 2025-10-26
**生成工具版本**: 1.1.0
**Phase 1 完成日期**: 2025-10-26
