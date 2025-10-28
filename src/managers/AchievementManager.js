/**
 * 成就系統管理器
 * 管理成就解鎖、進度追蹤、獎勵發放
 */
class AchievementManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 成就數據庫
        this.achievements = {};

        // 已解鎖的成就
        this.unlockedAchievements = new Set();

        // 成就進度（用於累積型成就）
        this.progress = {};

        // 成就分類
        this.categories = {
            wealth: '財富成就',
            reputation: '聲望成就',
            cooking: '烹飪成就',
            service: '服務成就',
            employee: '員工成就',
            exploration: '探索成就',
            special: '特殊成就'
        };

        // 統計數據
        this.statistics = {
            totalAchievements: 0,
            unlockedAchievements: 0,
            totalPoints: 0,           // 總成就點數
            recentUnlocked: []        // 最近解鎖的成就（最多保留 10 個）
        };
    }

    /**
     * 載入成就數據
     */
    loadAchievements() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data/achievements.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            this.achievements = JSON.parse(data);

            // 初始化進度
            for (const achievementId of Object.keys(this.achievements)) {
                if (!this.progress[achievementId]) {
                    this.progress[achievementId] = 0;
                }
            }

            return {
                success: true,
                count: Object.keys(this.achievements).length
            };
        } catch (error) {
            console.error('Failed to load achievements:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 檢查成就條件
     * @param {string} achievementId - 成就 ID
     * @returns {boolean} 是否符合條件
     */
    checkAchievementConditions(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return false;

        // 已解鎖的成就不再檢查
        if (this.unlockedAchievements.has(achievementId)) {
            return false;
        }

        const conditions = achievement.conditions;
        if (!conditions) return false;

        // 銀兩條件
        if (conditions.silver !== undefined && this.gameState.silver < conditions.silver) {
            return false;
        }

        // 總銀兩條件
        if (conditions.totalSilver !== undefined && this.gameState.totalSilver < conditions.totalSilver) {
            return false;
        }

        // 聲望條件
        if (conditions.reputation !== undefined) {
            const reputation = this.gameState.inn?.reputation || 0;
            if (reputation < conditions.reputation) return false;
        }

        // 客棧等級條件
        if (conditions.innLevel !== undefined) {
            const level = this.gameState.inn?.level || 1;
            if (level < conditions.innLevel) return false;
        }

        // 員工數量條件
        if (conditions.employeeCount !== undefined) {
            const count = this.gameState.employees.filter(e => e.unlocked).length;
            if (count < conditions.employeeCount) return false;
        }

        // 客人接待數量
        if (conditions.totalGuests !== undefined) {
            const total = this.gameState.guestManager?.statistics?.totalGuests || 0;
            if (total < conditions.totalGuests) return false;
        }

        // 總收入
        if (conditions.totalRevenue !== undefined) {
            const revenue = this.gameState.guestManager?.statistics?.totalRevenue || 0;
            if (revenue < conditions.totalRevenue) return false;
        }

        // 配方解鎖數量
        if (conditions.recipeCount !== undefined) {
            const count = this.gameState.recipeManager?.unlockedRecipes?.size || 0;
            if (count < conditions.recipeCount) return false;
        }

        // 科技解鎖數量
        if (conditions.techCount !== undefined) {
            const count = this.gameState.technologyManager?.unlockedTechnologies?.size || 0;
            if (count < conditions.techCount) return false;
        }

        // 結局解鎖數量
        if (conditions.endingCount !== undefined) {
            const count = this.gameState.endingManager?.unlockedEndings?.size || 0;
            if (count < conditions.endingCount) return false;
        }

        // 遊戲天數
        if (conditions.dayCount !== undefined) {
            const days = this.gameState.timeManager?.currentTime?.dayCount || 0;
            if (days < conditions.dayCount) return false;
        }

        // 平均滿意度
        if (conditions.averageSatisfaction !== undefined) {
            const avg = this.gameState.guestManager?.statistics?.averageSatisfaction || 0;
            if (avg < conditions.averageSatisfaction) return false;
        }

        // 特定結局達成
        if (conditions.hasEnding) {
            const unlocked = this.gameState.endingManager?.unlockedEndings?.has(conditions.hasEnding);
            if (!unlocked) return false;
        }

        // 累積型進度條件（如烹飪次數）
        if (conditions.progressTarget !== undefined) {
            if (this.progress[achievementId] < conditions.progressTarget) {
                return false;
            }
        }

        return true;
    }

    /**
     * 解鎖成就
     * @param {string} achievementId - 成就 ID
     * @returns {object} 解鎖結果
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) {
            return { success: false, reason: '成就不存在' };
        }

        if (this.unlockedAchievements.has(achievementId)) {
            return { success: false, reason: '成就已解鎖' };
        }

        // 記錄解鎖
        this.unlockedAchievements.add(achievementId);
        this.statistics.unlockedAchievements++;
        this.statistics.totalPoints += (achievement.points || 10);

        // 記錄到最近解鎖
        this.statistics.recentUnlocked.unshift({
            id: achievementId,
            name: achievement.name,
            time: Date.now()
        });

        // 只保留最近 10 個
        if (this.statistics.recentUnlocked.length > 10) {
            this.statistics.recentUnlocked = this.statistics.recentUnlocked.slice(0, 10);
        }

        // 發放獎勵
        if (achievement.rewards) {
            this.grantRewards(achievement.rewards);
        }

        // 通知
        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.success(
                '成就解鎖',
                `${achievement.name}\n${achievement.description}\n獲得 ${achievement.points || 10} 成就點數`
            );
        }

        return {
            success: true,
            achievement: {
                id: achievementId,
                name: achievement.name,
                points: achievement.points || 10
            }
        };
    }

    /**
     * 更新成就進度
     * @param {string} achievementId - 成就 ID
     * @param {number} increment - 增加量（默認 1）
     */
    updateProgress(achievementId, increment = 1) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        // 已解鎖的成就不更新進度
        if (this.unlockedAchievements.has(achievementId)) {
            return;
        }

        if (!this.progress[achievementId]) {
            this.progress[achievementId] = 0;
        }

        this.progress[achievementId] += increment;

        // 檢查是否達成
        this.checkAndUnlockAchievement(achievementId);
    }

    /**
     * 檢查並解鎖成就
     * @param {string} achievementId - 成就 ID（可選）
     */
    checkAndUnlockAchievement(achievementId = null) {
        if (achievementId) {
            // 檢查特定成就
            if (this.checkAchievementConditions(achievementId)) {
                return this.unlockAchievement(achievementId);
            }
        } else {
            // 檢查所有成就
            const results = [];
            for (const id of Object.keys(this.achievements)) {
                if (this.checkAchievementConditions(id)) {
                    const result = this.unlockAchievement(id);
                    if (result.success) {
                        results.push(result);
                    }
                }
            }
            return results;
        }
        return null;
    }

    /**
     * 發放獎勵
     * @param {object} rewards - 獎勵對象
     */
    grantRewards(rewards) {
        if (rewards.silver) {
            this.gameState.addSilver(rewards.silver);
        }

        if (rewards.reputation) {
            if (this.gameState.inn) {
                this.gameState.inn.reputation += rewards.reputation;
            }
        }

        if (rewards.items) {
            for (const [itemId, quantity] of Object.entries(rewards.items)) {
                this.gameState.inventory?.addItem(itemId, quantity);
            }
        }

        if (rewards.unlockRecipe) {
            this.gameState.recipeManager?.unlockRecipe(rewards.unlockRecipe);
        }

        if (rewards.unlockTech) {
            this.gameState.technologyManager?.unlockTechnology(rewards.unlockTech);
        }
    }

    /**
     * 獲取成就信息
     * @param {string} achievementId - 成就 ID
     * @returns {object|null} 成就信息
     */
    getAchievementInfo(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return null;

        const progress = this.progress[achievementId] || 0;
        const target = achievement.conditions?.progressTarget;

        return {
            ...achievement,
            id: achievementId,
            unlocked: this.unlockedAchievements.has(achievementId),
            progress: progress,
            progressTarget: target,
            progressPercentage: target ? Math.min(100, (progress / target * 100).toFixed(1)) : 100,
            categoryName: this.categories[achievement.category]
        };
    }

    /**
     * 獲取所有已解鎖成就
     */
    getUnlockedAchievements() {
        const unlocked = [];
        for (const achievementId of this.unlockedAchievements) {
            const info = this.getAchievementInfo(achievementId);
            if (info) {
                unlocked.push(info);
            }
        }
        return unlocked;
    }

    /**
     * 按分類獲取成就
     */
    getAchievementsByCategory(category) {
        return Object.values(this.achievements)
            .filter(a => a.category === category)
            .map(a => this.getAchievementInfo(a.id));
    }

    /**
     * 獲取所有成就（含未解鎖）
     * @param {boolean} hideSecret - 是否隱藏秘密成就
     */
    getAllAchievements(hideSecret = true) {
        const all = [];
        for (const id of Object.keys(this.achievements)) {
            const achievement = this.achievements[id];

            // 隱藏未解鎖的秘密成就
            if (hideSecret && achievement.secret && !this.unlockedAchievements.has(id)) {
                continue;
            }

            const info = this.getAchievementInfo(id);
            if (info) {
                all.push(info);
            }
        }
        return all;
    }

    /**
     * 獲取統計數據
     */
    getStatistics() {
        return {
            ...this.statistics,
            totalAchievements: Object.keys(this.achievements).length,
            unlockedAchievements: this.unlockedAchievements.size,
            completionRate: Object.keys(this.achievements).length > 0
                ? (this.unlockedAchievements.size / Object.keys(this.achievements).length * 100).toFixed(1) + '%'
                : '0%'
        };
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            unlockedAchievements: Array.from(this.unlockedAchievements),
            progress: { ...this.progress },
            statistics: { ...this.statistics }
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.unlockedAchievements) {
            this.unlockedAchievements = new Set(data.unlockedAchievements);
        }

        if (data.progress) {
            this.progress = { ...data.progress };
        }

        if (data.statistics) {
            this.statistics = {
                ...this.statistics,
                ...data.statistics
            };
        }
    }

    /**
     * 獲取存檔數據（SaveManager 接口）
     */
    getSaveData() {
        return this.serialize();
    }

    /**
     * 加載存檔數據（SaveManager 接口）
     */
    loadSaveData(data) {
        this.deserialize(data);
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementManager;
}
