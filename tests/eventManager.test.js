/**
 * EventManager 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const EventManager = require('../src/managers/EventManager');
const GameState = require('../src/core/GameState');

describe('事件管理器', () => {
    let gameState;
    let eventManager;

    beforeEach(() => {
        gameState = new GameState();
        eventManager = gameState.eventManager;
    });

    describe('初始化', () => {
        it('應該成功載入事件數據', () => {
            const result = eventManager.loadEventData();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
        });

        it('事件數據庫應該包含預期的事件', () => {
            expect(eventManager.eventDatabase['merchant_caravan']).toBeDefined();
            expect(eventManager.eventDatabase['bandit_attack']).toBeDefined();
            expect(eventManager.eventDatabase['festival']).toBeDefined();
        });

        it('應該有正確的初始狀態', () => {
            expect(eventManager.eventHistory).toBeDefined();
            expect(eventManager.eventHistory.length).toBe(0);
            expect(eventManager.eventCooldowns).toBeDefined();
        });
    });

    describe('事件觸發', () => {
        it('應該能觸發指定事件', () => {
            const result = eventManager.triggerEvent('merchant_caravan');

            expect(result.success).toBe(true);
            expect(result.event).toBeDefined();
            expect(result.event.id).toBe('merchant_caravan');
            expect(result.event.title).toBe('商隊來訪');
        });

        it('觸發不存在的事件應該失敗', () => {
            const result = eventManager.triggerEvent('nonexistent_event');
            expect(result.success).toBe(false);
        });

        it('應該記錄事件歷史', () => {
            eventManager.triggerEvent('merchant_caravan');
            expect(eventManager.eventHistory.length).toBe(1);
            expect(eventManager.eventHistory[0].eventId).toBe('merchant_caravan');
        });

        it('事件歷史應該限制在100個', () => {
            for (let i = 0; i < 110; i++) {
                eventManager.triggerEvent('merchant_caravan');
            }
            expect(eventManager.eventHistory.length).toBe(100);
        });
    });

    describe('事件冷卻', () => {
        it('觸發事件應該設置冷卻時間', () => {
            const beforeCooldowns = Object.keys(eventManager.eventCooldowns).length;
            eventManager.triggerEvent('merchant_caravan');
            const afterCooldowns = Object.keys(eventManager.eventCooldowns).length;

            expect(afterCooldowns).toBeGreaterThan(beforeCooldowns);
        });

        it('應該能清除冷卻時間', () => {
            eventManager.triggerEvent('merchant_caravan');
            eventManager.clearCooldowns();

            expect(Object.keys(eventManager.eventCooldowns).length).toBe(0);
        });
    });

    describe('條件檢查', () => {
        it('應該能檢查銀兩條件', () => {
            gameState.silver = 1000;

            const condition = {
                type: 'silver',
                operator: '>=',
                value: 500
            };

            expect(eventManager.checkSingleCondition(condition)).toBe(true);
        });

        it('應該能檢查等級條件', () => {
            gameState.player.experience.level = 5;

            const condition = {
                type: 'player_level',
                operator: '>=',
                value: 3
            };

            expect(eventManager.checkSingleCondition(condition)).toBe(true);
        });

        it('應該能檢查屬性條件', () => {
            gameState.player.attributes.strength = 40;

            const condition = {
                type: 'player_attribute',
                key: 'strength',
                operator: '>=',
                value: 30
            };

            expect(eventManager.checkSingleCondition(condition)).toBe(true);
        });

        it('不滿足條件應該返回false', () => {
            gameState.silver = 100;

            const condition = {
                type: 'silver',
                operator: '>=',
                value: 500
            };

            expect(eventManager.checkSingleCondition(condition)).toBe(false);
        });
    });

    describe('可用事件篩選', () => {
        it('應該能獲取可用事件', () => {
            gameState.silver = 1000;
            gameState.inn.level = 3;

            const available = eventManager.getAvailableEvents();
            expect(Array.isArray(available)).toBe(true);
        });

        it('冷卻中的事件應該被排除', () => {
            eventManager.triggerEvent('merchant_caravan');

            const available = eventManager.getAvailableEvents();
            const cooldownEvent = available.find(e => e.id === 'merchant_caravan');

            expect(cooldownEvent).toBeUndefined();
        });
    });

    describe('事件效果', () => {
        it('應該能執行添加銀兩效果', () => {
            const initialSilver = gameState.silver;

            eventManager.applyEffects([
                { type: 'add_silver', value: 100 }
            ]);

            expect(gameState.silver).toBe(initialSilver + 100);
        });

        it('應該能執行消耗銀兩效果', () => {
            gameState.silver = 500;

            eventManager.applyEffects([
                { type: 'spend_silver', value: 100 }
            ]);

            expect(gameState.silver).toBe(400);
        });

        it('應該能執行改變個性效果', () => {
            const initialRighteous = gameState.player.personality.righteous;

            eventManager.applyEffects([
                { type: 'player_personality', key: 'righteous', value: 10 }
            ]);

            expect(gameState.player.personality.righteous).toBe(initialRighteous + 10);
        });

        it('應該能執行添加物品效果', () => {
            eventManager.applyEffects([
                { type: 'add_item', itemId: 'test_item', quantity: 5 }
            ]);

            expect(gameState.inventory.hasItem('test_item', 5)).toBe(true);
        });

        it('應該能執行增加名聲效果', () => {
            const initialRep = gameState.inn.reputation;

            eventManager.applyEffects([
                { type: 'add_reputation', value: 20 }
            ]);

            expect(gameState.inn.reputation).toBe(initialRep + 20);
        });
    });

    describe('事件選擇處理', () => {
        it('應該能處理事件選擇', () => {
            const initialSilver = gameState.silver;

            // 商隊來訪，選擇第一個選項（熱情接待）
            const result = eventManager.handleEventChoice('merchant_caravan', 0);

            expect(result.success).toBe(true);
            expect(gameState.silver).toBeGreaterThan(initialSilver);
        });

        it('無效的選項應該失敗', () => {
            const result = eventManager.handleEventChoice('merchant_caravan', 999);
            expect(result.success).toBe(false);
        });

        it('沒有選項的事件應該失敗', () => {
            const result = eventManager.handleEventChoice('tax_collector', 0);
            expect(result.success).toBe(false);
        });
    });

    describe('自動事件', () => {
        it('應該能執行自動事件', () => {
            const initialSilver = gameState.silver;

            const result = eventManager.executeAutoEvent('tax_collector');

            expect(result.success).toBe(true);
            expect(gameState.silver).toBeLessThan(initialSilver);
        });
    });

    describe('事件統計', () => {
        it('應該能獲取事件統計', () => {
            eventManager.triggerEvent('merchant_caravan');
            eventManager.triggerEvent('merchant_caravan');
            eventManager.triggerEvent('bandit_attack');

            const stats = eventManager.getStatistics();

            expect(stats['merchant_caravan']).toBeDefined();
            expect(stats['merchant_caravan'].count).toBe(2);
            expect(stats['bandit_attack'].count).toBe(1);
        });
    });

    describe('事件歷史', () => {
        it('應該能獲取事件歷史', () => {
            eventManager.triggerEvent('merchant_caravan');
            eventManager.triggerEvent('bandit_attack');

            const history = eventManager.getEventHistory(10);

            expect(history.length).toBe(2);
            expect(history[0].eventId).toBe('bandit_attack'); // 最新的在前
        });

        it('應該能限制返回的歷史數量', () => {
            for (let i = 0; i < 20; i++) {
                eventManager.triggerEvent('merchant_caravan');
            }

            const history = eventManager.getEventHistory(5);
            expect(history.length).toBe(5);
        });
    });

    describe('序列化', () => {
        it('應該能序列化', () => {
            eventManager.triggerEvent('merchant_caravan');
            const data = eventManager.serialize();

            expect(data.eventHistory).toBeDefined();
            expect(data.eventHistory.length).toBeGreaterThan(0);
            expect(data.eventCooldowns).toBeDefined();
        });

        it('應該能反序列化', () => {
            eventManager.triggerEvent('merchant_caravan');
            eventManager.triggerEvent('bandit_attack');

            const data = eventManager.serialize();

            const newEventManager = new EventManager(gameState);
            newEventManager.loadEventData();
            newEventManager.deserialize(data);

            expect(newEventManager.eventHistory.length).toBe(2);
        });
    });
});
