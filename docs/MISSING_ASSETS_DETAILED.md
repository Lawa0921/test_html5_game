# 缺失資源詳細清單

根據代碼掃描，以下是所有缺失資源的詳細說明。

---

## 📊 總覽

| 類別 | 缺失數量 | 優先級 | 影響 |
|------|---------|--------|------|
| CG 圖 | 72 | 🔴 高 | 視覺小說體驗完整性 |
| 戰鬥系統 | 14 | 🔴 高 | 戰鬥場景可玩性 |
| 任務物品 | 13 | 🔴 高 | 劇情推進必需 |
| 烹飪系統 | 60 | 🟡 中 | 經營玩法深度 |
| 場景物件 | 30 | 🟡 中 | 場景視覺品質 |
| 藥材系統 | 16 | 🟡 中 | 顧青鸞角色功能 |
| 裝備擴展 | 9 | 🟢 低 | 裝備系統完整性 |
| 經營道具 | 23 | 🟢 低 | 經營細節豐富度 |
| 成就收藏 | 9 | 🟢 低 | 收集要素 |
| 季節變體 | 30 | 🟢 低 | 畫面多樣性 |

---

## 🔴 高優先級資源

### 1. 視覺小說 CG 圖（72 張）

**當前狀況**：
```javascript
// src/scenes/StoryScene.js 第 44-49 行
// 創建背景（暫時用純色矩形）
this.background = this.add.rectangle(0, 0, width, height, 0x2a2a2a);

// 創建角色立繪區域（placeholder）
this.characterPortrait = this.add.rectangle(width / 2, height / 2 - 50, 200, 300, 0x6b4423);
```

**影響**：
- ❌ 視覺小說模式只有純色矩形，無法展示劇情氛圍
- ❌ 角色情感表達完全缺失
- ❌ 關鍵劇情場景無法視覺化

#### 1.1 角色戀愛 CG（必需，10 張）

**用途**：每位可攻略女角的核心 CG，劇情高潮必需

| 文件名 | 角色 | 場景描述 | 關鍵劇情點 |
|--------|------|---------|-----------|
| `cg_romance_lingyuyan.png` | 林語嫣 | 客棧天台夜景，星光下相擁 | 妹妹線結局 |
| `cg_romance_wenruyu.png` | 溫如玉 | 書房讀書，溫柔互動 | 溫柔大姐線 |
| `cg_romance_guqingluan.png` | 顧青鸞 | 藥房煎藥，並肩而立 | 冰山醫師線 |
| `cg_romance_sumiaoyin.png` | 蘇妙音 | 月下古琴，琴劍合璧 | 殺手音樂家線 |
| `cg_romance_cuier.png` | 翠兒 | 庭院練劍，師徒情深 | 小師妹線 |
| `cg_romance_qinwanrou.png` | 秦婉柔 | 江邊放燈，救贖與寬恕 | 悲劇少女線 |
| `cg_fire_escape.png` | 林語嫣 | 火災中被救出 | 開場關鍵劇情 |
| `cg_qin_reveal.png` | 秦婉柔 | 身份揭露時刻 | 秦婉柔線轉折 |
| `cg_battle_rivalry.png` | 通用 | 客棧前武林決鬥 | 戰鬥事件 |
| `cg_inn_opening.png` | 通用 | 客棧開業慶典 | 遊戲開場 |

**尺寸**：1920×1080px
**格式**：PNG（支持透明背景用於疊加效果）

---

#### 1.2 角色專屬 CG（擴展，30 張）

**用途**：深化角色支線，增強代入感

<details>
<summary>點擊展開詳細清單</summary>

**林修然專屬（4 張）**：
- `cg_childhood.png` - 童年被欺負場景
- `cg_expelled.png` - 被逐出家族
- `cg_innkeeper.png` - 成為掌櫃的決心時刻
- `cg_success.png` - 客棧成功經營

**林語嫣專屬（5 張）**：
- `cg_fire.png` - 火災現場
- `cg_arrive.png` - 初到客棧
- `cg_kitchen_healing.png` - 廚房中治癒
- `cg_speak_again.png` - 重新開口說話

**溫如玉專屬（3 張）**：
- `cg_family_fall.png` - 家族沒落
- `cg_service.png` - 服務客人的優雅
- `cg_romance_alternate.png` - 備用戀愛場景

**顧青鸞專屬（3 張）**：
- `cg_poison.png` - 中毒事件
- `cg_healing.png` - 醫治他人
- `cg_romance_alternate.png` - 備用戀愛場景

**蘇妙音專屬（4 張）**：
- `cg_assassin.png` - 刺客身份揭露
- `cg_qin_performance.png` - 古琴演奏
- `cg_qin_sword.png` - 琴劍合璧
- `cg_romance_alternate.png` - 備用戀愛場景

**翠兒專屬（4 張）**：
- `cg_emei.png` - 峨眉派場景
- `cg_runaway.png` - 逃跑時刻
- `cg_sword_practice.png` - 練劍場景
- `cg_romance_alternate.png` - 備用戀愛場景

**秦婉柔專屬（7 張）**：
- `cg_childhood_qin.png` - 童年與林修然
- `cg_truth.png` - 真相揭露
- `cg_suicide_attempt.png` - 自殺未遂（需謹慎處理）
- `cg_escape.png` - 逃離秦府
- `cg_confrontation.png` - 與父親對峙
- `cg_father_meeting.png` - 與秦檜見面
- `cg_redemption.png` - 救贖時刻

</details>

---

#### 1.3 通用場景 CG（15 張）

**用途**：營造遊戲氛圍，通用劇情場景

| 文件名 | 場景 | 用途 |
|--------|------|------|
| `cg_inn_busy.png` | 客棧繁忙時刻 | 經營成功表現 |
| `cg_inn_night.png` | 客棧夜晚 | 夜間事件背景 |
| `cg_inn_festival.png` | 節慶裝飾 | 節日活動 |
| `cg_battle_robbery.png` | 強盜襲擊 | 戰鬥事件 |
| `cg_battle_victory.png` | 戰鬥勝利 | 戰鬥結果 |
| `cg_fire_disaster.png` | 火災災難 | 關鍵劇情 |
| `cg_flood.png` | 洪水場景 | 自然災害事件 |
| `cg_festival_lantern.png` | 燈會 | 節日活動 |
| `cg_wedding.png` | 婚禮場景 | 結局之一 |

---

#### 1.4 結局 CG（17 張）

**用途**：各種結局的視覺化呈現

<details>
<summary>點擊展開詳細清單</summary>

**角色結局 CG（12 張）**：
- 每位可攻略女角 2 張（好結局 + 壞結局）
  - 林語嫣：`cg_ending_lingyuyan_good.png` / `cg_ending_lingyuyan_bad.png`
  - 溫如玉：`cg_ending_wenruyu_good.png` / `cg_ending_wenruyu_bad.png`
  - 顧青鸞：`cg_ending_guqingluan_good.png` / `cg_ending_guqingluan_bad.png`
  - 蘇妙音：`cg_ending_sumiaoyin_good.png` / `cg_ending_sumiaoyin_bad.png`
  - 翠兒：`cg_ending_cuier_good.png` / `cg_ending_cuier_bad.png`
  - 秦婉柔：`cg_ending_qinwanrou_good.png` / `cg_ending_qinwanrou_bad.png`

**特殊結局 CG（5 張）**：
- `cg_ending_business_empire.png` - 商業帝國結局
- `cg_ending_martial_master.png` - 武林盟主結局
- `cg_ending_peaceful_life.png` - 平靜生活結局
- `cg_ending_tragedy.png` - 悲劇結局
- `cg_ending_reconciliation.png` - 和解結局（秦婉柔特殊線）

</details>

---

### 2. 戰鬥系統資源（14 張）

**當前狀況**：
```javascript
// src/managers/CombatManager.js
// 戰鬥類型已定義，但無對應圖像
this.combatTypes = {
    rivalry: '江湖仇殺',
    brawl: '酒後鬧事',
    robbery: '強盜來襲',
    duel: '武林切磋',
    protection: '保護客人'
};
```

**影響**：
- ❌ 戰鬥場景只有文字描述，缺乏視覺衝擊
- ❌ 敵人無圖像，使用純色圓形代替
- ❌ 戰鬥 UI 元素缺失，影響玩家體驗

#### 2.1 必需資源（8 張）

| 文件名 | 尺寸 | 用途 | 代碼位置 |
|--------|------|------|---------|
| `ui_health_bar.png` | 200×20px | 生命條 | CombatManager |
| `ui_combat_bg.png` | 1920×1080px | 戰鬥背景 | BattleScene |
| `ui_action_panel.png` | 400×300px | 行動選擇面板 | BattleScene |
| `ui_turn_indicator.png` | 100×100px | 回合指示器 | BattleScene |
| `enemy_robber.png` | 256×256px | 強盜（最常見敵人） | CombatManager |
| `enemy_drunk.png` | 256×256px | 醉漢 | CombatManager |
| `enemy_warrior.png` | 256×256px | 武林高手 | CombatManager |
| `enemy_assassin.png` | 256×256px | 追殺者（秦婉柔線） | CombatManager |

#### 2.2 擴展資源（6 張）

- `effect_sword_slash.png` - 劍氣特效（128×128px，6幀）
- `effect_punch.png` - 拳擊特效（128×128px，6幀）
- `effect_dodge.png` - 閃避特效（128×128px，6幀）

---

### 3. 任務關鍵物品（13 張）

**當前狀況**：
- 任務系統已實作（MissionManager.js）
- 物品引用已定義，但無對應圖像

**影響**：
- ❌ 任務物品無法視覺化，玩家不知道拿到什麼
- ❌ 關鍵劇情道具缺失，影響劇情推進的代入感

#### 3.1 角色專屬任務物品（8 張）

| 文件名 | 尺寸 | 關聯角色 | 劇情作用 |
|--------|------|---------|---------|
| `quest_qin_jade.png` | 128×128px | 秦婉柔 | 秦家玉佩，身份證明 |
| `quest_lin_genealogy.png` | 128×128px | 林修然 | 林家家譜，家族歷史 |
| `quest_yue_token.png` | 128×128px | 蕭鐵峰 | 岳家軍令牌，忠誠象徵 |
| `quest_emei_token.png` | 128×128px | 翠兒 | 峨眉掌門信物，師門信物 |
| `quest_assassin_list.png` | 128×128px | 蘇妙音 | 天籟閣刺殺名單，殺手過往 |
| `quest_medical_book.png` | 128×128px | 顧青鸞 | 醫書，醫術傳承 |
| `quest_intel_scroll.png` | 128×128px | 方無忌 | 情報卷軸，六扇門線索 |
| `quest_contract.png` | 128×128px | 李默然 | 商業契約，經營擴展 |

#### 3.2 通用任務物品（5 張）

| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| `quest_letter.png` | 128×128px | 通用信件 |
| `quest_love_letter.png` | 128×128px | 情書 |
| `quest_notice.png` | 128×128px | 告示 |
| `quest_map.png` | 128×128px | 地圖 |
| `quest_portrait.png` | 128×128px | 畫像 |

---

## 🟡 中優先級資源

### 4. 烹飪系統擴展（60 張）

**當前狀況**：
```javascript
// src/managers/RecipeManager.js 第 19-26 行
this.categories = {
    staple: '主食',
    snack: '小吃',
    soup: '湯品',
    drink: '酒水',
    dessert: '點心',
    special: '特色菜'
};
```

**已有**：10 種基礎食物圖標
**需要**：33 種食材 + 30 種菜餚（林語嫣的烹飪系統完整體驗）

#### 4.1 食材擴展（33 張，128×128px）

<details>
<summary>點擊展開完整清單</summary>

**穀物類（6 種）**：
- `ingredient_flour.png` - 麵粉
- `ingredient_sticky_rice.png` - 糯米
- `ingredient_wheat.png` - 小麥
- `ingredient_sorghum.png` - 高粱
- `ingredient_millet.png` - 小米
- `ingredient_corn.png` - 玉米

**肉類（8 種）**：
- `ingredient_duck.png` - 鴨肉
- `ingredient_mutton.png` - 羊肉
- `ingredient_rabbit.png` - 兔肉
- `ingredient_venison.png` - 鹿肉
- `ingredient_shrimp.png` - 蝦
- `ingredient_crab.png` - 蟹
- `ingredient_squid.png` - 魷魚
- `ingredient_clam.png` - 蛤蜊

**蔬菜類（10 種）**：
- `ingredient_cabbage.png` - 白菜
- `ingredient_radish.png` - 蘿蔔
- `ingredient_winter_melon.png` - 冬瓜
- `ingredient_eggplant.png` - 茄子
- `ingredient_cucumber.png` - 黃瓜
- `ingredient_bok_choy.png` - 青菜
- `ingredient_leek.png` - 韭菜
- `ingredient_bamboo_shoot.png` - 竹筍
- `ingredient_wood_ear.png` - 木耳
- `ingredient_mushroom.png` - 香菇

**調味料（9 種）**：
- `ingredient_chili.png` - 辣椒
- `ingredient_sichuan_pepper.png` - 花椒
- `ingredient_green_onion.png` - 蔥
- `ingredient_garlic.png` - 蒜
- `ingredient_ginger.png` - 薑
- `ingredient_star_anise.png` - 八角
- `ingredient_cinnamon.png` - 桂皮
- `ingredient_soy_sauce.png` - 醬油
- `ingredient_vinegar.png` - 醋

</details>

#### 4.2 菜餚擴展（30 張，128×128px）

<details>
<summary>點擊展開完整清單</summary>

**主食類（5 種）**：
- `dish_mixed_grain_rice.png` - 雜糧飯
- `dish_sesame_bread.png` - 燒餅
- `dish_congee.png` - 粥
- `dish_fried_rice.png` - 炒飯
- `dish_dumplings_deluxe.png` - 精緻水餃

**熱菜類（10 種）**：
- `dish_dongpo_pork.png` - 東坡肉
- `dish_west_lake_fish.png` - 西湖醋魚
- `dish_steamed_bass.png` - 清蒸鱸魚
- `dish_twice_cooked_pork.png` - 回鍋肉
- `dish_boiled_fish.png` - 水煮魚
- `dish_saliva_chicken.png` - 口水雞
- `dish_kung_pao_chicken.png` - 宮保雞丁
- `dish_mapo_tofu.png` - 麻婆豆腐
- `dish_braised_pork_belly.png` - 紅燒肉
- `dish_sweet_sour_ribs.png` - 糖醋排骨

**湯品類（5 種）**：
- `dish_hot_sour_soup.png` - 酸辣湯
- `dish_chicken_soup.png` - 雞湯
- `dish_radish_soup.png` - 蘿蔔湯
- `dish_fish_tofu_soup.png` - 魚頭豆腐湯
- `dish_herbal_soup.png` - 藥膳湯

**點心類（10 種）**：
- `dish_tanghulu.png` - 糖葫蘆
- `dish_osmanthus_cake.png` - 桂花糕
- `dish_mung_bean_cake.png` - 綠豆糕
- `dish_mooncake.png` - 月餅
- `dish_tangyuan.png` - 湯圓
- `dish_zongzi.png` - 粽子
- `dish_spring_roll.png` - 春捲
- `dish_sesame_ball.png` - 芝麻球
- `dish_red_bean_bun.png` - 豆沙包
- `dish_custard_bun.png` - 奶黃包

</details>

---

### 5. 場景物件圖標（30 張）

**當前狀況**：
```javascript
// src/scenes/KitchenScene.js 第 110-126 行
// 灶台（主要工作區）- 當前用純色矩形
const stove = this.createInteractiveObject(200, 200, 150, 100, '灶台🔥', 0xCD5C5C, ...)

// src/scenes/StorageScene.js
// 貨架 - 當前用純色矩形
const leftShelf = this.createInteractiveObject(100, 180, 120, 200, '食材架', 0x8B4513, ...)
```

**影響**：
- ❌ 場景中所有物件都是純色矩形 + 文字標籤
- ❌ 視覺品質低，缺乏細節
- ❌ 無法區分不同物件的質感

#### 5.1 廚房物件（10 張）

| 文件名 | 尺寸 | 用途場景 |
|--------|------|---------|
| `scene_stove.png` | 150×100px | KitchenScene 灶台 |
| `scene_workbench.png` | 200×80px | KitchenScene 工作台 |
| `scene_ingredient_shelf.png` | 120×200px | KitchenScene 食材架 |
| `scene_dish_rack.png` | 100×60px | KitchenScene 菜架 |
| `scene_water_barrel.png` | 80×80px | KitchenScene 水缸 |
| `scene_chopping_board.png` | 80×60px | KitchenScene 砧板 |
| `scene_wok.png` | 60×60px | KitchenScene 炒鍋 |
| `scene_steamer.png` | 60×80px | KitchenScene 蒸籠 |
| `scene_spice_rack.png` | 80×120px | KitchenScene 調味架 |
| `scene_kitchen_door.png` | 60×80px | KitchenScene 返回門 |

#### 5.2 儲藏室物件（10 張）

| 文件名 | 尺寸 | 用途場景 |
|--------|------|---------|
| `scene_food_shelf.png` | 120×200px | StorageScene 食材架 |
| `scene_supply_shelf.png` | 200×200px | StorageScene 物資架 |
| `scene_misc_shelf.png` | 120×200px | StorageScene 雜物架 |
| `scene_wooden_box.png` | 80×80px | StorageScene 木箱 |
| `scene_wine_jar.png` | 60×80px | StorageScene 酒罈 |
| `scene_storage_door.png` | 60×80px | StorageScene 返回門 |
| `scene_sack.png` | 60×80px | StorageScene 麻袋 |
| `scene_barrel.png` | 60×60px | StorageScene 木桶 |
| `scene_rope_coil.png` | 40×40px | StorageScene 繩索 |
| `scene_lantern_storage.png` | 30×50px | StorageScene 燈籠 |

#### 5.3 客房物件（10 張）

| 文件名 | 尺寸 | 用途場景 |
|--------|------|---------|
| `scene_bed.png` | 200×120px | RoomScene 床鋪 |
| `scene_table.png` | 120×80px | RoomScene 桌子 |
| `scene_chair.png` | 50×50px | RoomScene 椅子 |
| `scene_wardrobe.png` | 100×180px | RoomScene 衣櫃 |
| `scene_window.png` | 150×100px | RoomScene 窗戶 |
| `scene_tea_table.png` | 100×60px | RoomScene 茶几 |
| `scene_room_door.png` | 60×80px | RoomScene 返回門 |
| `scene_mirror.png` | 60×80px | RoomScene 鏡子 |
| `scene_wash_basin.png` | 60×40px | RoomScene 洗臉盆 |
| `scene_painting.png` | 80×100px | RoomScene 掛畫 |

---

### 6. 藥材藥品系統（16 張，128×128px）

**當前狀況**：
- 顧青鸞的醫術系統已實作
- 藥材數據定義在 `src/data/` 中
- 缺少對應圖像

**影響**：
- ❌ 顧青鸞角色功能不完整
- ❌ 醫術玩法無法視覺化

#### 6.1 藥材（10 張）

- `herb_ginseng.png` - 人參
- `herb_lingzhi.png` - 靈芝
- `herb_angelica.png` - 當歸
- `herb_licorice.png` - 甘草
- `herb_polygonum.png` - 何首烏
- `herb_fritillaria.png` - 川貝
- `herb_astragalus.png` - 黃芪
- `herb_honeysuckle.png` - 金銀花
- `herb_isatis.png` - 板藍根
- `herb_goji.png` - 枸杞

#### 6.2 藥品（6 張）

- `medicine_wound_balm.png` - 金創藥
- `medicine_antidote.png` - 解毒丹
- `medicine_qi_pill.png` - 補氣丸
- `medicine_calming_soup.png` - 安神湯
- `medicine_fever_reducer.png` - 退燒藥
- `medicine_cough_syrup.png` - 止咳糖漿

---

## 🟢 低優先級資源

### 7. 裝備系統擴展（9 張，128×128px）

**已有**：8 種基礎裝備
**需要**：9 種角色專屬裝備

- `equipment_emei_sword.png` - 峨眉劍（翠兒）
- `equipment_guqin_weapon.png` - 古琴（蘇妙音武器形態）
- `equipment_silver_needle.png` - 銀針（顧青鸞）
- `equipment_dagger.png` - 匕首（蘇妙音）
- `equipment_spear.png` - 長槍（蕭鐵峰）
- `equipment_staff.png` - 棍棒（通用）
- `equipment_bracer.png` - 護腕
- `equipment_shoulder_guard.png` - 護肩
- `equipment_talisman.png` - 護身符

---

### 8. 經營道具（23 張）

**用途**：豐富經營系統細節，客棧升級視覺化

#### 8.1 設施（9 張，64×64px 或 128×128px）

- `furniture_wooden_table.png`
- `furniture_wooden_chair.png`
- `furniture_bed.png`
- `furniture_stove.png`
- `furniture_counter.png`
- `furniture_bookshelf.png`
- `furniture_screen.png`
- `furniture_lantern.png`
- `furniture_signboard.png`

#### 8.2 工具（14 張，64×64px）

- `tool_cleaver.png` - 菜刀
- `tool_spatula.png` - 鍋鏟
- `tool_bowl.png` - 碗
- `tool_plate.png` - 盤子
- `tool_teapot.png` - 茶壺
- `tool_teacup.png` - 茶杯
- `tool_wine_pot.png` - 酒壺
- `tool_wine_cup.png` - 酒杯
- `tool_broom.png` - 掃帚
- `tool_cloth.png` - 抹布
- `tool_shoulder_pole.png` - 扁擔
- `tool_bucket.png` - 水桶
- `tool_abacus.png` - 算盤
- `tool_ledger.png` - 賬本

---

### 9. 成就與收藏品（9 張）

**用途**：收集要素，增加遊戲可玩性

#### 9.1 成就徽章（5 張，64×64px）

- `achievement_master_chef.png` - 名廚徽章
- `achievement_martial_master.png` - 武林高手
- `achievement_business_tycoon.png` - 經營大師
- `achievement_heartthrob.png` - 萬人迷
- `achievement_wealthy.png` - 富甲一方

#### 9.2 收藏品（4 張，128×128px）

- `collectible_antique_vase.png` - 古董花瓶
- `collectible_painting.png` - 名畫
- `collectible_guqin_sheet.png` - 古琴譜
- `collectible_rare_herb.png` - 珍稀藥材

---

### 10. 季節變體背景（30 張）

**用途**：增加畫面多樣性，時間流逝感

**需求**：
- 6 個場景 × 5 個版本（春夏秋冬 + 節日）= 30 張
- 尺寸：900×650px 或 1920×1080px

**清單**：
```
春天版: lobby_spring.png, kitchen_spring.png, ...
夏天版: lobby_summer.png, kitchen_summer.png, ...
秋天版: lobby_autumn.png, kitchen_autumn.png, ...
冬天版: lobby_winter.png, kitchen_winter.png, ...
節日版: lobby_festival.png, kitchen_festival.png, ...
```

---

## 📋 生成建議

根據優先級，建議分階段生成：

### 階段 1: 核心遊戲體驗（57 張）
- ✅ 戰鬥系統（14 張）- 讓戰鬥可玩
- ✅ 任務物品（13 張）- 讓劇情完整
- ✅ 場景物件（30 張）- 提升視覺品質

### 階段 2: 劇情沉浸感（20 張）
- ✅ 核心 CG（10 張必需 CG）- 關鍵劇情點
- ✅ 角色專屬 CG（10 張核心角色 CG）

### 階段 3: 玩法深度（76 張）
- ✅ 烹飪系統（60 張）
- ✅ 藥材系統（16 張）

### 階段 4: 內容豐富化（剩餘）
- ✅ 完整 CG 系統（剩餘 52 張）
- ✅ 裝備擴展（9 張）
- ✅ 經營道具（23 張）
- ✅ 成就收藏（9 張）
- ✅ 季節變體（30 張）

---

**總計缺失**：約 297 張
**建議優先生成**：階段 1 + 階段 2 = 77 張核心資源

---

**最後更新**: 2025-10-26
**文件位置**: `docs/MISSING_ASSETS_DETAILED.md`
