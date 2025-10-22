/**
 * 遊戲狀態管理 - 統一的數據源
 * 所有遊戲數據都在這裡，與視圖層完全分離
 */
class GameState {
    constructor() {
        this.resources = {
            gold: 100,
            wood: 50,
            stone: 30,
            food: 80,
            knowledge: 0,
            magic: 0
        };

        this.characters = [
            { id: 1, name: '戰士', type: 'warrior', atk: 10, int: 3, hp: 100, maxHp: 100, level: 1, exp: 0, state: 'idle', assignedTo: null },
            { id: 2, name: '法師', type: 'mage', atk: 4, int: 12, hp: 60, maxHp: 60, level: 1, exp: 0, state: 'idle', assignedTo: null },
            { id: 3, name: '工匠', type: 'craftsman', atk: 6, int: 8, hp: 80, maxHp: 80, level: 1, exp: 0, state: 'idle', assignedTo: null }
        ];

        this.stations = [
            {
                id: 1,
                name: '森林探險',
                type: 'adventure',
                requiredAttr: 'atk',
                minAttrValue: 5,
                output: { gold: 5, wood: 10, exp: 3 },
                duration: 5000, // 5秒產出一次
                workers: [] // 當前派遣的角色
            },
            {
                id: 2,
                name: '魔法研究',
                type: 'research',
                requiredAttr: 'int',
                minAttrValue: 8,
                output: { knowledge: 2, magic: 1, exp: 5 },
                duration: 8000, // 8秒產出一次
                workers: []
            },
            {
                id: 3,
                name: '石礦開採',
                type: 'mining',
                requiredAttr: 'atk',
                minAttrValue: 6,
                output: { stone: 8, gold: 3, exp: 2 },
                duration: 6000,
                workers: []
            },
            {
                id: 4,
                name: '農田耕作',
                type: 'farming',
                requiredAttr: 'hp',
                minAttrValue: 60,
                output: { food: 15, exp: 1 },
                duration: 4000,
                workers: []
            }
        ];

        // 時間追蹤
        this.lastSaveTime = Date.now();
        this.totalPlayTime = 0;

        // 工作進度追蹤（角色在各站點的工作進度）
        this.workProgress = {}; // { characterId: { stationId: accumulatedTime } }
    }

    /**
     * 派遣角色到互動點
     */
    assignCharacter(characterId, stationId) {
        const character = this.characters.find(c => c.id === characterId);
        const station = this.stations.find(s => s.id === stationId);

        if (!character || !station) {
            return { success: false, error: '角色或互動點不存在' };
        }

        if (character.state !== 'idle') {
            return { success: false, error: '角色正在工作中' };
        }

        // 檢查屬性需求
        const attrValue = character[station.requiredAttr];
        if (attrValue < station.minAttrValue) {
            return {
                success: false,
                error: `需要 ${station.requiredAttr} >= ${station.minAttrValue}，當前: ${attrValue}`
            };
        }

        // 派遣成功
        character.state = 'working';
        character.assignedTo = stationId;
        station.workers.push(characterId);

        // 初始化工作進度
        if (!this.workProgress[characterId]) {
            this.workProgress[characterId] = {};
        }
        this.workProgress[characterId][stationId] = 0;

        return { success: true };
    }

    /**
     * 召回角色
     */
    recallCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (!character || character.state === 'idle') {
            return { success: false, error: '角色未在工作' };
        }

        const stationId = character.assignedTo;
        const station = this.stations.find(s => s.id === stationId);

        if (station) {
            station.workers = station.workers.filter(id => id !== characterId);
        }

        character.state = 'idle';
        character.assignedTo = null;

        return { success: true };
    }

    /**
     * 核心時間系統 - 處理資源產出
     */
    tick(deltaTime) {
        this.totalPlayTime += deltaTime;

        this.characters.forEach(character => {
            if (character.state !== 'working') return;

            const stationId = character.assignedTo;
            const station = this.stations.find(s => s.id === stationId);
            if (!station) return;

            // 累積工作時間
            if (!this.workProgress[character.id]) {
                this.workProgress[character.id] = {};
            }
            if (!this.workProgress[character.id][stationId]) {
                this.workProgress[character.id][stationId] = 0;
            }

            this.workProgress[character.id][stationId] += deltaTime;

            // 檢查是否完成一個週期
            if (this.workProgress[character.id][stationId] >= station.duration) {
                const cycles = Math.floor(this.workProgress[character.id][stationId] / station.duration);
                this.workProgress[character.id][stationId] %= station.duration;

                // 產出資源
                this.produceResources(station, character, cycles);
            }
        });
    }

    /**
     * 產出資源
     */
    produceResources(station, character, cycles = 1) {
        const produced = {};

        Object.keys(station.output).forEach(resourceType => {
            const amount = station.output[resourceType] * cycles;

            if (resourceType === 'exp') {
                character.exp += amount;
                this.checkLevelUp(character);
            } else if (this.resources.hasOwnProperty(resourceType)) {
                this.resources[resourceType] += amount;
                produced[resourceType] = amount;
            }
        });

        return produced;
    }

    /**
     * 檢查角色升級
     */
    checkLevelUp(character) {
        const expNeeded = this.getExpForNextLevel(character.level);

        while (character.exp >= expNeeded) {
            character.exp -= expNeeded;
            character.level++;

            // 升級獎勵
            character.atk += 2;
            character.int += 2;
            character.maxHp += 10;
            character.hp = character.maxHp;

            console.log(`${character.name} 升級到 Lv.${character.level}！`);
        }
    }

    /**
     * 計算升級所需經驗
     */
    getExpForNextLevel(currentLevel) {
        return Math.floor(10 * Math.pow(1.5, currentLevel - 1));
    }

    /**
     * 計算離線掛機收益
     */
    calculateOfflineProgress() {
        const now = Date.now();
        const offlineTime = now - this.lastSaveTime;

        if (offlineTime < 1000) {
            return null; // 少於1秒不計算
        }

        // 離線時間上限：8小時
        const maxOfflineTime = 8 * 60 * 60 * 1000;
        const actualOfflineTime = Math.min(offlineTime, maxOfflineTime);

        // 執行時間計算
        this.tick(actualOfflineTime);

        return {
            duration: actualOfflineTime,
            durationInMinutes: Math.floor(actualOfflineTime / 60000)
        };
    }

    /**
     * 存檔
     */
    save() {
        this.lastSaveTime = Date.now();

        const saveData = {
            resources: this.resources,
            characters: this.characters,
            stations: this.stations,
            lastSaveTime: this.lastSaveTime,
            totalPlayTime: this.totalPlayTime,
            workProgress: this.workProgress
        };

        try {
            localStorage.setItem('gameState', JSON.stringify(saveData));
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
            const saveData = localStorage.getItem('gameState');
            if (!saveData) {
                return { success: false, error: '沒有存檔' };
            }

            const data = JSON.parse(saveData);

            this.resources = data.resources;
            this.characters = data.characters;
            this.stations = data.stations;
            this.lastSaveTime = data.lastSaveTime;
            this.totalPlayTime = data.totalPlayTime || 0;
            this.workProgress = data.workProgress || {};

            return { success: true };
        } catch (error) {
            console.error('讀檔失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 重置遊戲
     */
    reset() {
        localStorage.removeItem('gameState');
        // 重新初始化
        Object.assign(this, new GameState());
    }
}

module.exports = GameState;
