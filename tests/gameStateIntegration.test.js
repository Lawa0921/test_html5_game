import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

const GameState = require('../src/core/GameState');

describe('GameState 整合測試 - CharacterDispatchManager', () => {
    let gameState;

    beforeEach(() => {
        localStorage.clear();
        gameState = new GameState();
    });

    describe('CharacterDispatchManager 整合', () => {
        it('應該在 GameState 中正確初始化 CharacterDispatchManager', () => {
            expect(gameState.characterDispatchManager).toBeDefined();
            expect(gameState.characterDispatchManager).not.toBeNull();
        });

        it('CharacterDispatchManager 應該能訪問 gameState', () => {
            expect(gameState.characterDispatchManager.gameState).toBe(gameState);
        });

        it('應該能通過 GameState 派遣角色執行任務', () => {
            // 假設有員工
            const character = {
                id: '001',
                name: '測試員工',
                experience: {},
                fatigue: 0
            };

            // 執行派遣
            const result = gameState.characterDispatchManager.dispatch(character, 'cooking');

            // 驗證結果
            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
        });

        it('所有角色都應該能執行所有任務類型（無 restrictedTo 限制）', () => {
            const character = { id: '001', name: '測試', experience: {}, fatigue: 0 };
            const taskTypes = ['cooking', 'serving', 'cleaning', 'performing', 'healing', 'security'];

            taskTypes.forEach(taskType => {
                const result = gameState.characterDispatchManager.dispatch(character, taskType);

                // 所有任務都應該能夠派遣（即使效率可能很低）
                // success 可能是 false（因為其他原因），但不應該因為 restrictedTo 而失敗
                expect(result).toBeDefined();
                if (result.reason) {
                    expect(result.reason).not.toBe('該角色無法執行此任務');
                }
            });
        });

        it('應該正確計算不同技能等級的效率差異', () => {
            // 創建兩個角色：高技能和低技能
            const highSkillChar = {
                id: '002', // 林語嫣（烹飪5星）
                name: '林語嫣',
                experience: { cooking: 10000 }, // 假設高經驗
                fatigue: 0
            };

            const lowSkillChar = {
                id: '008', // 蕭鐵峰（烹飪1星）
                name: '蕭鐵峰',
                experience: {}, // 無經驗
                fatigue: 0
            };

            const highEfficiency = gameState.characterDispatchManager.calculateEfficiency(highSkillChar, 'cooking');
            const lowEfficiency = gameState.characterDispatchManager.calculateEfficiency(lowSkillChar, 'cooking');

            // 高技能角色的成功率應該高於低技能角色
            expect(highEfficiency.successRate).toBeGreaterThan(lowEfficiency.successRate);
            expect(highEfficiency.baseSkill).toBeGreaterThan(lowEfficiency.baseSkill);
        });

        it('calculateEfficiency 應該返回完整的效率信息', () => {
            const character = {
                id: '002',
                name: '林語嫣',
                experience: {},
                fatigue: 0
            };

            const efficiency = gameState.characterDispatchManager.calculateEfficiency(character, 'cooking');

            // 驗證返回的效率對象包含所有必要屬性
            expect(efficiency).toBeDefined();
            expect(efficiency.speed).toBeDefined();
            expect(efficiency.quality).toBeDefined();
            expect(efficiency.successRate).toBeDefined();
            expect(efficiency.baseSkill).toBeDefined();
            expect(efficiency.experienceBonus).toBeDefined();
            expect(efficiency.fatiguePenalty).toBeDefined();
        });

        it('應該有預定義的任務定義', () => {
            // 驗證 taskDefinitions 存在
            expect(gameState.characterDispatchManager.taskDefinitions).toBeDefined();

            // 驗證至少包含基本任務
            const taskDefs = gameState.characterDispatchManager.taskDefinitions;
            expect(taskDefs.cooking).toBeDefined();
            expect(taskDefs.serving).toBeDefined();
            expect(taskDefs.performing).toBeDefined();
        });

        it('派遣功能應該正常工作', () => {
            const character = { id: '002', name: '林語嫣', experience: {}, fatigue: 0 };

            // 執行派遣
            const result = gameState.characterDispatchManager.dispatch(character, 'cooking');

            // 驗證返回結果
            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
        });
    });

    describe('所有管理器整合測試', () => {
        it('應該有12個管理器實例', () => {
            const managers = [
                'equipmentManager',
                'storyManager',
                'eventManager',
                'notificationManager',
                'affectionManager',
                'timeManager',
                'seasonManager',
                'missionManager',
                'tradeManager',
                'guestManager',
                'recipeManager',
                'combatManager',
                'characterDispatchManager' // 新增的管理器
            ];

            managers.forEach(managerName => {
                expect(gameState[managerName]).toBeDefined();
                expect(gameState[managerName]).not.toBeNull();
            });
        });

        it('所有管理器都應該能訪問 GameState', () => {
            const managersWithGameState = [
                'characterDispatchManager',
                'recipeManager',
                'combatManager',
                'affectionManager',
                'missionManager'
            ];

            managersWithGameState.forEach(managerName => {
                const manager = gameState[managerName];
                expect(manager.gameState).toBe(gameState);
            });
        });
    });

    describe('CharacterDispatchManager 與其他系統的整合', () => {
        it('派遣烹飪任務應該與 RecipeManager 配合', () => {
            // 驗證兩個管理器都存在
            expect(gameState.characterDispatchManager).toBeDefined();
            expect(gameState.recipeManager).toBeDefined();

            // 兩者都應該能訪問 gameState
            expect(gameState.characterDispatchManager.gameState).toBe(gameState);
            expect(gameState.recipeManager.gameState).toBe(gameState);
        });

        it('派遣戰鬥任務應該與 CombatManager 配合', () => {
            expect(gameState.characterDispatchManager).toBeDefined();
            expect(gameState.combatManager).toBeDefined();

            expect(gameState.characterDispatchManager.gameState).toBe(gameState);
            expect(gameState.combatManager.gameState).toBe(gameState);
        });

        it('派遣應該影響角色疲勞度（與狀態系統整合）', () => {
            const character = {
                id: '001',
                name: '測試',
                experience: {},
                fatigue: 0
            };

            const initialFatigue = character.fatigue;
            gameState.characterDispatchManager.dispatch(character, 'cooking');

            // 派遣後疲勞度可能會變化（取決於實現）
            expect(character.fatigue).toBeGreaterThanOrEqual(initialFatigue);
        });
    });

    describe('UI 數據提供測試', () => {
        it('應該能提供 UI 所需的派遣任務數據', () => {
            const taskDefs = gameState.characterDispatchManager.taskDefinitions;

            // 驗證任務定義包含 UI 需要的信息
            expect(taskDefs.cooking).toBeDefined();
            expect(taskDefs.cooking.name).toBeDefined();
            expect(taskDefs.cooking.category).toBeDefined();
        });

        it('應該能提供角色的效率信息供 UI 顯示', () => {
            const character = { id: '002', name: '林語嫣', experience: {}, fatigue: 0 };

            const efficiency = gameState.characterDispatchManager.calculateEfficiency(character, 'cooking');

            // 驗證效率對象包含 UI 需要的數據
            expect(efficiency).toBeDefined();
            expect(efficiency.speed).toBeDefined();
            expect(typeof efficiency.speed).toBe('number');
            expect(efficiency.successRate).toBeDefined();
            expect(typeof efficiency.successRate).toBe('number');
        });

        it('CharacterDispatchManager 應該能被 UI 正常訪問', () => {
            // 驗證 UI 能夠訪問 CharacterDispatchManager
            expect(gameState.characterDispatchManager).toBeDefined();
            expect(typeof gameState.characterDispatchManager.dispatch).toBe('function');
            expect(typeof gameState.characterDispatchManager.calculateEfficiency).toBe('function');
        });
    });
});
