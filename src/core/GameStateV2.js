/**
 * 桌面冒險者 - 遊戲狀態管理 V2
 * 透明桌面遊戲版本
 */
class GameStateV2 {
    constructor() {
        // 基礎數據
        this.silver = 100;  // 初始銀兩
        this.totalClicks = 0;
        this.totalKeyPresses = 0;
        this.playTime = 0;
        this.lastSaveTime = Date.now();

        // 家園系統
        this.homeLevel = 1;

        // 角色系統 - 10個角色
        this.characters = this.initializeCharacters();

        // 裝備系統
        this.equipment = [];
        this.inventory = [];

        // 寵物系統
        this.pets = [];

        // 事件系統
        this.eventHistory = [];
        this.activeEvents = [];

        // 統計數據
        this.stats = {
            dungeonsCompleted: 0,
            treasuresFound: 0,
            banditsDefeated: 0,
            storiesUnlocked: 0
        };

        // 銀兩獲取倍率
        this.silverMultiplier = 1.0;
    }

    /**
     * 初始化10個角色
     */
    initializeCharacters() {
        const characterTemplates = [
            { id: 0, name: '主角', type: 'hero', unlocked: true, unlockCondition: null },
            { id: 1, name: '法師', type: 'mage', unlocked: false, unlockCondition: { type: 'silver', value: 1000 } },
            { id: 2, name: '弓箭手', type: 'archer', unlocked: false, unlockCondition: { type: 'dungeon', value: 1 } },
            { id: 3, name: '盜賊', type: 'rogue', unlocked: false, unlockCondition: { type: 'treasure', value: 1 } },
            { id: 4, name: '牧師', type: 'priest', unlocked: false, unlockCondition: { type: 'heroLevel', value: 20 } },
            { id: 5, name: '戰士', type: 'warrior', unlocked: false, unlockCondition: { type: 'bandits', value: 10 } },
            { id: 6, name: '刺客', type: 'assassin', unlocked: false, unlockCondition: { type: 'silver', value: 10000 } },
            { id: 7, name: '德魯伊', type: 'druid', unlocked: false, unlockCondition: { type: 'pet', value: 1 } },
            { id: 8, name: '武僧', type: 'monk', unlocked: false, unlockCondition: { type: 'story', value: 5 } },
            { id: 9, name: '騎士', type: 'knight', unlocked: false, unlockCondition: { type: 'homeLevel', value: 5 } }
        ];

        return characterTemplates.map(template => ({
            ...template,
            level: 1,
            exp: 0,
            maxExp: 100,

            // 基礎屬性
            attack: 10 + template.id * 2,
            defense: 5 + template.id,
            hp: 100,
            maxHp: 100,

            // 裝備
            weapon: null,
            armor: null,
            accessory: null,

            // 狀態
            status: 'idle',  // idle, walking, attacking, resting

            // 位置（桌面座標）
            x: 200 + (template.id % 5) * 150,
            y: 200 + Math.floor(template.id / 5) * 150,

            // 背景故事進度
            storyProgress: 0,
            storyEvents: []
        }));
    }

    /**
     * 處理點擊事件
     */
    onUserClick() {
        this.totalClicks++;
        const amount = Math.floor(1 * this.silverMultiplier * this.getHomeLevelBonus());
        this.addSilver(amount);

        // 檢查角色解鎖
        this.checkUnlocks();

        return amount;
    }

    /**
     * 處理按鍵事件
     */
    onUserKeyPress() {
        this.totalKeyPresses++;
        const amount = Math.floor(1 * this.silverMultiplier * this.getHomeLevelBonus());
        this.addSilver(amount);

        // 檢查角色解鎖
        this.checkUnlocks();

        return amount;
    }

    /**
     * 添加銀兩
     */
    addSilver(amount) {
        this.silver += amount;
        return this.silver;
    }

    /**
     * 消耗銀兩
     */
    spendSilver(amount) {
        if (this.silver >= amount) {
            this.silver -= amount;
            return true;
        }
        return false;
    }

    /**
     * 獲取家園等級加成
     */
    getHomeLevelBonus() {
        const bonuses = {
            1: 1.0,
            2: 1.1,
            3: 1.25,
            4: 1.5,
            5: 2.0,
            6: 3.0
        };
        return bonuses[this.homeLevel] || 1.0;
    }

    /**
     * 升級家園
     */
    upgradeHome() {
        const costs = {
            1: 500,
            2: 2000,
            3: 5000,
            4: 10000,
            5: 50000
        };

        const cost = costs[this.homeLevel];
        if (!cost) {
            return { success: false, error: '已達最高等級' };
        }

        if (this.spendSilver(cost)) {
            this.homeLevel++;
            this.checkUnlocks();
            return { success: true, level: this.homeLevel };
        }

        return { success: false, error: '銀兩不足' };
    }

    /**
     * 檢查角色解鎖條件
     */
    checkUnlocks() {
        this.characters.forEach(char => {
            if (char.unlocked) return;

            const condition = char.unlockCondition;
            if (!condition) return;

            let unlocked = false;

            switch (condition.type) {
                case 'silver':
                    unlocked = this.silver >= condition.value;
                    break;
                case 'dungeon':
                    unlocked = this.stats.dungeonsCompleted >= condition.value;
                    break;
                case 'treasure':
                    unlocked = this.stats.treasuresFound >= condition.value;
                    break;
                case 'heroLevel':
                    const hero = this.characters[0];
                    unlocked = hero.level >= condition.value;
                    break;
                case 'bandits':
                    unlocked = this.stats.banditsDefeated >= condition.value;
                    break;
                case 'pet':
                    unlocked = this.pets.length >= condition.value;
                    break;
                case 'story':
                    unlocked = this.stats.storiesUnlocked >= condition.value;
                    break;
                case 'homeLevel':
                    unlocked = this.homeLevel >= condition.value;
                    break;
            }

            if (unlocked) {
                char.unlocked = true;
                console.log(`🎉 新角色解鎖: ${char.name}`);
            }
        });
    }

    /**
     * 角色獲得經驗
     */
    gainExp(characterId, amount) {
        const char = this.characters.find(c => c.id === characterId);
        if (!char || !char.unlocked) return;

        char.exp += amount;

        // 檢查升級
        while (char.exp >= char.maxExp && char.level < 200) {
            char.exp -= char.maxExp;
            char.level++;

            // 屬性成長
            char.attack += 2;
            char.defense += 1;
            char.maxHp += 10;
            char.hp = char.maxHp;

            // 下一級所需經驗
            char.maxExp = Math.floor(100 * Math.pow(1.1, char.level - 1));

            console.log(`⬆️ ${char.name} 升級到 Lv.${char.level}!`);

            // 檢查解鎖條件
            this.checkUnlocks();
        }

        // 達到等級上限
        if (char.level >= 200) {
            char.exp = 0;
        }
    }

    /**
     * 自動探險（被動收入）
     */
    tick(deltaTime) {
        this.playTime += deltaTime;

        // 每個解鎖的角色每秒產生銀兩
        const unlockedChars = this.characters.filter(c => c.unlocked);
        const silverPerSecond = unlockedChars.length * 0.5 * this.getHomeLevelBonus();

        const amount = (silverPerSecond * deltaTime) / 1000;
        this.addSilver(amount);

        // 每個角色每分鐘獲得經驗
        if (this.playTime % 60000 < deltaTime) {  // 每分鐘
            unlockedChars.forEach(char => {
                this.gainExp(char.id, 10);
            });
        }
    }

    /**
     * 觸發隨機事件
     */
    triggerRandomEvent() {
        const eventTypes = ['dungeon', 'treasure', 'bandit'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        const event = {
            id: Date.now(),
            type: randomType,
            timestamp: Date.now(),
            completed: false
        };

        this.activeEvents.push(event);
        return event;
    }

    /**
     * 完成事件
     */
    completeEvent(eventId, success = true) {
        const eventIndex = this.activeEvents.findIndex(e => e.id === eventId);
        if (eventIndex === -1) return;

        const event = this.activeEvents[eventIndex];
        event.completed = true;
        event.success = success;

        // 移除活動事件
        this.activeEvents.splice(eventIndex, 1);

        // 添加到歷史
        this.eventHistory.push(event);

        // 根據事件類型給予獎勵
        if (success) {
            switch (event.type) {
                case 'dungeon':
                    this.stats.dungeonsCompleted++;
                    this.addSilver(200);
                    // 給參與的角色經驗
                    const unlockedChars = this.characters.filter(c => c.unlocked);
                    unlockedChars.slice(0, 3).forEach(char => {
                        this.gainExp(char.id, 200);
                    });
                    break;

                case 'treasure':
                    this.stats.treasuresFound++;
                    this.addSilver(500);
                    break;

                case 'bandit':
                    this.stats.banditsDefeated++;
                    this.addSilver(100);
                    this.gainExp(0, 50);  // 主角獲得經驗
                    break;
            }
        }

        this.checkUnlocks();
        return event;
    }

    /**
     * 購買裝備
     */
    buyEquipment(type, quality, cost) {
        if (!this.spendSilver(cost)) {
            return { success: false, error: '銀兩不足' };
        }

        const equipment = {
            id: Date.now(),
            type,  // weapon, armor, accessory
            quality,  // normal, excellent, rare, epic, legendary
            equipped: false,
            equipTo: null
        };

        this.inventory.push(equipment);
        return { success: true, equipment };
    }

    /**
     * 購買寵物
     */
    buyPet(name, cost) {
        if (!this.spendSilver(cost)) {
            return { success: false, error: '銀兩不足' };
        }

        const pet = {
            id: Date.now(),
            name,
            hunger: 100,  // 飢餓值 0-100
            bonus: 1.0 + this.pets.length * 0.1  // 銀兩加成
        };

        this.pets.push(pet);
        this.checkUnlocks();
        return { success: true, pet };
    }

    /**
     * 餵食寵物
     */
    feedPet(petId, cost = 10) {
        const pet = this.pets.find(p => p.id === petId);
        if (!pet) return { success: false, error: '寵物不存在' };

        if (!this.spendSilver(cost)) {
            return { success: false, error: '銀兩不足' };
        }

        pet.hunger = Math.min(100, pet.hunger + 50);
        return { success: true, pet };
    }

    /**
     * 更新寵物狀態
     */
    updatePets(deltaTime) {
        this.pets.forEach(pet => {
            // 每小時減少 10 飢餓值
            pet.hunger -= (10 * deltaTime) / 3600000;
            pet.hunger = Math.max(0, pet.hunger);
        });
    }

    /**
     * 存檔
     */
    save() {
        this.lastSaveTime = Date.now();

        const saveData = {
            version: 2,
            silver: this.silver,
            totalClicks: this.totalClicks,
            totalKeyPresses: this.totalKeyPresses,
            playTime: this.playTime,
            lastSaveTime: this.lastSaveTime,
            homeLevel: this.homeLevel,
            characters: this.characters,
            equipment: this.equipment,
            inventory: this.inventory,
            pets: this.pets,
            eventHistory: this.eventHistory,
            stats: this.stats,
            silverMultiplier: this.silverMultiplier
        };

        try {
            localStorage.setItem('desktopRPG_v2', JSON.stringify(saveData));
            return { success: true };
        } catch (error) {
            console.error('存檔失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 讀檔
     */
    load() {
        try {
            const saveData = localStorage.getItem('desktopRPG_v2');
            if (!saveData) {
                return { success: false, error: '沒有存檔' };
            }

            const data = JSON.parse(saveData);

            // 載入所有數據
            this.silver = data.silver || 100;
            this.totalClicks = data.totalClicks || 0;
            this.totalKeyPresses = data.totalKeyPresses || 0;
            this.playTime = data.playTime || 0;
            this.lastSaveTime = data.lastSaveTime || Date.now();
            this.homeLevel = data.homeLevel || 1;
            this.characters = data.characters || this.initializeCharacters();
            this.equipment = data.equipment || [];
            this.inventory = data.inventory || [];
            this.pets = data.pets || [];
            this.eventHistory = data.eventHistory || [];
            this.stats = data.stats || {
                dungeonsCompleted: 0,
                treasuresFound: 0,
                banditsDefeated: 0,
                storiesUnlocked: 0
            };
            this.silverMultiplier = data.silverMultiplier || 1.0;

            // 計算離線時間
            const offlineTime = Date.now() - this.lastSaveTime;
            if (offlineTime > 1000) {
                // 最多計算 8 小時離線收益
                const cappedTime = Math.min(offlineTime, 8 * 60 * 60 * 1000);
                this.tick(cappedTime);

                return {
                    success: true,
                    offline: true,
                    offlineTime: cappedTime,
                    offlineMinutes: Math.floor(cappedTime / 60000)
                };
            }

            return { success: true, offline: false };
        } catch (error) {
            console.error('讀檔失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 重置遊戲
     */
    reset() {
        localStorage.removeItem('desktopRPG_v2');
        Object.assign(this, new GameStateV2());
    }
}

module.exports = GameStateV2;
