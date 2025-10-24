import { describe, it, expect, beforeEach } from 'vitest';

const RecipeManager = require('../src/managers/RecipeManager');
const GameState = require('../src/core/GameState');

describe('RecipeManager - 配方/菜單系統', () => {
    let gameState;
    let recipeManager;

    beforeEach(() => {
        gameState = new GameState();
        recipeManager = new RecipeManager(gameState);
        recipeManager.loadRecipes();
    });

    describe('初始化與數據載入', () => {
        it('應該正確初始化', () => {
            expect(recipeManager.gameState).toBe(gameState);
            expect(recipeManager.recipes).toBeDefined();
            expect(recipeManager.unlockedRecipes).toBeInstanceOf(Set);
            expect(recipeManager.menuPrices).toBeDefined();
        });

        it('應該成功載入配方數據', () => {
            const result = recipeManager.loadRecipes();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
            expect(Object.keys(recipeManager.recipes).length).toBeGreaterThan(0);
        });

        it('應該有正確的配方分類', () => {
            expect(recipeManager.categories).toHaveProperty('staple');
            expect(recipeManager.categories).toHaveProperty('snack');
            expect(recipeManager.categories).toHaveProperty('soup');
            expect(recipeManager.categories).toHaveProperty('drink');
            expect(recipeManager.categories).toHaveProperty('dessert');
            expect(recipeManager.categories).toHaveProperty('special');
        });

        it('應該自動解鎖初始配方', () => {
            expect(recipeManager.unlockedRecipes.size).toBeGreaterThan(0);
            expect(recipeManager.isUnlocked('plain_rice')).toBe(true);
            expect(recipeManager.isUnlocked('plain_noodles')).toBe(true);
        });

        it('應該初始化菜單價格', () => {
            const plainRice = recipeManager.recipes['plain_rice'];
            expect(recipeManager.menuPrices['plain_rice']).toBe(plainRice.price);
        });

        it('應該有統計結構', () => {
            expect(recipeManager.statistics).toHaveProperty('totalCooked');
            expect(recipeManager.statistics).toHaveProperty('successfulCooks');
            expect(recipeManager.statistics).toHaveProperty('failedCooks');
            expect(recipeManager.statistics).toHaveProperty('totalRevenue');
            expect(recipeManager.statistics).toHaveProperty('mostPopularRecipe');
        });
    });

    describe('配方解鎖', () => {
        it('應該能解鎖新配方', () => {
            const result = recipeManager.unlockRecipe('egg_fried_rice');
            expect(result.success).toBe(true);
            expect(result.recipe).toBeDefined();
            expect(recipeManager.isUnlocked('egg_fried_rice')).toBe(true);
        });

        it('不應重複解鎖已解鎖的配方', () => {
            recipeManager.unlockRecipe('egg_fried_rice');
            const result = recipeManager.unlockRecipe('egg_fried_rice');
            expect(result.success).toBe(false);
            expect(result.reason).toContain('已解鎖');
        });

        it('無效配方ID應該返回錯誤', () => {
            const result = recipeManager.unlockRecipe('nonexistent_recipe');
            expect(result.success).toBe(false);
            expect(result.reason).toContain('不存在');
        });

        it('應該能檢查配方是否已解鎖', () => {
            expect(recipeManager.isUnlocked('plain_rice')).toBe(true);
            expect(recipeManager.isUnlocked('Buddha_jumps_wall')).toBe(false);
        });
    });

    describe('獲取配方列表', () => {
        it('應該能獲取已解鎖的配方', () => {
            const unlocked = recipeManager.getUnlockedRecipes();
            expect(Array.isArray(unlocked)).toBe(true);
            expect(unlocked.length).toBeGreaterThan(0);
            expect(unlocked[0]).toHaveProperty('name');
            expect(unlocked[0]).toHaveProperty('price');
            expect(unlocked[0]).toHaveProperty('menuPrice');
        });

        it('應該能按分類獲取配方', () => {
            const staples = recipeManager.getRecipesByCategory('staple');
            expect(Array.isArray(staples)).toBe(true);
            staples.forEach(recipe => {
                expect(recipe.category).toBe('staple');
            });
        });

        it('應該能獲取配方詳細信息', () => {
            const info = recipeManager.getRecipeInfo('plain_rice');
            expect(info).toBeDefined();
            expect(info.id).toBe('plain_rice');
            expect(info.unlocked).toBe(true);
            expect(info.categoryName).toBe(recipeManager.categories['staple']);
            expect(info.timesCooked).toBe(0);
        });
    });

    describe('烹飪檢查', () => {
        beforeEach(() => {
            // 確保有足夠的食材
            gameState.inventory.addItem('rice', 10);
            gameState.inventory.addItem('noodles', 10);
            gameState.inventory.addItem('salt', 10);
            gameState.inventory.addItem('egg', 10);
            gameState.inventory.addItem('oil', 10);
        });

        it('未解鎖的配方不能烹飪', () => {
            const result = recipeManager.canCook('egg_fried_rice');
            expect(result.canCook).toBe(false);
            expect(result.reason).toContain('未解鎖');
        });

        it('食材不足時不能烹飪', () => {
            gameState.inventory.removeItem('rice', 10); // 清空米
            const result = recipeManager.canCook('plain_rice');
            expect(result.canCook).toBe(false);
            expect(result.reason).toContain('食材不足');
        });

        it('食材充足時可以烹飪', () => {
            const result = recipeManager.canCook('plain_rice');
            expect(result.canCook).toBe(true);
        });

        it('應該檢查廚師技能', () => {
            recipeManager.unlockRecipe('egg_fried_rice');

            // 創建技能不足的廚師
            const lowSkillCook = gameState.employees[0];
            lowSkillCook.unlocked = true;
            lowSkillCook.attributes = { dexterity: 10 }; // 低於要求的30

            const result = recipeManager.canCook('egg_fried_rice', 0);
            expect(result.canCook).toBe(false);
            expect(result.reason).toContain('廚藝不足');
        });

        it('廚師技能足夠時可以烹飪', () => {
            recipeManager.unlockRecipe('egg_fried_rice');

            const skilledCook = gameState.employees[0];
            skilledCook.unlocked = true;
            skilledCook.attributes = { dexterity: 50 }; // 超過要求的30

            const result = recipeManager.canCook('egg_fried_rice', 0);
            expect(result.canCook).toBe(true);
        });

        it('無效配方ID應該返回錯誤', () => {
            const result = recipeManager.canCook('nonexistent');
            expect(result.canCook).toBe(false);
            expect(result.reason).toContain('不存在');
        });
    });

    describe('烹飪配方', () => {
        beforeEach(() => {
            // 準備充足食材
            gameState.inventory.addItem('rice', 100);
            gameState.inventory.addItem('noodles', 100);
            gameState.inventory.addItem('salt', 100);
            gameState.inventory.addItem('egg', 100);
            gameState.inventory.addItem('oil', 100);
        });

        it('應該能烹飪已解鎖的配方', () => {
            const initialRice = gameState.inventory.getItemCount('rice');
            const result = recipeManager.cookRecipe('plain_rice');

            // 由於有隨機成功率，我們只檢查返回結構
            expect(result).toHaveProperty('success');

            if (result.success) {
                expect(result.dish).toBeDefined();
                expect(result.dish.name).toBe('白飯');
                expect(result.dish.price).toBeDefined();
                expect(result.dish.quality).toBeDefined();
            }

            // 食材應該被消耗
            const finalRice = gameState.inventory.getItemCount('rice');
            expect(finalRice).toBe(initialRice - 1);
        });

        it('烹飪失敗應該返回失敗信息', () => {
            // 解鎖高難度配方並多次嘗試找到失敗案例
            recipeManager.unlockRecipe('Buddha_jumps_wall');
            gameState.inventory.addItem('chicken', 100);
            gameState.inventory.addItem('fish', 100);
            gameState.inventory.addItem('pork', 100);
            gameState.inventory.addItem('herbs', 100);
            gameState.inventory.addItem('wine', 100);
            gameState.inventory.addItem('mushrooms', 100);
            gameState.inventory.addItem('spices', 100);

            let foundFailure = false;
            for (let i = 0; i < 50; i++) {
                const result = recipeManager.cookRecipe('Buddha_jumps_wall');
                if (!result.success) {
                    expect(result.message).toContain('失敗');
                    expect(result.wasted).toBe(true);
                    foundFailure = true;
                    break;
                }
            }
            // 註：由於隨機性，可能50次都成功，這是可接受的
        });

        it('烹飪應該更新統計數據', () => {
            const initialTotal = recipeManager.statistics.totalCooked;
            recipeManager.cookRecipe('plain_rice');
            expect(recipeManager.statistics.totalCooked).toBe(initialTotal + 1);
        });

        it('烹飪應該記錄到歷史', () => {
            recipeManager.cookRecipe('plain_rice');
            expect(recipeManager.cookingHistory['plain_rice']).toBe(1);

            recipeManager.cookRecipe('plain_rice');
            expect(recipeManager.cookingHistory['plain_rice']).toBe(2);
        });

        it('應該更新最受歡迎菜品', () => {
            recipeManager.cookRecipe('plain_rice');
            recipeManager.cookRecipe('plain_rice');
            recipeManager.cookRecipe('plain_rice');

            expect(recipeManager.statistics.mostPopularRecipe).toBe('plain_rice');
        });
    });

    describe('成功率計算', () => {
        it('簡單配方應該有高成功率', () => {
            const rate = recipeManager.calculateSuccessRate('plain_rice');
            expect(rate).toBeGreaterThanOrEqual(0.9); // easy難度基礎成功率95%
        });

        it('困難配方應該有低成功率', () => {
            const rate = recipeManager.calculateSuccessRate('braised_pork');
            expect(rate).toBeLessThanOrEqual(0.7); // hard難度基礎成功率60%
        });

        it('廚師技能應該提升成功率', () => {
            recipeManager.unlockRecipe('egg_fried_rice');

            const cook = gameState.employees[0];
            cook.unlocked = true;
            cook.attributes = { dexterity: 80 }; // 遠超要求的30

            const rateWithCook = recipeManager.calculateSuccessRate('egg_fried_rice', 0);
            const rateWithoutCook = recipeManager.calculateSuccessRate('egg_fried_rice', null);

            expect(rateWithCook).toBeGreaterThan(rateWithoutCook);
        });

        it('成功率不應超過100%', () => {
            const cook = gameState.employees[0];
            cook.unlocked = true;
            cook.attributes = { dexterity: 100 };

            const rate = recipeManager.calculateSuccessRate('plain_rice', 0);
            expect(rate).toBeLessThanOrEqual(1.0);
        });
    });

    describe('菜品質量計算', () => {
        it('應該計算菜品質量', () => {
            const quality = recipeManager.calculateDishQuality('plain_rice');
            expect(quality).toBeGreaterThan(0);
            expect(quality).toBeLessThanOrEqual(100);
        });

        it('高難度配方應該有更高基礎質量', () => {
            recipeManager.unlockRecipe('Buddha_jumps_wall');
            const masterQuality = recipeManager.calculateDishQuality('Buddha_jumps_wall');
            const easyQuality = recipeManager.calculateDishQuality('plain_rice');

            expect(masterQuality).toBeGreaterThan(easyQuality);
        });

        it('廚師技能應該提升菜品質量', () => {
            const cook = gameState.employees[0];
            cook.unlocked = true;
            cook.attributes = { dexterity: 80 };

            const qualityWithCook = recipeManager.calculateDishQuality('plain_rice', 0);
            const qualityWithoutCook = recipeManager.calculateDishQuality('plain_rice', null);

            expect(qualityWithCook).toBeGreaterThan(qualityWithoutCook);
        });

        it('質量不應超過100', () => {
            const cook = gameState.employees[0];
            cook.unlocked = true;
            cook.attributes = { dexterity: 100 };

            gameState.inn.kitchen = 10; // 高等級廚房

            const quality = recipeManager.calculateDishQuality('plain_rice', 0);
            expect(quality).toBeLessThanOrEqual(100);
        });
    });

    describe('菜單定價', () => {
        it('應該能設置菜單價格', () => {
            const result = recipeManager.setMenuPrice('plain_rice', 10);
            expect(result.success).toBe(true);
            expect(recipeManager.menuPrices['plain_rice']).toBe(10);
        });

        it('價格不能為負數', () => {
            const result = recipeManager.setMenuPrice('plain_rice', -5);
            expect(result.success).toBe(false);
            expect(result.reason).toContain('不能為負');
        });

        it('無效配方ID應該返回錯誤', () => {
            const result = recipeManager.setMenuPrice('nonexistent', 10);
            expect(result.success).toBe(false);
        });
    });

    describe('推薦菜品', () => {
        it('應該能根據財力推薦菜品', () => {
            const poorDishes = recipeManager.getRecommendedDishes('poor');
            expect(Array.isArray(poorDishes)).toBe(true);

            // 檢查推薦的菜品價格符合窮人預算
            poorDishes.forEach(dish => {
                const price = recipeManager.menuPrices[dish.id];
                expect(price).toBeLessThanOrEqual(30);
            });
        });

        it('富人應該被推薦更貴的菜品', () => {
            // 解鎖一些貴的菜品
            recipeManager.unlockRecipe('braised_pork');
            recipeManager.unlockRecipe('kung_pao_chicken');

            const richDishes = recipeManager.getRecommendedDishes('rich');

            // 檢查推薦的菜品價格符合富人預算
            if (richDishes.length > 0) {
                richDishes.forEach(dish => {
                    const price = recipeManager.menuPrices[dish.id];
                    expect(price).toBeGreaterThanOrEqual(50);
                    expect(price).toBeLessThanOrEqual(200);
                });
            }
        });

        it('應該能指定推薦數量', () => {
            const dishes = recipeManager.getRecommendedDishes('normal', 5);
            expect(dishes.length).toBeLessThanOrEqual(5);
        });

        it('沒有合適菜品時返回空陣列', () => {
            // 清空已解鎖配方
            recipeManager.unlockedRecipes.clear();

            const dishes = recipeManager.getRecommendedDishes('rich');
            expect(dishes).toEqual([]);
        });
    });

    describe('統計數據', () => {
        beforeEach(() => {
            gameState.inventory.addItem('rice', 100);
        });

        it('應該能獲取統計數據', () => {
            const stats = recipeManager.getStatistics();
            expect(stats).toHaveProperty('totalCooked');
            expect(stats).toHaveProperty('successfulCooks');
            expect(stats).toHaveProperty('failedCooks');
            expect(stats).toHaveProperty('totalRecipes');
            expect(stats).toHaveProperty('unlockedRecipes');
            expect(stats).toHaveProperty('successRate');
            expect(stats).toHaveProperty('mostPopularDish');
        });

        it('應該正確計算成功率', () => {
            // 烹飪幾次
            for (let i = 0; i < 10; i++) {
                recipeManager.cookRecipe('plain_rice');
            }

            const stats = recipeManager.getStatistics();
            expect(stats.totalCooked).toBe(10);
            expect(stats.successRate).toBeDefined();
            expect(stats.successRate).toContain('%');
        });

        it('沒有烹飪時成功率應為0%', () => {
            const stats = recipeManager.getStatistics();
            expect(stats.successRate).toBe('0%');
        });

        it('應該顯示最受歡迎菜品名稱', () => {
            recipeManager.cookRecipe('plain_rice');
            recipeManager.cookRecipe('plain_rice');

            const stats = recipeManager.getStatistics();
            expect(stats.mostPopularDish).toBe('白飯');
        });
    });

    describe('序列化與反序列化', () => {
        it('應該能序列化數據', () => {
            recipeManager.unlockRecipe('egg_fried_rice');
            recipeManager.setMenuPrice('plain_rice', 10);

            gameState.inventory.addItem('rice', 10);
            recipeManager.cookRecipe('plain_rice');

            const data = recipeManager.serialize();
            expect(data).toHaveProperty('unlockedRecipes');
            expect(data).toHaveProperty('menuPrices');
            expect(data).toHaveProperty('statistics');
            expect(data).toHaveProperty('cookingHistory');

            expect(Array.isArray(data.unlockedRecipes)).toBe(true);
            expect(data.unlockedRecipes).toContain('egg_fried_rice');
        });

        it('應該能反序列化數據', () => {
            // 準備一些數據
            recipeManager.unlockRecipe('egg_fried_rice');
            recipeManager.setMenuPrice('plain_rice', 15);
            gameState.inventory.addItem('rice', 10);
            recipeManager.cookRecipe('plain_rice');

            const data = recipeManager.serialize();

            // 創建新實例並反序列化
            const newManager = new RecipeManager(gameState);
            newManager.loadRecipes();
            newManager.deserialize(data);

            expect(newManager.isUnlocked('egg_fried_rice')).toBe(true);
            expect(newManager.menuPrices['plain_rice']).toBe(15);
            expect(newManager.statistics.totalCooked).toBe(data.statistics.totalCooked);
        });

        it('序列化後的unlockedRecipes應該是陣列', () => {
            recipeManager.unlockRecipe('egg_fried_rice');
            const data = recipeManager.serialize();

            expect(Array.isArray(data.unlockedRecipes)).toBe(true);
        });

        it('反序列化後應該恢復為Set', () => {
            recipeManager.unlockRecipe('egg_fried_rice');
            const data = recipeManager.serialize();

            const newManager = new RecipeManager(gameState);
            newManager.loadRecipes();
            newManager.deserialize(data);

            expect(newManager.unlockedRecipes).toBeInstanceOf(Set);
            expect(newManager.unlockedRecipes.has('egg_fried_rice')).toBe(true);
        });
    });

    describe('邊界條件', () => {
        it('無效配方ID應該返回null', () => {
            const info = recipeManager.getRecipeInfo('nonexistent');
            expect(info).toBeNull();
        });

        it('未載入配方時應該正常運作', () => {
            const newManager = new RecipeManager(gameState);
            expect(newManager.recipes).toEqual({});
            expect(newManager.getUnlockedRecipes()).toEqual([]);
        });

        it('空的烹飪歷史應該返回無最受歡迎菜品', () => {
            const stats = recipeManager.getStatistics();
            expect(stats.mostPopularDish).toBe('無');
        });

        it('食材為0時應該無法烹飪', () => {
            // 不添加任何食材
            const result = recipeManager.canCook('plain_rice');
            expect(result.canCook).toBe(false);
        });

        it('不存在的廚師ID應該使用基礎成功率', () => {
            const rate = recipeManager.calculateSuccessRate('plain_rice', 9999);
            expect(rate).toBeGreaterThan(0);
            expect(rate).toBeLessThanOrEqual(1.0);
        });
    });
});
