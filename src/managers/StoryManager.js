/**
 * 視覺小說系統管理器
 * 管理故事流程、對話分支、選項判定
 */

class StoryManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.storyDatabase = {};  // 故事數據庫
        this.currentStory = null;  // 當前故事
        this.currentNodeIndex = 0; // 當前節點索引
        this.variables = {};       // 故事變量（用於條件判斷）
        this.history = [];         // 對話歷史
    }

    /**
     * 載入故事數據
     */
    loadStoryData() {
        try {
            this.storyDatabase = require('../data/stories.json');
            return { success: true, count: Object.keys(this.storyDatabase).length };
        } catch (e) {
            console.warn('故事數據載入失敗，使用空數據庫:', e.message);
            this.storyDatabase = {};
            return { success: false, error: e.message };
        }
    }

    /**
     * 開始一個故事
     * @param {string} storyId - 故事 ID
     */
    startStory(storyId) {
        const story = this.storyDatabase[storyId];
        if (!story) {
            return { success: false, message: "故事不存在" };
        }

        this.currentStory = story;
        this.currentNodeIndex = 0;
        this.variables = {};
        this.history = [];

        return {
            success: true,
            storyId: storyId,
            title: story.title,
            node: this.getCurrentNode()
        };
    }

    /**
     * 獲取當前節點
     */
    getCurrentNode() {
        if (!this.currentStory || !this.currentStory.nodes) {
            return null;
        }

        return this.currentStory.nodes[this.currentNodeIndex];
    }

    /**
     * 前進到下一個節點
     * @param {number} choiceIndex - 選擇的選項索引（如果有選項）
     */
    nextNode(choiceIndex = null) {
        const currentNode = this.getCurrentNode();
        if (!currentNode) {
            return { success: false, message: "沒有當前節點" };
        }

        // 記錄歷史
        this.history.push({
            nodeIndex: this.currentNodeIndex,
            choice: choiceIndex
        });

        // 如果當前節點有選項
        if (currentNode.choices && currentNode.choices.length > 0) {
            if (choiceIndex === null || choiceIndex === undefined) {
                return { success: false, message: "需要選擇一個選項" };
            }

            const choice = currentNode.choices[choiceIndex];
            if (!choice) {
                return { success: false, message: "無效的選項" };
            }

            // 執行選項效果
            this.applyChoiceEffects(choice);

            // 跳轉到指定節點
            if (choice.nextNode !== undefined) {
                this.currentNodeIndex = choice.nextNode;
            } else {
                // 如果沒有指定下一個節點，故事結束
                return this.endStory();
            }
        } else {
            // 沒有選項，自動前進
            if (currentNode.nextNode !== undefined) {
                this.currentNodeIndex = currentNode.nextNode;
            } else {
                // 故事結束
                return this.endStory();
            }
        }

        const nextNode = this.getCurrentNode();
        if (!nextNode) {
            return this.endStory();
        }

        // 檢查條件跳過
        return this.checkNodeCondition(nextNode);
    }

    /**
     * 檢查節點條件，決定是否跳過
     */
    checkNodeCondition(node) {
        // 如果節點有條件且不滿足，跳到fallback節點
        if (node.condition && !this.evaluateCondition(node.condition)) {
            if (node.fallbackNode !== undefined) {
                this.currentNodeIndex = node.fallbackNode;
                return { success: true, node: this.getCurrentNode() };
            } else {
                return this.endStory();
            }
        }

        return { success: true, node: node };
    }

    /**
     * 評估條件
     * @param {object} condition - 條件對象 { type, key, operator, value }
     */
    evaluateCondition(condition) {
        let actualValue;

        // 獲取實際值
        switch (condition.type) {
            case 'variable':
                actualValue = this.variables[condition.key];
                break;
            case 'player_attribute':
                actualValue = this.gameState.player.attributes[condition.key];
                break;
            case 'player_personality':
                actualValue = this.gameState.player.personality[condition.key];
                break;
            case 'silver':
                actualValue = this.gameState.silver;
                break;
            case 'inn_reputation':
                actualValue = this.gameState.inn.reputation;
                break;
            default:
                return false;
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
                return false;
        }
    }

    /**
     * 應用選項效果
     */
    applyChoiceEffects(choice) {
        if (!choice.effects) return;

        for (const effect of choice.effects) {
            switch (effect.type) {
                case 'set_variable':
                    this.variables[effect.key] = effect.value;
                    break;

                case 'player_personality':
                    this.gameState.player.changePersonality(effect.key, effect.value);
                    break;

                case 'player_attribute':
                    this.gameState.player.addAttribute(effect.key, effect.value);
                    break;

                case 'add_silver':
                    this.gameState.addSilver(effect.value);
                    break;

                case 'add_reputation':
                    this.gameState.addReputation(effect.value);
                    break;

                case 'unlock_employee':
                    if (this.gameState.employees[effect.employeeId]) {
                        this.gameState.employees[effect.employeeId].hired.unlocked = true;
                    }
                    break;

                case 'add_item':
                    this.gameState.inventory.addItem(effect.itemId, effect.quantity || 1);
                    break;

                case 'start_story':
                    // 記錄後續要播放的故事
                    this.variables['next_story'] = effect.storyId;
                    break;
            }
        }
    }

    /**
     * 故事結束
     */
    endStory() {
        const completedStory = this.currentStory;
        this.currentStory = null;
        this.currentNodeIndex = 0;

        // 檢查是否有後續故事
        const nextStory = this.variables['next_story'];

        return {
            success: true,
            ended: true,
            completedStory: completedStory?.id,
            nextStory: nextStory
        };
    }

    /**
     * 獲取故事進度摘要
     */
    getSummary() {
        return {
            currentStory: this.currentStory?.id || null,
            currentNode: this.currentNodeIndex,
            historyLength: this.history.length,
            variables: { ...this.variables }
        };
    }

    /**
     * 回退到上一個節點（用於"回看"功能）
     */
    goBack() {
        if (this.history.length === 0) {
            return { success: false, message: "已經是第一個節點" };
        }

        const lastHistory = this.history.pop();
        this.currentNodeIndex = lastHistory.nodeIndex;

        return {
            success: true,
            node: this.getCurrentNode()
        };
    }

    /**
     * 跳過當前故事（用於已看過的故事）
     */
    skipStory() {
        if (!this.currentStory) {
            return { success: false, message: "沒有正在進行的故事" };
        }

        return this.endStory();
    }

    /**
     * 保存故事進度（用於存檔）
     */
    serialize() {
        return {
            currentStory: this.currentStory?.id || null,
            currentNodeIndex: this.currentNodeIndex,
            variables: { ...this.variables },
            history: [...this.history]
        };
    }

    /**
     * 恢復故事進度（用於讀檔）
     */
    deserialize(data) {
        if (data.currentStory && this.storyDatabase[data.currentStory]) {
            this.currentStory = this.storyDatabase[data.currentStory];
            this.currentNodeIndex = data.currentNodeIndex || 0;
            this.variables = data.variables || {};
            this.history = data.history || [];
        }
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryManager;
}
