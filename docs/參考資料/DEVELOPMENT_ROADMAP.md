# 悅來客棧 - 開發路線圖

## 📋 開發策略

### 核心原則
1. **邏輯優先** - 先完成所有遊戲邏輯
2. **佔位圖策略** - 使用程式化繪製的簡單圖形
3. **接口預留** - 為美術資源預留清晰的接口
4. **模組化設計** - 方便後續替換素材

### 美術資源接口設計

所有美術資源通過配置文件管理：

```javascript
// src/config/AssetConfig.js
const ASSETS = {
    portraits: {
        player: "assets/portraits/player.png",      // 主角立繪
        employee_0: "assets/portraits/manager.png", // 掌櫃立繪
        // ... 10個員工立繪
    },

    avatars: {
        player: "assets/avatars/player.png",        // 主角頭像 (64x64)
        employee_0: "assets/avatars/manager.png",   // 掌櫃頭像
        // ... 10個員工頭像
    },

    scenes: {
        lobby: "assets/scenes/lobby.png",           // 大廳背景
        kitchen: "assets/scenes/kitchen.png",       // 廚房背景
        // ...
    },

    items: {
        weapon_001: "assets/items/sword.png",       // 物品圖標 (32x32)
        // ...
    },

    ui: {
        dialogBox: "assets/ui/dialog_box.png",      // 對話框
        button: "assets/ui/button.png",             // 按鈕
        // ...
    }
};
```

當素材不存在時，自動使用佔位圖：
- 角色立繪 → 彩色矩形 + 名字
- 頭像 → 彩色圓形
- 場景背景 → 漸變色 + 文字標示
- 物品圖標 → 簡單形狀

---

## 🎯 Phase 1: 核心系統重構（預計 3-5 天）

### 目標
重構角色系統，從技能評級改為完整屬性系統

### 任務清單

#### 1.1 創建 Player 類別
**檔案**: `src/core/Player.js`

```javascript
class Player {
    constructor(name = "未命名") {
        this.name = name;
        this.age = 20;
        this.gender = "male";

        // 核心屬性
        this.attributes = {
            physique: 10,      // 體質
            strength: 10,      // 武力
            intelligence: 10,  // 智慧
            charisma: 10,      // 口才
            dexterity: 10      // 靈巧
        };

        // 個性系統
        this.personality = {
            righteous: 0,      // 正義 ←→ 邪惡 (-100 to +100)
            benevolent: 0,     // 仁慈 ←→ 冷酷
            cautious: 0,       // 謹慎 ←→ 冒險
            frugal: 0,         // 節儉 ←→ 奢侈
            humble: 0          // 謙遜 ←→ 傲慢
        };

        // 狀態
        this.status = {
            fatigue: 0,
            health: 100,
            mood: 50
        };

        // 裝備
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };

        // 技能
        this.skills = [];

        // 經驗
        this.experience = {
            total: 0,
            level: 1,
            nextLevelExp: 100
        };
    }

    // 增加屬性
    addAttribute(attr, value) { /* ... */ }

    // 改變個性
    changePersonality(axis, value) { /* ... */ }

    // 裝備物品
    equip(slot, itemId) { /* ... */ }

    // 序列化
    serialize() { /* ... */ }
    deserialize(data) { /* ... */ }
}
```

**測試**:
- [x] 創建主角
- [x] 屬性增減
- [x] 個性變化
- [x] 裝備系統

---

#### 1.2 重構 GameState - 員工系統
**檔案**: `src/core/GameState.js`

**改動**:

1. **員工數據結構**

舊結構：
```javascript
{
    skills: {
        cooking: 'A',
        service: 'B'
    }
}
```

新結構：
```javascript
{
    // 核心屬性（0-100）
    attributes: {
        physique: 50,
        strength: 60,
        intelligence: 70,
        charisma: 80,
        dexterity: 40
    },

    // 成長率
    growthRate: {
        physique: 1.0,
        strength: 1.2,
        intelligence: 1.5,
        charisma: 1.3,
        dexterity: 0.8
    },

    // 才能
    talents: [
        {
            id: "talent_leadership",
            effects: {
                workBonus: { management: 0.3 },
                growthBonus: { intelligence: 0.2 }
            }
        }
    ],

    // 技能
    skills: [
        {
            id: "skill_accounting",
            type: "passive",
            level: 3,
            exp: 450,
            maxLevel: 10,
            effects: { incomeBonus: 0.05 }
        }
    ],

    // 雇用相關
    hired: {
        unlocked: true,
        cost: 0,
        salary: 100,      // 每日薪資
        joinDate: 1
    },

    // 狀態
    status: {
        fatigue: 0,
        health: 100,
        mood: 80,
        currentState: "IDLE"
    },

    // 裝備
    equipment: {
        weapon: null,
        armor: null,
        accessory: null
    },

    // 好感度
    affection: {
        level: 0,
        points: 0,
        relationship: "stranger",
        events: []
    }
}
```

2. **新增方法**

```javascript
// 計算員工總屬性（基礎 + 裝備加成）
calculateTotalAttributes(employeeId) {
    const employee = this.employees.find(e => e.id === employeeId);
    const base = employee.attributes;
    const equipBonus = this.getEquipmentBonus(employee.equipment);

    return {
        physique: base.physique + equipBonus.physique,
        strength: base.strength + equipBonus.strength,
        // ...
    };
}

// 每日薪資結算
dailySalaryPayment() {
    let totalSalary = 0;
    this.employees.forEach(emp => {
        if (emp.hired.unlocked) {
            totalSalary += emp.hired.salary;
        }
    });

    if (this.silver >= totalSalary) {
        this.silver -= totalSalary;
        return { success: true, amount: totalSalary };
    } else {
        // 銀兩不足，員工心情下降
        this.employees.forEach(emp => {
            if (emp.hired.unlocked) {
                emp.status.mood -= 10;
            }
        });
        return { success: false, shortage: totalSalary - this.silver };
    }
}

// 工作導致疲勞
addFatigue(employeeId, amount) {
    const employee = this.employees.find(e => e.id === employeeId);
    employee.status.fatigue = Math.min(100, employee.status.fatigue + amount);

    // 疲勞影響工作效率
    employee.work.efficiency = Math.max(0.3, 1 - employee.status.fatigue / 100);
}

// 休息恢復疲勞
rest(employeeId, hours) {
    const employee = this.employees.find(e => e.id === employeeId);
    const recovery = hours * (employee.attributes.physique / 10);
    employee.status.fatigue = Math.max(0, employee.status.fatigue - recovery);
}
```

**測試**:
- [x] 員工屬性計算
- [x] 薪資結算
- [x] 疲勞系統
- [x] 裝備加成

---

#### 1.3 創建 EquipmentManager
**檔案**: `src/managers/EquipmentManager.js`

```javascript
class EquipmentManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.equipmentDatabase = {}; // 裝備數據庫
    }

    // 載入裝備數據
    loadEquipmentData() {
        // 從 JSON 或配置文件載入
        this.equipmentDatabase = require('../data/equipment.json');
    }

    // 裝備物品
    equip(targetId, targetType, slot, itemId) {
        // targetType: 'player' | 'employee'
        // slot: 'weapon' | 'armor' | 'accessory'

        const item = this.equipmentDatabase[itemId];
        if (!item) return { success: false, message: "裝備不存在" };

        // 檢查需求
        if (!this.checkRequirements(targetId, targetType, item)) {
            return { success: false, message: "不符合裝備需求" };
        }

        // 卸下舊裝備
        const oldItem = this.unequip(targetId, targetType, slot);

        // 裝備新裝備
        if (targetType === 'player') {
            this.gameState.player.equipment[slot] = itemId;
        } else {
            const employee = this.gameState.employees.find(e => e.id === targetId);
            employee.equipment[slot] = itemId;
        }

        return { success: true, oldItem };
    }

    // 卸下裝備
    unequip(targetId, targetType, slot) {
        // 返回到背包
    }

    // 檢查裝備需求
    checkRequirements(targetId, targetType, item) {
        const target = targetType === 'player'
            ? this.gameState.player
            : this.gameState.employees.find(e => e.id === targetId);

        // 檢查等級
        if (item.requirements.level > target.experience.level) {
            return false;
        }

        // 檢查屬性
        for (const [attr, value] of Object.entries(item.requirements.attributes || {})) {
            if (target.attributes[attr] < value) {
                return false;
            }
        }

        return true;
    }

    // 計算裝備加成
    calculateBonus(equipment) {
        const bonus = {
            physique: 0,
            strength: 0,
            intelligence: 0,
            charisma: 0,
            dexterity: 0
        };

        for (const slot of ['weapon', 'armor', 'accessory']) {
            const itemId = equipment[slot];
            if (!itemId) continue;

            const item = this.equipmentDatabase[itemId];
            for (const [attr, value] of Object.entries(item.attributes || {})) {
                bonus[attr] += value;
            }
        }

        return bonus;
    }
}
```

**測試**:
- [x] 裝備穿戴
- [x] 裝備卸下
- [x] 需求檢查
- [x] 加成計算

---

#### 1.4 創建裝備數據文件
**檔案**: `src/data/equipment.json`

```json
{
    "weapon_001": {
        "id": "weapon_001",
        "name": "青鋒劍",
        "type": "weapon",
        "rarity": "rare",
        "icon": "assets/items/sword_001.png",
        "attributes": {
            "strength": 10,
            "dexterity": 5
        },
        "effects": [
            {
                "type": "combat_bonus",
                "value": 0.15
            }
        ],
        "requirements": {
            "level": 5,
            "attributes": {
                "strength": 20
            }
        },
        "price": {
            "buy": 500,
            "sell": 250
        }
    },

    "armor_001": {
        "id": "armor_001",
        "name": "布衣",
        "type": "armor",
        "rarity": "common",
        "icon": "assets/items/cloth_armor.png",
        "attributes": {
            "physique": 5
        },
        "requirements": {
            "level": 1
        },
        "price": {
            "buy": 50,
            "sell": 25
        }
    }
}
```

---

#### 1.5 更新 TimeManager - 每日事件
**檔案**: `src/managers/TimeManager.js`

**新增**:

```javascript
// 在 advanceDay() 中添加
advanceDay() {
    this.currentTime.dayCount++;
    // ... 原有邏輯

    // 觸發每日事件
    this.triggerEvent('onDayChange', {
        dayCount: this.currentTime.dayCount,
        season: this.currentTime.season,
        weather: this.currentTime.weather
    });
}
```

在 GameState 中監聽：

```javascript
// 監聽每日事件
this.timeManager.on('onDayChange', (data) => {
    // 薪資結算
    this.dailySalaryPayment();

    // 疲勞恢復（夜間休息）
    this.employees.forEach(emp => {
        if (emp.status.currentState === 'SLEEPING') {
            this.rest(emp.id, 8);
        }
    });

    // 檢查隨機事件
    // （Phase 3 實作）
});
```

---

#### 1.6 更新測試
**檔案**: `tests/gameState.test.js`

新增測試：

```javascript
describe('員工屬性系統', () => {
    it('應該有正確的屬性結構', () => {
        const employee = gameState.employees[0];
        expect(employee.attributes).toHaveProperty('physique');
        expect(employee.attributes).toHaveProperty('strength');
        expect(employee.attributes).toHaveProperty('intelligence');
        expect(employee.attributes).toHaveProperty('charisma');
        expect(employee.attributes).toHaveProperty('dexterity');
    });

    it('應該有成長率', () => {
        const employee = gameState.employees[0];
        expect(employee.growthRate).toBeDefined();
    });
});

describe('薪資系統', () => {
    it('應該能正確扣除薪資', () => {
        gameState.silver = 1000;
        const result = gameState.dailySalaryPayment();
        expect(result.success).toBe(true);
    });

    it('銀兩不足時應該失敗', () => {
        gameState.silver = 10;
        const result = gameState.dailySalaryPayment();
        expect(result.success).toBe(false);
    });
});

describe('裝備系統', () => {
    it('應該能裝備物品', () => {
        const result = gameState.equipmentManager.equip(
            'player', 'player', 'weapon', 'weapon_001'
        );
        expect(result.success).toBe(true);
    });

    it('不符合需求時不能裝備', () => {
        // 主角等級不足
        const result = gameState.equipmentManager.equip(
            'player', 'player', 'weapon', 'weapon_legendary'
        );
        expect(result.success).toBe(false);
    });
});
```

---

### Phase 1 完成標準

- [x] Player 類別完成並測試
- [x] GameState 員工結構重構完成
- [x] EquipmentManager 完成並測試
- [x] 薪資系統運作正常
- [x] 疲勞系統運作正常
- [x] 裝備系統運作正常
- [x] 所有測試通過（至少 95% 覆蓋率）

---

## 🎭 Phase 2: 視覺小說系統（預計 4-6 天）

### 目標
實作故事播放系統，支援立繪、對話、選擇分支

### 任務清單

#### 2.1 創建 StoryManager
**檔案**: `src/managers/StoryManager.js`

```javascript
class StoryManager extends Phaser.Events.EventEmitter {
    constructor(gameState) {
        super();
        this.gameState = gameState;
        this.storyDatabase = {};
        this.currentStory = null;
        this.currentNode = 0;
        this.variables = {};  // 故事變數
    }

    // 載入故事數據
    loadStory(storyId) {
        const storyData = require(`../data/stories/${storyId}.json`);
        this.currentStory = storyData;
        this.currentNode = 0;
        return storyData;
    }

    // 獲取當前對話節點
    getCurrentNode() {
        if (!this.currentStory) return null;
        return this.currentStory.nodes[this.currentNode];
    }

    // 推進到下一個節點
    next(choiceIndex = null) {
        const node = this.getCurrentNode();

        if (!node) return null;

        // 如果有選擇
        if (node.choices && choiceIndex !== null) {
            const choice = node.choices[choiceIndex];

            // 應用選擇效果
            this.applyEffects(choice.effects);

            // 跳轉到目標節點
            this.currentNode = choice.nextNode;
        } else {
            // 沒有選擇，自動推進
            this.currentNode++;
        }

        const nextNode = this.getCurrentNode();

        // 如果故事結束
        if (!nextNode) {
            this.emit('story-complete', this.currentStory.id);
            return null;
        }

        return nextNode;
    }

    // 應用效果
    applyEffects(effects) {
        if (!effects) return;

        // 銀兩變化
        if (effects.silver) {
            this.gameState.addSilver(effects.silver);
        }

        // 名聲變化
        if (effects.reputation) {
            this.gameState.addReputation(effects.reputation);
        }

        // 主角個性變化
        if (effects.personality) {
            for (const [axis, value] of Object.entries(effects.personality)) {
                this.gameState.player.changePersonality(axis, value);
            }
        }

        // 解鎖員工
        if (effects.unlockEmployee !== undefined) {
            this.gameState.employees[effects.unlockEmployee].hired.unlocked = true;
        }

        // 獲得物品
        if (effects.items) {
            effects.items.forEach(itemId => {
                this.gameState.inventory.addItem(itemId, 1);
            });
        }
    }

    // 檢查條件
    checkConditions(conditions) {
        if (!conditions) return true;

        for (const condition of conditions) {
            switch (condition.type) {
                case 'silver':
                    if (this.gameState.silver < condition.min) return false;
                    break;

                case 'attribute':
                    if (this.gameState.player.attributes[condition.name] < condition.min) {
                        return false;
                    }
                    break;

                case 'affection':
                    const emp = this.gameState.employees.find(e => e.id === condition.employeeId);
                    if (emp.affection.level < condition.min) return false;
                    break;

                case 'day':
                    if (this.gameState.timeManager.currentTime.dayCount < condition.min) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }
}
```

---

#### 2.2 創建 StoryScene
**檔案**: `src/scenes/StoryScene.js`

```javascript
class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });
        this.storyManager = null;
        this.currentNode = null;

        // UI 元素
        this.background = null;
        this.portraitLeft = null;
        this.portraitRight = null;
        this.dialogBox = null;
        this.nameText = null;
        this.contentText = null;
        this.choiceButtons = [];

        // 文字顯示
        this.textSpeed = 50;  // 毫秒/字
        this.currentText = "";
        this.targetText = "";
        this.textTimer = null;
    }

    init(data) {
        this.gameState = data.gameState;
        this.storyManager = data.storyManager;
        this.storyId = data.storyId;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 背景（全屏黑色）
        this.background = this.add.rectangle(
            width / 2, height / 2,
            width, height,
            0x000000
        );

        // 立繪位置（佔位圖）
        this.createPortraitSlots();

        // 對話框
        this.createDialogBox();

        // 載入故事
        this.storyManager.loadStory(this.storyId);

        // 顯示第一個節點
        this.showNode(this.storyManager.getCurrentNode());

        // 點擊推進
        this.input.on('pointerdown', () => this.handleClick());
    }

    createPortraitSlots() {
        const { width, height } = this.cameras.main;

        // 左側立繪（佔位：200x400 矩形）
        this.portraitLeft = this.add.rectangle(
            150, height / 2,
            200, 400,
            0x555555, 0.5
        );
        this.portraitLeft.setVisible(false);

        // 右側立繪
        this.portraitRight = this.add.rectangle(
            width - 150, height / 2,
            200, 400,
            0x555555, 0.5
        );
        this.portraitRight.setVisible(false);
    }

    createDialogBox() {
        const { width, height } = this.cameras.main;

        // 對話框背景
        this.dialogBox = this.add.rectangle(
            width / 2, height - 120,
            width - 40, 200,
            0x000000, 0.8
        );
        this.dialogBox.setStrokeStyle(2, 0xFFD700);

        // 名字標籤
        this.nameText = this.add.text(50, height - 210, "", {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });

        // 對話內容
        this.contentText = this.add.text(50, height - 170, "", {
            fontSize: '18px',
            color: '#FFFFFF',
            wordWrap: { width: width - 100 },
            lineSpacing: 8
        });
    }

    showNode(node) {
        if (!node) {
            // 故事結束
            this.endStory();
            return;
        }

        this.currentNode = node;

        // 更新立繪
        this.updatePortraits(node.characters);

        // 更新對話
        this.nameText.setText(this.getSpeakerName(node.speaker));

        // 逐字顯示
        this.targetText = node.text;
        this.currentText = "";
        this.startTextAnimation();

        // 清除舊選擇
        this.clearChoices();

        // 如果有選擇，顯示選擇按鈕
        if (node.choices) {
            this.showChoices(node.choices);
        }
    }

    updatePortraits(characters) {
        // 佔位圖實作：根據角色 ID 顯示不同顏色
        if (!characters || characters.length === 0) {
            this.portraitLeft.setVisible(false);
            this.portraitRight.setVisible(false);
            return;
        }

        // 左側角色
        if (characters[0]) {
            this.portraitLeft.setVisible(true);
            this.portraitLeft.setFillStyle(this.getCharacterColor(characters[0].id));

            // 未來替換為：
            // this.portraitLeft.setTexture(characters[0].portrait);
        }

        // 右側角色
        if (characters[1]) {
            this.portraitRight.setVisible(true);
            this.portraitRight.setFillStyle(this.getCharacterColor(characters[1].id));
        }
    }

    getCharacterColor(characterId) {
        // 佔位圖：不同角色不同顏色
        const colors = {
            'player': 0x4A90E2,
            'employee_0': 0xFFD700,
            'employee_1': 0xFF6B6B,
            // ...
        };
        return colors[characterId] || 0x888888;
    }

    getSpeakerName(speakerId) {
        if (speakerId === 'player') {
            return this.gameState.player.name;
        }

        if (speakerId.startsWith('employee_')) {
            const id = parseInt(speakerId.split('_')[1]);
            return this.gameState.employees[id].name;
        }

        // NPC 或旁白
        const names = {
            'narrator': '旁白',
            'mysterious_man': '神秘人',
            // ...
        };
        return names[speakerId] || speakerId;
    }

    startTextAnimation() {
        // 停止舊動畫
        if (this.textTimer) {
            this.textTimer.destroy();
        }

        let index = 0;
        this.textTimer = this.time.addEvent({
            delay: this.textSpeed,
            repeat: this.targetText.length - 1,
            callback: () => {
                this.currentText += this.targetText[index];
                this.contentText.setText(this.currentText);
                index++;
            }
        });
    }

    showChoices(choices) {
        const { width, height } = this.cameras.main;
        const startY = height - 280;

        choices.forEach((choice, index) => {
            // 檢查條件
            const enabled = this.storyManager.checkConditions(choice.conditions);

            // 按鈕背景
            const btn = this.add.rectangle(
                width / 2, startY - index * 50,
                width - 100, 40,
                enabled ? 0x2E7D32 : 0x555555,
                0.8
            );
            btn.setStrokeStyle(2, 0xFFD700);

            if (enabled) {
                btn.setInteractive({ useHandCursor: true });
                btn.on('pointerdown', () => this.handleChoice(index));
                btn.on('pointerover', () => btn.setFillStyle(0x4CAF50, 0.9));
                btn.on('pointerout', () => btn.setFillStyle(0x2E7D32, 0.8));
            }

            // 按鈕文字
            const text = this.add.text(
                width / 2, startY - index * 50,
                choice.text,
                {
                    fontSize: '16px',
                    color: enabled ? '#FFFFFF' : '#888888'
                }
            );
            text.setOrigin(0.5);

            this.choiceButtons.push(btn, text);
        });
    }

    clearChoices() {
        this.choiceButtons.forEach(obj => obj.destroy());
        this.choiceButtons = [];
    }

    handleClick() {
        // 如果文字還在動畫中，立即顯示完整文字
        if (this.currentText !== this.targetText) {
            this.textTimer.destroy();
            this.currentText = this.targetText;
            this.contentText.setText(this.currentText);
            return;
        }

        // 如果有選擇，不自動推進
        if (this.currentNode.choices) {
            return;
        }

        // 推進到下一個節點
        const nextNode = this.storyManager.next();
        this.showNode(nextNode);
    }

    handleChoice(choiceIndex) {
        const nextNode = this.storyManager.next(choiceIndex);
        this.showNode(nextNode);
    }

    endStory() {
        console.log('故事結束');

        // 淡出效果
        this.cameras.main.fadeOut(500);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            // 返回主場景
            this.scene.start('ExteriorScene', {
                gameState: this.gameState,
                timeManager: this.gameState.timeManager
            });
        });
    }
}
```

---

#### 2.3 創建開場故事數據
**檔案**: `src/data/stories/opening.json`

```json
{
    "id": "opening",
    "title": "繼承客棧",
    "nodes": [
        {
            "id": 0,
            "speaker": "narrator",
            "text": "開禧二年，春。江南道，臨安府郊外。",
            "characters": [],
            "nextNode": 1
        },
        {
            "id": 1,
            "speaker": "narrator",
            "text": "你站在一間破舊客棧前，手中握著一封信。",
            "characters": [
                { "id": "player", "emotion": "normal" }
            ],
            "nextNode": 2
        },
        {
            "id": 2,
            "speaker": "narrator",
            "text": "信是三個月前收到的，內容簡單：「你繼承了悅來客棧。」",
            "characters": [
                { "id": "player", "emotion": "confused" }
            ],
            "nextNode": 3
        },
        {
            "id": 3,
            "speaker": "player",
            "text": "（這間客棧...真的是我的嗎？）",
            "characters": [
                { "id": "player", "emotion": "thinking" }
            ],
            "nextNode": 4
        },
        {
            "id": 4,
            "speaker": "narrator",
            "text": "門口站著一位中年男子，穿著樸素的長袍，神色疲憊。",
            "characters": [
                { "id": "player", "emotion": "normal" },
                { "id": "employee_0", "emotion": "tired" }
            ],
            "nextNode": 5
        },
        {
            "id": 5,
            "speaker": "employee_0",
            "text": "你就是新掌櫃？我是沈青山，一直在這裡幫忙。",
            "characters": [
                { "id": "player", "emotion": "normal" },
                { "id": "employee_0", "emotion": "normal" }
            ],
            "nextNode": 6
        },
        {
            "id": 6,
            "speaker": "employee_0",
            "text": "老掌櫃走得突然...客棧最近生意不好，只剩我一個人了。",
            "characters": [
                { "id": "player", "emotion": "normal" },
                { "id": "employee_0", "emotion": "sad" }
            ],
            "nextNode": 7
        },
        {
            "id": 7,
            "speaker": "player",
            "text": "我該怎麼稱呼你？",
            "characters": [
                { "id": "player", "emotion": "polite" },
                { "id": "employee_0", "emotion": "normal" }
            ],
            "choices": [
                {
                    "text": "沈大哥（親切）",
                    "effects": {
                        "personality": { "benevolent": 5, "humble": 5 }
                    },
                    "nextNode": 8
                },
                {
                    "text": "青山（平等）",
                    "effects": {
                        "personality": { "humble": 2 }
                    },
                    "nextNode": 8
                },
                {
                    "text": "沈掌櫃（正式）",
                    "effects": {
                        "personality": { "humble": -2 }
                    },
                    "nextNode": 8
                }
            ]
        },
        {
            "id": 8,
            "speaker": "employee_0",
            "text": "呵，隨你怎麼叫。客棧裡還有五百兩銀子，勉強能撐一陣子。",
            "characters": [
                { "id": "player", "emotion": "normal" },
                { "id": "employee_0", "emotion": "normal" }
            ],
            "nextNode": 9
        },
        {
            "id": 9,
            "speaker": "narrator",
            "text": "你的新生活，從這間破舊的客棧開始...",
            "characters": [],
            "effects": {
                "silver": 500,
                "unlockEmployee": 0
            }
        }
    ]
}
```

---

#### 2.4 整合到 game.js

```javascript
// 導入
const StoryManager = require('./src/managers/StoryManager');
const StoryScene = require('./src/scenes/StoryScene');

// 初始化
const storyManager = new StoryManager(gameState);

// 配置
const config = {
    // ...
    scene: [
        StoryScene,      // 新增
        ExteriorScene,
        LobbyScene
    ]
};

// 遊戲啟動後
game.scene.start('StoryScene', {
    gameState: gameState,
    timeManager: timeManager,
    storyManager: storyManager,
    storyId: 'opening'
});
```

---

### Phase 2 完成標準

- [x] StoryManager 完成
- [x] StoryScene 完成並測試
- [x] 開場故事播放正常
- [x] 對話逐字顯示
- [x] 選擇分支運作
- [x] 效果應用正確
- [x] 立繪顯示（佔位圖）
- [x] 故事結束後正確跳轉

---

## 🎲 Phase 3: 事件系統（預計 5-7 天）

### 目標
實作隨機事件、劇情事件、通知系統

### 任務清單

#### 3.1 創建 EventManager
#### 3.2 創建事件數據庫（至少 20 個事件）
#### 3.3 創建 NotificationManager
#### 3.4 小介面通知 UI
#### 3.5 事件觸發邏輯

（詳細內容待 Phase 2 完成後展開）

---

## 💕 Phase 4: 好感度與學習系統（預計 4-5 天）

### 目標
實作角色好感度、學習系統、技能系統

（詳細內容待 Phase 3 完成後展開）

---

## 🚢 Phase 5: 派遣系統（預計 5-7 天）

### 目標
實作押標、行商、探險任務

（詳細內容待 Phase 4 完成後展開）

---

## 🌳 Phase 6: 科技樹系統（預計 4-5 天）

### 目標
實作建築升級、科技研發

（詳細內容待 Phase 5 完成後展開）

---

## 🏪 Phase 7: 貿易與季節系統（預計 3-4 天）

### 目標
實作商店、季節商品、價格波動

（詳細內容待 Phase 6 完成後展開）

---

## 🎨 Phase 8: 場景擴展與整合測試（預計 5-7 天）

### 目標
新增廚房、儲藏室、客房場景，整合所有系統

（詳細內容待 Phase 7 完成後展開）

---

## 📊 總體進度追蹤

| Phase | 內容 | 預計時間 | 狀態 |
|-------|------|----------|------|
| Phase 1 | 核心系統重構 | 3-5 天 | ⏳ 進行中 |
| Phase 2 | 視覺小說系統 | 4-6 天 | ⏸️ 待開始 |
| Phase 3 | 事件系統 | 5-7 天 | ⏸️ 待開始 |
| Phase 4 | 好感度與學習 | 4-5 天 | ⏸️ 待開始 |
| Phase 5 | 派遣系統 | 5-7 天 | ⏸️ 待開始 |
| Phase 6 | 科技樹系統 | 4-5 天 | ⏸️ 待開始 |
| Phase 7 | 貿易與季節 | 3-4 天 | ⏸️ 待開始 |
| Phase 8 | 場景擴展與整合 | 5-7 天 | ⏸️ 待開始 |

**總計**: 33-46 天（約 5-7 週）

---

## 🎯 當前任務

**正在進行**: Phase 1 - 核心系統重構

**下一步**:
1. 創建 `src/core/Player.js`
2. 重構 `src/core/GameState.js` 員工結構
3. 創建 `src/managers/EquipmentManager.js`
4. 創建 `src/data/equipment.json`
5. 更新測試

---

**文檔版本**: v1.0
**最後更新**: 2025-10-24
**狀態**: 📝 Phase 1 進行中
