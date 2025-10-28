/**
 * 好感度管理器
 * 管理主角與員工之間的好感度系統
 */

class AffectionManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.affectionEventDatabase = {};  // 好感度事件數據庫
        this.relationshipThresholds = {
            stranger: 0,        // 陌生人
            acquaintance: 20,   // 熟人
            friend: 50,         // 朋友
            close_friend: 80,   // 摯友
            lover: 100          // 戀人（僅部分角色）
        };
    }

    /**
     * 載入好感度事件數據
     */
    loadAffectionEventData() {
        try {
            this.affectionEventDatabase = require('../data/affectionEvents.json');
            return { success: true, count: Object.keys(this.affectionEventDatabase).length };
        } catch (e) {
            console.warn('好感度事件數據載入失敗，使用空數據庫:', e.message);
            this.affectionEventDatabase = {};
            return { success: false, error: e.message };
        }
    }

    /**
     * 增加好感度
     * @param {number} employeeId - 員工ID
     * @param {number} points - 增加的點數
     * @param {string} reason - 原因（可選，用於記錄）
     */
    addAffection(employeeId, points, reason = '') {
        const employee = this.gameState.employees[employeeId];

        if (!employee) {
            return { success: false, message: "員工不存在" };
        }

        if (!employee.affection) {
            employee.affection = {
                level: 0,
                points: 0,
                relationship: 'stranger',
                events: []
            };
        }

        const oldPoints = employee.affection.points;
        const oldRelationship = employee.affection.relationship;

        // 增加好感度點數
        employee.affection.points = Math.min(150, Math.max(0, employee.affection.points + points));

        // 更新關係等級
        const newRelationship = this.getRelationshipLevel(employee.affection.points);
        employee.affection.relationship = newRelationship;

        // 檢查是否升級
        const levelChanged = oldRelationship !== newRelationship;

        // 記錄原因
        if (reason) {
            if (!employee.affection.history) {
                employee.affection.history = [];
            }

            employee.affection.history.push({
                timestamp: Date.now(),
                points: points,
                reason: reason,
                totalPoints: employee.affection.points
            });

            // 限制歷史記錄
            if (employee.affection.history.length > 50) {
                employee.affection.history.shift();
            }
        }

        // 檢查是否觸發好感度事件
        const triggeredEvent = this.checkAffectionEvent(employeeId);

        return {
            success: true,
            oldPoints: oldPoints,
            newPoints: employee.affection.points,
            pointsChanged: points,
            oldRelationship: oldRelationship,
            newRelationship: newRelationship,
            levelChanged: levelChanged,
            triggeredEvent: triggeredEvent
        };
    }

    /**
     * 減少好感度
     */
    reduceAffection(employeeId, points, reason = '') {
        return this.addAffection(employeeId, -points, reason);
    }

    /**
     * 獲取關係等級
     */
    getRelationshipLevel(points) {
        if (points >= this.relationshipThresholds.lover) return 'lover';
        if (points >= this.relationshipThresholds.close_friend) return 'close_friend';
        if (points >= this.relationshipThresholds.friend) return 'friend';
        if (points >= this.relationshipThresholds.acquaintance) return 'acquaintance';
        return 'stranger';
    }

    /**
     * 獲取關係等級描述
     */
    getRelationshipDescription(relationship) {
        const descriptions = {
            stranger: '陌生人',
            acquaintance: '熟人',
            friend: '朋友',
            close_friend: '摯友',
            lover: '戀人'
        };

        return descriptions[relationship] || '陌生人';
    }

    /**
     * 檢查是否觸發好感度事件
     */
    checkAffectionEvent(employeeId) {
        const employee = this.gameState.employees[employeeId];

        if (!employee || !employee.affection) {
            return null;
        }

        // 查找該員工的好感度事件
        const employeeEvents = Object.values(this.affectionEventDatabase).filter(event => {
            return event.employeeId === employeeId;
        });

        // 找到可觸發的事件
        for (const event of employeeEvents) {
            // 檢查好感度條件
            if (employee.affection.points < event.requiredAffection) {
                continue;
            }

            // 檢查是否已觸發過
            if (employee.affection.events && employee.affection.events.includes(event.id)) {
                continue;
            }

            // 檢查其他條件
            if (event.conditions && !this.checkEventConditions(event.conditions, employee)) {
                continue;
            }

            // 觸發事件
            return this.triggerAffectionEvent(employeeId, event);
        }

        return null;
    }

    /**
     * 檢查事件條件
     */
    checkEventConditions(conditions, employee) {
        for (const condition of conditions) {
            if (condition.type === 'relationship') {
                if (employee.affection.relationship !== condition.value) {
                    return false;
                }
            } else if (condition.type === 'player_attribute') {
                const playerAttr = this.gameState.player.attributes[condition.key];
                if (!playerAttr || playerAttr < condition.value) {
                    return false;
                }
            } else if (condition.type === 'player_personality') {
                const playerPers = this.gameState.player.personality[condition.key];
                if (condition.operator === '>=') {
                    if (!playerPers || playerPers < condition.value) return false;
                } else if (condition.operator === '<=') {
                    if (!playerPers || playerPers > condition.value) return false;
                }
            }
        }

        return true;
    }

    /**
     * 觸發好感度事件
     */
    triggerAffectionEvent(employeeId, event) {
        const employee = this.gameState.employees[employeeId];

        // 記錄已觸發
        if (!employee.affection.events) {
            employee.affection.events = [];
        }
        employee.affection.events.push(event.id);

        // 返回事件數據供 StoryManager 使用
        return {
            eventId: event.id,
            storyId: event.storyId,
            title: event.title,
            description: event.description,
            rewards: event.rewards || []
        };
    }

    /**
     * 執行好感度事件獎勵
     */
    applyEventRewards(employeeId, rewards) {
        for (const reward of rewards) {
            switch (reward.type) {
                case 'attribute_boost':
                    // 員工屬性提升
                    const employee = this.gameState.employees[employeeId];
                    if (employee.attributes[reward.key]) {
                        employee.attributes[reward.key] += reward.value;
                    }
                    break;

                case 'skill_unlock':
                    // 解鎖技能
                    this.unlockSkill(employeeId, reward.skillId);
                    break;

                case 'item':
                    // 獲得物品
                    this.gameState.inventory.addItem(reward.itemId, reward.quantity || 1);
                    break;

                case 'silver':
                    // 獲得銀兩
                    this.gameState.addSilver(reward.value);
                    break;

                case 'special':
                    // 特殊效果（如解鎖特殊場景、CG等）
                    if (reward.callback && typeof reward.callback === 'function') {
                        reward.callback(this.gameState, employeeId);
                    }
                    break;
            }
        }
    }

    /**
     * 解鎖員工技能
     */
    unlockSkill(employeeId, skillId) {
        const employee = this.gameState.employees[employeeId];

        if (!employee) return { success: false };

        if (!employee.skills) {
            employee.skills = [];
        }

        // 檢查是否已有該技能
        const hasSkill = employee.skills.find(s => s.id === skillId);
        if (hasSkill) {
            return { success: false, message: "已擁有該技能" };
        }

        // 添加技能
        employee.skills.push({
            id: skillId,
            level: 1,
            exp: 0
        });

        return { success: true };
    }

    /**
     * 獲取員工好感度信息
     */
    getAffectionInfo(employeeId) {
        const employee = this.gameState.employees[employeeId];

        if (!employee) {
            return { success: false, message: "員工不存在" };
        }

        if (!employee.affection) {
            return {
                success: true,
                points: 0,
                relationship: 'stranger',
                relationshipName: '陌生人',
                nextThreshold: this.relationshipThresholds.acquaintance,
                nextRelationship: '熟人'
            };
        }

        const currentRelationship = employee.affection.relationship;
        const currentPoints = employee.affection.points;

        // 找到下一個等級的門檻
        let nextThreshold = null;
        let nextRelationship = null;

        const levels = ['stranger', 'acquaintance', 'friend', 'close_friend', 'lover'];
        const currentIndex = levels.indexOf(currentRelationship);

        if (currentIndex < levels.length - 1) {
            nextRelationship = levels[currentIndex + 1];
            nextThreshold = this.relationshipThresholds[nextRelationship];
        }

        return {
            success: true,
            points: currentPoints,
            relationship: currentRelationship,
            relationshipName: this.getRelationshipDescription(currentRelationship),
            nextThreshold: nextThreshold,
            nextRelationship: nextRelationship ? this.getRelationshipDescription(nextRelationship) : null,
            triggeredEvents: employee.affection.events || []
        };
    }

    /**
     * 每日好感度衰減（可選功能）
     */
    dailyAffectionDecay() {
        let totalDecay = 0;

        this.gameState.employees.forEach(employee => {
            if (employee.hired && employee.hired.unlocked && employee.affection) {
                // 如果員工心情低落，好感度可能下降
                if (employee.status && employee.status.mood < 30) {
                    const decay = 2;
                    employee.affection.points = Math.max(0, employee.affection.points - decay);
                    totalDecay += decay;

                    // 更新關係等級
                    employee.affection.relationship = this.getRelationshipLevel(employee.affection.points);
                }
            }
        });

        return { totalDecay: totalDecay };
    }

    /**
     * 獲取所有員工好感度摘要
     */
    getAllAffectionSummary() {
        return this.gameState.employees
            .filter(e => e.hired && e.hired.unlocked)
            .map(employee => {
                const info = this.getAffectionInfo(employee.id);
                return {
                    id: employee.id,
                    name: employee.realName || employee.name,
                    ...info
                };
            });
    }

    /**
     * 序列化（好感度數據已在employee中，不需要單獨序列化）
     */
    serialize() {
        // 好感度數據存儲在 employee.affection 中
        // GameState 已經處理了序列化
        return {};
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        // 好感度數據由 GameState 恢復
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
    module.exports = AffectionManager;
}
