/**
 * 配方/菜單系統管理器
 * 管理菜譜解鎖、烹飪、定價等功能
 */
class RecipeManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 配方數據庫
        this.recipes = {};

        // 已解鎖的配方
        this.unlockedRecipes = new Set();

        // 菜單定價（可以自定義，默認使用配方價格）
        this.menuPrices = {};

        // 配方分類
        this.categories = {
            staple: '主食',
            snack: '小吃',
            soup: '湯品',
            drink: '酒水',
            dessert: '點心',
            special: '特色菜'
        };

        // 統計數據
        this.statistics = {
            totalCooked: 0,           // 總烹飪次數
            successfulCooks: 0,       // 成功次數
            failedCooks: 0,           // 失敗次數
            totalRevenue: 0,          // 總收入
            mostPopularRecipe: null   // 最受歡迎菜品
        };

        // 烹飪記錄（用於統計最受歡迎菜品）
        this.cookingHistory = {};
    }

    /**
     * 載入配方數據
     */
    loadRecipes() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data/recipes.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            this.recipes = JSON.parse(data);

            // 初始化菜單價格
            for (const [id, recipe] of Object.entries(this.recipes)) {
                this.menuPrices[id] = recipe.price;
            }

            // 解鎖初始配方（difficulty === 'easy' 的配方）
            for (const [id, recipe] of Object.entries(this.recipes)) {
                if (recipe.initialUnlocked) {
                    this.unlockedRecipes.add(id);
                }
            }

            return {
                success: true,
                count: Object.keys(this.recipes).length,
                initialUnlocked: this.unlockedRecipes.size
            };
        } catch (error) {
            console.error('Failed to load recipes:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 解鎖配方
     */
    unlockRecipe(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe) {
            return { success: false, reason: '配方不存在' };
        }

        if (this.unlockedRecipes.has(recipeId)) {
            return { success: false, reason: '配方已解鎖' };
        }

        this.unlockedRecipes.add(recipeId);

        // 通知
        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.success(
                '新配方解鎖',
                `學會了新菜式：${recipe.name}`
            );
        }

        return { success: true, recipe: recipe };
    }

    /**
     * 檢查配方是否已解鎖
     */
    isUnlocked(recipeId) {
        return this.unlockedRecipes.has(recipeId);
    }

    /**
     * 獲取已解鎖的配方
     */
    getUnlockedRecipes() {
        const unlocked = [];
        for (const recipeId of this.unlockedRecipes) {
            const recipe = this.recipes[recipeId];
            if (recipe) {
                unlocked.push({
                    ...recipe,
                    id: recipeId,
                    menuPrice: this.menuPrices[recipeId]
                });
            }
        }
        return unlocked;
    }

    /**
     * 按分類獲取已解鎖配方
     */
    getRecipesByCategory(category) {
        return this.getUnlockedRecipes().filter(r => r.category === category);
    }

    /**
     * 檢查是否可以烹飪
     */
    canCook(recipeId, cookerId = null) {
        const recipe = this.recipes[recipeId];
        if (!recipe) {
            return { canCook: false, reason: '配方不存在' };
        }

        // 1. 檢查是否已解鎖
        if (!this.unlockedRecipes.has(recipeId)) {
            return { canCook: false, reason: '配方未解鎖' };
        }

        // 2. 檢查食材
        if (recipe.ingredients) {
            for (const [ingredientId, quantity] of Object.entries(recipe.ingredients)) {
                const available = this.gameState.inventory?.getItemCount(ingredientId) || 0;
                if (available < quantity) {
                    const ingredientName = this.gameState.tradeManager?.getGoodInfo(ingredientId)?.name || ingredientId;
                    return {
                        canCook: false,
                        reason: `食材不足：${ingredientName}（需要 ${quantity}，當前 ${available}）`
                    };
                }
            }
        }

        // 3. 檢查廚師技能（如果指定了廚師）
        if (cookerId !== null && recipe.requiredSkill) {
            const cook = this.gameState.employees?.find(e => e.id === cookerId);
            if (!cook) {
                return { canCook: false, reason: '廚師不存在' };
            }

            const cookingSkill = cook.attributes?.dexterity || 0;
            if (cookingSkill < recipe.requiredSkill) {
                return {
                    canCook: false,
                    reason: `廚藝不足（需要 ${recipe.requiredSkill}，當前 ${cookingSkill}）`
                };
            }
        }

        return { canCook: true };
    }

    /**
     * 烹飪配方
     */
    cookRecipe(recipeId, cookerId = null) {
        // 檢查是否可以烹飪
        const check = this.canCook(recipeId, cookerId);
        if (!check.canCook) {
            return {
                success: false,
                message: check.reason
            };
        }

        const recipe = this.recipes[recipeId];

        // 消耗食材
        if (recipe.ingredients) {
            for (const [ingredientId, quantity] of Object.entries(recipe.ingredients)) {
                this.gameState.inventory?.removeItem(ingredientId, quantity);
            }
        }

        // 計算成功率
        const successRate = this.calculateSuccessRate(recipeId, cookerId);
        const success = Math.random() < successRate;

        // 更新統計
        this.statistics.totalCooked++;
        if (success) {
            this.statistics.successfulCooks++;
        } else {
            this.statistics.failedCooks++;
        }

        // 記錄烹飪歷史
        if (!this.cookingHistory[recipeId]) {
            this.cookingHistory[recipeId] = 0;
        }
        this.cookingHistory[recipeId]++;

        // 更新最受歡迎菜品
        this.updateMostPopular();

        if (!success) {
            return {
                success: false,
                message: `烹飪失敗！${recipe.name} 做壞了...`,
                wasted: true
            };
        }

        return {
            success: true,
            recipe: recipe,
            dish: {
                id: recipeId,
                name: recipe.name,
                price: this.menuPrices[recipeId],
                quality: this.calculateDishQuality(recipeId, cookerId)
            }
        };
    }

    /**
     * 計算烹飪成功率
     */
    calculateSuccessRate(recipeId, cookerId) {
        const recipe = this.recipes[recipeId];

        // 基礎成功率（根據難度）
        const baseRate = {
            'easy': 0.95,
            'normal': 0.80,
            'hard': 0.60,
            'master': 0.40
        }[recipe.difficulty] || 0.70;

        // 如果沒有指定廚師，使用基礎成功率
        if (cookerId === null) {
            return baseRate;
        }

        // 根據廚師技能調整
        const cook = this.gameState.employees?.find(e => e.id === cookerId);
        if (!cook) {
            return baseRate;
        }

        const cookingSkill = cook.attributes?.dexterity || 50;
        const requiredSkill = recipe.requiredSkill || 0;

        // 技能超過要求越多，成功率越高
        const skillBonus = Math.min(0.3, (cookingSkill - requiredSkill) / 100);

        return Math.min(1.0, baseRate + skillBonus);
    }

    /**
     * 計算菜品質量（影響滿意度）
     */
    calculateDishQuality(recipeId, cookerId) {
        const recipe = this.recipes[recipeId];

        // 基礎質量
        let quality = 50;

        // 配方本身的品質
        if (recipe.difficulty === 'master') quality += 30;
        else if (recipe.difficulty === 'hard') quality += 20;
        else if (recipe.difficulty === 'normal') quality += 10;

        // 廚師技能影響
        if (cookerId !== null) {
            const cook = this.gameState.employees?.find(e => e.id === cookerId);
            if (cook) {
                const cookingSkill = cook.attributes?.dexterity || 50;
                quality += Math.floor(cookingSkill / 2);
            }
        }

        // 廚房等級影響
        const kitchenLevel = this.gameState.inn?.kitchen || 1;
        quality += kitchenLevel * 2;

        return Math.min(100, quality);
    }

    /**
     * 設置菜單價格
     */
    setMenuPrice(recipeId, price) {
        if (!this.recipes[recipeId]) {
            return { success: false, reason: '配方不存在' };
        }

        if (price < 0) {
            return { success: false, reason: '價格不能為負' };
        }

        this.menuPrices[recipeId] = price;
        return { success: true, price: price };
    }

    /**
     * 獲取配方信息
     */
    getRecipeInfo(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe) {
            return null;
        }

        return {
            ...recipe,
            id: recipeId,
            unlocked: this.isUnlocked(recipeId),
            menuPrice: this.menuPrices[recipeId],
            categoryName: this.categories[recipe.category],
            timesCooked: this.cookingHistory[recipeId] || 0
        };
    }

    /**
     * 獲取推薦菜品（根據客人財力）
     */
    getRecommendedDishes(wealth, count = 3) {
        const priceRange = {
            'poor': [0, 30],
            'normal': [20, 80],
            'rich': [50, 200],
            'noble': [100, 500]
        }[wealth] || [10, 100];

        const available = this.getUnlockedRecipes().filter(r => {
            const price = this.menuPrices[r.id];
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // 隨機選擇
        const shuffled = available.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * 更新最受歡迎菜品
     */
    updateMostPopular() {
        let maxCount = 0;
        let mostPopular = null;

        for (const [recipeId, count] of Object.entries(this.cookingHistory)) {
            if (count > maxCount) {
                maxCount = count;
                mostPopular = recipeId;
            }
        }

        this.statistics.mostPopularRecipe = mostPopular;
    }

    /**
     * 獲取統計數據
     */
    getStatistics() {
        return {
            ...this.statistics,
            totalRecipes: Object.keys(this.recipes).length,
            unlockedRecipes: this.unlockedRecipes.size,
            successRate: this.statistics.totalCooked > 0
                ? (this.statistics.successfulCooks / this.statistics.totalCooked * 100).toFixed(1) + '%'
                : '0%',
            mostPopularDish: this.statistics.mostPopularRecipe
                ? this.recipes[this.statistics.mostPopularRecipe]?.name
                : '無'
        };
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            unlockedRecipes: Array.from(this.unlockedRecipes),
            menuPrices: { ...this.menuPrices },
            statistics: { ...this.statistics },
            cookingHistory: { ...this.cookingHistory }
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.unlockedRecipes) {
            this.unlockedRecipes = new Set(data.unlockedRecipes);
        }

        if (data.menuPrices) {
            this.menuPrices = { ...data.menuPrices };
        }

        if (data.statistics) {
            this.statistics = {
                ...this.statistics,
                ...data.statistics
            };
        }

        if (data.cookingHistory) {
            this.cookingHistory = { ...data.cookingHistory };
        }
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecipeManager;
}
