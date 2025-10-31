/**
 * 視覺小說系統管理器
 * 管理故事流程、對話分支、選項判定
 * 追蹤故事進度和玩家選擇，用於劇情差分
 */

class StoryManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.storyDatabase = {};  // 故事數據庫
        this.currentStory = null;  // 當前故事
        this.currentNodeIndex = 0; // 當前節點索引
        this.variables = {};       // 故事變量（用於條件判斷）
        this.history = [];         // 對話歷史

        // 故事進度追蹤系統
        this.storyProgress = {
            completedStories: [],      // 已完成的故事ID列表
            storyRecords: {},          // 每個故事的詳細記錄
            globalFlags: {}            // 全局劇情標記
        };

        // 當前故事的臨時記錄
        this.currentStoryRecord = null;
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
     * 檢查是否可以播放某個故事（基於條件檢查）
     * @param {string} storyId - 故事 ID
     * @returns {{ canPlay: boolean, reason?: string }}
     */
    canPlayStory(storyId) {
        const story = this.storyDatabase[storyId];
        if (!story) {
            return { canPlay: false, reason: '故事不存在' };
        }

        // 檢查故事的條件
        if (story.conditions && story.conditions.length > 0) {
            for (const condition of story.conditions) {
                if (!this.evaluateCondition(condition)) {
                    // 條件不滿足
                    let reason = '前置條件未滿足';
                    if (condition.type === 'story_completed') {
                        reason = `需要先完成故事: ${condition.storyId}`;
                    }
                    return { canPlay: false, reason };
                }
            }
        }

        return { canPlay: true };
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

        // 初始化當前故事的記錄
        this.currentStoryRecord = {
            storyId: storyId,
            startedAt: Date.now(),
            completedAt: null,
            choices: [],           // 玩家的選擇記錄
            importantFlags: {},    // 重要的劇情標記
            playCount: this.getStoryPlayCount(storyId) + 1  // 遊玩次數
        };

        console.log(`📖 開始故事「${story.title}」（第 ${this.currentStoryRecord.playCount} 次遊玩）`);

        return {
            success: true,
            storyId: storyId,
            title: story.title,
            node: this.getCurrentNode(),
            playCount: this.currentStoryRecord.playCount
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
            nodeId: currentNode.id,
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

            // 記錄選擇
            this.recordChoice(currentNode, choiceIndex, choice);

            // 執行選項效果
            this.applyChoiceEffects(choice);

            // 跳轉到指定節點（將節點ID轉換為索引）
            if (choice.nextNode !== undefined) {
                const nextIndex = this.findNodeIndexById(choice.nextNode);
                if (nextIndex === -1) {
                    console.error(`找不到目標節點: ${choice.nextNode}`);
                    return this.endStory();
                }
                this.currentNodeIndex = nextIndex;
            } else {
                // 如果沒有指定下一個節點，故事結束
                return this.endStory();
            }
        } else {
            // 沒有選項，自動前進（將節點ID轉換為索引）
            if (currentNode.nextNode !== undefined) {
                const nextIndex = this.findNodeIndexById(currentNode.nextNode);
                if (nextIndex === -1) {
                    console.error(`找不到目標節點: ${currentNode.nextNode}`);
                    return this.endStory();
                }
                this.currentNodeIndex = nextIndex;
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
     * 記錄玩家選擇
     */
    recordChoice(node, choiceIndex, choice) {
        const choiceRecord = {
            nodeId: node.id,
            nodeIndex: this.currentNodeIndex,
            choiceIndex: choiceIndex,
            choiceText: choice.text,
            timestamp: Date.now()
        };

        this.currentStoryRecord.choices.push(choiceRecord);

        console.log(`✅ 記錄選擇: [節點 ${node.id}] ${choice.text}`);
    }

    /**
     * 根據節點ID找到對應的索引
     */
    findNodeIndexById(nodeId) {
        if (!this.currentStory || !this.currentStory.nodes) return -1;
        return this.currentStory.nodes.findIndex(n => n.id === nodeId);
    }

    /**
     * 檢查節點條件，決定是否跳過
     */
    checkNodeCondition(node) {
        // 處理條件分支節點
        if (node.type === 'conditional_branch') {
            // 檢查所有條件
            const conditionsMet = node.conditions && node.conditions.length > 0
                ? node.conditions.every(condition => this.evaluateCondition(condition))
                : false;

            // 根據條件結果跳轉（使用節點ID查找索引）
            let targetNodeId;
            if (conditionsMet && node.nextNodeIfTrue !== undefined) {
                targetNodeId = node.nextNodeIfTrue;
            } else if (!conditionsMet && node.nextNodeIfFalse !== undefined) {
                targetNodeId = node.nextNodeIfFalse;
            } else {
                // 沒有指定跳轉節點，結束故事
                return this.endStory();
            }

            // 將節點ID轉換為索引
            const targetIndex = this.findNodeIndexById(targetNodeId);
            if (targetIndex === -1) {
                console.error(`找不到目標節點: ${targetNodeId}`);
                return this.endStory();
            }

            this.currentNodeIndex = targetIndex;

            // 遞歸檢查新節點（處理連續的條件分支）
            const newNode = this.getCurrentNode();
            if (newNode) {
                return this.checkNodeCondition(newNode);
            }
        }

        // 如果節點有條件且不滿足，跳到fallback節點
        if (node.condition && !this.evaluateCondition(node.condition)) {
            if (node.fallbackNode !== undefined) {
                const fallbackIndex = this.findNodeIndexById(node.fallbackNode);
                if (fallbackIndex !== -1) {
                    this.currentNodeIndex = fallbackIndex;
                }
                return { success: true, node: this.getCurrentNode() };
            } else {
                return this.endStory();
            }
        }

        return { success: true, node: node };
    }

    /**
     * 評估條件（支援查詢過往故事選擇）
     * @param {object} condition - 條件對象
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

            // 新增：檢查是否完成過某個故事
            case 'story_completed':
                actualValue = this.hasCompletedStory(condition.storyId);
                return actualValue === condition.value;

            // 新增：檢查某個故事中的選擇
            case 'story_choice':
                const storyRecord = this.getStoryRecord(condition.storyId);
                if (!storyRecord) return false;

                const choice = storyRecord.choices.find(c => c.nodeId === condition.nodeId);
                if (!choice) return false;

                actualValue = choice.choiceIndex;
                break;

            // 新增：檢查全局劇情標記
            case 'global_flag':
                actualValue = this.storyProgress.globalFlags[condition.key];
                break;

            // 新增：檢查故事標記
            case 'story_flag':
                const record = this.getStoryRecord(condition.storyId);
                actualValue = record?.importantFlags[condition.key];
                break;

            // 新增：檢查故事遊玩次數
            case 'story_play_count':
                actualValue = this.getStoryPlayCount(condition.storyId);
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
                    // 記錄重要變數（如果有當前故事記錄）
                    if (this.currentStoryRecord) {
                        this.currentStoryRecord.importantFlags[effect.key] = effect.value;
                    }
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

                // 新增：設置全局標記
                case 'set_global_flag':
                    this.setGlobalFlag(effect.key, effect.value);
                    break;

                // 新增：設置故事標記
                case 'set_story_flag':
                    this.currentStoryRecord.importantFlags[effect.key] = effect.value;
                    break;
            }
        }
    }

    /**
     * 故事結束
     */
    endStory() {
        const completedStory = this.currentStory;

        if (completedStory && this.currentStoryRecord) {
            // 標記完成時間
            this.currentStoryRecord.completedAt = Date.now();

            // 計算遊玩時長
            const duration = this.currentStoryRecord.completedAt - this.currentStoryRecord.startedAt;
            this.currentStoryRecord.duration = duration;

            // 保存故事記錄
            this.saveStoryRecord(completedStory.id, this.currentStoryRecord);

            // 添加到已完成列表（如果是第一次完成）
            if (!this.storyProgress.completedStories.includes(completedStory.id)) {
                this.storyProgress.completedStories.push(completedStory.id);
                console.log(`🎉 首次完成故事「${completedStory.title}」！`);
            }

            // 輸出摘要
            this.printStoryCompletionSummary(completedStory.id);
        }

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
     * 保存故事記錄
     */
    saveStoryRecord(storyId, record) {
        if (!this.storyProgress.storyRecords[storyId]) {
            this.storyProgress.storyRecords[storyId] = [];
        }

        // 保存這次遊玩的記錄
        this.storyProgress.storyRecords[storyId].push({...record});

        console.log(`💾 保存故事記錄: ${storyId} (第 ${record.playCount} 次)`);
    }

    /**
     * 獲取故事記錄（返回最近一次的記錄）
     */
    getStoryRecord(storyId) {
        const records = this.storyProgress.storyRecords[storyId];
        if (!records || records.length === 0) return null;

        // 返回最近的記錄
        return records[records.length - 1];
    }

    /**
     * 獲取所有故事記錄
     */
    getAllStoryRecords(storyId) {
        return this.storyProgress.storyRecords[storyId] || [];
    }

    /**
     * 檢查是否完成過某個故事
     */
    hasCompletedStory(storyId) {
        return this.storyProgress.completedStories.includes(storyId);
    }

    /**
     * 獲取故事遊玩次數
     */
    getStoryPlayCount(storyId) {
        const records = this.storyProgress.storyRecords[storyId];
        return records ? records.length : 0;
    }

    /**
     * 設置全局標記
     */
    setGlobalFlag(key, value) {
        this.storyProgress.globalFlags[key] = value;
        console.log(`🚩 設置全局標記: ${key} = ${value}`);
    }

    /**
     * 獲取全局標記
     */
    getGlobalFlag(key, defaultValue = null) {
        return this.storyProgress.globalFlags[key] ?? defaultValue;
    }

    /**
     * 查詢玩家在某個故事某個節點的選擇
     */
    getPlayerChoice(storyId, nodeId) {
        const record = this.getStoryRecord(storyId);
        if (!record) return null;

        const choice = record.choices.find(c => c.nodeId === nodeId);
        return choice || null;
    }

    /**
     * 檢查劇情差分條件（便捷方法）
     */
    checkStoryBranch(conditions) {
        // conditions 可以是單個條件或條件陣列
        if (!Array.isArray(conditions)) {
            conditions = [conditions];
        }

        // 所有條件都要滿足
        return conditions.every(condition => this.evaluateCondition(condition));
    }

    /**
     * 輸出故事完成摘要
     */
    printStoryCompletionSummary(storyId) {
        const record = this.getStoryRecord(storyId);
        if (!record) return;

        console.log('');
        console.log('═══════════════════════════════════════');
        console.log(`📖 故事完成：${storyId}`);
        console.log('═══════════════════════════════════════');
        console.log(`⏱️  遊玩時長: ${Math.floor(record.duration / 1000)} 秒`);
        console.log(`🔢 遊玩次數: ${record.playCount}`);
        console.log(`✅ 選擇次數: ${record.choices.length}`);

        if (record.choices.length > 0) {
            console.log('');
            console.log('玩家選擇記錄:');
            record.choices.forEach((choice, index) => {
                console.log(`  ${index + 1}. [節點 ${choice.nodeId}] ${choice.choiceText}`);
            });
        }

        if (Object.keys(record.importantFlags).length > 0) {
            console.log('');
            console.log('重要劇情標記:');
            Object.entries(record.importantFlags).forEach(([key, value]) => {
                console.log(`  🚩 ${key}: ${value}`);
            });
        }

        console.log('═══════════════════════════════════════');
        console.log('');
    }

    /**
     * 獲取故事進度摘要
     */
    getSummary() {
        return {
            currentStory: this.currentStory?.id || null,
            currentNode: this.currentNodeIndex,
            historyLength: this.history.length,
            variables: { ...this.variables },
            completedStories: [...this.storyProgress.completedStories],
            totalStoryRecords: Object.keys(this.storyProgress.storyRecords).length,
            globalFlags: { ...this.storyProgress.globalFlags }
        };
    }

    /**
     * 獲取故事進度統計
     */
    getProgressStats() {
        const totalStories = Object.keys(this.storyDatabase).length;
        const completedCount = this.storyProgress.completedStories.length;

        return {
            totalStories: totalStories,
            completedStories: completedCount,
            completionRate: totalStories > 0 ? (completedCount / totalStories * 100).toFixed(1) : 0,
            totalPlaytime: this.calculateTotalPlaytime(),
            mostPlayedStory: this.getMostPlayedStory()
        };
    }

    /**
     * 計算總遊玩時間
     */
    calculateTotalPlaytime() {
        let totalTime = 0;

        Object.values(this.storyProgress.storyRecords).forEach(records => {
            records.forEach(record => {
                if (record.duration) {
                    totalTime += record.duration;
                }
            });
        });

        return totalTime;
    }

    /**
     * 獲取最常遊玩的故事
     */
    getMostPlayedStory() {
        let maxCount = 0;
        let mostPlayed = null;

        Object.entries(this.storyProgress.storyRecords).forEach(([storyId, records]) => {
            if (records.length > maxCount) {
                maxCount = records.length;
                mostPlayed = storyId;
            }
        });

        return mostPlayed ? { storyId: mostPlayed, playCount: maxCount } : null;
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
            history: [...this.history],
            // 新增：保存故事進度追蹤
            storyProgress: {
                completedStories: [...this.storyProgress.completedStories],
                storyRecords: JSON.parse(JSON.stringify(this.storyProgress.storyRecords)),
                globalFlags: { ...this.storyProgress.globalFlags }
            },
            currentStoryRecord: this.currentStoryRecord ? {...this.currentStoryRecord} : null
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

        // 恢復故事進度追蹤
        if (data.storyProgress) {
            this.storyProgress = {
                completedStories: data.storyProgress.completedStories || [],
                storyRecords: data.storyProgress.storyRecords || {},
                globalFlags: data.storyProgress.globalFlags || {}
            };
        }

        if (data.currentStoryRecord) {
            this.currentStoryRecord = data.currentStoryRecord;
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
        if (data) {
            this.deserialize(data);
        }
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryManager;
}
