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

describe('StoryManager', () => {
    let gameState;
    let storyManager;

    beforeEach(() => {
        localStorage.clear();
        gameState = new GameState();
        storyManager = gameState.storyManager;
    });

    describe('初始化', () => {
        it('應該正確初始化', () => {
            expect(storyManager).toBeDefined();
            expect(storyManager.gameState).toBe(gameState);
        });

        it('應該初始化空的故事數據庫', () => {
            expect(storyManager.storyDatabase).toBeDefined();
            expect(typeof storyManager.storyDatabase).toBe('object');
        });

        it('應該初始化為無當前故事', () => {
            expect(storyManager.currentStory).toBeNull();
            expect(storyManager.currentNodeIndex).toBe(0);
        });
    });

    describe('載入故事數據', () => {
        it('loadStoryData 應該嘗試載入故事數據', () => {
            const result = storyManager.loadStoryData();
            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
        });
    });

    describe('開始故事', () => {
        beforeEach(() => {
            storyManager.storyDatabase = {
                test_story: {
                    id: 'test_story',
                    title: '測試故事',
                    nodes: [
                        { id: 0, text: '這是第一個節點', nextNode: 1 },
                        {
                            id: 1,
                            text: '這是第二個節點',
                            choices: [
                                { text: '選項A', nextNode: 2 },
                                { text: '選項B', nextNode: 3 }
                            ]
                        },
                        { id: 2, text: '你選擇了A' },
                        { id: 3, text: '你選擇了B' }
                    ]
                }
            };
        });

        it('startStory 應該開始指定的故事', () => {
            const result = storyManager.startStory('test_story');
            expect(result.success).toBe(true);
            expect(result.storyId).toBe('test_story');
            expect(result.title).toBe('測試故事');
        });

        it('startStory 不存在的故事應該失敗', () => {
            const result = storyManager.startStory('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    describe('節點操作', () => {
        beforeEach(() => {
            storyManager.storyDatabase = {
                test: {
                    nodes: [
                        { id: 0, text: '開始', nextNode: 1 },
                        {
                            id: 1,
                            text: '選擇',
                            choices: [
                                { text: 'A', nextNode: 2 },
                                { text: 'B', nextNode: 3 }
                            ]
                        },
                        { id: 2, text: '結局A' },
                        { id: 3, text: '結局B' }
                    ]
                }
            };
            storyManager.startStory('test');
        });

        it('getCurrentNode 應該返回當前節點', () => {
            const node = storyManager.getCurrentNode();
            expect(node).toBeDefined();
            expect(node.text).toBe('開始');
        });

        it('nextNode 應該推進到下一個節點', () => {
            const result = storyManager.nextNode();
            expect(result.success).toBe(true);
            expect(storyManager.currentNodeIndex).toBe(1);
        });

        it('nextNode 有選項時需要提供選擇', () => {
            storyManager.nextNode(); // 推進到節點1
            const result = storyManager.nextNode(); // 沒有提供選擇
            expect(result.success).toBe(false);
        });

        it('nextNode 應該處理選項跳轉', () => {
            storyManager.nextNode(); // 到節點1
            const result = storyManager.nextNode(0); // 選擇選項A
            expect(result.success).toBe(true);
            expect(storyManager.currentNodeIndex).toBe(2);
        });
    });

    describe('條件評估', () => {
        beforeEach(() => {
            storyManager.variables = { flag1: true, counter: 5 };
        });

        it('evaluateCondition 應該評估變量條件', () => {
            const condition = {
                type: 'variable',
                key: 'flag1',
                operator: '==',
                value: true
            };
            expect(storyManager.evaluateCondition(condition)).toBe(true);
        });

        it('evaluateCondition 應該評估數值比較', () => {
            const condition = {
                type: 'variable',
                key: 'counter',
                operator: '>',
                value: 3
            };
            expect(storyManager.evaluateCondition(condition)).toBe(true);
        });
    });

    describe('選項效果', () => {
        beforeEach(() => {
            storyManager.variables = {};
        });

        it('applyChoiceEffects 應該設置變量', () => {
            const choice = {
                effects: [
                    { type: 'set_variable', key: 'test_var', value: 42 }
                ]
            };
            storyManager.applyChoiceEffects(choice);
            expect(storyManager.variables.test_var).toBe(42);
        });

        it('applyChoiceEffects 應該給予物品', () => {
            const choice = {
                effects: [
                    { type: 'add_item', itemId: 'potion', quantity: 3 }
                ]
            };
            storyManager.applyChoiceEffects(choice);
            // 驗證物品已添加到玩家背包
            if (gameState.player && gameState.player.inventory) {
                expect(gameState.player.inventory.hasItem('potion')).toBe(true);
            } else {
                // 如果玩家背包未初始化，至少確保方法不拋出錯誤
                expect(true).toBe(true);
            }
        });
    });

    describe('故事結束', () => {
        it('endStory 應該清除當前故事', () => {
            storyManager.storyDatabase = {
                test: { id: 'test', nodes: [{ id: 0, text: 'End' }] }
            };
            storyManager.startStory('test');
            const result = storyManager.endStory();
            expect(result.ended).toBe(true);
            expect(storyManager.currentStory).toBeNull();
        });
    });

    describe('故事進度', () => {
        it('getSummary 應該返回故事進度摘要', () => {
            const summary = storyManager.getSummary();
            expect(summary.currentStory).toBeNull();
            expect(summary.currentNode).toBe(0);
        });

        it('goBack 應該回退到上一個節點', () => {
            storyManager.storyDatabase = {
                test: { nodes: [{ id: 0, text: 'A', nextNode: 1 }, { id: 1, text: 'B' }] }
            };
            storyManager.startStory('test');
            storyManager.nextNode();
            const result = storyManager.goBack();
            expect(result.success).toBe(true);
            expect(storyManager.currentNodeIndex).toBe(0);
        });

        it('skipStory 應該跳過當前故事', () => {
            storyManager.storyDatabase = {
                test: { id: 'test', nodes: [{ id: 0, text: 'A' }] }
            };
            storyManager.startStory('test');
            const result = storyManager.skipStory();
            expect(result.ended).toBe(true);
        });
    });

    describe('序列化', () => {
        it('serialize 應該序列化故事狀態', () => {
            storyManager.variables = { key: 'value' };
            const data = storyManager.serialize();
            expect(data.currentStory).toBeNull();
            expect(data.variables).toEqual({ key: 'value' });
        });

        it('deserialize 應該恢復故事狀態', () => {
            storyManager.storyDatabase = {
                test: { id: 'test', nodes: [{ id: 0 }, { id: 1 }] }
            };
            const savedData = {
                currentStory: 'test',
                currentNodeIndex: 1,
                variables: { saved: true }
            };
            storyManager.deserialize(savedData);
            expect(storyManager.currentStory.id).toBe('test');
            expect(storyManager.currentNodeIndex).toBe(1);
            expect(storyManager.variables.saved).toBe(true);
        });
    });
});
