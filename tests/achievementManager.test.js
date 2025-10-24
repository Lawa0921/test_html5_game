import { describe, it, expect, beforeEach } from 'vitest';

const AchievementManager = require('../src/managers/AchievementManager');
const GameState = require('../src/core/GameState');

describe('AchievementManager - 成就系統', () => {
    let gameState;
    let achievementManager;

    beforeEach(() => {
        gameState = new GameState();
        achievementManager = new AchievementManager(gameState);
        achievementManager.loadAchievements();
    });

    describe('初始化與數據載入', () => {
        it('應該正確初始化', () => {
            expect(achievementManager.gameState).toBe(gameState);
            expect(achievementManager.achievements).toBeDefined();
            expect(achievementManager.unlockedAchievements).toBeInstanceOf(Set);
            expect(achievementManager.progress).toBeDefined();
        });

        it('應該成功載入成就數據', () => {
            const result = achievementManager.loadAchievements();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
            expect(Object.keys(achievementManager.achievements).length).toBeGreaterThan(0);
        });

        it('應該有成就分類', () => {
            expect(achievementManager.categories).toHaveProperty('wealth');
            expect(achievementManager.categories).toHaveProperty('reputation');
            expect(achievementManager.categories).toHaveProperty('cooking');
            expect(achievementManager.categories).toHaveProperty('service');
            expect(achievementManager.categories).toHaveProperty('employee');
            expect(achievementManager.categories).toHaveProperty('exploration');
            expect(achievementManager.categories).toHaveProperty('special');
        });

        it('應該初始化進度', () => {
            expect(Object.keys(achievementManager.progress).length).toBeGreaterThan(0);
        });

        it('應該有統計結構', () => {
            expect(achievementManager.statistics).toHaveProperty('totalAchievements');
            expect(achievementManager.statistics).toHaveProperty('unlockedAchievements');
            expect(achievementManager.statistics).toHaveProperty('totalPoints');
            expect(achievementManager.statistics).toHaveProperty('recentUnlocked');
        });
    });

    describe('成就條件檢查', () => {
        it('應該檢查銀兩條件', () => {
            gameState.totalSilver = 1000;
            const canUnlock = achievementManager.checkAchievementConditions('first_silver');
            expect(canUnlock).toBe(true);
        });

        it('銀兩不足時應該返回 false', () => {
            gameState.totalSilver = 500;
            const canUnlock = achievementManager.checkAchievementConditions('first_silver');
            expect(canUnlock).toBe(false);
        });

        it('應該檢查聲望條件', () => {
            gameState.inn.reputation = 500;
            const canUnlock = achievementManager.checkAchievementConditions('famous_inn');
            expect(canUnlock).toBe(true);
        });

        it('應該檢查客人數量條件', () => {
            gameState.guestManager.statistics.totalGuests = 100;
            const canUnlock = achievementManager.checkAchievementConditions('hundred_guests');
            expect(canUnlock).toBe(true);
        });

        it('應該檢查配方數量條件', () => {
            // 解鎖 15 個配方
            gameState.recipeManager.unlockedRecipes = new Set(
                Object.keys(gameState.recipeManager.recipes).slice(0, 15)
            );
            const canUnlock = achievementManager.checkAchievementConditions('recipe_collector');
            expect(canUnlock).toBe(true);
        });

        it('應該檢查員工數量條件', () => {
            // 解鎖所有員工
            gameState.employees.forEach(e => { e.unlocked = true; });
            const canUnlock = achievementManager.checkAchievementConditions('full_staff');
            expect(canUnlock).toBe(true);
        });

        it('應該檢查結局條件', () => {
            gameState.endingManager.unlockedEndings.add('legendary_inn');
            const canUnlock = achievementManager.checkAchievementConditions('true_ending');
            expect(canUnlock).toBe(true);
        });

        it('已解鎖的成就不應再檢查', () => {
            achievementManager.unlockedAchievements.add('first_silver');
            const canUnlock = achievementManager.checkAchievementConditions('first_silver');
            expect(canUnlock).toBe(false);
        });

        it('無效成就 ID 應該返回 false', () => {
            const canUnlock = achievementManager.checkAchievementConditions('nonexistent');
            expect(canUnlock).toBe(false);
        });
    });

    describe('解鎖成就', () => {
        it('應該能解鎖成就', () => {
            const result = achievementManager.unlockAchievement('first_silver');
            expect(result.success).toBe(true);
            expect(result.achievement).toBeDefined();
            expect(result.achievement.name).toBe('第一桶金');
        });

        it('解鎖後應該記錄到已解鎖集合', () => {
            achievementManager.unlockAchievement('first_silver');
            expect(achievementManager.unlockedAchievements.has('first_silver')).toBe(true);
        });

        it('解鎖應該更新統計', () => {
            const initialCount = achievementManager.statistics.unlockedAchievements;
            const initialPoints = achievementManager.statistics.totalPoints;

            achievementManager.unlockAchievement('first_silver');

            expect(achievementManager.statistics.unlockedAchievements).toBe(initialCount + 1);
            expect(achievementManager.statistics.totalPoints).toBeGreaterThan(initialPoints);
        });

        it('應該記錄到最近解鎖', () => {
            achievementManager.unlockAchievement('first_silver');
            expect(achievementManager.statistics.recentUnlocked.length).toBe(1);
            expect(achievementManager.statistics.recentUnlocked[0].id).toBe('first_silver');
        });

        it('最近解鎖應該限制在 10 個', () => {
            // 解鎖 15 個成就
            const achievementIds = Object.keys(achievementManager.achievements).slice(0, 15);
            achievementIds.forEach(id => {
                achievementManager.unlockAchievement(id);
            });

            expect(achievementManager.statistics.recentUnlocked.length).toBeLessThanOrEqual(10);
        });

        it('不應重複解鎖已解鎖的成就', () => {
            achievementManager.unlockAchievement('first_silver');
            const result = achievementManager.unlockAchievement('first_silver');
            expect(result.success).toBe(false);
            expect(result.reason).toContain('已解鎖');
        });

        it('無效成就 ID 應該返回失敗', () => {
            const result = achievementManager.unlockAchievement('nonexistent');
            expect(result.success).toBe(false);
        });

        it('解鎖應該發放獎勵', () => {
            const initialSilver = gameState.silver;
            achievementManager.unlockAchievement('wealthy_owner');

            // wealthy_owner 有 500 銀兩獎勵
            expect(gameState.silver).toBeGreaterThan(initialSilver);
        });
    });

    describe('進度更新', () => {
        it('應該能更新進度', () => {
            achievementManager.updateProgress('first_silver', 100);
            expect(achievementManager.progress['first_silver']).toBe(100);
        });

        it('進度累積應該正確', () => {
            achievementManager.updateProgress('first_silver', 50);
            achievementManager.updateProgress('first_silver', 30);
            expect(achievementManager.progress['first_silver']).toBe(80);
        });

        it('已解鎖的成就不應更新進度', () => {
            achievementManager.unlockAchievement('first_silver');
            const initialProgress = achievementManager.progress['first_silver'];

            achievementManager.updateProgress('first_silver', 100);
            expect(achievementManager.progress['first_silver']).toBe(initialProgress);
        });

        it('無效成就 ID 應該不報錯', () => {
            expect(() => {
                achievementManager.updateProgress('nonexistent', 100);
            }).not.toThrow();
        });
    });

    describe('自動檢查與解鎖', () => {
        it('符合條件時應該自動解鎖', () => {
            gameState.totalSilver = 1000;
            const result = achievementManager.checkAndUnlockAchievement('first_silver');
            expect(result).not.toBeNull();
            expect(result.success).toBe(true);
        });

        it('不符合條件時應該返回 null', () => {
            gameState.totalSilver = 500;
            const result = achievementManager.checkAndUnlockAchievement('first_silver');
            expect(result).toBeNull();
        });

        it('應該能批量檢查所有成就', () => {
            gameState.totalSilver = 10000;
            gameState.inn.reputation = 500;
            gameState.guestManager.statistics.totalGuests = 100;

            const results = achievementManager.checkAndUnlockAchievement();
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
        });
    });

    describe('獎勵發放', () => {
        it('應該發放銀兩獎勵', () => {
            const initialSilver = gameState.silver;
            achievementManager.grantRewards({ silver: 500 });
            expect(gameState.silver).toBe(initialSilver + 500);
        });

        it('應該發放聲望獎勵', () => {
            const initialReputation = gameState.inn.reputation;
            achievementManager.grantRewards({ reputation: 100 });
            expect(gameState.inn.reputation).toBe(initialReputation + 100);
        });

        it('應該發放物品獎勵', () => {
            const initialCount = gameState.inventory.getItemCount('rice') || 0;
            achievementManager.grantRewards({ items: { rice: 10 } });
            expect(gameState.inventory.getItemCount('rice')).toBe(initialCount + 10);
        });

        it('應該解鎖配方獎勵', () => {
            achievementManager.grantRewards({ unlockRecipe: 'egg_fried_rice' });
            expect(gameState.recipeManager.isUnlocked('egg_fried_rice')).toBe(true);
        });
    });

    describe('成就信息獲取', () => {
        it('應該能獲取成就詳細信息', () => {
            const info = achievementManager.getAchievementInfo('first_silver');
            expect(info).toBeDefined();
            expect(info.id).toBe('first_silver');
            expect(info.name).toBe('第一桶金');
            expect(info.unlocked).toBe(false);
            expect(info.categoryName).toBe(achievementManager.categories['wealth']);
        });

        it('解鎖後應該標記為已解鎖', () => {
            achievementManager.unlockAchievement('first_silver');
            const info = achievementManager.getAchievementInfo('first_silver');
            expect(info.unlocked).toBe(true);
        });

        it('無效成就 ID 應該返回 null', () => {
            const info = achievementManager.getAchievementInfo('nonexistent');
            expect(info).toBeNull();
        });

        it('應該能獲取已解鎖成就列表', () => {
            achievementManager.unlockAchievement('first_silver');
            achievementManager.unlockAchievement('first_guest');

            const unlocked = achievementManager.getUnlockedAchievements();
            expect(unlocked.length).toBe(2);
            expect(unlocked.some(a => a.id === 'first_silver')).toBe(true);
            expect(unlocked.some(a => a.id === 'first_guest')).toBe(true);
        });

        it('應該能按分類獲取成就', () => {
            const wealthAchievements = achievementManager.getAchievementsByCategory('wealth');
            expect(wealthAchievements.length).toBeGreaterThan(0);
            wealthAchievements.forEach(achievement => {
                expect(achievement.category).toBe('wealth');
            });
        });

        it('應該能獲取所有成就', () => {
            const all = achievementManager.getAllAchievements(false);
            expect(all.length).toBeGreaterThan(0);
        });

        it('應該能隱藏秘密成就', () => {
            const allWithSecret = achievementManager.getAllAchievements(false);
            const allWithoutSecret = achievementManager.getAllAchievements(true);

            expect(allWithSecret.length).toBeGreaterThanOrEqual(allWithoutSecret.length);
        });
    });

    describe('進度追蹤', () => {
        it('應該顯示進度百分比', () => {
            achievementManager.progress['first_silver'] = 500;
            const info = achievementManager.getAchievementInfo('first_silver');

            // 假設 first_silver 沒有 progressTarget，進度應該是 100
            expect(info.progressPercentage).toBeDefined();
        });

        it('累積型成就應該追蹤進度', () => {
            achievementManager.updateProgress('first_silver', 500);
            const info = achievementManager.getAchievementInfo('first_silver');
            expect(info.progress).toBe(500);
        });
    });

    describe('統計數據', () => {
        it('應該能獲取統計數據', () => {
            const stats = achievementManager.getStatistics();
            expect(stats).toHaveProperty('totalAchievements');
            expect(stats).toHaveProperty('unlockedAchievements');
            expect(stats).toHaveProperty('totalPoints');
            expect(stats).toHaveProperty('completionRate');
        });

        it('應該正確計算完成率', () => {
            achievementManager.unlockAchievement('first_silver');
            achievementManager.unlockAchievement('first_guest');

            const stats = achievementManager.getStatistics();
            expect(stats.completionRate).toContain('%');
        });

        it('應該累計總點數', () => {
            const initialPoints = achievementManager.statistics.totalPoints;

            achievementManager.unlockAchievement('first_silver');
            expect(achievementManager.statistics.totalPoints).toBeGreaterThan(initialPoints);
        });
    });

    describe('序列化與反序列化', () => {
        it('應該能序列化數據', () => {
            achievementManager.unlockAchievement('first_silver');
            achievementManager.updateProgress('wealthy_owner', 5000);

            const data = achievementManager.serialize();
            expect(data).toHaveProperty('unlockedAchievements');
            expect(data).toHaveProperty('progress');
            expect(data).toHaveProperty('statistics');

            expect(Array.isArray(data.unlockedAchievements)).toBe(true);
            expect(data.unlockedAchievements).toContain('first_silver');
        });

        it('應該能反序列化數據', () => {
            achievementManager.unlockAchievement('first_silver');
            achievementManager.updateProgress('wealthy_owner', 5000);
            const data = achievementManager.serialize();

            const newManager = new AchievementManager(gameState);
            newManager.loadAchievements();
            newManager.deserialize(data);

            expect(newManager.unlockedAchievements.has('first_silver')).toBe(true);
            expect(newManager.progress['wealthy_owner']).toBe(5000);
            expect(newManager.statistics.totalPoints).toBe(data.statistics.totalPoints);
        });

        it('序列化後的 unlockedAchievements 應該是陣列', () => {
            achievementManager.unlockAchievement('first_silver');
            const data = achievementManager.serialize();

            expect(Array.isArray(data.unlockedAchievements)).toBe(true);
        });

        it('反序列化後應該恢復為 Set', () => {
            achievementManager.unlockAchievement('first_silver');
            const data = achievementManager.serialize();

            const newManager = new AchievementManager(gameState);
            newManager.loadAchievements();
            newManager.deserialize(data);

            expect(newManager.unlockedAchievements).toBeInstanceOf(Set);
        });
    });

    describe('邊界條件', () => {
        it('空的成就數據應該正常運作', () => {
            const newManager = new AchievementManager(gameState);
            expect(newManager.achievements).toEqual({});
            expect(newManager.getUnlockedAchievements()).toEqual([]);
        });

        it('沒有解鎖成就時統計應該正常', () => {
            const stats = achievementManager.getStatistics();
            expect(stats.unlockedAchievements).toBe(0);
            expect(stats.totalPoints).toBe(0);
        });

        it('檢查不存在的成就應該不報錯', () => {
            expect(() => {
                achievementManager.checkAchievementConditions('nonexistent');
            }).not.toThrow();
        });

        it('發放空獎勵應該不報錯', () => {
            expect(() => {
                achievementManager.grantRewards({});
            }).not.toThrow();
        });
    });
});
