/**
 * 結局系統管理器
 * 管理遊戲結局觸發、解鎖、達成記錄
 */
class EndingManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 結局數據庫
        this.endings = {};

        // 已達成的結局
        this.unlockedEndings = new Set();

        // 當前觸發的結局（遊戲進行中可能觸發但未確認）
        this.triggeredEnding = null;

        // 結局分類
        this.categories = {
            wealth: '財富結局',
            reputation: '聲望結局',
            employee: '員工結局',
            special: '特殊結局',
            bad: '失敗結局',
            true: '真結局'
        };

        // 統計數據
        this.statistics = {
            totalEndingsUnlocked: 0,
            firstEndingDate: null,
            favoriteEnding: null  // 最常達成的結局
        };

        // 結局達成次數
        this.endingCounts = {};
    }

    /**
     * 載入結局數據
     */
    loadEndings() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data/endings.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            this.endings = JSON.parse(data);

            return {
                success: true,
                count: Object.keys(this.endings).length
            };
        } catch (error) {
            console.error('Failed to load endings:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 檢查所有結局條件
     * @returns {object|null} 符合的結局或 null
     */
    checkAllEndings() {
        // 按優先級排序（true > special > 其他）
        const sortedEndings = Object.values(this.endings).sort((a, b) => {
            const priorityOrder = { true: 0, special: 1, wealth: 2, reputation: 3, employee: 4, bad: 5 };
            return (priorityOrder[a.category] || 10) - (priorityOrder[b.category] || 10);
        });

        for (const ending of sortedEndings) {
            if (this.checkEndingConditions(ending.id)) {
                return ending;
            }
        }

        return null;
    }

    /**
     * 檢查特定結局的觸發條件
     * @param {string} endingId - 結局 ID
     * @returns {boolean} 是否符合條件
     */
    checkEndingConditions(endingId) {
        const ending = this.endings[endingId];
        if (!ending) return false;

        // 檢查是否已解鎖（某些結局需要先達成其他結局）
        if (ending.requiresEndings && ending.requiresEndings.length > 0) {
            const hasRequired = ending.requiresEndings.some(reqId =>
                this.unlockedEndings.has(reqId)
            );
            if (!hasRequired) return false;
        }

        // 檢查所有條件
        const conditions = ending.conditions;
        if (!conditions) return false;

        // 銀兩條件
        if (conditions.silver !== undefined) {
            const op = conditions.silverOp || '>=';
            if (!this.compareValue(this.gameState.silver, op, conditions.silver)) {
                return false;
            }
        }

        // 聲望條件
        if (conditions.reputation !== undefined) {
            const op = conditions.reputationOp || '>=';
            const reputation = this.gameState.inn?.reputation || 0;
            if (!this.compareValue(reputation, op, conditions.reputation)) {
                return false;
            }
        }

        // 客棧等級條件
        if (conditions.innLevel !== undefined) {
            const op = conditions.innLevelOp || '>=';
            const level = this.gameState.inn?.level || 1;
            if (!this.compareValue(level, op, conditions.innLevel)) {
                return false;
            }
        }

        // 員工數量條件
        if (conditions.employeeCount !== undefined) {
            const op = conditions.employeeCountOp || '>=';
            const count = this.gameState.employees.filter(e => e.unlocked).length;
            if (!this.compareValue(count, op, conditions.employeeCount)) {
                return false;
            }
        }

        // 特定員工好感度條件
        if (conditions.employeeAffection) {
            for (const [employeeId, requiredAffection] of Object.entries(conditions.employeeAffection)) {
                const employee = this.gameState.employees.find(e => e.id === employeeId);
                if (!employee || (employee.affection || 0) < requiredAffection) {
                    return false;
                }
            }
        }

        // 已服務客人數量
        if (conditions.totalGuests !== undefined) {
            const op = conditions.totalGuestsOp || '>=';
            const total = this.gameState.guestManager?.statistics?.totalGuests || 0;
            if (!this.compareValue(total, op, conditions.totalGuests)) {
                return false;
            }
        }

        // 總收入條件
        if (conditions.totalRevenue !== undefined) {
            const op = conditions.totalRevenueOp || '>=';
            const revenue = this.gameState.guestManager?.statistics?.totalRevenue || 0;
            if (!this.compareValue(revenue, op, conditions.totalRevenue)) {
                return false;
            }
        }

        // 科技解鎖數量
        if (conditions.techCount !== undefined) {
            const op = conditions.techCountOp || '>=';
            const count = this.gameState.technologyManager?.unlockedTechnologies?.size || 0;
            if (!this.compareValue(count, op, conditions.techCount)) {
                return false;
            }
        }

        // 配方解鎖數量
        if (conditions.recipeCount !== undefined) {
            const op = conditions.recipeCountOp || '>=';
            const count = this.gameState.recipeManager?.unlockedRecipes?.size || 0;
            if (!this.compareValue(count, op, conditions.recipeCount)) {
                return false;
            }
        }

        // 遊戲時間（天數）
        if (conditions.dayCount !== undefined) {
            const op = conditions.dayCountOp || '>=';
            const days = this.gameState.timeManager?.currentTime?.dayCount || 0;
            if (!this.compareValue(days, op, conditions.dayCount)) {
                return false;
            }
        }

        // 特定事件已觸發
        if (conditions.triggeredEvents && conditions.triggeredEvents.length > 0) {
            const hasAllEvents = conditions.triggeredEvents.every(eventId =>
                this.gameState.eventManager?.triggeredEvents?.has(eventId)
            );
            if (!hasAllEvents) return false;
        }

        // 自定義條件函數（高級用法）
        if (ending.customCheck && typeof ending.customCheck === 'function') {
            if (!ending.customCheck(this.gameState)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 比較數值
     */
    compareValue(actual, operator, expected) {
        switch (operator) {
            case '>=': return actual >= expected;
            case '<=': return actual <= expected;
            case '>': return actual > expected;
            case '<': return actual < expected;
            case '==': return actual === expected;
            case '!=': return actual !== expected;
            default: return actual >= expected;
        }
    }

    /**
     * 觸發結局
     * @param {string} endingId - 結局 ID
     * @returns {object} 結局信息
     */
    triggerEnding(endingId) {
        const ending = this.endings[endingId];
        if (!ending) {
            return { success: false, reason: '結局不存在' };
        }

        // 設置觸發的結局
        this.triggeredEnding = ending;

        // 記錄到已解鎖結局
        if (!this.unlockedEndings.has(endingId)) {
            this.unlockedEndings.add(endingId);
            this.statistics.totalEndingsUnlocked++;

            if (!this.statistics.firstEndingDate) {
                this.statistics.firstEndingDate = Date.now();
            }
        }

        // 更新達成次數
        if (!this.endingCounts[endingId]) {
            this.endingCounts[endingId] = 0;
        }
        this.endingCounts[endingId]++;

        // 更新最喜愛結局
        this.updateFavoriteEnding();

        // 通知
        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.success(
                '達成結局',
                `${ending.name}\n${ending.description}`
            );
        }

        return {
            success: true,
            ending: {
                id: ending.id,
                name: ending.name,
                category: ending.category,
                description: ending.description,
                isNew: this.endingCounts[endingId] === 1
            }
        };
    }

    /**
     * 手動觸發結局檢查
     * @returns {object|null} 觸發的結局或 null
     */
    checkAndTriggerEnding() {
        const ending = this.checkAllEndings();
        if (ending) {
            return this.triggerEnding(ending.id);
        }
        return null;
    }

    /**
     * 獲取結局信息
     */
    getEndingInfo(endingId) {
        const ending = this.endings[endingId];
        if (!ending) return null;

        return {
            ...ending,
            unlocked: this.unlockedEndings.has(endingId),
            timesAchieved: this.endingCounts[endingId] || 0,
            categoryName: this.categories[ending.category]
        };
    }

    /**
     * 獲取所有已解鎖的結局
     */
    getUnlockedEndings() {
        const unlocked = [];
        for (const endingId of this.unlockedEndings) {
            const info = this.getEndingInfo(endingId);
            if (info) {
                unlocked.push(info);
            }
        }
        return unlocked;
    }

    /**
     * 按分類獲取結局
     */
    getEndingsByCategory(category) {
        return Object.values(this.endings)
            .filter(e => e.category === category)
            .map(e => this.getEndingInfo(e.id));
    }

    /**
     * 獲取結局進度
     * @param {string} endingId - 結局 ID
     * @returns {object} 進度信息
     */
    getEndingProgress(endingId) {
        const ending = this.endings[endingId];
        if (!ending) return null;

        const conditions = ending.conditions;
        const progress = {};
        let totalConditions = 0;
        let metConditions = 0;

        // 檢查每個條件的完成情況
        if (conditions.silver !== undefined) {
            totalConditions++;
            const met = this.gameState.silver >= conditions.silver;
            if (met) metConditions++;
            progress.silver = {
                required: conditions.silver,
                current: this.gameState.silver,
                met: met
            };
        }

        if (conditions.reputation !== undefined) {
            totalConditions++;
            const current = this.gameState.inn?.reputation || 0;
            const met = current >= conditions.reputation;
            if (met) metConditions++;
            progress.reputation = {
                required: conditions.reputation,
                current: current,
                met: met
            };
        }

        if (conditions.totalGuests !== undefined) {
            totalConditions++;
            const current = this.gameState.guestManager?.statistics?.totalGuests || 0;
            const met = current >= conditions.totalGuests;
            if (met) metConditions++;
            progress.totalGuests = {
                required: conditions.totalGuests,
                current: current,
                met: met
            };
        }

        return {
            endingId: endingId,
            name: ending.name,
            progress: progress,
            completion: totalConditions > 0 ? (metConditions / totalConditions * 100).toFixed(1) + '%' : '0%',
            canTrigger: this.checkEndingConditions(endingId)
        };
    }

    /**
     * 更新最喜愛結局
     */
    updateFavoriteEnding() {
        let maxCount = 0;
        let favorite = null;

        for (const [endingId, count] of Object.entries(this.endingCounts)) {
            if (count > maxCount) {
                maxCount = count;
                favorite = endingId;
            }
        }

        this.statistics.favoriteEnding = favorite;
    }

    /**
     * 獲取統計數據
     */
    getStatistics() {
        return {
            ...this.statistics,
            totalEndings: Object.keys(this.endings).length,
            unlockedEndings: this.unlockedEndings.size,
            completionRate: Object.keys(this.endings).length > 0
                ? (this.unlockedEndings.size / Object.keys(this.endings).length * 100).toFixed(1) + '%'
                : '0%',
            favoriteEndingName: this.statistics.favoriteEnding
                ? this.endings[this.statistics.favoriteEnding]?.name
                : '無'
        };
    }

    /**
     * 重置觸發的結局（用於繼續遊戲）
     */
    clearTriggeredEnding() {
        this.triggeredEnding = null;
    }

    /**
     * 檢查是否有結局被觸發
     */
    hasTriggeredEnding() {
        return this.triggeredEnding !== null;
    }

    /**
     * 獲取當前觸發的結局
     */
    getTriggeredEnding() {
        return this.triggeredEnding;
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            unlockedEndings: Array.from(this.unlockedEndings),
            triggeredEnding: this.triggeredEnding,
            statistics: { ...this.statistics },
            endingCounts: { ...this.endingCounts }
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.unlockedEndings) {
            this.unlockedEndings = new Set(data.unlockedEndings);
        }

        if (data.triggeredEnding) {
            this.triggeredEnding = data.triggeredEnding;
        }

        if (data.statistics) {
            this.statistics = {
                ...this.statistics,
                ...data.statistics
            };
        }

        if (data.endingCounts) {
            this.endingCounts = { ...data.endingCounts };
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
    module.exports = EndingManager;
}
