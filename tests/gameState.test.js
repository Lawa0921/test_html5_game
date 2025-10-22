import { describe, it, expect, beforeEach } from 'vitest';

// 在測試環境中模擬 localStorage
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

const GameState = require('../src/core/GameState');

describe('遊戲狀態管理', () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
        localStorage.clear();
    });

    describe('初始化', () => {
        it('應該有正確的初始資源', () => {
            expect(gameState.resources.gold).toBe(100);
            expect(gameState.resources.wood).toBe(50);
            expect(gameState.resources.stone).toBe(30);
        });

        it('應該有3個初始角色', () => {
            expect(gameState.characters.length).toBe(3);
            expect(gameState.characters[0].name).toBe('戰士');
            expect(gameState.characters[1].name).toBe('法師');
        });

        it('應該有4個互動點', () => {
            expect(gameState.stations.length).toBe(4);
            expect(gameState.stations[0].name).toBe('森林探險');
        });
    });

    describe('角色派遣系統', () => {
        it('應該能成功派遣符合條件的角色', () => {
            const result = gameState.assignCharacter(1, 1); // 戰士 -> 森林探險
            expect(result.success).toBe(true);
            expect(gameState.characters[0].state).toBe('working');
            expect(gameState.characters[0].assignedTo).toBe(1);
        });

        it('應該拒絕派遣不符合屬性需求的角色', () => {
            const result = gameState.assignCharacter(2, 1); // 法師(atk=4) -> 森林探險(需要atk>=5)
            expect(result.success).toBe(false);
            expect(result.error).toContain('atk');
        });

        it('應該拒絕派遣已在工作的角色', () => {
            gameState.assignCharacter(1, 1);
            const result = gameState.assignCharacter(1, 2);
            expect(result.success).toBe(false);
            expect(result.error).toContain('工作中');
        });

        it('應該能召回正在工作的角色', () => {
            gameState.assignCharacter(1, 1);
            const result = gameState.recallCharacter(1);
            expect(result.success).toBe(true);
            expect(gameState.characters[0].state).toBe('idle');
            expect(gameState.characters[0].assignedTo).toBeNull();
        });
    });

    describe('資源產出系統', () => {
        it('應該在完成一個週期後產出資源', () => {
            gameState.assignCharacter(1, 1); // 森林探險：5秒產出 gold+5, wood+10

            const initialGold = gameState.resources.gold;
            const initialWood = gameState.resources.wood;

            // 模擬5秒
            gameState.tick(5000);

            expect(gameState.resources.gold).toBe(initialGold + 5);
            expect(gameState.resources.wood).toBe(initialWood + 10);
        });

        it('應該在多個週期內正確累積資源', () => {
            gameState.assignCharacter(1, 1); // 5秒週期

            const initialGold = gameState.resources.gold;

            // 模擬15秒（3個週期）
            gameState.tick(15000);

            expect(gameState.resources.gold).toBe(initialGold + 15); // 5 * 3
        });

        it('未完成週期的時間應該被保留', () => {
            gameState.assignCharacter(1, 1); // 5秒週期

            // 先進行3秒
            gameState.tick(3000);
            const goldAfter3s = gameState.resources.gold;

            // 再進行3秒（總共6秒，應該完成一個週期）
            gameState.tick(3000);
            const goldAfter6s = gameState.resources.gold;

            expect(goldAfter6s).toBeGreaterThan(goldAfter3s);
        });

        it('多個角色應該能同時工作', () => {
            gameState.assignCharacter(1, 1); // 戰士 -> 森林探險
            gameState.assignCharacter(3, 3); // 工匠 -> 石礦開採

            const initialGold = gameState.resources.gold;
            const initialWood = gameState.resources.wood;
            const initialStone = gameState.resources.stone;

            // 模擬6秒
            gameState.tick(6000);

            // 森林探險應該完成1次（gold+5, wood+10）
            // 石礦應該完成1次（stone+8, gold+3）
            expect(gameState.resources.gold).toBe(initialGold + 5 + 3);
            expect(gameState.resources.wood).toBe(initialWood + 10);
            expect(gameState.resources.stone).toBe(initialStone + 8);
        });
    });

    describe('角色升級系統', () => {
        it('獲得足夠經驗後應該升級', () => {
            const character = gameState.characters[0];
            const initialLevel = character.level;
            const initialAtk = character.atk;

            // 獲得經驗
            character.exp = 20; // 足夠升級（Lv1需10exp）
            gameState.checkLevelUp(character);

            expect(character.level).toBeGreaterThan(initialLevel);
            expect(character.atk).toBeGreaterThan(initialAtk);
        });

        it('工作應該獲得經驗值', () => {
            gameState.assignCharacter(1, 1); // 森林探險每週期給3exp

            const character = gameState.characters[0];
            const initialExp = character.exp;

            gameState.tick(5000); // 完成一個週期

            expect(character.exp).toBeGreaterThan(initialExp);
        });
    });

    describe('存檔/讀檔系統', () => {
        it('應該能成功存檔', () => {
            const result = gameState.save();
            expect(result.success).toBe(true);
        });

        it('應該能讀取存檔並恢復狀態', () => {
            // 修改狀態
            gameState.resources.gold = 999;
            gameState.characters[0].level = 5;
            gameState.save();

            // 創建新實例並讀檔
            const newGameState = new GameState();
            const result = newGameState.load();

            expect(result.success).toBe(true);
            expect(newGameState.resources.gold).toBe(999);
            expect(newGameState.characters[0].level).toBe(5);
        });

        it('沒有存檔時讀檔應該失敗', () => {
            localStorage.clear();
            const result = gameState.load();
            expect(result.success).toBe(false);
        });
    });

    describe('離線掛機系統', () => {
        it('應該計算離線時間的資源產出', () => {
            gameState.assignCharacter(1, 1); // 森林探險

            // 設定上次存檔時間為10分鐘前
            gameState.lastSaveTime = Date.now() - 10 * 60 * 1000;

            const initialGold = gameState.resources.gold;

            const result = gameState.calculateOfflineProgress();

            expect(result).not.toBeNull();
            expect(result.durationInMinutes).toBeGreaterThanOrEqual(10);
            expect(gameState.resources.gold).toBeGreaterThan(initialGold);
        });

        it('離線時間應該有上限（8小時）', () => {
            gameState.assignCharacter(1, 1);

            // 設定上次存檔時間為24小時前
            gameState.lastSaveTime = Date.now() - 24 * 60 * 60 * 1000;

            const result = gameState.calculateOfflineProgress();

            // 應該被限制在8小時
            expect(result.durationInMinutes).toBeLessThanOrEqual(8 * 60);
        });

        it('少於1秒的離線時間不應該計算', () => {
            gameState.lastSaveTime = Date.now() - 500; // 0.5秒前

            const result = gameState.calculateOfflineProgress();

            expect(result).toBeNull();
        });
    });

    describe('遊戲時間追蹤', () => {
        it('應該正確累積遊戲時間', () => {
            const initialTime = gameState.totalPlayTime;

            gameState.tick(5000);
            gameState.tick(3000);

            expect(gameState.totalPlayTime).toBe(initialTime + 8000);
        });
    });

    describe('經驗值計算', () => {
        it('升級所需經驗應該隨等級增長', () => {
            const exp1 = gameState.getExpForNextLevel(1);
            const exp2 = gameState.getExpForNextLevel(2);
            const exp5 = gameState.getExpForNextLevel(5);

            expect(exp2).toBeGreaterThan(exp1);
            expect(exp5).toBeGreaterThan(exp2);
        });
    });
});
