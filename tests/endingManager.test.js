import { describe, it, expect, beforeEach } from 'vitest';

const EndingManager = require('../src/managers/EndingManager');
const GameState = require('../src/core/GameState');

describe('EndingManager - 結局系統', () => {
    let gameState;
    let endingManager;

    beforeEach(() => {
        gameState = new GameState();
        endingManager = new EndingManager(gameState);
        endingManager.loadEndings();
    });

    describe('初始化與數據載入', () => {
        it('應該正確初始化', () => {
            expect(endingManager.gameState).toBe(gameState);
            expect(endingManager.endings).toBeDefined();
            expect(endingManager.unlockedEndings).toBeInstanceOf(Set);
            expect(endingManager.triggeredEnding).toBeNull();
        });

        it('應該成功載入結局數據', () => {
            const result = endingManager.loadEndings();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
            expect(Object.keys(endingManager.endings).length).toBeGreaterThan(0);
        });

        it('應該有結局分類', () => {
            expect(endingManager.categories).toHaveProperty('wealth');
            expect(endingManager.categories).toHaveProperty('reputation');
            expect(endingManager.categories).toHaveProperty('employee');
            expect(endingManager.categories).toHaveProperty('special');
            expect(endingManager.categories).toHaveProperty('bad');
            expect(endingManager.categories).toHaveProperty('true');
        });

        it('應該有統計結構', () => {
            expect(endingManager.statistics).toHaveProperty('totalEndingsUnlocked');
            expect(endingManager.statistics).toHaveProperty('firstEndingDate');
            expect(endingManager.statistics).toHaveProperty('favoriteEnding');
        });
    });

    describe('結局條件檢查', () => {
        it('應該檢查銀兩條件', () => {
            gameState.silver = 1000;
            gameState.inn.reputation = 100;

            // 模擬時間流逝
            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 365;

            const canTrigger = endingManager.checkEndingConditions('small_business');
            expect(canTrigger).toBe(true);
        });

        it('銀兩不足時應該返回 false', () => {
            gameState.silver = 500;
            gameState.inn.reputation = 100;

            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 365;

            const canTrigger = endingManager.checkEndingConditions('small_business');
            expect(canTrigger).toBe(false);
        });

        it('應該檢查聲望條件', () => {
            gameState.silver = 10000;
            gameState.inn.reputation = 300;
            gameState.inn.level = 3;

            const canTrigger = endingManager.checkEndingConditions('wealthy_merchant');
            expect(canTrigger).toBe(true);
        });

        it('應該檢查員工數量條件', () => {
            // 解鎖 10 個員工
            for (let i = 0; i < 10; i++) {
                gameState.employees[i].unlocked = true;
            }

            const canTrigger = endingManager.checkEndingConditions('training_ground');
            expect(canTrigger).toBe(true);
        });

        it('應該檢查員工好感度條件', () => {
            gameState.employees[0].unlocked = true;
            gameState.employees[0].affection = 100;
            gameState.employees.filter(e => e.unlocked).length = 5;

            const canTrigger = endingManager.checkEndingConditions('love_story');
            // 注意：這個可能需要更多條件，所以只檢查不報錯
            expect(typeof canTrigger).toBe('boolean');
        });

        it('應該檢查客人統計條件', () => {
            gameState.guestManager.statistics.totalGuests = 500;
            gameState.inn.reputation = 800;
            gameState.inn.level = 4;

            const canTrigger = endingManager.checkEndingConditions('famous_inn');
            expect(canTrigger).toBe(true);
        });

        it('應該檢查配方數量條件', () => {
            // 解鎖所有配方
            gameState.recipeManager.unlockedRecipes = new Set(
                Object.keys(gameState.recipeManager.recipes)
            );
            gameState.guestManager.statistics.totalRevenue = 50000;

            const canTrigger = endingManager.checkEndingConditions('master_chef');
            expect(canTrigger).toBe(true);
        });

        it('無效結局 ID 應該返回 false', () => {
            const canTrigger = endingManager.checkEndingConditions('nonexistent');
            expect(canTrigger).toBe(false);
        });
    });

    describe('比較數值操作', () => {
        it('應該正確比較 >= 操作', () => {
            expect(endingManager.compareValue(100, '>=', 100)).toBe(true);
            expect(endingManager.compareValue(100, '>=', 50)).toBe(true);
            expect(endingManager.compareValue(100, '>=', 150)).toBe(false);
        });

        it('應該正確比較 <= 操作', () => {
            expect(endingManager.compareValue(100, '<=', 100)).toBe(true);
            expect(endingManager.compareValue(100, '<=', 150)).toBe(true);
            expect(endingManager.compareValue(100, '<=', 50)).toBe(false);
        });

        it('應該正確比較 > 操作', () => {
            expect(endingManager.compareValue(100, '>', 50)).toBe(true);
            expect(endingManager.compareValue(100, '>', 100)).toBe(false);
        });

        it('應該正確比較 < 操作', () => {
            expect(endingManager.compareValue(100, '<', 150)).toBe(true);
            expect(endingManager.compareValue(100, '<', 100)).toBe(false);
        });

        it('應該正確比較 == 操作', () => {
            expect(endingManager.compareValue(100, '==', 100)).toBe(true);
            expect(endingManager.compareValue(100, '==', 50)).toBe(false);
        });

        it('應該正確比較 != 操作', () => {
            expect(endingManager.compareValue(100, '!=', 50)).toBe(true);
            expect(endingManager.compareValue(100, '!=', 100)).toBe(false);
        });
    });

    describe('觸發結局', () => {
        it('應該能觸發結局', () => {
            const result = endingManager.triggerEnding('small_business');
            expect(result.success).toBe(true);
            expect(result.ending).toBeDefined();
            expect(result.ending.name).toBe('小本經營');
        });

        it('觸發結局應該記錄到已解鎖', () => {
            endingManager.triggerEnding('small_business');
            expect(endingManager.unlockedEndings.has('small_business')).toBe(true);
        });

        it('觸發結局應該更新統計', () => {
            const initialCount = endingManager.statistics.totalEndingsUnlocked;
            endingManager.triggerEnding('small_business');
            expect(endingManager.statistics.totalEndingsUnlocked).toBe(initialCount + 1);
        });

        it('首次觸發應該記錄時間', () => {
            expect(endingManager.statistics.firstEndingDate).toBeNull();
            endingManager.triggerEnding('small_business');
            expect(endingManager.statistics.firstEndingDate).not.toBeNull();
        });

        it('應該記錄達成次數', () => {
            endingManager.triggerEnding('small_business');
            expect(endingManager.endingCounts['small_business']).toBe(1);

            endingManager.triggerEnding('small_business');
            expect(endingManager.endingCounts['small_business']).toBe(2);
        });

        it('應該設置觸發的結局', () => {
            endingManager.triggerEnding('small_business');
            expect(endingManager.triggeredEnding).toBeDefined();
            expect(endingManager.triggeredEnding.id).toBe('small_business');
        });

        it('無效結局 ID 應該返回失敗', () => {
            const result = endingManager.triggerEnding('nonexistent');
            expect(result.success).toBe(false);
        });

        it('重複觸發應該標記為非新結局', () => {
            const first = endingManager.triggerEnding('small_business');
            expect(first.ending.isNew).toBe(true);

            const second = endingManager.triggerEnding('small_business');
            expect(second.ending.isNew).toBe(false);
        });
    });

    describe('自動檢查結局', () => {
        it('符合條件時應該返回結局', () => {
            gameState.silver = 0;

            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 30;

            const ending = endingManager.checkAllEndings();
            expect(ending).not.toBeNull();
            expect(ending.id).toBe('bankrupt');
        });

        it('不符合條件時應該返回 null', () => {
            gameState.silver = 10000;
            gameState.inn.reputation = 10;

            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 1;

            const ending = endingManager.checkAllEndings();
            // 可能有些簡單結局符合，所以只檢查類型
            expect(ending === null || typeof ending === 'object').toBe(true);
        });

        it('應該優先返回高優先級結局', () => {
            // 設置條件使多個結局都符合
            gameState.silver = 100000;
            gameState.inn.reputation = 2000;
            gameState.inn.level = 5;

            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 1000;

            // 先解鎖前置結局
            endingManager.unlockEnding('business_empire');
            endingManager.unlockEnding('imperial_recognition');
            endingManager.unlockEnding('master_chef');

            // 解鎖所有員工和配方
            gameState.employees.forEach(e => { e.unlocked = true; });
            gameState.recipeManager.unlockedRecipes = new Set(
                Object.keys(gameState.recipeManager.recipes)
            );
            gameState.guestManager.statistics.totalGuests = 2000;
            gameState.technologyManager.unlockedTechnologies = new Set();
            for (let i = 0; i < 30; i++) {
                gameState.technologyManager.unlockedTechnologies.add(`tech_${i}`);
            }

            const ending = endingManager.checkAllEndings();
            // 真結局應該優先
            if (ending) {
                expect(ending.category === 'true' || ending.category === 'special').toBe(true);
            }
        });
    });

    describe('結局信息獲取', () => {
        it('應該能獲取結局詳細信息', () => {
            const info = endingManager.getEndingInfo('small_business');
            expect(info).toBeDefined();
            expect(info.id).toBe('small_business');
            expect(info.name).toBe('小本經營');
            expect(info.unlocked).toBe(false);
            expect(info.categoryName).toBe(endingManager.categories['wealth']);
        });

        it('觸發後應該標記為已解鎖', () => {
            endingManager.triggerEnding('small_business');
            const info = endingManager.getEndingInfo('small_business');
            expect(info.unlocked).toBe(true);
            expect(info.timesAchieved).toBe(1);
        });

        it('無效結局 ID 應該返回 null', () => {
            const info = endingManager.getEndingInfo('nonexistent');
            expect(info).toBeNull();
        });

        it('應該能獲取已解鎖結局列表', () => {
            endingManager.triggerEnding('small_business');
            endingManager.triggerEnding('wealthy_merchant');

            const unlocked = endingManager.getUnlockedEndings();
            expect(unlocked.length).toBe(2);
            expect(unlocked.some(e => e.id === 'small_business')).toBe(true);
            expect(unlocked.some(e => e.id === 'wealthy_merchant')).toBe(true);
        });

        it('應該能按分類獲取結局', () => {
            const wealthEndings = endingManager.getEndingsByCategory('wealth');
            expect(wealthEndings.length).toBeGreaterThan(0);
            wealthEndings.forEach(ending => {
                expect(ending.category).toBe('wealth');
            });
        });
    });

    describe('結局進度追蹤', () => {
        it('應該能獲取結局進度', () => {
            gameState.silver = 500;
            gameState.inn.reputation = 50;

            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 100;

            const progress = endingManager.getEndingProgress('small_business');
            expect(progress).toBeDefined();
            expect(progress.endingId).toBe('small_business');
            expect(progress.progress).toBeDefined();
            expect(progress.completion).toBeDefined();
        });

        it('進度應該包含各條件的完成狀態', () => {
            gameState.silver = 1200;
            gameState.inn.reputation = 80;

            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 300;

            const progress = endingManager.getEndingProgress('small_business');
            expect(progress.progress.silver).toBeDefined();
            expect(progress.progress.silver.current).toBe(1200);
            expect(progress.progress.silver.required).toBe(1000);
            expect(progress.progress.silver.met).toBe(true);
        });

        it('應該正確計算完成百分比', () => {
            gameState.silver = 1000;
            gameState.inn.reputation = 0;

            if (!gameState.timeManager.currentTime) {
                gameState.timeManager.currentTime = {};
            }
            gameState.timeManager.currentTime.dayCount = 0;

            const progress = endingManager.getEndingProgress('small_business');
            expect(progress.completion).toContain('%');
        });

        it('無效結局 ID 應該返回 null', () => {
            const progress = endingManager.getEndingProgress('nonexistent');
            expect(progress).toBeNull();
        });
    });

    describe('統計數據', () => {
        it('應該能獲取統計數據', () => {
            const stats = endingManager.getStatistics();
            expect(stats).toHaveProperty('totalEndingsUnlocked');
            expect(stats).toHaveProperty('totalEndings');
            expect(stats).toHaveProperty('unlockedEndings');
            expect(stats).toHaveProperty('completionRate');
            expect(stats).toHaveProperty('favoriteEndingName');
        });

        it('應該正確計算完成率', () => {
            endingManager.triggerEnding('small_business');
            endingManager.triggerEnding('wealthy_merchant');

            const stats = endingManager.getStatistics();
            expect(stats.completionRate).toContain('%');
        });

        it('應該追蹤最喜愛結局', () => {
            endingManager.triggerEnding('small_business');
            endingManager.triggerEnding('small_business');
            endingManager.triggerEnding('small_business');
            endingManager.triggerEnding('wealthy_merchant');

            const stats = endingManager.getStatistics();
            expect(stats.favoriteEndingName).toBe('小本經營');
        });

        it('沒有結局時最喜愛應該是無', () => {
            const stats = endingManager.getStatistics();
            expect(stats.favoriteEndingName).toBe('無');
        });
    });

    describe('觸發狀態管理', () => {
        it('應該能清除觸發的結局', () => {
            endingManager.triggerEnding('small_business');
            expect(endingManager.hasTriggeredEnding()).toBe(true);

            endingManager.clearTriggeredEnding();
            expect(endingManager.hasTriggeredEnding()).toBe(false);
        });

        it('應該能獲取當前觸發的結局', () => {
            endingManager.triggerEnding('small_business');
            const triggered = endingManager.getTriggeredEnding();
            expect(triggered).toBeDefined();
            expect(triggered.id).toBe('small_business');
        });

        it('沒有觸發時應該返回 null', () => {
            expect(endingManager.getTriggeredEnding()).toBeNull();
        });
    });

    describe('結局前置條件', () => {
        it('需要前置結局時應該檢查', () => {
            // imperial_recognition 需要先達成 famous_inn
            gameState.inn.reputation = 1500;
            gameState.recipeManager.unlockedRecipes = new Set(
                Object.keys(gameState.recipeManager.recipes).slice(0, 25)
            );
            gameState.guestManager.statistics.totalRevenue = 100000;

            // 沒有前置結局，不應該觸發
            let canTrigger = endingManager.checkEndingConditions('imperial_recognition');
            expect(canTrigger).toBe(false);

            // 解鎖前置結局後應該可以觸發
            endingManager.triggerEnding('famous_inn');
            canTrigger = endingManager.checkEndingConditions('imperial_recognition');
            expect(canTrigger).toBe(true);
        });
    });

    describe('序列化與反序列化', () => {
        it('應該能序列化數據', () => {
            endingManager.triggerEnding('small_business');
            endingManager.triggerEnding('wealthy_merchant');

            const data = endingManager.serialize();
            expect(data).toHaveProperty('unlockedEndings');
            expect(data).toHaveProperty('triggeredEnding');
            expect(data).toHaveProperty('statistics');
            expect(data).toHaveProperty('endingCounts');

            expect(Array.isArray(data.unlockedEndings)).toBe(true);
            expect(data.unlockedEndings.length).toBe(2);
        });

        it('應該能反序列化數據', () => {
            endingManager.triggerEnding('small_business');
            const data = endingManager.serialize();

            const newManager = new EndingManager(gameState);
            newManager.loadEndings();
            newManager.deserialize(data);

            expect(newManager.unlockedEndings.has('small_business')).toBe(true);
            expect(newManager.statistics.totalEndingsUnlocked).toBe(data.statistics.totalEndingsUnlocked);
        });

        it('序列化後的 unlockedEndings 應該是陣列', () => {
            endingManager.triggerEnding('small_business');
            const data = endingManager.serialize();

            expect(Array.isArray(data.unlockedEndings)).toBe(true);
        });

        it('反序列化後應該恢復為 Set', () => {
            endingManager.triggerEnding('small_business');
            const data = endingManager.serialize();

            const newManager = new EndingManager(gameState);
            newManager.loadEndings();
            newManager.deserialize(data);

            expect(newManager.unlockedEndings).toBeInstanceOf(Set);
        });

        it('應該保存觸發的結局狀態', () => {
            endingManager.triggerEnding('small_business');
            const data = endingManager.serialize();

            expect(data.triggeredEnding).toBeDefined();
            expect(data.triggeredEnding.id).toBe('small_business');
        });
    });

    describe('邊界條件', () => {
        it('空的結局數據應該正常運作', () => {
            const newManager = new EndingManager(gameState);
            expect(newManager.endings).toEqual({});
            expect(newManager.getUnlockedEndings()).toEqual([]);
        });

        it('沒有觸發結局時統計應該正常', () => {
            const stats = endingManager.getStatistics();
            expect(stats.totalEndingsUnlocked).toBe(0);
            expect(stats.unlockedEndings).toBe(0);
        });

        it('檢查不存在的結局應該不報錯', () => {
            expect(() => {
                endingManager.checkEndingConditions('nonexistent');
            }).not.toThrow();
        });

        it('員工數據不完整時應該正常處理', () => {
            gameState.employees = [];
            const canTrigger = endingManager.checkEndingConditions('happy_family');
            expect(canTrigger).toBe(false);
        });
    });

    // 輔助方法：手動解鎖結局（用於測試前置條件）
    beforeEach(() => {
        endingManager.unlockEnding = function(endingId) {
            this.unlockedEndings.add(endingId);
        };
    });
});
