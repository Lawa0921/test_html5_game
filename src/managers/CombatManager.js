/**
 * 戰鬥系統管理器
 * 管理客棧內的武林紛爭、衝突解決、戰鬥結算
 *
 * 注：這是輕量級戰鬥系統，用於處理隨機事件，非主要玩法
 */
class CombatManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 戰鬥記錄
        this.combatHistory = [];

        // 統計數據
        this.statistics = {
            totalCombats: 0,
            victories: 0,
            defeats: 0,
            peaceResolved: 0,
            totalDamage: 0,        // 總損失
            totalRewards: 0        // 總獎勵
        };

        // 戰鬥類型
        this.combatTypes = {
            rivalry: '江湖仇殺',
            brawl: '酒後鬧事',
            robbery: '強盜來襲',
            duel: '武林切磋',
            protection: '保護客人'
        };
    }

    /**
     * 觸發戰鬥事件
     * @param {string} combatType - 戰鬥類型
     * @param {object} options - 額外選項
     * @returns {object} 戰鬥結果
     */
    triggerCombat(combatType, options = {}) {
        const combat = this.createCombat(combatType, options);

        if (!combat) {
            return { success: false, reason: '無法創建戰鬥' };
        }

        // 執行戰鬥
        const result = this.executeCombat(combat);

        // 記錄歷史
        this.recordCombat(combat, result);

        // 更新統計
        this.updateStatistics(result);

        // 應用結果
        this.applyResult(result);

        // 通知
        if (this.gameState.notificationManager) {
            this.notifyCombatResult(combat, result);
        }

        return result;
    }

    /**
     * 創建戰鬥實例
     */
    createCombat(combatType, options) {
        const combat = {
            id: `combat_${Date.now()}`,
            type: combatType,
            timestamp: Date.now(),
            participants: {
                enemies: [],
                allies: []
            },
            stakes: {
                potentialLoss: 0,    // 潛在損失
                potentialReward: 0   // 潛在獎勵
            }
        };

        // 根據類型設置參數
        switch (combatType) {
            case 'rivalry':
                return this.setupRivalryCombat(combat, options);
            case 'brawl':
                return this.setupBrawlCombat(combat, options);
            case 'robbery':
                return this.setupRobberyCombat(combat, options);
            case 'duel':
                return this.setupDuelCombat(combat, options);
            case 'protection':
                return this.setupProtectionCombat(combat, options);
            default:
                return null;
        }
    }

    /**
     * 設置江湖仇殺戰鬥
     */
    setupRivalryCombat(combat, options) {
        // 敵人：兩方江湖人士
        combat.participants.enemies = [
            this.createWarrior('仇家甲', 60, 70),
            this.createWarrior('仇家乙', 65, 65)
        ];

        // 盟友：可用的員工
        combat.participants.allies = this.getAvailableDefenders();

        // 風險：可能損壞家具、影響聲望
        combat.stakes.potentialLoss = this.randomInRange(100, 500);
        combat.stakes.potentialReward = this.randomInRange(50, 200);

        combat.description = '兩派江湖人士在客棧相遇，劍拔弩張！';

        return combat;
    }

    /**
     * 設置酒後鬧事戰鬥
     */
    setupBrawlCombat(combat, options) {
        combat.participants.enemies = [
            this.createWarrior('醉漢', 40, 30)
        ];

        combat.participants.allies = this.getAvailableDefenders();

        combat.stakes.potentialLoss = this.randomInRange(50, 200);
        combat.stakes.potentialReward = 0;

        combat.description = '有客人喝醉酒在客棧內鬧事！';

        return combat;
    }

    /**
     * 設置強盜來襲戰鬥
     */
    setupRobberyCombat(combat, options) {
        const robberCount = this.randomInRange(2, 4);
        combat.participants.enemies = [];

        for (let i = 0; i < robberCount; i++) {
            combat.participants.enemies.push(
                this.createWarrior(`強盜${i + 1}`, 50, 50)
            );
        }

        combat.participants.allies = this.getAvailableDefenders();

        // 強盜目標是搶劫，損失可能很大
        const currentSilver = this.gameState.silver;
        combat.stakes.potentialLoss = Math.min(currentSilver * 0.3, 1000);
        combat.stakes.potentialReward = this.randomInRange(100, 300);

        combat.description = '一群強盜闖入客棧，意圖搶劫！';

        return combat;
    }

    /**
     * 設置武林切磋戰鬥
     */
    setupDuelCombat(combat, options) {
        combat.participants.enemies = [
            this.createWarrior('武林高手', 80, 85)
        ];

        combat.participants.allies = this.getAvailableDefenders();

        combat.stakes.potentialLoss = 0;  // 切磋不會損失
        combat.stakes.potentialReward = this.randomInRange(200, 500);

        combat.description = '一位武林高手想要切磋武藝！';
        combat.peaceful = true;  // 可和平解決

        return combat;
    }

    /**
     * 設置保護客人戰鬥
     */
    setupProtectionCombat(combat, options) {
        combat.participants.enemies = [
            this.createWarrior('追殺者', 70, 75)
        ];

        combat.participants.allies = this.getAvailableDefenders();

        combat.stakes.potentialLoss = this.randomInRange(100, 300);
        combat.stakes.potentialReward = this.randomInRange(300, 800);

        combat.description = '有人追殺客棧的客人，需要保護！';
        combat.protectedGuest = options.guestId;

        return combat;
    }

    /**
     * 創建戰士
     */
    createWarrior(name, attack, defense) {
        return {
            name: name,
            attack: attack,
            defense: defense,
            hp: 100,
            maxHp: 100
        };
    }

    /**
     * 獲取可用的防禦者（員工）
     */
    getAvailableDefenders() {
        const defenders = [];

        this.gameState.employees.forEach(employee => {
            if (employee.unlocked && employee.status?.currentState === 'WORKING') {
                defenders.push({
                    name: employee.name,
                    attack: employee.attributes?.strength || 50,
                    defense: employee.attributes?.constitution || 50,
                    hp: 100,
                    maxHp: 100,
                    employeeId: employee.id
                });
            }
        });

        // 如果沒有員工，老闆親自上陣
        if (defenders.length === 0) {
            defenders.push({
                name: this.gameState.player?.name || '掌櫃',
                attack: 30,
                defense: 30,
                hp: 100,
                maxHp: 100,
                isPlayer: true
            });
        }

        return defenders;
    }

    /**
     * 執行戰鬥
     */
    executeCombat(combat) {
        const result = {
            combat: combat,
            outcome: null,  // 'victory', 'defeat', 'peace'
            rounds: [],
            casualties: {
                enemies: 0,
                allies: 0
            },
            damage: 0,
            reward: 0,
            reputationChange: 0,
            experienceGained: {}
        };

        // 計算雙方總戰力
        const allyPower = this.calculateTotalPower(combat.participants.allies);
        const enemyPower = this.calculateTotalPower(combat.participants.enemies);

        // 是否可以和平解決
        if (combat.peaceful && this.canResolvepeacefully(combat)) {
            result.outcome = 'peace';
            result.reward = Math.floor(combat.stakes.potentialReward * 0.5);
            result.reputationChange = 10;
            result.message = '成功和平解決衝突，雙方握手言和';
            return result;
        }

        // 簡化戰鬥：基於戰力比較
        const powerRatio = allyPower / (enemyPower + 1);
        const victoryChance = Math.min(0.9, 0.3 + powerRatio * 0.4);

        // 戰鬥結果
        if (Math.random() < victoryChance) {
            // 勝利
            result.outcome = 'victory';
            result.reward = combat.stakes.potentialReward;
            result.damage = Math.floor(combat.stakes.potentialLoss * 0.2);  // 少量損失
            result.reputationChange = 5;
            result.message = '成功擊退敵人，保護了客棧安全';

            // 員工獲得經驗
            combat.participants.allies.forEach(ally => {
                if (ally.employeeId !== undefined) {
                    result.experienceGained[ally.employeeId] = this.randomInRange(10, 30);
                }
            });
        } else {
            // 失敗
            result.outcome = 'defeat';
            result.reward = 0;
            result.damage = combat.stakes.potentialLoss;
            result.reputationChange = -10;
            result.message = '戰鬥失利，客棧蒙受損失';
        }

        return result;
    }

    /**
     * 計算總戰力
     */
    calculateTotalPower(warriors) {
        return warriors.reduce((total, warrior) => {
            return total + warrior.attack + warrior.defense;
        }, 0);
    }

    /**
     * 是否可以和平解決
     */
    canResolvepeacefully(combat) {
        // 基於掌櫃魅力和聲望
        const charisma = this.gameState.player?.attributes?.charisma || 50;
        const reputation = this.gameState.inn?.reputation || 0;

        const peaceChance = Math.min(0.8, (charisma / 100) * 0.5 + (reputation / 1000) * 0.3);

        return Math.random() < peaceChance;
    }

    /**
     * 記錄戰鬥歷史
     */
    recordCombat(combat, result) {
        this.combatHistory.push({
            ...combat,
            result: {
                outcome: result.outcome,
                damage: result.damage,
                reward: result.reward,
                reputationChange: result.reputationChange
            },
            timestamp: Date.now()
        });

        // 只保留最近 50 場戰鬥
        if (this.combatHistory.length > 50) {
            this.combatHistory = this.combatHistory.slice(-50);
        }
    }

    /**
     * 更新統計
     */
    updateStatistics(result) {
        this.statistics.totalCombats++;

        switch (result.outcome) {
            case 'victory':
                this.statistics.victories++;
                break;
            case 'defeat':
                this.statistics.defeats++;
                break;
            case 'peace':
                this.statistics.peaceResolved++;
                break;
        }

        this.statistics.totalDamage += result.damage;
        this.statistics.totalRewards += result.reward;
    }

    /**
     * 應用結果
     */
    applyResult(result) {
        // 扣除損失
        if (result.damage > 0) {
            this.gameState.addSilver(-result.damage);
        }

        // 獲得獎勵
        if (result.reward > 0) {
            this.gameState.addSilver(result.reward);
        }

        // 聲望變化
        if (result.reputationChange !== 0 && this.gameState.inn) {
            this.gameState.inn.reputation = Math.max(0,
                this.gameState.inn.reputation + result.reputationChange
            );
        }

        // 員工經驗
        for (const [employeeId, exp] of Object.entries(result.experienceGained)) {
            // Object.entries 會把 key 轉成字符串，需要轉回數字比較
            const numericId = Number(employeeId);
            const employee = this.gameState.employees.find(e => e.id === numericId);
            if (employee && employee.work && employee.work.experience !== undefined) {
                employee.work.experience += exp;
            }
        }
    }

    /**
     * 通知戰鬥結果
     */
    notifyCombatResult(combat, result) {
        let title, message;

        switch (result.outcome) {
            case 'victory':
                title = '戰鬥勝利';
                message = `${result.message}\n獲得獎勵：${result.reward} 兩\n損失：${result.damage} 兩`;
                this.gameState.notificationManager.success(title, message);
                break;

            case 'defeat':
                title = '戰鬥失敗';
                message = `${result.message}\n損失：${result.damage} 兩\n聲望：${result.reputationChange}`;
                this.gameState.notificationManager.error(title, message);
                break;

            case 'peace':
                title = '和平解決';
                message = `${result.message}\n獲得獎勵：${result.reward} 兩`;
                this.gameState.notificationManager.info(title, message);
                break;
        }
    }

    /**
     * 隨機觸發戰鬥（由事件系統調用）
     */
    randomCombatEvent() {
        // 基於聲望和客棧等級決定事件機率和類型
        const reputation = this.gameState.inn?.reputation || 0;
        const innLevel = this.gameState.inn?.level || 1;

        // 聲望越高，越容易吸引武林人士（切磋）
        // 聲望越低，越容易遭遇麻煩（強盜、鬧事）

        let eventType;
        const rand = Math.random();

        if (reputation < 200) {
            // 低聲望：容易遭遇麻煩
            if (rand < 0.5) eventType = 'brawl';
            else if (rand < 0.8) eventType = 'robbery';
            else eventType = 'rivalry';
        } else if (reputation < 600) {
            // 中聲望：平衡
            if (rand < 0.4) eventType = 'rivalry';
            else if (rand < 0.7) eventType = 'brawl';
            else eventType = 'duel';
        } else {
            // 高聲望：吸引高手
            if (rand < 0.5) eventType = 'duel';
            else if (rand < 0.8) eventType = 'protection';
            else eventType = 'rivalry';
        }

        return this.triggerCombat(eventType);
    }

    /**
     * 獲取戰鬥統計
     */
    getStatistics() {
        const winRate = this.statistics.totalCombats > 0
            ? (this.statistics.victories / this.statistics.totalCombats * 100).toFixed(1) + '%'
            : '0%';

        const peaceRate = this.statistics.totalCombats > 0
            ? (this.statistics.peaceResolved / this.statistics.totalCombats * 100).toFixed(1) + '%'
            : '0%';

        return {
            ...this.statistics,
            winRate: winRate,
            peaceRate: peaceRate,
            netProfit: this.statistics.totalRewards - this.statistics.totalDamage
        };
    }

    /**
     * 獲取最近戰鬥記錄
     */
    getRecentCombats(count = 10) {
        return this.combatHistory.slice(-count).reverse();
    }

    /**
     * 工具方法：隨機數範圍
     */
    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            combatHistory: this.combatHistory.slice(-50),
            statistics: { ...this.statistics }
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.combatHistory) {
            this.combatHistory = data.combatHistory;
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
    module.exports = CombatManager;
}
