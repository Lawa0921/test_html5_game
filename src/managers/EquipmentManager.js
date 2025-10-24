/**
 * 裝備管理器
 * 管理裝備的穿戴、卸下、屬性加成計算
 */

class EquipmentManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.equipmentDatabase = {};  // 裝備數據庫
    }

    /**
     * 載入裝備數據
     */
    loadEquipmentData() {
        try {
            this.equipmentDatabase = require('../data/equipment.json');
            return { success: true, count: Object.keys(this.equipmentDatabase).length };
        } catch (e) {
            console.warn('裝備數據載入失敗，使用空數據庫:', e.message);
            this.equipmentDatabase = {};
            return { success: false, error: e.message };
        }
    }

    /**
     * 裝備物品
     * @param {string} targetType - 'player' | 'employee'
     * @param {number|string} targetId - 玩家用 'player'，員工用 ID
     * @param {string} slot - 'weapon' | 'armor' | 'accessory'
     * @param {string} itemId - 裝備 ID
     */
    equip(targetType, targetId, slot, itemId) {
        // 獲取目標對象
        const target = this.getTarget(targetType, targetId);
        if (!target) {
            return { success: false, message: "目標不存在" };
        }

        // 檢查裝備是否存在
        const item = this.equipmentDatabase[itemId];
        if (!item) {
            return { success: false, message: "裝備不存在" };
        }

        // 檢查裝備欄位
        if (!target.equipment || !target.equipment.hasOwnProperty(slot)) {
            return { success: false, message: "無效的裝備欄位" };
        }

        // 檢查裝備類型是否匹配
        if (item.type !== slot) {
            return { success: false, message: `此裝備類型為 ${item.type}，無法裝備到 ${slot}` };
        }

        // 檢查裝備需求
        const reqCheck = this.checkRequirements(target, item);
        if (!reqCheck.success) {
            return reqCheck;
        }

        // 卸下舊裝備（返回到背包）
        const oldItem = target.equipment[slot];
        if (oldItem) {
            this.gameState.inventory?.addItem(oldItem, 1);
        }

        // 裝備新裝備
        target.equipment[slot] = itemId;

        // 從背包移除（如果有背包系統）
        if (this.gameState.inventory) {
            this.gameState.inventory.removeItem(itemId, 1);
        }

        return {
            success: true,
            slot: slot,
            oldItem: oldItem,
            newItem: itemId,
            message: `成功裝備 ${item.name}`
        };
    }

    /**
     * 卸下裝備
     */
    unequip(targetType, targetId, slot) {
        const target = this.getTarget(targetType, targetId);
        if (!target) {
            return { success: false, message: "目標不存在" };
        }

        if (!target.equipment || !target.equipment.hasOwnProperty(slot)) {
            return { success: false, message: "無效的裝備欄位" };
        }

        const itemId = target.equipment[slot];
        if (!itemId) {
            return { success: false, message: "該欄位沒有裝備" };
        }

        // 卸下裝備
        target.equipment[slot] = null;

        // 返回到背包
        if (this.gameState.inventory) {
            this.gameState.inventory.addItem(itemId, 1);
        }

        const item = this.equipmentDatabase[itemId];

        return {
            success: true,
            slot: slot,
            item: itemId,
            message: `成功卸下 ${item?.name || itemId}`
        };
    }

    /**
     * 獲取目標對象（玩家或員工）
     */
    getTarget(targetType, targetId) {
        if (targetType === 'player') {
            return this.gameState.player;
        } else if (targetType === 'employee') {
            return this.gameState.employees.find(e => e.id === targetId);
        }
        return null;
    }

    /**
     * 檢查裝備需求
     */
    checkRequirements(target, item) {
        if (!item.requirements) {
            return { success: true };
        }

        const req = item.requirements;

        // 檢查等級需求
        if (req.level !== undefined) {
            const targetLevel = target.experience?.level || target.level || 1;
            if (targetLevel < req.level) {
                return {
                    success: false,
                    message: `需要等級 ${req.level}（當前等級 ${targetLevel}）`
                };
            }
        }

        // 檢查屬性需求
        if (req.attributes) {
            for (const [attr, value] of Object.entries(req.attributes)) {
                const targetAttr = target.attributes?.[attr] || 0;
                if (targetAttr < value) {
                    const attrNames = {
                        physique: '體質',
                        strength: '武力',
                        intelligence: '智慧',
                        charisma: '口才',
                        dexterity: '靈巧'
                    };
                    return {
                        success: false,
                        message: `需要${attrNames[attr]} ${value}（當前 ${targetAttr}）`
                    };
                }
            }
        }

        return { success: true };
    }

    /**
     * 計算裝備加成
     * @param {object} equipment - { weapon: 'id', armor: 'id', accessory: 'id' }
     * @returns {object} - { physique: 10, strength: 20, ... }
     */
    calculateBonus(equipment) {
        const bonus = {
            physique: 0,
            strength: 0,
            intelligence: 0,
            charisma: 0,
            dexterity: 0
        };

        if (!equipment) return bonus;

        // 遍歷三個裝備欄位
        for (const slot of ['weapon', 'armor', 'accessory']) {
            const itemId = equipment[slot];
            if (!itemId) continue;

            const item = this.equipmentDatabase[itemId];
            if (!item || !item.attributes) continue;

            // 累加屬性加成
            for (const [attr, value] of Object.entries(item.attributes)) {
                if (bonus.hasOwnProperty(attr)) {
                    bonus[attr] += value;
                }
            }
        }

        return bonus;
    }

    /**
     * 獲取裝備詳細信息
     */
    getEquipmentInfo(itemId) {
        const item = this.equipmentDatabase[itemId];
        if (!item) {
            return { success: false, message: "裝備不存在" };
        }

        return {
            success: true,
            item: item
        };
    }

    /**
     * 獲取目標的所有裝備信息
     */
    getEquippedItems(targetType, targetId) {
        const target = this.getTarget(targetType, targetId);
        if (!target || !target.equipment) {
            return { success: false, items: [] };
        }

        const items = {};
        for (const [slot, itemId] of Object.entries(target.equipment)) {
            if (itemId) {
                items[slot] = this.equipmentDatabase[itemId] || { id: itemId, name: '未知裝備' };
            }
        }

        return {
            success: true,
            items: items,
            bonus: this.calculateBonus(target.equipment)
        };
    }

    /**
     * 獲取裝備效果列表
     */
    getEquipmentEffects(equipment) {
        const effects = [];

        if (!equipment) return effects;

        for (const slot of ['weapon', 'armor', 'accessory']) {
            const itemId = equipment[slot];
            if (!itemId) continue;

            const item = this.equipmentDatabase[itemId];
            if (!item) continue;

            if (item.effects && Array.isArray(item.effects)) {
                effects.push(...item.effects.map(e => ({
                    ...e,
                    source: item.name
                })));
            }
        }

        return effects;
    }

    /**
     * 檢查是否可以裝備
     */
    canEquip(targetType, targetId, itemId) {
        const target = this.getTarget(targetType, targetId);
        if (!target) {
            return { success: false, message: "目標不存在" };
        }

        const item = this.equipmentDatabase[itemId];
        if (!item) {
            return { success: false, message: "裝備不存在" };
        }

        return this.checkRequirements(target, item);
    }

    /**
     * 自動裝備最佳裝備（簡易版）
     */
    autoEquipBest(targetType, targetId, slot) {
        // 未來實作：從背包中找出最佳裝備並自動裝備
        return { success: false, message: "自動裝備功能尚未實作" };
    }

    /**
     * 序列化（不需要，裝備數據在 GameState 中）
     */
    serialize() {
        // EquipmentManager 本身不需要序列化
        // 裝備狀態保存在 player.equipment 和 employee.equipment
        return {};
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentManager;
}
