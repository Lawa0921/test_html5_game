# 遊戲圖片資源清單

> 此文檔列出遊戲所需的所有圖片資源，包括角色立繪、場景背景、UI元素等

## 📋 目錄結構

```
assets/
├── characters/          # 角色相關圖片
│   ├── portraits/      # 立繪（對話時顯示的全身/半身像）
│   ├── avatars/        # 頭像（小圖標，64x64）
│   ├── emotions/       # 表情差分（不同情緒的臉部特寫）
│   └── cg/             # CG圖（特殊劇情場景）
├── backgrounds/         # 背景圖片
│   ├── inn/            # 客棧場景
│   ├── town/           # 城鎮場景
│   └── special/        # 特殊場景
├── ui/                  # UI元素
│   ├── buttons/        # 按鈕
│   ├── windows/        # 對話框、窗口
│   └── icons/          # 圖標
├── items/              # 物品圖標
│   ├── food/           # 食物
│   ├── equipment/      # 裝備
│   └── materials/      # 材料
└── effects/            # 特效
    ├── particles/      # 粒子效果
    └── animations/     # 動畫序列
```

---

## 🎭 角色圖片需求

### 主角與初期夥伴

#### 001 林修然（主角）
**職位**：掌櫃
**圖片需求**：
- [ ] `001_林修然_portrait_normal.png` - 立繪（普通）
- [ ] `001_林修然_portrait_smile.png` - 立繪（微笑）
- [ ] `001_林修然_portrait_serious.png` - 立繪（嚴肅）
- [ ] `001_林修然_portrait_sad.png` - 立繪（悲傷）
- [ ] `001_林修然_portrait_angry.png` - 立繪（憤怒）
- [ ] `001_林修然_avatar.png` - 頭像（64x64）
- [ ] `001_林修然_cg_childhood.png` - CG：童年回憶
- [ ] `001_林修然_cg_innkeeper.png` - CG：接管客棧

**立繪規格**：800x1200px
**描述重點**：
- 23歲，身高七尺五寸（約173cm）
- 清瘦但有韌性的身材
- 黑色短髮，眼神堅毅
- 灰色長衫（掌櫃服裝）
- 手腕有鞭痕疤痕

---

#### 002 林語嫣（妹妹）
**職位**：廚師
**圖片需求**：
- [ ] `002_林語嫣_portrait_normal.png` - 立繪（普通）
- [ ] `002_林語嫣_portrait_scared.png` - 立繪（害怕）
- [ ] `002_林語嫣_portrait_cooking.png` - 立繪（做菜時）
- [ ] `002_林語嫣_portrait_crying.png` - 立繪（哭泣）
- [ ] `002_林語嫣_portrait_smile.png` - 立繪（微笑，罕見）
- [ ] `002_林語嫣_avatar.png` - 頭像（64x64）
- [ ] `002_林語嫣_cg_fire.png` - CG：火災回憶
- [ ] `002_林語嫣_cg_kitchen.png` - CG：廚房中找到安慰
- [ ] `002_林語嫣_cg_nightmare.png` - CG：噩夢驚醒

**立繪規格**：800x1200px
**描述重點**：
- 18歲，身材嬌小纖弱
- 臉色蒼白，大眼睛空洞
- 素色衣裳，腰繫圍裙
- 右手手背有燒傷疤痕
- 喉嚨處有淺淺疤痕
- 表情多為恐懼或空洞

---

### 可攻略女角

#### 003 溫如玉（服務生）- 可攻略女角 ①
**職位**：服務生
**圖片需求**：
- [ ] `003_溫如玉_portrait_normal.png` - 立繪（普通）
- [ ] `003_溫如玉_portrait_smile.png` - 立繪（溫柔微笑）
- [ ] `003_溫如玉_portrait_sad.png` - 立繪（悲傷）
- [ ] `003_溫如玉_portrait_shy.png` - 立繪（害羞）
- [ ] `003_溫如玉_portrait_determined.png` - 立繪（堅定）
- [ ] `003_溫如玉_avatar.png` - 頭像（64x64）
- [ ] `003_溫如玉_cg_serving.png` - CG：招待客人
- [ ] `003_溫如玉_cg_romance.png` - CG：戀愛場景
- [ ] `003_溫如玉_cg_family_fall.png` - CG：家道中落回憶

**立繪規格**：800x1200px
**描述重點**：
- 22歲，身高中等
- 溫婉賢淑，大家閨秀氣質
- 素色長裙，髮髻簡單
- 曾經的富家千金

---

#### 004 顧青鸞（藥師）- 可攻略女角 ②
**職位**：藥師
**圖片需求**：
- [ ] `004_顧青鸞_portrait_normal.png` - 立繪（普通）
- [ ] `004_顧青鸞_portrait_cold.png` - 立繪（冷淡）
- [ ] `004_顧青鸞_portrait_smile.png` - 立繪（微笑，罕見）
- [ ] `004_顧青鸞_portrait_serious.png` - 立繪（認真配藥）
- [ ] `004_顧青鸞_portrait_angry.png` - 立繪（生氣）
- [ ] `004_顧青鸞_avatar.png` - 頭像（64x64）
- [ ] `004_顧青鸞_cg_medicine.png` - CG：配製藥物
- [ ] `004_顧青鸞_cg_romance.png` - CG：戀愛場景
- [ ] `004_顧青鸞_cg_poison.png` - CG：使用毒術

**立繪規格**：800x1200px
**描述重點**：
- 26歲，身材高挑
- 冷豔美人，氣質凌厲
- 黑色勁裝或青色長袍
- 眼神銳利冷淡
- 腰間掛著藥囊

---

#### 005 蘇妙音（樂師）- 可攻略女角 ③
**職位**：樂師
**圖片需求**：
- [ ] `005_蘇妙音_portrait_normal.png` - 立繪（普通）
- [ ] `005_蘇妙音_portrait_playing.png` - 立繪（彈琴）
- [ ] `005_蘇妙音_portrait_smile.png` - 立繪（妖嬈微笑）
- [ ] `005_蘇妙音_portrait_sad.png` - 立繪（哀傷）
- [ ] `005_蘇妙音_portrait_killer.png` - 立繪（殺手模式）
- [ ] `005_蘇妙音_avatar.png` - 頭像（64x64）
- [ ] `005_蘇妙音_cg_performance.png` - CG：演奏場景
- [ ] `005_蘇妙音_cg_romance.png` - CG：戀愛場景
- [ ] `005_蘇妙音_cg_assassin.png` - CG：殺手過去
- [ ] `005_蘇妙音_cg_qin_sword.png` - CG：琴劍雙絕

**立繪規格**：800x1200px
**描述重點**：
- 28歲，絕美容顏
- 膚如凝脂，柳眉杏眼
- 白裙紅綢，髮間碧玉簪
- 風情萬種但眼神深處有哀傷
- 抱著古琴

---

#### 006 翠兒（門童）- 可攻略女角 ④
**職位**：門童
**圖片需求**：
- [ ] `006_翠兒_portrait_normal.png` - 立繪（普通）
- [ ] `006_翠兒_portrait_happy.png` - 立繪（開心）
- [ ] `006_翠兒_portrait_pout.png` - 立繪（撅嘴）
- [ ] `006_翠兒_portrait_excited.png` - 立繪（興奮）
- [ ] `006_翠兒_portrait_shy.png` - 立繪（害羞）
- [ ] `006_翠兒_avatar.png` - 頭像（64x64）
- [ ] `006_翠兒_cg_greeting.png` - CG：迎接客人
- [ ] `006_翠兒_cg_romance.png` - CG：戀愛場景
- [ ] `006_翠兒_cg_sword.png` - CG：峨眉劍法

**立繪規格**：800x1200px
**描述重點**：
- 16歲，清秀可人
- 雙馬尾，大眼睛
- 青色小襖，繡小花
- 笑起來露小虎牙
- 活潑可愛

---

#### 011 秦婉柔（琴師）- 可攻略女角 ⑤
**職位**：琴師
**圖片需求**：
- [ ] `011_秦婉柔_portrait_normal.png` - 立繪（普通，憂鬱）
- [ ] `011_秦婉柔_portrait_playing.png` - 立繪（彈琴）
- [ ] `011_秦婉柔_portrait_crying.png` - 立繪（哭泣）
- [ ] `011_秦婉柔_portrait_smile.png` - 立繪（微笑，罕見）
- [ ] `011_秦婉柔_portrait_afraid.png` - 立繪（恐懼）
- [ ] `011_秦婉柔_portrait_determined.png` - 立繪（堅定）
- [ ] `011_秦婉柔_avatar.png` - 頭像（64x64）
- [ ] `011_秦婉柔_cg_qin_performance.png` - CG：演奏《秋水》
- [ ] `011_秦婉柔_cg_reveal.png` - CG：身份揭露
- [ ] `011_秦婉柔_cg_confrontation.png` - CG：與蕭鐵峰對峙
- [ ] `011_秦婉柔_cg_romance.png` - CG：戀愛場景
- [ ] `011_秦婉柔_cg_father.png` - CG：與父親秦檜對峙
- [ ] `011_秦婉柔_cg_suicide_attempt.png` - CG：自殺回憶（慎重）
- [ ] `011_秦婉柔_cg_redemption.png` - CG：救贖結局

**立繪規格**：800x1200px
**描述重點**：
- 23歲，身材纖細柔弱
- 鵝蛋臉，柳葉眉常蹙起
- 左眼角有淚痣
- 素色長裙（白色或淡藍色）
- 左手腕有淺淺疤痕
- 眉宇間憂鬱和愧疚
- 抱著古琴（母親遺物）
- 可戴面紗（隱藏身份時）

---

### 其他重要角色

#### 007 沈青山（前掌櫃）
**職位**：前掌櫃、mentor
**圖片需求**：
- [ ] `007_沈青山_portrait_normal.png` - 立繪（普通）
- [ ] `007_沈青山_portrait_smile.png` - 立繪（微笑）
- [ ] `007_沈青山_portrait_serious.png` - 立繪（嚴肅）
- [ ] `007_沈青山_avatar.png` - 頭像（64x64）
- [ ] `007_沈青山_cg_past.png` - CG：皇室過去

**立繪規格**：800x1200px
**描述重點**：
- 五十多歲，鶴髮童顏
- 前皇室成員氣質
- 長衫，手持摺扇
- 睿智溫和

---

#### 008 蕭鐵峰（保鏢）
**職位**：保鏢
**圖片需求**：
- [ ] `008_蕭鐵峰_portrait_normal.png` - 立繪（普通）
- [ ] `008_蕭鐵峰_portrait_serious.png` - 立繪（嚴肅）
- [ ] `008_蕭鐵峰_portrait_angry.png` - 立繪（憤怒）
- [ ] `008_蕭鐵峰_portrait_fighting.png` - 立繪（戰鬥）
- [ ] `008_蕭鐵峰_avatar.png` -頭像（64x64）
- [ ] `008_蕭鐵峰_cg_battle.png` - CG：戰鬥場景
- [ ] `008_蕭鐵峰_cg_yue_fei.png` - CG：岳家軍回憶
- [ ] `008_蕭鐵峰_cg_qin_confrontation.png` - CG：與秦婉柔對峙

**立繪規格**：800x1200px
**描述重點**：
- 三十歲，虎背熊腰
- 國字臉，濃眉大眼
- 黑色勁裝
- 腰掛長刀
- 氣勢威武

---

#### 009 方無忌（說書人）
**職位**：說書人
**圖片需求**：
- [ ] `009_方無忌_portrait_normal.png` - 立繪（普通）
- [ ] `009_方無忌_portrait_smile.png` - 立繪（神秘微笑）
- [ ] `009_方無忌_portrait_storytelling.png` - 立繪（說書）
- [ ] `009_方無忌_avatar.png` - 頭像（64x64）
- [ ] `009_方無忌_cg_information.png` - CG：情報網絡

**立繪規格**：800x1200px
**描述重點**：
- 四十出頭，風度翩翩
- 白面書生外貌
- 手持摺扇
- 儒雅但眼神精明

---

#### 010 李默然（賬房）
**職位**：賬房
**圖片需求**：
- [ ] `010_李默然_portrait_normal.png` - 立繪（普通）
- [ ] `010_李默然_portrait_calculating.png` - 立繪（算賬）
- [ ] `010_李默然_portrait_smile.png` - 立繪（微笑）
- [ ] `010_李默然_avatar.png` - 頭像（64x64）
- [ ] `010_李默然_cg_business.png` - CG：商業天才

**立繪規格**：800x1200px
**描述重點**：
- 三十五歲，斯文儒雅
- 李家旁系氣質
- 長袍，手持算盤或賬本
- 精明幹練

---

## 🏞️ 場景背景需求

### 客棧場景
- [ ] `bg_inn_exterior_day.png` - 客棧外觀（白天）
- [ ] `bg_inn_exterior_night.png` - 客棧外觀（夜晚）
- [ ] `bg_inn_lobby.png` - 客棧大廳
- [ ] `bg_inn_kitchen.png` - 廚房
- [ ] `bg_inn_room_mc.png` - 主角房間
- [ ] `bg_inn_room_yuyan.png` - 林語嫣房間
- [ ] `bg_inn_courtyard.png` - 客棧庭院
- [ ] `bg_inn_storage.png` - 倉庫

### 城鎮場景
- [ ] `bg_town_street_day.png` - 臨安街道（白天）
- [ ] `bg_town_street_night.png` - 臨安街道（夜晚）
- [ ] `bg_town_market.png` - 集市
- [ ] `bg_town_west_lake.png` - 西湖
- [ ] `bg_town_temple.png` - 寺廟

### 特殊場景
- [ ] `bg_fire_ruins.png` - 林家火災廢墟
- [ ] `bg_qin_mansion.png` - 秦府（宰相府）
- [ ] `bg_forest.png` - 森林
- [ ] `bg_mountain.png` - 山道
- [ ] `bg_battlefield.png` - 戰場回憶

**背景規格**：1920x1080px

---

## 🎨 UI 元素需求

### 對話系統
- [ ] `ui_dialogue_box.png` - 對話框
- [ ] `ui_name_plate.png` - 名字牌
- [ ] `ui_choice_button.png` - 選項按鈕
- [ ] `ui_choice_button_hover.png` - 選項按鈕（懸停）

### 選單系統
- [ ] `ui_main_menu_bg.png` - 主選單背景
- [ ] `ui_button_normal.png` - 按鈕（普通）
- [ ] `ui_button_hover.png` - 按鈕（懸停）
- [ ] `ui_button_pressed.png` - 按鈕（按下）
- [ ] `ui_window_bg.png` - 窗口背景
- [ ] `ui_scroll_bar.png` - 滾動條

### 遊戲內UI
- [ ] `ui_health_bar.png` - 生命條
- [ ] `ui_affection_meter.png` - 好感度計量器
- [ ] `ui_gold_icon.png` - 金錢圖標
- [ ] `ui_time_icon.png` - 時間圖標
- [ ] `ui_quest_marker.png` - 任務標記

**UI規格**：依元素而定，建議使用SVG或高解析度PNG

---

## 🎒 物品圖標需求

### 食物類（舉例）
- [ ] `item_rice.png` - 白米飯
- [ ] `item_dumpling.png` - 餃子
- [ ] `item_wine.png` - 酒
- [ ] `item_tea.png` - 茶
- [ ] `item_medicine_food.png` - 藥膳

### 裝備類
- [ ] `item_sword.png` - 劍
- [ ] `item_clothes.png` - 衣服
- [ ] `item_accessory.png` - 飾品

### 材料類
- [ ] `item_herbs.png` - 草藥
- [ ] `item_ingredients.png` - 食材
- [ ] `item_wood.png` - 木材

**物品圖標規格**：128x128px

---

## 📊 優先級分類

### 🔴 最高優先級（必須有）
1. 主要角色立繪（普通表情）
   - 林修然、林語嫣、5位可攻略女角
2. 主要場景背景
   - 客棧大廳、主角房間
3. 基礎UI元素
   - 對話框、按鈕

### 🟡 中優先級（重要）
1. 主要角色其他表情
2. 其他NPC立繪
3. 特殊場景背景
4. 物品圖標

### 🟢 低優先級（可後期添加）
1. CG圖
2. 特效動畫
3. 裝飾性UI元素

---

## 🎯 佔位圖片規範

在正式美術資源完成前，使用以下佔位圖片：

### 角色立繪佔位
- **尺寸**：800x1200px
- **格式**：PNG（透明背景）
- **內容**：純色矩形 + 角色名稱 + 表情標註
- **顏色方案**：
  - 男性角色：藍色系 (#4A90E2)
  - 女性角色：粉色系 (#E91E63)
  - 中性角色：綠色系 (#4CAF50)

### 背景佔位
- **尺寸**：1920x1080px
- **格式**：PNG或JPG
- **內容**：漸變背景 + 場景名稱
- **顏色方案**：
  - 室內：暖色調
  - 室外白天：明亮色調
  - 室外夜晚：暗色調

### UI元素佔位
- **尺寸**：依實際需求
- **格式**：PNG（透明背景）
- **風格**：簡約線框 + 文字標註

---

## 📝 命名規範

### 角色圖片
```
{編號}_{角色名}_{類型}_{變體}.png

範例：
001_林修然_portrait_normal.png
005_蘇妙音_cg_romance.png
011_秦婉柔_avatar.png
```

### 場景背景
```
bg_{場所}_{時間/狀態}.png

範例：
bg_inn_lobby.png
bg_town_street_day.png
```

### UI元素
```
ui_{元件名}_{狀態}.png

範例：
ui_button_normal.png
ui_dialogue_box.png
```

### 物品圖標
```
item_{類別}_{名稱}.png

範例：
item_food_rice.png
item_equipment_sword.png
```

---

## 📅 製作時程建議

### Phase 1：核心角色（1-2週）
- 主角、妹妹、5位可攻略女角的基礎立繪

### Phase 2：場景與UI（1週）
- 主要場景背景
- 基礎UI系統

### Phase 3：擴展內容（2-3週）
- 其他NPC立繪
- 表情差分
- 特殊場景

### Phase 4：高級內容（持續）
- CG圖
- 特效
- 精緻化UI

---

## 🎨 美術風格建議

### 整體風格
- **類型**：日式視覺小說風格 + 中國風元素
- **色調**：古典雅致，偏暖色調
- **線條**：清晰流暢，帶有水墨畫韻味

### 角色設計
- **比例**：寫實偏向，頭身比約1:6-1:7
- **細節**：服飾細節豐富，體現南宋時代特色
- **表情**：細膩生動，能傳達角色性格

### 場景設計
- **透視**：合理的空間感
- **光影**：明確的光源，營造氣氛
- **細節**：反映宋代建築和生活場景

---

## 📌 注意事項

1. **版權問題**：所有圖片必須是原創或獲得授權
2. **文件大小**：單個圖片建議不超過2MB
3. **格式選擇**：
   - 需要透明背景：PNG
   - 不需要透明：JPG（質量90%）
4. **解析度**：統一使用2x解析度，便於未來升級
5. **色彩管理**：使用sRGB色彩空間

---

## 🔧 技術規格

### Phaser 3 載入範例
```javascript
// 在 BootScene.js 的 preload() 中
this.load.image('林修然_normal', 'assets/characters/portraits/001_林修然_portrait_normal.png');
this.load.image('bg_inn_lobby', 'assets/backgrounds/inn/bg_inn_lobby.png');
```

### 建議使用圖片壓縮工具
- TinyPNG (https://tinypng.com/)
- ImageOptim
- Squoosh (https://squoosh.app/)

---

**文檔版本**：V1.0
**創建日期**：2025-01-24
**最後更新**：2025-01-24

**統計**：
- 角色數量：10人
- 預估圖片總數：200+張
- 優先製作：50張（核心角色 + 基礎場景）
