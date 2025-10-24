/**
 * 事件管理器
 * 管理隨機事件的觸發、條件檢查、效果執行
 */

class EventManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.eventDatabase = {};  // 事件數據庫
        this.eventHistory = [];   // 事件歷史
        this.eventCooldowns = {}; // 事件冷卻時間
        this.lastEventTime = 0;   // 上次觸發事件的時間
        this.minEventInterval = 60000; // 最小事件間隔（毫秒）
    }

    /**
     * 載入事件數據
     */
    loadEventData() {
        try {
            this.eventDatabase = require('../data/events.json');
            return { success: true, count: Object.keys(this.eventDatabase).length };
        } catch (e) {
            console.warn('事件數據載入失敗，使用空數據庫:', e.message);
            this.eventDatabase = {};
            return { success: false, error: e.message };
        }
    }

    /**
     * 隨機觸發事件（由時間系統定期調用）
     */
    tryTriggerRandomEvent() {
        const now = Date.now();

        // 檢查事件間隔
        if (now - this.lastEventTime < this.minEventInterval) {
            return { success: false, message: "事件冷卻中" };
        }

        // 獲取所有可用事件
        const availableEvents = this.getAvailableEvents();

        if (availableEvents.length === 0) {
            return { success: false, message: "沒有可用事件" };
        }

        // 根據權重隨機選擇事件
        const selectedEvent = this.selectEventByWeight(availableEvents);

        if (!selectedEvent) {
            return { success: false, message: "事件選擇失敗" };
        }

        // 觸發事件
        return this.triggerEvent(selectedEvent.id);
    }

    /**
     * 獲取所有可用事件（滿足條件且未冷卻）
     */
    getAvailableEvents() {
        const now = Date.now();
        const available = [];

        for (const [eventId, event] of Object.entries(this.eventDatabase)) {
            // 檢查冷卻時間
            if (this.eventCooldowns[eventId] && this.eventCooldowns[eventId] > now) {
                continue;
            }

            // 檢查觸發條件
            if (event.conditions && !this.checkConditions(event.conditions)) {
                continue;
            }

            available.push(event);
        }

        return available;
    }

    /**
     * 檢查事件條件
     */
    checkConditions(conditions) {
        for (const condition of conditions) {
            if (!this.checkSingleCondition(condition)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 檢查單個條件
     */
    checkSingleCondition(condition) {
        let actualValue;

        // 獲取實際值
        switch (condition.type) {
            case 'silver':
                actualValue = this.gameState.silver;
                break;

            case 'inn_level':
                actualValue = this.gameState.inn.level;
                break;

            case 'inn_reputation':
                actualValue = this.gameState.inn.reputation;
                break;

            case 'employee_count':
                actualValue = this.gameState.employees.filter(e => e.hired && e.hired.unlocked).length;
                break;

            case 'player_level':
                actualValue = this.gameState.player.experience.level;
                break;

            case 'player_attribute':
                actualValue = this.gameState.player.attributes[condition.key];
                break;

            case 'player_personality':
                actualValue = this.gameState.player.personality[condition.key];
                break;

            case 'time_of_day':
                // 需要 TimeManager 支持
                if (this.gameState.timeManager && this.gameState.timeManager.time) {
                    actualValue = this.gameState.timeManager.time.hour;
                } else {
                    return true; // 如果沒有時間管理器，跳過時間條件
                }
                break;

            case 'season':
                if (this.gameState.seasonManager) {
                    actualValue = this.gameState.seasonManager.currentSeason;
                } else {
                    return true;
                }
                break;

            case 'random':
                // 隨機條件，用於控制稀有度
                return Math.random() < condition.chance;

            default:
                return true;
        }

        // 比較
        switch (condition.operator) {
            case '>=':
                return actualValue >= condition.value;
            case '<=':
                return actualValue <= condition.value;
            case '>':
                return actualValue > condition.value;
            case '<':
                return actualValue < condition.value;
            case '==':
                return actualValue == condition.value;
            case '!=':
                return actualValue != condition.value;
            default:
                return true;
        }
    }

    /**
     * 根據權重選擇事件
     */
    selectEventByWeight(events) {
        // 計算總權重
        const totalWeight = events.reduce((sum, event) => sum + (event.weight || 1), 0);

        // 隨機選擇
        let random = Math.random() * totalWeight;

        for (const event of events) {
            const weight = event.weight || 1;
            random -= weight;

            if (random <= 0) {
                return event;
            }
        }

        // 回退到第一個事件
        return events[0];
    }

    /**
     * 觸發指定事件
     */
    triggerEvent(eventId) {
        const event = this.eventDatabase[eventId];

        if (!event) {
            return { success: false, message: "事件不存在" };
        }

        // 記錄觸發時間
        this.lastEventTime = Date.now();

        // 設置冷卻時間
        if (event.cooldown) {
            this.eventCooldowns[eventId] = Date.now() + event.cooldown;
        }

        // 記錄到歷史
        this.eventHistory.push({
            eventId: eventId,
            timestamp: Date.now(),
            title: event.title
        });

        // 限制歷史記錄數量
        if (this.eventHistory.length > 100) {
            this.eventHistory.shift();
        }

        return {
            success: true,
            event: {
                id: event.id,
                title: event.title,
                description: event.description,
                type: event.type,
                choices: event.choices || null,
                autoEffects: event.autoEffects || null
            }
        };
    }

    /**
     * 處理事件選擇
     */
    handleEventChoice(eventId, choiceIndex) {
        const event = this.eventDatabase[eventId];

        if (!event || !event.choices) {
            return { success: false, message: "無效的事件或選項" };
        }

        const choice = event.choices[choiceIndex];

        if (!choice) {
            return { success: false, message: "選項不存在" };
        }

        // 執行選擇效果
        if (choice.effects) {
            this.applyEffects(choice.effects);
        }

        return {
            success: true,
            result: choice.result || "選擇完成"
        };
    }

    /**
     * 自動執行事件效果（無選項事件）
     */
    executeAutoEvent(eventId) {
        const event = this.eventDatabase[eventId];

        if (!event || !event.autoEffects) {
            return { success: false, message: "無自動效果" };
        }

        this.applyEffects(event.autoEffects);

        return {
            success: true,
            result: event.result || "事件已完成"
        };
    }

    /**
     * 應用效果
     */
    applyEffects(effects) {
        for (const effect of effects) {
            switch (effect.type) {
                case 'add_silver':
                    this.gameState.addSilver(effect.value);
                    break;

                case 'spend_silver':
                    this.gameState.spendSilver(effect.value);
                    break;

                case 'add_reputation':
                    this.gameState.addReputation(effect.value);
                    break;

                case 'player_personality':
                    this.gameState.player.changePersonality(effect.key, effect.value);
                    break;

                case 'player_attribute':
                    this.gameState.player.addAttribute(effect.key, effect.value);
                    break;

                case 'player_experience':
                    this.gameState.player.addExperience(effect.value);
                    break;

                case 'add_item':
                    this.gameState.inventory.addItem(effect.itemId, effect.quantity || 1);
                    break;

                case 'unlock_employee':
                    if (this.gameState.employees[effect.employeeId]) {
                        this.gameState.employees[effect.employeeId].hired.unlocked = true;
                    }
                    break;

                case 'upgrade_facility':
                    if (this.gameState.inn[effect.facility] !== undefined) {
                        this.gameState.inn[effect.facility] += effect.value || 1;
                    }
                    break;

                case 'start_story':
                    // 觸發劇情（需要通知遊戲切換到StoryScene）
                    if (this.gameState.storyManager) {
                        this.gameState.pendingStory = effect.storyId;
                    }
                    break;

                case 'custom':
                    // 自定義效果，通過回調處理
                    if (effect.callback && typeof effect.callback === 'function') {
                        effect.callback(this.gameState);
                    }
                    break;
            }
        }
    }

    /**
     * 獲取事件歷史
     */
    getEventHistory(limit = 10) {
        return this.eventHistory.slice(-limit).reverse();
    }

    /**
     * 清除事件冷卻（調試用）
     */
    clearCooldowns() {
        this.eventCooldowns = {};
        return { success: true, message: "已清除所有事件冷卻" };
    }

    /**
     * 獲取事件統計
     */
    getStatistics() {
        const stats = {};

        for (const record of this.eventHistory) {
            if (!stats[record.eventId]) {
                stats[record.eventId] = {
                    title: record.title,
                    count: 0
                };
            }
            stats[record.eventId].count++;
        }

        return stats;
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            eventHistory: [...this.eventHistory],
            eventCooldowns: { ...this.eventCooldowns },
            lastEventTime: this.lastEventTime
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.eventHistory) {
            this.eventHistory = data.eventHistory;
        }
        if (data.eventCooldowns) {
            this.eventCooldowns = data.eventCooldowns;
        }
        if (data.lastEventTime) {
            this.lastEventTime = data.lastEventTime;
        }
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
}
