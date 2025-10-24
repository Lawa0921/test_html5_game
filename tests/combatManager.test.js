import { describe, it, expect, beforeEach } from 'vitest';

const CombatManager = require('../src/managers/CombatManager');
const GameState = require('../src/core/GameState');

describe('CombatManager - 戰鬥系統', () => {
    let gameState;
    let combatManager;

    beforeEach(() => {
        gameState = new GameState();
        combatManager = new CombatManager(gameState);

        // 設置一些基礎狀態
        gameState.silver = 1000;
        gameState.inn.reputation = 100;
    });

    describe('初始化', () => {
        it('應該正確初始化', () => {
            expect(combatManager.gameState).toBe(gameState);
            expect(combatManager.combatHistory).toEqual([]);
            expect(combatManager.statistics).toBeDefined();
        });

        it('應該有戰鬥類型定義', () => {
            expect(combatManager.combatTypes).toHaveProperty('rivalry');
            expect(combatManager.combatTypes).toHaveProperty('brawl');
            expect(combatManager.combatTypes).toHaveProperty('robbery');
            expect(combatManager.combatTypes).toHaveProperty('duel');
            expect(combatManager.combatTypes).toHaveProperty('protection');
        });

        it('應該有統計結構', () => {
            expect(combatManager.statistics).toHaveProperty('totalCombats');
            expect(combatManager.statistics).toHaveProperty('victories');
            expect(combatManager.statistics).toHaveProperty('defeats');
            expect(combatManager.statistics).toHaveProperty('peaceResolved');
        });
    });

    describe('創建戰士', () => {
        it('應該能創建戰士', () => {
            const warrior = combatManager.createWarrior('測試俠客', 60, 70);
            expect(warrior.name).toBe('測試俠客');
            expect(warrior.attack).toBe(60);
            expect(warrior.defense).toBe(70);
            expect(warrior.hp).toBe(100);
            expect(warrior.maxHp).toBe(100);
        });
    });

    describe('獲取防禦者', () => {
        it('沒有員工時應該返回掌櫃', () => {
            // 清空員工
            gameState.employees.forEach(e => { e.unlocked = false; });

            const defenders = combatManager.getAvailableDefenders();
            expect(defenders.length).toBe(1);
            expect(defenders[0].isPlayer).toBe(true);
        });

        it('有工作中的員工時應該返回員工', () => {
            const employee = gameState.employees[0];
            employee.unlocked = true;
            employee.status = { currentState: 'WORKING' };
            employee.attributes = {
                strength: 70,
                constitution: 65
            };

            const defenders = combatManager.getAvailableDefenders();
            expect(defenders.length).toBeGreaterThan(0);
            expect(defenders[0].employeeId).toBe(employee.id);
        });

        it('只返回工作中的員工', () => {
            gameState.employees[0].unlocked = true;
            gameState.employees[0].status = { currentState: 'WORKING' };

            gameState.employees[1].unlocked = true;
            gameState.employees[1].status = { currentState: 'IDLE' };

            const defenders = combatManager.getAvailableDefenders();
            expect(defenders.length).toBe(1);
        });
    });

    describe('創建戰鬥', () => {
        it('應該能創建江湖仇殺戰鬥', () => {
            const combat = combatManager.createCombat('rivalry');
            expect(combat).toBeDefined();
            expect(combat.type).toBe('rivalry');
            expect(combat.participants.enemies.length).toBe(2);
            expect(combat.participants.allies.length).toBeGreaterThan(0);
            expect(combat.stakes.potentialLoss).toBeGreaterThan(0);
        });

        it('應該能創建酒後鬧事戰鬥', () => {
            const combat = combatManager.createCombat('brawl');
            expect(combat).toBeDefined();
            expect(combat.type).toBe('brawl');
            expect(combat.participants.enemies.length).toBe(1);
        });

        it('應該能創建強盜來襲戰鬥', () => {
            const combat = combatManager.createCombat('robbery');
            expect(combat).toBeDefined();
            expect(combat.type).toBe('robbery');
            expect(combat.participants.enemies.length).toBeGreaterThanOrEqual(2);
            expect(combat.stakes.potentialLoss).toBeGreaterThan(0);
        });

        it('應該能創建武林切磋戰鬥', () => {
            const combat = combatManager.createCombat('duel');
            expect(combat).toBeDefined();
            expect(combat.type).toBe('duel');
            expect(combat.peaceful).toBe(true);
            expect(combat.stakes.potentialLoss).toBe(0);
        });

        it('應該能創建保護客人戰鬥', () => {
            const combat = combatManager.createCombat('protection', { guestId: 'guest_123' });
            expect(combat).toBeDefined();
            expect(combat.type).toBe('protection');
            expect(combat.protectedGuest).toBe('guest_123');
        });

        it('無效類型應該返回 null', () => {
            const combat = combatManager.createCombat('invalid_type');
            expect(combat).toBeNull();
        });
    });

    describe('計算戰力', () => {
        it('應該正確計算總戰力', () => {
            const warriors = [
                { attack: 60, defense: 70 },
                { attack: 50, defense: 50 }
            ];
            const power = combatManager.calculateTotalPower(warriors);
            expect(power).toBe(230);
        });

        it('空陣列應該返回 0', () => {
            const power = combatManager.calculateTotalPower([]);
            expect(power).toBe(0);
        });
    });

    describe('執行戰鬥', () => {
        it('應該能執行戰鬥並返回結果', () => {
            const combat = combatManager.createCombat('brawl');
            const result = combatManager.executeCombat(combat);

            expect(result).toBeDefined();
            expect(result.outcome).toBeDefined();
            expect(['victory', 'defeat', 'peace']).toContain(result.outcome);
            expect(result.message).toBeDefined();
        });

        it('和平型戰鬥可能和平解決', () => {
            const combat = combatManager.createCombat('duel');

            // 提高和平解決機率
            gameState.player.attributes = { charisma: 100 };
            gameState.inn.reputation = 1000;

            const result = combatManager.executeCombat(combat);
            // 不保證一定和平，只檢查結果有效
            expect(['victory', 'defeat', 'peace']).toContain(result.outcome);
        });

        it('勝利應該獲得獎勵', () => {
            // 使用有獎勵的戰鬥類型（duel 或 protection）
            const combat = combatManager.createCombat('duel');

            // 給予壓倒性優勢
            combat.participants.allies = [
                combatManager.createWarrior('超強員工', 200, 200)
            ];

            const result = combatManager.executeCombat(combat);
            if (result.outcome === 'victory') {
                expect(result.reward).toBeGreaterThan(0);
                expect(result.reputationChange).toBeGreaterThan(0);
            }
            // 如果是和平解決，獎勵也應該 > 0
            if (result.outcome === 'peace') {
                expect(result.reward).toBeGreaterThan(0);
            }
        });

        it('失敗應該有損失', () => {
            const combat = combatManager.createCombat('robbery');

            // 給予絕對劣勢
            combat.participants.allies = [
                combatManager.createWarrior('弱雞掌櫃', 10, 10)
            ];
            combat.participants.enemies = [
                combatManager.createWarrior('超強強盜', 200, 200)
            ];

            const result = combatManager.executeCombat(combat);
            if (result.outcome === 'defeat') {
                expect(result.damage).toBeGreaterThan(0);
                expect(result.reputationChange).toBeLessThan(0);
            }
        });
    });

    describe('觸發戰鬥', () => {
        it('應該能觸發完整戰鬥流程', () => {
            const result = combatManager.triggerCombat('brawl');
            expect(result.success).not.toBe(false);
            expect(result.outcome).toBeDefined();
        });

        it('應該記錄到歷史', () => {
            const initialLength = combatManager.combatHistory.length;
            combatManager.triggerCombat('brawl');
            expect(combatManager.combatHistory.length).toBe(initialLength + 1);
        });

        it('應該更新統計', () => {
            const initialTotal = combatManager.statistics.totalCombats;
            combatManager.triggerCombat('brawl');
            expect(combatManager.statistics.totalCombats).toBe(initialTotal + 1);
        });

        it('應該應用結果到遊戲狀態', () => {
            const initialSilver = gameState.silver;
            const result = combatManager.triggerCombat('brawl');

            // 銀兩應該有變化（獎勵或損失）
            expect(gameState.silver).not.toBe(initialSilver);
        });
    });

    describe('應用結果', () => {
        it('應該扣除損失', () => {
            const initialSilver = gameState.silver;
            const result = {
                outcome: 'defeat',
                damage: 100,
                reward: 0,
                reputationChange: -5,
                experienceGained: {}
            };

            combatManager.applyResult(result);
            expect(gameState.silver).toBe(initialSilver - 100);
        });

        it('應該發放獎勵', () => {
            const initialSilver = gameState.silver;
            const result = {
                outcome: 'victory',
                damage: 0,
                reward: 200,
                reputationChange: 5,
                experienceGained: {}
            };

            combatManager.applyResult(result);
            expect(gameState.silver).toBe(initialSilver + 200);
        });

        it('應該更新聲望', () => {
            const initialReputation = gameState.inn.reputation;
            const result = {
                outcome: 'victory',
                damage: 0,
                reward: 0,
                reputationChange: 10,
                experienceGained: {}
            };

            combatManager.applyResult(result);
            expect(gameState.inn.reputation).toBe(initialReputation + 10);
        });

        it('聲望不應低於 0', () => {
            gameState.inn.reputation = 5;
            const result = {
                outcome: 'defeat',
                damage: 0,
                reward: 0,
                reputationChange: -10,
                experienceGained: {}
            };

            combatManager.applyResult(result);
            expect(gameState.inn.reputation).toBeGreaterThanOrEqual(0);
        });

        it('應該發放員工經驗', () => {
            const employee = gameState.employees[0];
            employee.hired.unlocked = true;

            // 確保 work 對象存在
            if (!employee.work) {
                employee.work = { experience: 0 };
            }
            employee.work.experience = 0;

            const result = {
                outcome: 'victory',
                damage: 0,
                reward: 0,
                reputationChange: 0,
                experienceGained: {
                    [employee.id]: 50
                }
            };

            combatManager.applyResult(result);
            expect(employee.work.experience).toBe(50);
        });
    });

    describe('隨機戰鬥事件', () => {
        it('應該能隨機觸發戰鬥', () => {
            const result = combatManager.randomCombatEvent();
            expect(result).toBeDefined();
            expect(result.outcome).toBeDefined();
        });

        it('低聲望更容易遇到麻煩', () => {
            gameState.inn.reputation = 50;

            // 多次測試（由於隨機性）
            const results = [];
            for (let i = 0; i < 10; i++) {
                const result = combatManager.randomCombatEvent();
                results.push(result.combat.type);
            }

            // 應該有鬧事或強盜
            const hasTrouble = results.some(type =>
                type === 'brawl' || type === 'robbery'
            );
            expect(hasTrouble).toBe(true);
        });

        it('高聲望更容易遇到高手', () => {
            gameState.inn.reputation = 800;

            const results = [];
            for (let i = 0; i < 10; i++) {
                const result = combatManager.randomCombatEvent();
                results.push(result.combat.type);
            }

            // 應該有切磋或保護
            const hasHighLevel = results.some(type =>
                type === 'duel' || type === 'protection'
            );
            expect(hasHighLevel).toBe(true);
        });
    });

    describe('戰鬥記錄', () => {
        it('應該能獲取最近戰鬥記錄', () => {
            combatManager.triggerCombat('brawl');
            combatManager.triggerCombat('robbery');

            const recent = combatManager.getRecentCombats(5);
            expect(recent.length).toBe(2);
            expect(recent[0].type).toBe('robbery');  // 最新的在前
            expect(recent[1].type).toBe('brawl');
        });

        it('記錄應該限制在 50 條', () => {
            for (let i = 0; i < 60; i++) {
                combatManager.triggerCombat('brawl');
            }

            expect(combatManager.combatHistory.length).toBeLessThanOrEqual(50);
        });
    });

    describe('統計數據', () => {
        it('應該能獲取統計數據', () => {
            const stats = combatManager.getStatistics();
            expect(stats).toHaveProperty('totalCombats');
            expect(stats).toHaveProperty('victories');
            expect(stats).toHaveProperty('defeats');
            expect(stats).toHaveProperty('winRate');
            expect(stats).toHaveProperty('netProfit');
        });

        it('應該正確計算勝率', () => {
            // 進行幾場戰鬥
            for (let i = 0; i < 5; i++) {
                combatManager.triggerCombat('brawl');
            }

            const stats = combatManager.getStatistics();
            expect(stats.winRate).toContain('%');
        });

        it('沒有戰鬥時勝率應該是 0%', () => {
            const stats = combatManager.getStatistics();
            expect(stats.winRate).toBe('0%');
        });

        it('應該追蹤淨收益', () => {
            combatManager.triggerCombat('robbery');
            const stats = combatManager.getStatistics();
            expect(stats.netProfit).toBeDefined();
            expect(typeof stats.netProfit).toBe('number');
        });
    });

    describe('序列化與反序列化', () => {
        it('應該能序列化數據', () => {
            combatManager.triggerCombat('brawl');
            combatManager.triggerCombat('robbery');

            const data = combatManager.serialize();
            expect(data).toHaveProperty('combatHistory');
            expect(data).toHaveProperty('statistics');
            expect(data.combatHistory.length).toBe(2);
        });

        it('應該能反序列化數據', () => {
            combatManager.triggerCombat('brawl');
            const data = combatManager.serialize();

            const newManager = new CombatManager(gameState);
            newManager.deserialize(data);

            expect(newManager.combatHistory.length).toBe(1);
            expect(newManager.statistics.totalCombats).toBe(data.statistics.totalCombats);
        });

        it('序列化應該限制歷史記錄數量', () => {
            for (let i = 0; i < 60; i++) {
                combatManager.triggerCombat('brawl');
            }

            const data = combatManager.serialize();
            expect(data.combatHistory.length).toBeLessThanOrEqual(50);
        });
    });

    describe('邊界條件', () => {
        it('銀兩為 0 時強盜損失應該為 0', () => {
            gameState.silver = 0;
            const combat = combatManager.createCombat('robbery');
            expect(combat.stakes.potentialLoss).toBe(0);
        });

        it('沒有員工且沒有玩家時應該正常處理', () => {
            gameState.employees = [];
            gameState.player = null;

            const defenders = combatManager.getAvailableDefenders();
            expect(defenders.length).toBeGreaterThan(0);
        });

        it('空的戰鬥歷史應該正常運作', () => {
            expect(combatManager.getRecentCombats()).toEqual([]);
        });

        it('和平解決機率應該在 0-1 之間', () => {
            gameState.player.attributes = { charisma: 100 };
            gameState.inn.reputation = 1000;

            const combat = combatManager.createCombat('duel');

            // canResolvepeacefully 應該總是返回 boolean
            for (let i = 0; i < 10; i++) {
                const canResolve = combatManager.canResolvepeacefully(combat);
                expect(typeof canResolve).toBe('boolean');
            }
        });
    });
});
