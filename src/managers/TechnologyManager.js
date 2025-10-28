/**
 * 科技樹管理器
 * 管理建築升級、設施解鎖、場景擴展等科技樹系統
 */

class TechnologyManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 科技數據庫
        this.technologies = {};

        // 已解鎖的科技
        this.unlockedTechs = new Set();

        // 科技分類
        this.categories = {
            building: '建築升級',
            facility: '設施升級',
            recipe: '配方解鎖',
            dispatch: '派遣地點',
            scene: '場景擴展',
            gameplay: '玩法解鎖'
        };

        // 科技等級（用於UI顯示排序）
        this.tiers = [1, 2, 3, 4, 5];

        // 建築容量追蹤
        this.buildingCapacities = {
            guest_rooms: 3,        // 客房數量（初始3間）
            staff_rooms: 2,        // 員工房數量
            storage_capacity: 100, // 倉庫容量
            kitchen_level: 1,      // 廚房等級
            smithy_level: 0,       // 鍛造房等級（初始未解鎖）
            apothecary_level: 0,   // 藥房等級
            garden_level: 0        // 花園等級
        };
    }

    /**
     * 載入科技數據
     */
    loadTechnologies() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data/technologies.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            this.technologies = JSON.parse(data);

            return {
                success: true,
                count: Object.keys(this.technologies).length
            };
        } catch (error) {
            console.error('Failed to load technologies:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 檢查是否可以解鎖科技
     */
    canUnlock(techId) {
        const tech = this.technologies[techId];
        if (!tech) {
            return { canUnlock: false, reason: '科技不存在' };
        }

        // 1. 檢查是否已解鎖
        if (this.unlockedTechs.has(techId)) {
            return { canUnlock: false, reason: '已經解鎖此科技' };
        }

        // 2. 檢查前置科技
        if (tech.prerequisites && tech.prerequisites.length > 0) {
            for (const prereqId of tech.prerequisites) {
                if (!this.unlockedTechs.has(prereqId)) {
                    const prereqName = this.technologies[prereqId]?.name || prereqId;
                    return {
                        canUnlock: false,
                        reason: `需要先解鎖：${prereqName}`
                    };
                }
            }
        }

        // 3. 檢查等級要求
        if (tech.requirements) {
            if (tech.requirements.playerLevel) {
                const playerLevel = this.gameState.player?.level || 1;
                if (playerLevel < tech.requirements.playerLevel) {
                    return {
                        canUnlock: false,
                        reason: `需要玩家等級 ${tech.requirements.playerLevel}（當前 ${playerLevel}）`
                    };
                }
            }

            if (tech.requirements.innLevel) {
                const innLevel = this.gameState.inn?.level || 1;
                if (innLevel < tech.requirements.innLevel) {
                    return {
                        canUnlock: false,
                        reason: `需要客棧等級 ${tech.requirements.innLevel}（當前 ${innLevel}）`
                    };
                }
            }

            if (tech.requirements.reputation) {
                const reputation = this.gameState.inn?.reputation || 0;
                if (reputation < tech.requirements.reputation) {
                    return {
                        canUnlock: false,
                        reason: `需要聲望 ${tech.requirements.reputation}（當前 ${reputation}）`
                    };
                }
            }
        }

        // 4. 檢查資源需求
        if (tech.cost) {
            if (tech.cost.silver) {
                if (this.gameState.silver < tech.cost.silver) {
                    return {
                        canUnlock: false,
                        reason: `銀兩不足（需要 ${tech.cost.silver}，當前 ${this.gameState.silver}）`
                    };
                }
            }

            // 檢查材料需求
            for (const [itemId, quantity] of Object.entries(tech.cost)) {
                if (itemId === 'silver') continue;

                const currentQuantity = this.gameState.inventory?.getItemCount(itemId) || 0;
                if (currentQuantity < quantity) {
                    const itemName = this.gameState.tradeManager?.getGoodInfo(itemId)?.name || itemId;
                    return {
                        canUnlock: false,
                        reason: `材料不足：${itemName}（需要 ${quantity}，當前 ${currentQuantity}）`
                    };
                }
            }
        }

        return { canUnlock: true };
    }

    /**
     * 解鎖科技
     */
    unlock(techId) {
        // 檢查是否可解鎖
        const check = this.canUnlock(techId);
        if (!check.canUnlock) {
            return {
                success: false,
                message: check.reason
            };
        }

        const tech = this.technologies[techId];

        // 扣除資源
        if (tech.cost) {
            if (tech.cost.silver) {
                const spendResult = this.gameState.spendSilver(tech.cost.silver);
                if (!spendResult.success) {
                    return {
                        success: false,
                        message: '銀兩不足'
                    };
                }
            }

            // 扣除材料
            for (const [itemId, quantity] of Object.entries(tech.cost)) {
                if (itemId === 'silver') continue;
                this.gameState.inventory?.removeItem(itemId, quantity);
            }
        }

        // 標記已解鎖
        this.unlockedTechs.add(techId);

        // 應用科技效果
        const effectResults = this.applyTechEffects(tech);

        // 通知
        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.success(
                '科技解鎖',
                `已解鎖：${tech.name}\n${tech.description}`
            );
        }

        return {
            success: true,
            tech: tech,
            effects: effectResults
        };
    }

    /**
     * 應用科技效果
     */
    applyTechEffects(tech) {
        const results = [];

        if (!tech.effects || tech.effects.length === 0) {
            return results;
        }

        for (const effect of tech.effects) {
            const result = this.applySingleEffect(effect);
            results.push({
                type: effect.type,
                target: effect.target,
                value: effect.value,
                applied: result
            });
        }

        return results;
    }

    /**
     * 應用單一效果
     */
    applySingleEffect(effect) {
        switch (effect.type) {
            case 'building_capacity':
                // 增加建築容量
                if (this.buildingCapacities.hasOwnProperty(effect.target)) {
                    this.buildingCapacities[effect.target] += effect.value;
                    return true;
                }
                return false;

            case 'facility_level':
                // 升級設施等級
                if (this.buildingCapacities.hasOwnProperty(effect.target)) {
                    this.buildingCapacities[effect.target] = Math.max(
                        this.buildingCapacities[effect.target],
                        effect.value
                    );
                    return true;
                }
                return false;

            case 'unlock_recipe':
                // 解鎖配方（通知配方管理器）
                // TODO: 等 RecipeManager 實作後整合
                return true;

            case 'unlock_dispatch':
                // 解鎖派遣地點
                if (this.gameState.missionManager) {
                    // MissionManager 應該有方法處理解鎖新地點
                    return true;
                }
                return false;

            case 'unlock_scene':
                // 解鎖場景（通知場景管理器）
                // TODO: 等 SceneManager 實作後整合
                return true;

            case 'stat_bonus':
                // 永久屬性加成（如：所有員工效率+10%）
                // TODO: 需要 BuffManager 或直接修改相關系統
                return true;

            case 'gameplay_feature':
                // 解鎖玩法功能（如：自動販售、快速派遣）
                // TODO: 記錄到 gameState.unlockedFeatures
                return true;

            default:
                console.warn('Unknown effect type:', effect.type);
                return false;
        }
    }

    /**
     * 檢查科技是否已解鎖
     */
    isUnlocked(techId) {
        return this.unlockedTechs.has(techId);
    }

    /**
     * 獲取科技資訊
     */
    getTechInfo(techId) {
        const tech = this.technologies[techId];
        if (!tech) {
            return null;
        }

        const unlocked = this.isUnlocked(techId);
        const canUnlock = unlocked ? { canUnlock: false, reason: '已解鎖' } : this.canUnlock(techId);

        return {
            ...tech,
            unlocked,
            canUnlock: canUnlock.canUnlock,
            unlockReason: canUnlock.reason,
            categoryName: this.categories[tech.category] || tech.category
        };
    }

    /**
     * 獲取所有科技（按分類）
     */
    getAllTechnologies() {
        const result = {};

        for (const category of Object.keys(this.categories)) {
            result[category] = {
                name: this.categories[category],
                technologies: []
            };
        }

        for (const [techId, tech] of Object.entries(this.technologies)) {
            const category = tech.category || 'gameplay';
            if (result[category]) {
                result[category].technologies.push({
                    ...tech,
                    unlocked: this.isUnlocked(techId)
                });
            }
        }

        // 按 tier 排序
        for (const category of Object.keys(result)) {
            result[category].technologies.sort((a, b) => {
                if (a.tier !== b.tier) return a.tier - b.tier;
                return a.name.localeCompare(b.name);
            });
        }

        return result;
    }

    /**
     * 獲取可解鎖的科技
     */
    getAvailableTechnologies() {
        const available = [];

        for (const [techId, tech] of Object.entries(this.technologies)) {
            if (this.isUnlocked(techId)) continue;

            const check = this.canUnlock(techId);
            if (check.canUnlock) {
                available.push({
                    ...tech,
                    id: techId
                });
            }
        }

        return available;
    }

    /**
     * 獲取已解鎖的科技
     */
    getUnlockedTechnologies() {
        const unlocked = [];

        for (const techId of this.unlockedTechs) {
            const tech = this.technologies[techId];
            if (tech) {
                unlocked.push({
                    ...tech,
                    id: techId
                });
            }
        }

        return unlocked;
    }

    /**
     * 獲取建築容量
     */
    getBuildingCapacity(type) {
        return this.buildingCapacities[type] || 0;
    }

    /**
     * 獲取所有建築容量
     */
    getAllBuildingCapacities() {
        return { ...this.buildingCapacities };
    }

    /**
     * 獲取科技樹統計
     */
    getStatistics() {
        const totalTechs = Object.keys(this.technologies).length;
        const unlockedCount = this.unlockedTechs.size;
        const availableCount = this.getAvailableTechnologies().length;

        const byCategory = {};
        for (const category of Object.keys(this.categories)) {
            byCategory[category] = {
                total: 0,
                unlocked: 0
            };
        }

        for (const [techId, tech] of Object.entries(this.technologies)) {
            const category = tech.category || 'gameplay';
            if (byCategory[category]) {
                byCategory[category].total++;
                if (this.isUnlocked(techId)) {
                    byCategory[category].unlocked++;
                }
            }
        }

        return {
            total: totalTechs,
            unlocked: unlockedCount,
            available: availableCount,
            progress: totalTechs > 0 ? (unlockedCount / totalTechs * 100).toFixed(1) : 0,
            byCategory
        };
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            unlockedTechs: Array.from(this.unlockedTechs),
            buildingCapacities: { ...this.buildingCapacities }
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.unlockedTechs) {
            this.unlockedTechs = new Set(data.unlockedTechs);

            // 重新應用所有已解鎖科技的效果（以防數據不同步）
            for (const techId of this.unlockedTechs) {
                const tech = this.technologies[techId];
                if (tech) {
                    // 不重新扣資源，只應用效果
                    this.applyTechEffects(tech);
                }
            }
        }

        if (data.buildingCapacities) {
            this.buildingCapacities = {
                ...this.buildingCapacities,
                ...data.buildingCapacities
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
    module.exports = TechnologyManager;
}
