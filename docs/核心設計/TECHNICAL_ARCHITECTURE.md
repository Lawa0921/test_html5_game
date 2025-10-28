# 悅來客棧 - 完整系統架構設計

## 遊戲核心概念

**類型**: 桌面寵物 + 掛機經營 + 視覺小說
**風格**: 32bit 像素風格
**主題**: 中式客棧經營模擬

## 系統架構總覽

```
GameState (遊戲核心狀態)
├── Player (主角系統)
├── Employees (夥伴系統)
├── Inventory (背包系統)
├── EquipmentManager (裝備管理)
├── StoryManager (故事系統)
├── EventManager (事件系統)
├── NotificationManager (通知系統)
├── AffectionManager (好感度系統)
├── LearningManager (學習系統)
├── TimeManager (時間系統) ⏳
├── SeasonManager (季節系統) ⏳
├── MissionManager (派遣系統) ⏳
├── TradeManager (貿易系統) ⏳
├── TechnologyManager (科技樹系統) ⏳
└── SceneManager (場景管理) ⏳
```

---

## 🕐 Phase 5: 時間與季節系統

### TimeManager (時間管理器)

#### 核心功能
```javascript
class TimeManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 時間狀態
        this.time = {
            year: 1,           // 年份
            month: 1,          // 月份 (1-12)
            day: 1,            // 日期 (1-30)
            hour: 8,           // 時刻 (0-23)
            minute: 0,         // 分鐘 (0-59)
            totalDays: 1       // 總天數
        };

        // 營業狀態
        this.business = {
            isOpen: true,      // 是否營業中
            openHour: 6,       // 開門時間
            closeHour: 22,     // 關門時間
            lastDayChange: 0   // 上次換日時間戳
        };

        // 時間流速（可調整）
        this.timeScale = 1.0;  // 1.0 = 正常速度

        // 時間事件監聽器
        this.listeners = {
            onNewDay: [],      // 新的一天
            onNewMonth: [],    // 新的一月
            onNewYear: [],     // 新的一年
            onOpen: [],        // 開門
            onClose: [],       // 關門
            onHourChange: []   // 每小時
        };
    }

    // 更新時間（每秒調用）
    update(deltaTime) {
        // 計算時間增量
        const timeIncrease = deltaTime * this.timeScale;

        // 更新分鐘
        this.time.minute += timeIncrease;

        // 處理時間進位
        if (this.time.minute >= 60) {
            this.advanceHour();
        }
    }

    // 推進一小時
    advanceHour() {
        this.time.hour++;
        this.time.minute = 0;

        this.trigger('onHourChange', this.time.hour);

        // 檢查營業狀態
        this.checkBusinessHours();

        // 換日
        if (this.time.hour >= 24) {
            this.advanceDay();
        }
    }

    // 推進一天
    advanceDay() {
        this.time.day++;
        this.time.hour = 0;
        this.time.totalDays++;

        // 換月
        if (this.time.day > 30) {
            this.advanceMonth();
        }

        this.trigger('onNewDay', this.time.totalDays);

        // 每日結算
        this.dailySettlement();
    }

    // 推進一月
    advanceMonth() {
        this.time.month++;
        this.time.day = 1;

        // 換年
        if (this.time.month > 12) {
            this.advanceYear();
        }

        this.trigger('onNewMonth', this.time.month);
    }

    // 推進一年
    advanceYear() {
        this.time.year++;
        this.time.month = 1;

        this.trigger('onNewYear', this.time.year);
    }

    // 檢查營業時間
    checkBusinessHours() {
        const wasOpen = this.business.isOpen;

        if (this.time.hour >= this.business.openHour &&
            this.time.hour < this.business.closeHour) {
            this.business.isOpen = true;

            if (!wasOpen) {
                this.trigger('onOpen');
            }
        } else {
            this.business.isOpen = false;

            if (wasOpen) {
                this.trigger('onClose');
            }
        }
    }

    // 每日結算
    dailySettlement() {
        // 支付薪資
        this.gameState.dailySalaryPayment();

        // 好感度衰減
        if (this.gameState.affectionManager) {
            this.gameState.affectionManager.dailyAffectionDecay();
        }

        // 員工疲勞恢復
        this.recoverEmployeeFatigue();

        // 觸發每日事件
        this.triggerDailyEvents();
    }

    // 獲取當前時間描述
    getTimeDescription() {
        const period = this.getTimePeriod();
        return `${this.time.year}年 ${this.time.month}月 ${this.time.day}日 ${period}`;
    }

    // 獲取時段
    getTimePeriod() {
        if (this.time.hour < 6) return '凌晨';
        if (this.time.hour < 9) return '清晨';
        if (this.time.hour < 12) return '上午';
        if (this.time.hour < 14) return '中午';
        if (this.time.hour < 18) return '下午';
        if (this.time.hour < 22) return '晚上';
        return '深夜';
    }
}
```

### SeasonManager (季節管理器)

#### 核心功能
```javascript
class SeasonManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 季節定義
        this.seasons = {
            spring: { name: '春季', months: [1, 2, 3], icon: '🌸' },
            summer: { name: '夏季', months: [4, 5, 6], icon: '☀️' },
            autumn: { name: '秋季', months: [7, 8, 9], icon: '🍂' },
            winter: { name: '冬季', months: [10, 11, 12], icon: '❄️' }
        };

        this.currentSeason = 'spring';

        // 季節效果
        this.seasonEffects = {
            spring: {
                incomeMultiplier: 1.1,    // 客流量增加
                eventWeights: {
                    festival: 1.5,
                    merchant_caravan: 1.2
                }
            },
            summer: {
                incomeMultiplier: 1.0,
                eventWeights: {
                    heat_wave: 2.0,
                    drought: 1.5
                }
            },
            autumn: {
                incomeMultiplier: 1.2,    // 豐收季節
                eventWeights: {
                    harvest_festival: 2.0,
                    trade_fair: 1.5
                }
            },
            winter: {
                incomeMultiplier: 0.8,    // 客流量減少
                eventWeights: {
                    snowstorm: 1.5,
                    new_year: 2.0
                }
            }
        };

        // 季節性商品
        this.seasonalGoods = {
            spring: ['spring_tea', 'bamboo_shoots', 'fresh_fish'],
            summer: ['cold_noodles', 'watermelon', 'ice'],
            autumn: ['moon_cake', 'crab', 'wine'],
            winter: ['hot_pot', 'mutton', 'coal']
        };
    }

    // 更新季節（由 TimeManager 觸發）
    updateSeason(month) {
        let newSeason = null;

        for (const [key, season] of Object.entries(this.seasons)) {
            if (season.months.includes(month)) {
                newSeason = key;
                break;
            }
        }

        if (newSeason && newSeason !== this.currentSeason) {
            this.changeSeason(newSeason);
        }
    }

    // 切換季節
    changeSeason(newSeason) {
        const oldSeason = this.currentSeason;
        this.currentSeason = newSeason;

        // 通知事件管理器更新事件權重
        this.updateEventWeights();

        // 通知貿易管理器更新商品
        this.updateSeasonalGoods();

        // 觸發季節變化事件
        return {
            oldSeason: oldSeason,
            newSeason: newSeason,
            effects: this.seasonEffects[newSeason]
        };
    }

    // 獲取當前季節效果
    getCurrentSeasonEffects() {
        return this.seasonEffects[this.currentSeason];
    }
}
```

---

## 🚶 Phase 6: 派遣系統

### MissionManager (任務管理器)

#### 任務類型
1. **押鏢任務** - 護送商隊，考驗武力和運氣
2. **行商任務** - 前往其他城市交易，考驗口才和智慧
3. **探索任務** - 探索未知地點，可能獲得稀有物品
4. **採集任務** - 收集特定材料，考驗靈巧和體質

#### 核心功能
```javascript
class MissionManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 任務數據庫
        this.missionDatabase = {};

        // 進行中的任務
        this.activeMissions = [];

        // 任務歷史
        this.missionHistory = [];
    }

    // 派遣任務
    dispatchMission(missionId, participants) {
        // participants: [employeeId] 或 ['player']

        const mission = this.missionDatabase[missionId];

        // 檢查參與者是否可用
        // 計算成功率
        // 創建任務實例
        // 開始任務計時
    }

    // 更新任務進度
    updateMissions(deltaTime) {
        for (const mission of this.activeMissions) {
            mission.elapsed += deltaTime;

            // 檢查是否到達檢查點
            // 觸發旅途事件
            // 檢查是否完成
        }
    }

    // 完成任務
    completeMission(missionId) {
        // 計算獎勵
        // 應用獎勵
        // 增加參與者經驗
        // 記錄歷史
    }
}
```

---

## 💰 Phase 7: 貿易系統

### TradeManager (貿易管理器)

#### 核心功能
```javascript
class TradeManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 商品數據庫
        this.goodsDatabase = {};

        // 當前市場價格
        this.marketPrices = {};

        // 商店庫存
        this.shopInventory = {};
    }

    // 更新市場價格（每日）
    updateMarketPrices() {
        // 基於供需、季節、隨機波動
    }

    // 購買商品
    buyGoods(goodsId, quantity) {
        // 檢查銀兩
        // 檢查庫存
        // 扣除銀兩
        // 增加背包物品
    }

    // 出售商品
    sellGoods(goodsId, quantity) {
        // 檢查背包
        // 計算售價
        // 移除物品
        // 增加銀兩
    }
}
```

---

## 🏗️ Phase 8: 科技樹系統

### TechnologyManager (科技管理器)

#### 建築升級樹
```
客棧外觀
├── 牌匾升級 (增加名聲)
├── 門面裝修 (吸引客人)
└── 圍牆加固 (安全性)

大廳
├── 桌椅升級 (容納更多客人)
├── 裝潢升級 (提升收入)
└── 展示櫃 (展示特殊物品)

廚房
├── 爐灶升級 (提升烹飪效率)
├── 儲物架 (增加食材容量)
└── 冰窖 (保鮮食材)

客房
├── 床鋪升級 (提升客人滿意度)
├── 增加客房數量
└── 豪華套房 (高級客人)

新設施
├── 藥房 (解鎖醫療功能)
├── 武館 (解鎖武術訓練)
├── 書房 (解鎖學習功能)
└── 倉庫 (增加儲存空間)
```

#### 核心功能
```javascript
class TechnologyManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 科技樹數據
        this.techTree = {};

        // 已解鎖的科技
        this.unlockedTechs = [];

        // 建設中的項目
        this.constructing = [];
    }

    // 研究/建造科技
    researchTech(techId) {
        // 檢查前置需求
        // 檢查資源
        // 開始建造
    }

    // 完成科技
    completeTech(techId) {
        // 應用效果
        // 解鎖新科技
        // 解鎖新場景
    }
}
```

---

## 🎬 場景系統整合

### 場景層級
```
外觀場景 (ExteriorScene)
  ↓ 點擊大門
大廳場景 (LobbyScene)
  ├→ 點擊櫃台 → 管理介面
  ├→ 點擊廚房門 → 廚房場景 (KitchenScene)
  ├→ 點擊儲藏室門 → 儲藏室場景 (StorageScene)
  ├→ 點擊客房A門 → 客房A場景 (RoomAScene)
  └→ 點擊客房B門 → 客房B場景 (RoomBScene)

小介面模式
  - 顯示客棧外觀縮圖
  - 顯示通知氣泡
  - 點擊展開完整介面
```

---

## 實作優先級

### ✅ 已完成 (Phase 1-4)
- [x] 核心角色系統
- [x] 背包與裝備系統
- [x] 視覺小說系統
- [x] 事件系統
- [x] 通知系統
- [x] 好感度系統
- [x] 學習系統

### 🔄 進行中 (Phase 5)
- [ ] 時間系統 (TimeManager)
- [ ] 季節系統 (SeasonManager)

### ⏳ 待實作
- [ ] Phase 6: 派遣系統 (MissionManager)
- [ ] Phase 7: 貿易系統 (TradeManager)
- [ ] Phase 8: 科技樹系統 (TechnologyManager)
- [ ] Phase 9: UI 場景系統整合

---

## 數據流向圖

```
用戶操作
  ↓
Phaser Scene (UI層)
  ↓
GameState (狀態管理)
  ├→ TimeManager (時間更新)
  ├→ EventManager (事件觸發)
  ├→ MissionManager (任務進度)
  └→ NotificationManager (通知推送)
  ↓
自動存檔
```

---

## 測試策略

每個新系統都需要：
1. 單元測試（Vitest）
2. 整合測試（與 GameState 的交互）
3. 場景測試（UI 交互）

目標測試覆蓋率：80%+

---

## 下一步行動

立即開始實作 **Phase 5: 時間與季節系統**
- 創建 TimeManager.js
- 創建 SeasonManager.js
- 整合到 GameState
- 創建測試
