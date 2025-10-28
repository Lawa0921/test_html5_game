/**
 * 任務管理器 - 派遣系統
 * 管理押鏢、行商、探索、採集等任務
 */

class MissionManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 任務數據庫
        this.missionDatabase = {};

        // 進行中的任務
        this.activeMissions = [];

        // 任務歷史
        this.missionHistory = [];

        // 任務類型定義
        this.missionTypes = {
            escort: {
                id: 'escort',
                name: '押鏢',
                icon: '🛡️',
                description: '護送商隊前往目的地',
                primaryAttribute: 'strength',     // 主要屬性
                secondaryAttribute: 'physique'    // 次要屬性
            },
            trade: {
                id: 'trade',
                name: '行商',
                icon: '💰',
                description: '前往其他城市進行貿易',
                primaryAttribute: 'charisma',
                secondaryAttribute: 'intelligence'
            },
            explore: {
                id: 'explore',
                name: '探索',
                icon: '🗺️',
                description: '探索未知地點，尋找寶藏',
                primaryAttribute: 'intelligence',
                secondaryAttribute: 'dexterity'
            },
            gather: {
                id: 'gather',
                name: '採集',
                icon: '🌿',
                description: '採集珍稀材料',
                primaryAttribute: 'dexterity',
                secondaryAttribute: 'physique'
            }
        };

        // 任務難度等級
        this.difficultyLevels = {
            easy: { name: '簡單', multiplier: 0.8, expMultiplier: 1.0 },
            normal: { name: '普通', multiplier: 1.0, expMultiplier: 1.2 },
            hard: { name: '困難', multiplier: 1.3, expMultiplier: 1.5 },
            extreme: { name: '極難', multiplier: 1.8, expMultiplier: 2.0 }
        };

        // 任務狀態
        this.missionStates = {
            PREPARING: 'preparing',     // 準備中
            TRAVELING: 'traveling',     // 旅途中
            IN_PROGRESS: 'in_progress', // 執行中
            RETURNING: 'returning',     // 返程中
            COMPLETED: 'completed',     // 已完成
            FAILED: 'failed'            // 失敗
        };

        // 下一個任務ID
        this.nextMissionId = 1;
    }

    /**
     * 載入任務數據
     */
    loadMissionData() {
        try {
            this.missionDatabase = require('../data/missions.json');
            return { success: true, count: Object.keys(this.missionDatabase).length };
        } catch (e) {
            console.warn('任務數據載入失敗:', e.message);
            this.missionDatabase = {};
            return { success: false, error: e.message };
        }
    }

    /**
     * 派遣任務
     * @param {string} missionId - 任務ID
     * @param {Array} participantIds - 參與者ID數組 ['player'] 或 [employeeId]
     */
    dispatchMission(missionId, participantIds = []) {
        const mission = this.missionDatabase[missionId];

        if (!mission) {
            return { success: false, message: '任務不存在' };
        }

        // 檢查參與者
        const checkResult = this.checkParticipants(participantIds);
        if (!checkResult.success) {
            return checkResult;
        }

        // 檢查是否有人正在執行任務
        for (const id of participantIds) {
            if (this.isOnMission(id)) {
                return { success: false, message: '參與者正在執行其他任務' };
            }
        }

        // 計算成功率
        const successRate = this.calculateSuccessRate(mission, checkResult.participants);

        // 創建任務實例
        const missionInstance = {
            id: this.nextMissionId++,
            missionId: mission.id,
            title: mission.title,
            type: mission.type,
            difficulty: mission.difficulty,
            participants: checkResult.participants,
            participantIds: participantIds,

            // 時間相關
            duration: mission.duration,          // 任務總時長（小時）
            elapsed: 0,                          // 已經過時間（小時）
            startTime: this.gameState.timeManager ?
                this.gameState.timeManager.time.totalHours : 0,

            // 狀態
            state: this.missionStates.TRAVELING,
            progress: 0,                         // 進度 0-100

            // 成功率和獎勵
            successRate: successRate,
            baseRewards: mission.rewards,

            // 事件記錄
            events: [],

            // 其他
            checkpoints: this.generateCheckpoints(mission.duration)
        };

        // 添加到進行中的任務
        this.activeMissions.push(missionInstance);

        // 標記參與者為忙碌
        this.markParticipantsAsBusy(participantIds, missionInstance.id);

        // 通知用戶
        if (this.gameState.notificationManager) {
            const participantNames = checkResult.participants.map(p => p.name).join('、');
            this.gameState.notificationManager.info(
                `${this.missionTypes[mission.type].icon} 任務派遣`,
                `${participantNames} 已出發執行「${mission.title}」任務！`
            );
        }

        return {
            success: true,
            missionInstance: missionInstance,
            message: `任務已派遣，預計 ${mission.duration} 小時後返回`
        };
    }

    /**
     * 檢查參與者
     */
    checkParticipants(participantIds) {
        if (!participantIds || participantIds.length === 0) {
            return { success: false, message: '至少需要一名參與者' };
        }

        const participants = [];

        for (const id of participantIds) {
            if (id === 'player') {
                // 主角
                participants.push({
                    id: 'player',
                    name: this.gameState.player.name,
                    attributes: this.gameState.player.attributes,
                    isPlayer: true
                });
            } else {
                // 員工
                const employee = this.gameState.employees[id];
                if (!employee) {
                    return { success: false, message: `員工 ${id} 不存在` };
                }

                if (!employee.hired || !employee.hired.unlocked) {
                    return { success: false, message: `員工 ${employee.name} 尚未雇用` };
                }

                participants.push({
                    id: id,
                    name: employee.realName || employee.name,
                    attributes: employee.attributes,
                    isPlayer: false
                });
            }
        }

        return {
            success: true,
            participants: participants
        };
    }

    /**
     * 計算成功率
     */
    calculateSuccessRate(mission, participants) {
        const type = this.missionTypes[mission.type];
        let totalScore = 0;

        // 計算參與者的總能力值
        for (const participant of participants) {
            const primaryValue = participant.attributes[type.primaryAttribute] || 50;
            const secondaryValue = participant.attributes[type.secondaryAttribute] || 50;

            // 主要屬性權重 70%，次要屬性權重 30%
            const score = primaryValue * 0.7 + secondaryValue * 0.3;
            totalScore += score;
        }

        // 平均能力值
        const averageScore = totalScore / participants.length;

        // 難度影響
        const difficulty = this.difficultyLevels[mission.difficulty] || this.difficultyLevels.normal;

        // 基礎成功率：能力值 50 = 50% 成功率
        let successRate = averageScore / difficulty.multiplier;

        // 人數加成（最多 3 人）
        const teamBonus = Math.min(participants.length - 1, 2) * 5;
        successRate += teamBonus;

        // 限制在 10%-95% 之間
        successRate = Math.max(10, Math.min(95, successRate));

        return Math.floor(successRate);
    }

    /**
     * 生成檢查點（用於觸發旅途事件）
     */
    generateCheckpoints(duration) {
        const checkpoints = [];
        const numCheckpoints = Math.floor(duration / 2); // 每2小時一個檢查點

        for (let i = 1; i <= numCheckpoints; i++) {
            checkpoints.push({
                hour: i * 2,
                triggered: false
            });
        }

        return checkpoints;
    }

    /**
     * 標記參與者為忙碌
     */
    markParticipantsAsBusy(participantIds, missionId) {
        for (const id of participantIds) {
            if (id === 'player') {
                if (this.gameState.player.status) {
                    this.gameState.player.status.onMission = missionId;
                }
            } else {
                const employee = this.gameState.employees[id];
                if (employee && employee.status) {
                    employee.status.onMission = missionId;
                }
            }
        }
    }

    /**
     * 更新任務進度（每小時調用）
     */
    updateMissions() {
        const completedMissions = [];

        for (const mission of this.activeMissions) {
            mission.elapsed++;
            mission.progress = Math.floor((mission.elapsed / mission.duration) * 100);

            // 檢查檢查點
            this.checkMissionCheckpoints(mission);

            // 檢查是否完成
            if (mission.elapsed >= mission.duration) {
                const result = this.completeMission(mission);
                completedMissions.push(result);
            }
        }

        // 移除已完成的任務
        this.activeMissions = this.activeMissions.filter(m =>
            m.state !== this.missionStates.COMPLETED &&
            m.state !== this.missionStates.FAILED
        );

        return completedMissions;
    }

    /**
     * 檢查任務檢查點
     */
    checkMissionCheckpoints(mission) {
        for (const checkpoint of mission.checkpoints) {
            if (!checkpoint.triggered && mission.elapsed >= checkpoint.hour) {
                checkpoint.triggered = true;

                // 30% 概率觸發旅途事件
                if (Math.random() < 0.3) {
                    const event = this.triggerTravelEvent(mission);
                    mission.events.push(event);
                }
            }
        }
    }

    /**
     * 觸發旅途事件
     */
    triggerTravelEvent(mission) {
        const events = {
            escort: [
                { type: 'bandit', description: '遇到山賊襲擊', successRateChange: -10 },
                { type: 'shortcut', description: '發現捷徑', timeReduction: 1 },
                { type: 'help', description: '幫助路人', reputationGain: 5 }
            ],
            trade: [
                { type: 'bargain', description: '遇到精明的商人', profitChange: 20 },
                { type: 'scam', description: '差點被騙', successRateChange: -5 },
                { type: 'insider', description: '獲得內部消息', profitChange: 30 }
            ],
            explore: [
                { type: 'treasure', description: '發現隱藏寶箱', bonusReward: true },
                { type: 'trap', description: '觸發陷阱', successRateChange: -15 },
                { type: 'clue', description: '找到線索', successRateChange: 10 }
            ],
            gather: [
                { type: 'rare', description: '發現稀有材料', bonusReward: true },
                { type: 'weather', description: '天氣不佳', successRateChange: -10 },
                { type: 'guide', description: '遇到熱心嚮導', successRateChange: 15 }
            ]
        };

        const typeEvents = events[mission.type] || [];
        const randomEvent = typeEvents[Math.floor(Math.random() * typeEvents.length)];

        if (randomEvent) {
            // 應用事件效果
            if (randomEvent.successRateChange) {
                mission.successRate = Math.max(10, Math.min(95,
                    mission.successRate + randomEvent.successRateChange
                ));
            }

            if (randomEvent.timeReduction) {
                mission.duration = Math.max(1, mission.duration - randomEvent.timeReduction);
            }

            return {
                hour: mission.elapsed,
                type: randomEvent.type,
                description: randomEvent.description,
                effectApplied: true
            };
        }

        return {
            hour: mission.elapsed,
            type: 'none',
            description: '一切順利',
            effectApplied: false
        };
    }

    /**
     * 完成任務
     */
    completeMission(mission) {
        // 判定成功或失敗
        const roll = Math.random() * 100;
        const success = roll <= mission.successRate;

        mission.state = success ? this.missionStates.COMPLETED : this.missionStates.FAILED;

        let rewards = {
            silver: 0,
            experience: 0,
            items: [],
            reputation: 0
        };

        if (success) {
            // 計算獎勵
            rewards = this.calculateRewards(mission);

            // 應用獎勵
            this.applyRewards(mission, rewards);
        } else {
            // 失敗懲罰 - 30% 補償
            const baseSilver = mission.baseRewards.baseSilver || mission.baseRewards.silver || 0;
            rewards.silver = Math.floor(baseSilver * 0.3);
            this.gameState.addSilver(rewards.silver);
        }

        // 釋放參與者
        this.releaseParticipants(mission.participantIds);

        // 增加參與者經驗
        this.addParticipantExperience(mission, success);

        // 記錄歷史
        this.recordMissionHistory(mission, success, rewards);

        // 通知用戶
        if (this.gameState.notificationManager) {
            const participantNames = mission.participants.map(p => p.name).join('、');

            if (success) {
                this.gameState.notificationManager.success(
                    `✓ 任務成功`,
                    `${participantNames} 完成了「${mission.title}」任務！\n獲得 ${rewards.silver} 銀兩`
                );
            } else {
                this.gameState.notificationManager.warning(
                    `✗ 任務失敗`,
                    `${participantNames} 未能完成「${mission.title}」任務。`
                );
            }
        }

        return {
            mission: mission,
            success: success,
            rewards: rewards
        };
    }

    /**
     * 計算獎勵
     */
    calculateRewards(mission) {
        const difficulty = this.difficultyLevels[mission.difficulty] || this.difficultyLevels.normal;

        // 任務數據中使用 baseSilver 和 baseExperience
        const baseSilver = mission.baseRewards.baseSilver || mission.baseRewards.silver || 0;
        const baseExperience = mission.baseRewards.baseExperience || mission.baseRewards.experience || 0;

        let rewards = {
            silver: Math.floor(baseSilver * difficulty.multiplier),
            experience: Math.floor(baseExperience * difficulty.expMultiplier),
            items: mission.baseRewards.items ? [...mission.baseRewards.items] : [],
            reputation: mission.baseRewards.reputation || 0
        };

        // 檢查是否有額外獎勵事件
        const hasBonusEvent = mission.events && mission.events.some(e => e.type === 'treasure' || e.type === 'rare');
        if (hasBonusEvent) {
            rewards.silver = Math.floor(rewards.silver * 1.3);
            rewards.experience = Math.floor(rewards.experience * 1.2);
        }

        return rewards;
    }

    /**
     * 應用獎勵
     */
    applyRewards(mission, rewards) {
        // 銀兩
        this.gameState.addSilver(rewards.silver);

        // 聲望
        if (rewards.reputation > 0) {
            this.gameState.addReputation(rewards.reputation);
        }

        // 物品
        for (const item of rewards.items) {
            this.gameState.inventory.addItem(item.id, item.quantity || 1);
        }
    }

    /**
     * 增加參與者經驗
     */
    addParticipantExperience(mission, success) {
        const expGain = success ?
            mission.baseRewards.experience :
            Math.floor(mission.baseRewards.experience * 0.5);

        for (const id of mission.participantIds) {
            if (id === 'player') {
                this.gameState.player.addExperience(expGain);
            } else {
                // 員工經驗暫時不實作，保留擴展性
            }
        }
    }

    /**
     * 釋放參與者
     */
    releaseParticipants(participantIds) {
        for (const id of participantIds) {
            if (id === 'player') {
                if (this.gameState.player.status) {
                    delete this.gameState.player.status.onMission;
                }
            } else {
                const employee = this.gameState.employees[id];
                if (employee && employee.status) {
                    delete employee.status.onMission;
                }
            }
        }
    }

    /**
     * 記錄任務歷史
     */
    recordMissionHistory(mission, success, rewards) {
        this.missionHistory.push({
            missionId: mission.missionId,
            title: mission.title,
            type: mission.type,
            difficulty: mission.difficulty,
            participants: mission.participants.map(p => p.name),
            success: success,
            rewards: rewards,
            duration: mission.duration,
            events: mission.events.length,
            completedAt: this.gameState.timeManager ?
                this.gameState.timeManager.getTimeDescription() :
                Date.now()
        });

        // 限制歷史記錄在 100 個以內
        if (this.missionHistory.length > 100) {
            this.missionHistory.shift();
        }
    }

    /**
     * 檢查參與者是否在執行任務
     */
    isOnMission(participantId) {
        if (participantId === 'player') {
            return this.gameState.player.status?.onMission !== undefined;
        } else {
            const employee = this.gameState.employees[participantId];
            return employee?.status?.onMission !== undefined;
        }
    }

    /**
     * 取消任務（提前召回）
     */
    cancelMission(missionInstanceId) {
        const missionIndex = this.activeMissions.findIndex(m => m.id === missionInstanceId);

        if (missionIndex === -1) {
            return { success: false, message: '任務不存在' };
        }

        const mission = this.activeMissions[missionIndex];

        // 釋放參與者
        this.releaseParticipants(mission.participantIds);

        // 移除任務
        this.activeMissions.splice(missionIndex, 1);

        // 通知
        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.warning(
                '任務取消',
                `已召回「${mission.title}」任務的參與者。`
            );
        }

        return {
            success: true,
            message: '任務已取消'
        };
    }

    /**
     * 獲取可用任務列表
     */
    getAvailableMissions() {
        return Object.values(this.missionDatabase).filter(mission => {
            // 檢查是否滿足解鎖條件
            if (mission.requirements) {
                return this.checkRequirements(mission.requirements);
            }
            return true;
        });
    }

    /**
     * 檢查需求
     */
    checkRequirements(requirements) {
        if (requirements.innLevel) {
            if (this.gameState.inn.level < requirements.innLevel) {
                return false;
            }
        }

        if (requirements.reputation) {
            if (this.gameState.inn.reputation < requirements.reputation) {
                return false;
            }
        }

        if (requirements.minReputation) {
            if (this.gameState.inn.reputation < requirements.minReputation) {
                return false;
            }
        }

        return true;
    }

    /**
     * 獲取任務統計
     */
    getStatistics() {
        const stats = {
            totalMissions: this.missionHistory.length,
            successfulMissions: 0,
            failedMissions: 0,
            totalSilverEarned: 0,
            byType: {}
        };

        for (const record of this.missionHistory) {
            if (record.success) {
                stats.successfulMissions++;
                stats.totalSilverEarned += record.rewards.silver;
            } else {
                stats.failedMissions++;
            }

            if (!stats.byType[record.type]) {
                stats.byType[record.type] = { total: 0, success: 0 };
            }
            stats.byType[record.type].total++;
            if (record.success) {
                stats.byType[record.type].success++;
            }
        }

        return stats;
    }

    /**
     * 檢查參與者是否繁忙
     */
    isParticipantBusy(participantId) {
        return this.activeMissions.some(mission => {
            return mission.participantIds.includes(participantId);
        });
    }

    /**
     * 獲取任務信息
     */
    getMissionInfo(missionId) {
        return this.missionDatabase[missionId] || null;
    }

    /**
     * 獲取活躍任務列表
     */
    getActiveMissions() {
        return this.activeMissions.map(mission => ({
            ...mission,
            missionInfo: this.missionDatabase[mission.missionId]
        }));
    }

    /**
     * 獲取任務歷史
     */
    getHistory(limit = 10) {
        return this.missionHistory.slice(-limit).reverse();
    }

    /**
     * 召回任務（提前結束任務）
     */
    recallMission(missionInstanceId) {
        const mission = this.activeMissions.find(m => m.id === missionInstanceId);

        if (!mission) {
            return { success: false, message: '任務不存在' };
        }

        // 只能召回旅途中或執行中的任務
        if (mission.state !== this.missionStates.TRAVELING &&
            mission.state !== this.missionStates.IN_PROGRESS) {
            return { success: false, message: '任務無法召回' };
        }

        // 設置為返程狀態
        mission.state = this.missionStates.RETURNING;
        mission.returnProgress = 0;
        mission.returnDuration = Math.ceil(mission.duration * 0.5); // 返程時間為任務時間的一半

        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.info(
                '任務召回',
                `任務「${mission.title}」已召回，正在返程中...`
            );
        }

        return {
            success: true,
            message: '任務已召回',
            returnTime: mission.returnDuration
        };
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            activeMissions: this.activeMissions,
            missionHistory: this.missionHistory,
            nextMissionId: this.nextMissionId
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.activeMissions) {
            this.activeMissions = data.activeMissions;
        }

        if (data.missionHistory) {
            this.missionHistory = data.missionHistory;
        }

        if (data.nextMissionId) {
            this.nextMissionId = data.nextMissionId;
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
    module.exports = MissionManager;
}
