# 悅來客棧 - 遊戲系統設計

> **文檔版本**: v2.0
> **最後更新**: 2025-10-28
> **遊戲版本**: v0.1.0

## 📋 文檔說明

本文檔是**遊戲系統設計的權威文檔**，詳細描述所有遊戲系統的設計、數值、交互和實作細節。

---

## 第一部分：遊戲核心概念

### 1.1 遊戲定位

**類型**: 桌面寵物 + 掛機經營 + 視覺小說
**美術風格**: 32-bit 像素風格（全遊戲統一）
**主題**: 宋朝武俠客棧經營模擬

### 1.2 雙模式設計

#### 小視窗模式（300x400）
```
┌──────────────────┐
│                  │
│   [客棧外觀]      │  ← 2.5D 斜向視角
│    🏮悅來客棧     │     會隨進度變化
│                  │
│   [門口有精靈]    │
│                  │
│ 💰 1,234  📈45/秒│
│ ⏰ 午時 (晴)     │  ← 時間顯示
└──────────────────┘
```

#### 展開模式（900x650）
```
┌────────────────────────────────────────┐
│ 🏮 悅來客棧 - 一樓大廳  ⏰ 午時三刻 (晴) │
├────────────────────────────────────────┤
│                                        │
│         [2.5D 客棧內部場景]             │
│                                        │
│   👔 掌櫃 (櫃台)    [樓梯]             │
│                                        │
│   👨‍🍳 廚師 → 廚房   [桌子] 👨‍💼服務員  │
│                                        │
│   💂 保鏢 (站崗)    [門]               │
│                                        │
│ [廚房] [客房] [後院]  ← 場景切換       │
└────────────────────────────────────────┘
```

### 1.3 遊戲流程

```
開場故事（視覺小說）
    ↓
小介面（客棧外觀）→ 點擊展開
    ↓
大介面（客棧內部）
    ├── 場景切換（大廳、廚房、儲藏室、客房等）
    ├── 角色管理（雇用、配置、訓練）
    ├── 設施升級（科技樹）
    ├── 事件處理（劇情、隨機）
    └── 派遣任務（押標、行商）
```

---

## 第二部分：核心系統列表

### 2.1 系統清單

| 系統 | 狀態 | 優先級 | 說明 |
|------|------|--------|------|
| 時間系統 (TimeManager) | ✅ 完成 | P0 | 時間流速、營業時間 |
| 經營系統 (InnManager) | ✅ 完成 | P0 | 客棧管理、收支 |
| 員工系統 (CharacterDispatchManager) | ✅ 完成 | P0 | 角色調度、工作分配 |
| 烹飪系統 (RecipeManager) | ✅ 完成 | P0 | 菜譜、食材、品質 |
| 好感度系統 (AffectionManager) | ✅ 完成 | P1 | 角色關係、好感度 |
| 劇情系統 (StoryManager) | ✅ 完成 | P1 | 視覺小說、分支劇情 |
| 事件系統 (EventManager) | ✅ 完成 | P1 | 隨機事件、觸發條件 |
| 學習系統 (LearningManager) | ✅ 完成 | P1 | 讀書、拜師、技能 |
| 戰鬥系統 (CombatManager) | 🚧 進行中 | P2 | 回合制戰鬥 |
| 貿易系統 (TradeManager) | ⏳ 待實作 | P2 | 商品交易、市場 |
| 派遣系統 (MissionManager) | ⏳ 待實作 | P2 | 押標、行商、探索 |
| 科技樹系統 (TechnologyManager) | ⏳ 待實作 | P3 | 建築升級、研發 |
| 季節系統 (SeasonManager) | ⏳ 待實作 | P3 | 季節變化、氣候 |
| 成就系統 (AchievementManager) | ⏳ 待實作 | P3 | 成就記錄 |

### 2.2 系統依賴關係圖

```
GameState (核心狀態管理)
  ├─ TimeManager (時間驅動器)
  │   └─ triggers → 所有系統的 update()
  │
  ├─ 經營層
  │   ├─ InnManager (客棧管理)
  │   │   ├─ CharacterDispatchManager (員工調度)
  │   │   ├─ RecipeManager (烹飪系統)
  │   │   └─ GuestManager (客人管理)
  │   └─ TechnologyManager (科技樹)
  │
  ├─ 劇情層
  │   ├─ StoryManager (劇情控制)
  │   ├─ EventManager (事件觸發)
  │   └─ AffectionManager (好感度)
  │
  ├─ 活動層
  │   ├─ MissionManager (派遣任務)
  │   ├─ TradeManager (貿易)
  │   └─ CombatManager (戰鬥)
  │
  └─ 持久化層
      └─ SaveManager (存檔)
```

---

## 第三部分：核心數據結構

### 3.1 主角數據 (Player)

```javascript
{
    // 基本資訊
    name: "未命名",           // 主角名字（遊戲中設定）
    age: 20,
    gender: "male",          // male/female

    // 核心屬性（0-100）
    attributes: {
        physique: 10,        // 體質（影響疲勞恢復、負重）
        strength: 10,        // 武力（影響戰鬥、護衛）
        intelligence: 10,    // 智慧（影響學習、研究）
        charisma: 10,        // 口才（影響談判、招待）
        dexterity: 10        // 靈巧（影響烹飪、製作）
    },

    // 個性系統（-100 到 +100）
    personality: {
        righteous: 0,        // 正義 ←→ 邪惡
        benevolent: 0,       // 仁慈 ←→ 冷酷
        cautious: 0,         // 謹慎 ←→ 冒險
        frugal: 0,           // 節儉 ←→ 奢侈
        humble: 0            // 謙遜 ←→ 傲慢
    },

    // 狀態
    status: {
        fatigue: 0,          // 疲勞值（0-100）
        health: 100,         // 健康值（0-100）
        mood: 50             // 心情（0-100）
    },

    // 裝備
    equipment: {
        weapon: null,        // 武器 ID
        armor: null,         // 護甲 ID
        accessory: null      // 配飾 ID
    },

    // 技能列表
    skills: [
        // { id: 'skill_001', level: 5, exp: 250 }
    ],

    // 經驗值
    experience: {
        total: 0,
        level: 1,
        nextLevelExp: 100
    }
}
```

### 3.2 員工數據 (Employee)

```javascript
{
    // 基本資訊
    id: 0,
    name: "掌櫃",
    realName: "沈青山",
    type: "manager",
    portrait: "assets/portraits/manager.png",  // 立繪
    avatar: "assets/avatars/manager.png",      // 頭像

    // 背景故事
    story: {
        background: "...",   // 背景故事
        personality: "...",  // 性格描述
        preference: "..."    // 喜好
    },

    // 雇用狀態
    hired: {
        unlocked: true,      // 是否解鎖
        cost: 0,             // 雇用費用
        salary: 100,         // 每日薪資
        joinDate: 1          // 加入日期（遊戲天數）
    },

    // 核心屬性（0-100）
    attributes: {
        physique: 50,
        strength: 60,
        intelligence: 70,
        charisma: 80,
        dexterity: 40
    },

    // 成長率（1.0 = 正常，越高成長越快）
    growthRate: {
        physique: 1.0,
        strength: 1.2,
        intelligence: 1.5,
        charisma: 1.3,
        dexterity: 0.8
    },

    // 才能（影響工作表現和成長）
    talents: [
        {
            id: "talent_management",
            name: "天生領導",
            description: "管理工作效率+30%，智慧成長+20%",
            effects: {
                workBonus: { management: 0.3 },
                growthBonus: { intelligence: 0.2 }
            }
        }
    ],

    // 技能（主動/被動技能）
    skills: [
        {
            id: "skill_accounting",
            name: "精打細算",
            type: "passive",
            level: 3,
            exp: 450,
            maxLevel: 10,
            description: "客棧收入+5%",
            effects: { incomeBonus: 0.05 }
        }
    ],

    // 狀態
    status: {
        fatigue: 0,          // 疲勞值（0-100）
        health: 100,
        mood: 80,
        currentState: "IDLE" // IDLE/WORKING/RESTING/SLEEPING/MISSION
    },

    // 工作分配
    work: {
        assignedStation: null,       // 當前工作站
        workHours: 0,                // 今日工作時長
        efficiency: 1.0,             // 工作效率（受疲勞影響）
        experience: 0                // 工作經驗
    },

    // 裝備
    equipment: {
        weapon: null,
        armor: null,
        accessory: null
    },

    // 好感度系統
    affection: {
        level: 0,            // 好感度等級（0-100）
        points: 0,           // 好感度點數
        relationship: "stranger",  // stranger/acquaintance/friend/close_friend/lover

        // 好感度歷史事件
        events: [
            // { type: "gift", value: +5, date: 10, description: "收到禮物很開心" }
        ]
    },

    // 位置（2D場景）
    position: {
        scene: "lobby",      // 當前場景
        x: 220,
        y: 130
    }
}
```

### 3.3 時間系統數據 (Time)

```javascript
{
    // 當前時間
    current: {
        year: 1,             // 年份
        month: 1,            // 月份 (1-12)
        day: 1,              // 日期 (1-30)
        dayCount: 1,         // 總天數
        hour: 8,             // 時刻 (0-23)
        minute: 0,           // 分鐘 (0-59)
        season: "春",        // 春/夏/秋/冬
        weather: "晴"        // 晴/陰/雨/雪
    },

    // 時間流速
    timeScale: 1.0,          // 倍速（可調整）

    // 營業時間
    businessHours: {
        open: 6,             // 06:00 開門
        close: 22            // 22:00 關門
    },

    // 特殊日期（節日、事件日）
    specialDays: [
        {
            dayIndex: 15,    // 每月15日
            type: "festival",
            name: "中秋節",
            effects: {
                customerBonus: 1.5,
                eventChance: 0.3
            }
        }
    ]
}
```

---

## 第四部分：場景式經營系統

### 4.1 場景系統設計理念

**核心概念**：
- 將客棧分成多個功能場景
- 每個場景有獨特的經營玩法
- 場景間相互關聯，形成完整經營循環

**場景列表**：
1. **外觀場景** (ExteriorScene) - 小視窗模式
2. **大廳場景** (LobbyScene) - 接待客人
3. **廚房場景** (KitchenScene) - 烹飪料理
4. **客房場景** (RoomScene) - 客房管理
5. **儲藏室場景** (StorageScene) - 物資管理
6. **庭院場景** (YardScene) - 休閒娛樂

### 4.2 場景切換邏輯

```
外觀場景 (ExteriorScene)
  ↓ 點擊大門
大廳場景 (LobbyScene)
  ├→ 點擊櫃台 → 管理介面
  ├→ 點擊廚房門 → 廚房場景 (KitchenScene)
  ├→ 點擊儲藏室門 → 儲藏室場景 (StorageScene)
  ├→ 點擊客房A門 → 客房A場景 (RoomAScene)
  └→ 點擊客房B門 → 客房B場景 (RoomBScene)
```

### 4.3 大廳場景（詳細設計）

**功能**：
- 接待客人
- 客人點餐
- 服務評分
- 聲望積累

**UI布局**：
```
[頂部狀態欄：時間 | 金錢 | 聲望]
[中央區域：客人座位（8個）]
[左側：待接待客人隊列]
[右側：當前訂單列表]
[底部：員工快捷操作]
```

**玩法流程**：
1. 客人到達 → 排隊等待
2. 指派員工接待 → 客人入座
3. 客人點餐 → 生成訂單
4. 廚房製作 → 完成料理
5. 指派員工上菜 → 客人用餐
6. 客人結帳 → 獲得收入 + 評價

**數值設計**：
- 等待容忍度：60秒（超過開始不滿）
- 服務評分：1-5星（影響聲望和小費）
- 座位上限：8個（可升級到12個）

### 4.4 廚房場景（詳細設計）

**功能**：
- 烹飪料理
- 食材管理
- 配方研發

**工作站**：
```javascript
const KITCHEN_STATIONS = {
    stove: {
        name: "爐灶",
        maxWorkers: 2,
        requiredSkill: "cooking",
        efficiency: 1.0
    },
    prep_table: {
        name: "備菜台",
        maxWorkers: 1,
        requiredSkill: "dexterity",
        efficiency: 0.8
    }
};
```

**烹飪流程**：
1. 接收訂單
2. 檢查食材
3. 指派廚師
4. 開始烹飪
5. 品質判定
6. 完成出餐

### 4.5 儲藏室場景

**功能**：
- 物品儲存
- 庫存管理
- 食材保鮮

**倉庫容量**：
- 初始容量：50格
- 可升級到：100格、150格、200格

**保鮮系統**：
- 每種食材有保鮮期（3-30天）
- 超過保鮮期品質下降
- 冰窖升級可延長保鮮期

### 4.6 客房場景

**功能**：
- 客人住宿
- 房間升級
- 住宿收入

**房間類型**：
- 普通客房（5兩/晚）
- 中等客房（10兩/晚）
- 豪華套房（20兩/晚）

### 4.7 庭院場景

**功能**：
- 員工休息
- 訓練場地
- 種植採集

**活動區域**：
- 休息區：恢復疲勞
- 訓練場：提升屬性
- 菜園：種植食材

---

## 第五部分：時間系統

### 5.1 時間流速

- **遊戲內 1天 = 現實時間 30分鐘**（可調整倍速）
- **遊戲內 1月 = 30天**
- **遊戲內 1年 = 12個月**

### 5.2 時段劃分

| 時段 | 遊戲時間 | 說明 | 客流量 |
|------|---------|------|--------|
| 凌晨 | 00:00-06:00 | 休息時段 | 無客人 |
| 清晨 | 06:00-09:00 | 準備營業 | 稀少 |
| 上午 | 09:00-12:00 | 客人高峰 | 中等 |
| 中午 | 12:00-14:00 | 午餐時段 | 高峰 |
| 下午 | 14:00-18:00 | 午休時段 | 稀少 |
| 傍晚 | 18:00-20:00 | 晚餐時段 | 高峰 |
| 夜晚 | 20:00-22:00 | 收尾時段 | 中等 |
| 深夜 | 22:00-24:00 | 打烊 | 無客人 |

### 5.3 時間事件

**每日事件**：
- 06:00：新的一天開始
- 06:00：員工上班
- 22:00：客棧打烊
- 22:00：每日結算
- 00:00：員工休息

**每月事件**：
- 30日：月結算
- 30日：支付薪資
- 30日：設施維護

**特定日期事件**：
- 節日事件
- 劇情觸發
- 特殊客人到訪

### 5.4 實作接口

```javascript
class TimeManager {
    update(deltaTime)  // 每幀更新
    getCurrentTime()   // 獲取當前時間
    advanceTime(hours) // 快進時間
    pauseTime()        // 暫停時間
    setTimeScale(scale) // 設定時間倍速

    // 事件監聽
    onDayStart(callback)   // 新一天事件
    onMonthEnd(callback)   // 月結算事件
    onHourChange(callback) // 每小時事件
}
```

---

## 第六部分：經營系統

### 6.1 客棧屬性

```javascript
{
    name: "悅來客棧",
    gold: 1000,           // 金錢
    reputation: 0,        // 聲望（0-100）
    satisfaction: 50,     // 客人滿意度（0-100）
    capacity: 8,          // 座位數

    // 設施等級
    facilities: {
        lobby: 1,         // 大廳（1-3級）
        kitchen: 1,       // 廚房（1-3級）
        storage: 1,       // 倉庫（1-3級）
        room_a: 1,        // 客房A（1-3級）
        room_b: 0,        // 客房B（0-3級，未解鎖）
        yard: 0           // 庭院（0-2級，可選）
    }
}
```

### 6.2 收入來源

1. **客人消費**：基礎收入
   - 料理收入
   - 住宿收入
   - 小費收入

2. **特殊訂單**：高利潤訂單
   - 宴席訂單（+500兩）
   - VIP客人（+200兩）

3. **貿易收入**：賣出物品
   - 食材販賣
   - 裝備販賣

4. **任務獎勵**：完成任務
   - 押標任務（+300兩）
   - 行商任務（+200兩）

### 6.3 支出項目

1. **員工薪資**：每月固定支出
   - 掌櫃：100兩/月
   - 廚師：80兩/月
   - 服務員：60兩/月
   - 其他員工：40-80兩/月

2. **食材採購**：烹飪成本
   - 根據菜單調整
   - 季節性價格波動

3. **設施維護**：每月固定支出
   - 基礎維護：50兩/月
   - 高級設施：+20兩/月/級

4. **設施升級**：一次性大額支出
   - 大廳升級：500兩
   - 廚房升級：400兩
   - 倉庫升級：300兩
   - 客房升級：600兩

### 6.4 數值平衡

**第1年目標**：生存期（勉強盈利）
- 月收入：≥ 200兩
- 年收入：≥ 2000兩
- 員工數：2-3人

**第2年目標**：成長期（穩定盈利）
- 月收入：≥ 500兩
- 年收入：≥ 5000兩
- 員工數：4-6人

**第3年目標**：發展期（高額盈利）
- 月收入：≥ 1000兩
- 年收入：≥ 10000兩
- 員工數：7-8人

**第4年目標**：成熟期（自由發展）
- 月收入：≥ 1500兩
- 年收入：≥ 15000兩
- 員工數：9-10人

---

## 第七部分：員工系統

### 7.1 工作調度系統

#### 工作崗位定義

```javascript
const WORK_STATIONS = {
    lobby: {
        name: "大廳接待",
        location: { x: 200, y: 150 },
        maxWorkers: 2,
        requiredSkills: ["service"],
        workHours: [6, 22],
        incomeBonus: 1.2
    },

    kitchen: {
        name: "廚房烹飪",
        location: { x: 100, y: 200 },
        maxWorkers: 2,
        requiredSkills: ["cooking"],
        workHours: [6, 22],
        incomeBonus: 1.5
    },

    security: {
        name: "安保巡邏",
        location: { x: 300, y: 100 },
        maxWorkers: 1,
        requiredSkills: ["combat"],
        workHours: [6, 24],
        incomeBonus: 1.0
    },

    management: {
        name: "櫃台管理",
        location: { x: 200, y: 120 },
        maxWorkers: 1,
        requiredSkills: ["management"],
        workHours: [6, 22],
        incomeBonus: 1.4
    }
};
```

#### 工作狀態機

```javascript
員工狀態 {
    IDLE: "閒置",      // 無事可做
    WALKING: "移動中",  // 前往工作崗位
    WORKING: "工作中",  // 正在工作
    RESTING: "休息中",  // 工作間隙休息
    SLEEPING: "睡眠中", // 晚上睡覺
    MISSION: "任務中",  // 外出任務
    EVENT: "事件中"    // 觸發特殊事件
}
```

### 7.2 派遣系統

**工作類型**：
- 烹飪：廚房工作
- 服務：大廳接待
- 採購：外出採買
- 清潔：設施維護
- 維護：設施修理
- 外出任務：押標、行商

**效率計算**：
```
工作效率 = 基礎屬性 × (1 - 疲勞/100) × (心相/100) × 職業修正
```

**疲勞累積**：
- 每工作1小時 +5疲勞
- 疲勞≥80時工作效率-50%
- 疲勞≥100時無法工作

**疲勞恢復**：
- 休息1小時 -10疲勞
- 睡眠1小時 -20疲勞
- 泡澡 -30疲勞（需要設施）

### 7.3 角色專長系統

#### 10位角色專長定義

| 角色 | 體質 | 武力 | 智慧 | 口才 | 靈巧 | 主要工作 |
|------|------|------|------|------|------|---------|
| 掌櫃 | 50 | 60 | **80** | **85** | 45 | 管理、接待 |
| 廚師 | 60 | 50 | 65 | 40 | **90** | 烹飪、藥膳 |
| 服務員 | 55 | 30 | 50 | **85** | 60 | 服務、接待 |
| 保鏢 | **80** | **90** | 45 | 40 | 50 | 戰鬥、安保 |
| 跑堂 | **70** | 55 | 45 | 65 | 55 | 跑腿、雜務 |
| 藥師 | 50 | 40 | **85** | 45 | **80** | 醫療、煉藥 |
| 說書人 | 45 | 40 | **80** | **90** | 50 | 娛樂、情報 |
| 樂師 | 50 | 45 | 60 | **75** | **85** | 娛樂、琴藝 |
| 賬房 | 40 | 30 | **90** | 60 | 55 | 管理、算賬 |
| 門童 | 60 | 50 | 40 | **70** | 45 | 迎賓、雜務 |

---

## 第八部分：烹飪系統

### 8.1 食材系統

**食材分類**：
- 主料：米、麵、肉、魚
- 配料：蔬菜、蛋、豆腐
- 調料：鹽、醬油、醋、糖

**食材品質**：
- 普通：基礎品質
- 優良：+10%成品品質
- 精品：+20%成品品質

**食材保鮮**：
- 肉類：3天
- 蔬菜：5天
- 乾貨：30天
- 調料：永久

**食材獲取**：
- 市場採購：基本方式
- 任務獎勵：特殊食材
- 庭院種植：自給自足（需解鎖）

### 8.2 菜譜系統

```javascript
{
    id: 'rice_congee',
    name: '白粥',
    category: '主食',
    difficulty: 1,        // 難度（1-5）
    cookTime: 10,         // 製作時間（分鐘）

    ingredients: [        // 所需食材
        { id: 'rice', quantity: 2 },
        { id: 'water', quantity: 5 }
    ],

    requiredSkill: 1,     // 所需烹飪技能
    sellPrice: 5,         // 售價
    reputation: 1,        // 聲望獎勵
    satisfaction: 10,     // 滿意度獎勵

    unlockCondition: {
        level: 1,
        reputation: 0
    }
}
```

### 8.3 品質系統

**品質等級**：
- 失敗（0-30%）：退菜
- 普通（30-60%）：基礎價格
- 優良（60-80%）：1.2倍價格
- 精品（80-95%）：1.5倍價格
- 極品（95-100%）：2倍價格

**品質影響因素**：
1. 廚師烹飪技能（主要）：60%權重
2. 食材品質（次要）：25%權重
3. 廚房設施等級（輔助）：10%權重
4. 隨機因素（±10%）：5%權重

**計算公式**：
```
基礎成功率 = (廚師靈巧 / 菜譜難度) / 100
品質調整 = 食材品質加成 + 設施加成
最終品質 = (基礎成功率 × 品質調整) × 隨機(0.9-1.1)

品質判定：
< 0.3 → 失敗
0.3-0.6 → 普通
0.6-0.8 → 優良
0.8-0.95 → 精品
> 0.95 → 極品
```

---

## 第九部分：好感度系統

### 9.1 好感度機制

**範圍**：0-100
**初始值**：20（基礎信任）

**增加方式**：
1. 對話選擇（+1~+5）
2. 完成個人任務（+10~+20）
3. 贈送禮物（+5~+15）
4. 派遣喜歡的工作（+1/天）
5. 特殊事件選擇（+5~+30）

**減少方式**：
1. 錯誤的對話選擇（-1~-5）
2. 派遣討厭的工作（-1/天）
3. 忽視個人請求（-5~-10）
4. 特殊事件選擇（-5~-20）
5. 長期不互動（-1/週）

### 9.2 好感度里程碑

| 好感度 | 里程碑 | 關係 | 解鎖內容 |
|--------|--------|------|---------|
| 0-20 | 陌生人 | stranger | 僅基礎對話 |
| 20-40 | 認識 | acquaintance | 解鎖基礎工作 |
| 40-60 | 熟悉 | friend | 個人故事第一章、送禮 |
| 60-80 | 信任 | close_friend | 特殊技能、個人故事第二章 |
| 80-100 | 摯友/戀人 | lover | 深度對話、個人故事第三章、獨特技能 |

### 9.3 禮物系統

**禮物類型**：
- 食物類：糕點、酒、茶
- 飾品類：髮簪、手鐲、玉佩
- 書籍類：詩集、醫書、兵法
- 特殊類：稀有物品

**角色偏好**（示例）：
```javascript
{
    // 掌櫃偏好
    0: {
        favorite: ['antique_vase', 'rare_book'],  // 喜歡（+15）
        like: ['tea', 'wine'],                    // 普通（+5）
        dislike: ['cheap_jewelry']                // 討厭（-5）
    },

    // 廚師偏好
    1: {
        favorite: ['rare_spice', 'cookbook'],
        like: ['food_ingredients'],
        dislike: ['weapon']
    }
}
```

**贈禮規則**：
- 每人每天最多1次
- 喜歡禮物：+10~+15好感度
- 普通禮物：+3~+5好感度
- 討厭禮物：-5~-10好感度

---

## 第十部分：劇情系統

### 10.1 劇情觸發機制

```javascript
{
    id: 'story_001_chapter1',
    triggerType: 'time',    // time/affection/quest/choice

    triggerCondition: {
        month: 1,             // 第1個月
        day: 1,               // 第1天
        affection: { '001': 40 },  // 角色001好感度 ≥ 40
        completedQuests: []   // 已完成的任務
    },

    scenes: [              // 場景列表
        {
            background: 'inn_lobby_day',
            characters: ['001'],
            dialogue: [
                {
                    speaker: '001',
                    text: '掌櫃，客人來了。',
                    emotion: 'normal'
                }
            ]
        }
    ],

    choices: [             // 選擇分支
        {
            text: '選項A',
            effects: {
                affection: { '001': +5 },
                personality: { benevolent: +2 }
            },
            nextStoryId: 'story_001_a'
        },
        {
            text: '選項B',
            effects: {
                affection: { '001': -2 },
                personality: { cautious: +2 }
            },
            nextStoryId: 'story_001_b'
        }
    ],

    rewards: {             // 完成獎勵
        gold: 100,
        items: ['quest_item_001'],
        unlockEmployee: 3  // 解鎖新員工
    }
}
```

### 10.2 劇情類型

1. **主線劇情**
   - 固定時間觸發
   - 推進主要故事
   - 解鎖核心功能

2. **支線劇情**
   - 好感度觸發
   - 角色個人故事
   - 深化角色背景

3. **隨機事件**
   - 每月隨機觸發
   - 增加遊戲變化
   - 獲得額外獎勵

4. **節日事件**
   - 特定日期觸發
   - 節慶氛圍
   - 季節性獎勵

### 10.3 視覺小說場景

**UI元素**：
- 背景圖（全屏）
- 角色立繪（左/中/右）
- 對話框（底部）
- 角色名字框
- 選擇按鈕（最多4個）
- 自動播放按鈕
- 跳過按鈕
- 存檔按鈕

**立繪系統**：
- 每個角色5-10個表情
- 可左右移動
- 支持淡入淡出
- 支持多角色同時顯示

**對話效果**：
- 文字逐字顯示
- 打字機效果
- 語音預留（可選）
- 對話歷史記錄

---

## 第十一部分：戰鬥系統（簡化版）

### 11.1 戰鬥場景

**觸發情況**：
- 外出任務遇敵
- 客棧保衛戰
- 特殊劇情戰鬥

### 11.2 戰鬥機制（簡化版）

**回合制流程**：
1. 初始化戰鬥
2. 計算速度順序
3. 行動選擇
4. 執行動作
5. 判定勝負

**行動選擇**：
- 攻擊：基礎傷害
- 技能：消耗能量
- 防禦：減少傷害
- 物品：使用道具
- 逃跑：離開戰鬥

**數值計算**：
```
傷害 = 攻擊方武力 - 防禦方體質/2 + 隨機(0-10)
命中率 = 80% + (攻擊方靈巧 - 防禦方靈巧) / 10
暴擊率 = 5% + 攻擊方武力 / 100
```

**勝利獎勵**：
- 金錢
- 裝備
- 經驗值
- 任務進度

---

## 第十二部分：系統交互矩陣

| 系統A | 系統B | 交互方式 | 影響 |
|-------|-------|---------|------|
| TimeManager | InnManager | update() 驅動 | 客人到達、月結算 |
| TimeManager | CharacterDispatchManager | 檢查工作時間 | 員工上下班 |
| InnManager | RecipeManager | 訂單創建 | 烹飪任務 |
| CharacterDispatchManager | RecipeManager | 指派烹飪 | 製作料理 |
| AffectionManager | StoryManager | 好感度判定 | 觸發劇情 |
| EventManager | TimeManager | 監聽時間事件 | 觸發隨機事件 |
| MissionManager | CharacterDispatchManager | 派遣員工 | 員工外出 |
| TechnologyManager | InnManager | 升級設施 | 解鎖新功能 |

---

## 第十三部分：數值平衡

### 13.1 經濟平衡

**第1年**：生存期
- 目標：學習遊戲機制
- 收入：勉強維持
- 員工：2-3人
- 設施：基礎設施

**第2年**：成長期
- 目標：穩定經營
- 收入：開始盈利
- 員工：4-6人
- 設施：升級1-2個

**第3年**：發展期
- 目標：擴張規模
- 收入：高額盈利
- 員工：7-8人
- 設施：升級3-4個

**第4年**：成熟期
- 目標：自由發展
- 收入：財務自由
- 員工：9-10人
- 設施：全部解鎖

### 13.2 難度曲線

**前期（1-6月）**：
- 教學引導
- 較簡單
- 容錯率高

**中期（7-18月）**：
- 挑戰增加
- 需要策略
- 多種選擇

**後期（19月+）**：
- 自由度高
- 多種玩法
- 追求完美

---

## 第十四部分：實作指南

### 14.1 開發優先級

**P0（已完成）**：
- ✅ 時間系統 (TimeManager)
- ✅ 經營系統 (InnManager)
- ✅ 員工系統 (CharacterDispatchManager)
- ✅ 烹飪系統 (RecipeManager)

**P1（進行中）**：
- ✅ 好感度系統 (AffectionManager)
- ✅ 劇情系統 (StoryManager)
- ✅ 事件系統 (EventManager)
- ✅ 學習系統 (LearningManager)

**P2（待實作）**：
- ⏳ 戰鬥系統 (CombatManager)
- ⏳ 貿易系統 (TradeManager)
- ⏳ 派遣系統 (MissionManager)

**P3（未來）**：
- ⏳ 科技樹系統 (TechnologyManager)
- ⏳ 季節系統 (SeasonManager)
- ⏳ 成就系統 (AchievementManager)

### 14.2 測試要點

**經濟平衡測試**：
- 收支平衡測試
- 薪資支付測試
- 設施升級成本測試

**好感度成長曲線測試**：
- 好感度增減測試
- 關係等級測試
- 禮物系統測試

**劇情觸發邏輯測試**：
- 條件檢查測試
- 分支跳轉測試
- 獎勵發放測試

**系統交互測試**：
- 時間驅動測試
- 場景切換測試
- 數據同步測試

### 14.3 性能優化

**數據結構優化**：
- 使用對象池管理精靈
- 懶加載場景資源
- 快取計算結果

**渲染優化**：
- 離屏裁剪
- 批次渲染
- 紋理壓縮

**記憶體優化**：
- 及時釋放資源
- 避免記憶體洩漏
- 定期垃圾回收

---

## 第十五部分：視覺資產需求

### 15.1 場景背景

**客棧外觀（小視窗）**：
- exterior_level_1.png (初期：簡陋小客棧)
- exterior_level_2.png (3個夥伴：增加招牌)
- exterior_level_3.png (5個夥伴：二層樓)
- exterior_level_4.png (7個夥伴：三層樓)
- exterior_level_5.png (10個夥伴：豪華客棧)

尺寸：300x350
視角：斜向45度
風格：32-bit 像素風格

**客棧內部場景**：
- lobby_interior.png (一樓大廳)
- kitchen_interior.png (廚房)
- room_interior.png (客房區)
- storage_interior.png (儲藏室)
- yard_interior.png (後院)

尺寸：900x550
視角：斜向45度
包含：櫃台、桌椅、樓梯等固定物件

### 15.2 角色精靈圖

**每個角色需要**：
- character_name_idle.png (待機動畫，4幀)
- character_name_walk_down.png (向下走，4幀)
- character_name_walk_up.png (向上走，4幀)
- character_name_walk_left.png (向左走，4幀)
- character_name_walk_right.png (向右走，4幀)
- character_name_work.png (工作動畫，4幀)

尺寸：64x64 每幀
數量：10個角色 × 6種動畫 = 60個精靈表

### 15.3 角色立繪

**每個角色需要**：
- portrait_name_normal.png (普通表情)
- portrait_name_happy.png (開心)
- portrait_name_sad.png (難過)
- portrait_name_angry.png (生氣)
- portrait_name_surprised.png (驚訝)

尺寸：512x768
數量：10個角色 × 5種表情 = 50張立繪

### 15.4 UI 圖標

**狀態圖標**：
- status_working.png (工作中)
- status_resting.png (休息中)
- status_sleeping.png (睡眠中)
- status_mission.png (任務中)

**資源圖標**：
- icon_gold.png (金錢)
- icon_reputation.png (聲望)
- icon_satisfaction.png (滿意度)
- icon_time.png (時間)

### 15.5 佔位圖方案

在正式素材完成前：
- 背景：純色 + 網格線
- 角色：帶名字的圓形
- 圖標：emoji 或文字
- 立繪：簡單色塊

---

## 附錄 A：系統 API 參考

### TimeManager

```javascript
// 時間控制
timeManager.update(deltaTime)
timeManager.pauseTime()
timeManager.resumeTime()
timeManager.setTimeScale(scale)

// 時間查詢
timeManager.getCurrentTime()
timeManager.getTimePeriod()
timeManager.isBusinessHours()

// 事件監聽
timeManager.onDayStart(callback)
timeManager.onMonthEnd(callback)
timeManager.onHourChange(callback)
```

### InnManager

```javascript
// 經營管理
innManager.addGold(amount)
innManager.spendGold(amount)
innManager.updateReputation(value)
innManager.updateSatisfaction(value)

// 設施管理
innManager.upgradeFacility(facilityId)
innManager.getFacilityLevel(facilityId)
innManager.canUpgrade(facilityId)
```

### CharacterDispatchManager

```javascript
// 工作分配
dispatchManager.assignWork(employeeId, stationId)
dispatchManager.unassignWork(employeeId)
dispatchManager.getWorkingEmployees()

// 狀態查詢
dispatchManager.getEmployeeState(employeeId)
dispatchManager.calculateEfficiency(employeeId)
```

### AffectionManager

```javascript
// 好感度管理
affectionManager.addAffection(employeeId, points, reason)
affectionManager.getAffectionLevel(employeeId)
affectionManager.getRelationship(employeeId)

// 禮物系統
affectionManager.giveGift(employeeId, giftId)
affectionManager.canGiveGift(employeeId)
```

---

## 附錄 B：數據配置示例

### 菜譜配置

```javascript
const RECIPES = {
    'rice_congee': {
        id: 'rice_congee',
        name: '白粥',
        category: '主食',
        difficulty: 1,
        cookTime: 10,
        ingredients: [
            { id: 'rice', quantity: 2 },
            { id: 'water', quantity: 5 }
        ],
        requiredSkill: 1,
        sellPrice: 5,
        reputation: 1,
        satisfaction: 10
    },

    'braised_pork': {
        id: 'braised_pork',
        name: '紅燒肉',
        category: '熱菜',
        difficulty: 3,
        cookTime: 30,
        ingredients: [
            { id: 'pork', quantity: 5 },
            { id: 'soy_sauce', quantity: 2 },
            { id: 'sugar', quantity: 1 }
        ],
        requiredSkill: 5,
        sellPrice: 20,
        reputation: 5,
        satisfaction: 30
    }
};
```

### 員工配置

```javascript
const EMPLOYEES = {
    0: {
        id: 0,
        name: '掌櫃',
        realName: '沈青山',
        type: 'manager',
        attributes: {
            physique: 50,
            strength: 60,
            intelligence: 80,
            charisma: 85,
            dexterity: 45
        },
        salary: 100,
        unlockCost: 0
    },

    1: {
        id: 1,
        name: '孟四娘',
        realName: '孟雲娘',
        type: 'chef',
        attributes: {
            physique: 60,
            strength: 50,
            intelligence: 65,
            charisma: 40,
            dexterity: 90
        },
        salary: 80,
        unlockCost: 500
    }
};
```

---

## 附錄 C：開發檢查清單

### 核心系統
- [x] TimeManager 實作完成
- [x] InnManager 實作完成
- [x] CharacterDispatchManager 實作完成
- [x] RecipeManager 實作完成
- [x] AffectionManager 實作完成
- [x] StoryManager 實作完成
- [x] EventManager 實作完成
- [x] LearningManager 實作完成
- [ ] CombatManager 實作完成
- [ ] TradeManager 實作完成
- [ ] MissionManager 實作完成

### 測試覆蓋
- [x] 時間系統測試
- [x] 經營系統測試
- [x] 員工系統測試
- [x] 烹飪系統測試
- [ ] 好感度系統測試
- [ ] 劇情系統測試
- [ ] 事件系統測試
- [ ] 學習系統測試

### 場景實作
- [x] ExteriorScene 實作完成
- [x] LobbyScene 實作完成
- [ ] KitchenScene 實作完成
- [ ] StorageScene 實作完成
- [ ] RoomScene 實作完成
- [ ] YardScene 實作完成
- [ ] StoryScene 實作完成

### 美術資源
- [ ] 客棧外觀（5個等級）
- [ ] 場景背景（6個場景）
- [ ] 角色精靈（10個角色）
- [ ] 角色立繪（10個角色 × 5種表情）
- [ ] UI 圖標（20+個）

### 用戶測試
- [ ] 經濟平衡測試
- [ ] 難度曲線測試
- [ ] 用戶體驗測試
- [ ] 性能測試

---

**文檔版本**: v2.0
**創建日期**: 2025-10-24
**最後更新**: 2025-10-28
**維護者**: 開發團隊
