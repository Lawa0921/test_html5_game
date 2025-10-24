/**
 * AffectionManager 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const AffectionManager = require('../src/managers/AffectionManager');
const GameState = require('../src/core/GameState');

describe('好感度管理器', () => {
    let gameState;
    let affectionManager;

    beforeEach(() => {
        gameState = new GameState();
        affectionManager = gameState.affectionManager;
    });

    describe('初始化', () => {
        it('應該成功載入好感度事件數據', () => {
            const result = affectionManager.loadAffectionEventData();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
        });

        it('好感度事件數據庫應該包含預期的事件', () => {
            expect(affectionManager.affectionEventDatabase['shopkeeper_friend']).toBeDefined();
            expect(affectionManager.affectionEventDatabase['chef_friend']).toBeDefined();
            expect(affectionManager.affectionEventDatabase['guard_friend']).toBeDefined();
        });

        it('應該有正確的關係等級門檻', () => {
            expect(affectionManager.relationshipThresholds.stranger).toBe(0);
            expect(affectionManager.relationshipThresholds.acquaintance).toBe(20);
            expect(affectionManager.relationshipThresholds.friend).toBe(50);
            expect(affectionManager.relationshipThresholds.close_friend).toBe(80);
            expect(affectionManager.relationshipThresholds.lover).toBe(100);
        });
    });

    describe('增加好感度', () => {
        it('應該能增加員工好感度', () => {
            const employee = gameState.employees[0];

            const result = affectionManager.addAffection(0, 10, '測試互動');

            expect(result.success).toBe(true);
            expect(result.pointsChanged).toBe(10);
            expect(employee.affection.points).toBe(10);
        });

        it('應該記錄好感度變化歷史', () => {
            affectionManager.addAffection(0, 10, '第一次互動');
            affectionManager.addAffection(0, 5, '第二次互動');

            const employee = gameState.employees[0];
            expect(employee.affection.history).toBeDefined();
            expect(employee.affection.history.length).toBe(2);
            expect(employee.affection.history[0].reason).toBe('第一次互動');
        });

        it('好感度應該有上限150', () => {
            affectionManager.addAffection(0, 200);

            const employee = gameState.employees[0];
            expect(employee.affection.points).toBe(150);
        });

        it('好感度不應低於0', () => {
            affectionManager.addAffection(0, -100);

            const employee = gameState.employees[0];
            expect(employee.affection.points).toBe(0);
        });

        it('增加好感度應該能處理不存在的員工', () => {
            const result = affectionManager.addAffection(999, 10);
            expect(result.success).toBe(false);
        });
    });

    describe('減少好感度', () => {
        it('應該能減少員工好感度', () => {
            affectionManager.addAffection(0, 50);
            const result = affectionManager.reduceAffection(0, 10, '做錯事');

            expect(result.success).toBe(true);
            expect(result.pointsChanged).toBe(-10);
            expect(gameState.employees[0].affection.points).toBe(40);
        });
    });

    describe('關係等級', () => {
        it('應該能正確判斷關係等級', () => {
            expect(affectionManager.getRelationshipLevel(0)).toBe('stranger');
            expect(affectionManager.getRelationshipLevel(20)).toBe('acquaintance');
            expect(affectionManager.getRelationshipLevel(50)).toBe('friend');
            expect(affectionManager.getRelationshipLevel(80)).toBe('close_friend');
            expect(affectionManager.getRelationshipLevel(100)).toBe('lover');
        });

        it('增加好感度應該能觸發關係升級', () => {
            const result = affectionManager.addAffection(0, 50);

            expect(result.levelChanged).toBe(true);
            expect(result.oldRelationship).toBe('stranger');
            expect(result.newRelationship).toBe('friend');
        });

        it('應該能獲取關係等級描述', () => {
            expect(affectionManager.getRelationshipDescription('stranger')).toBe('陌生人');
            expect(affectionManager.getRelationshipDescription('friend')).toBe('朋友');
            expect(affectionManager.getRelationshipDescription('lover')).toBe('戀人');
        });
    });

    describe('好感度事件觸發', () => {
        it('達到好感度要求時應該觸發事件', () => {
            // 增加到50好感度，應該觸發朋友事件
            const result = affectionManager.addAffection(0, 50);

            expect(result.triggeredEvent).toBeDefined();
            expect(result.triggeredEvent.eventId).toBe('shopkeeper_friend');
        });

        it('同一事件不應該重複觸發', () => {
            affectionManager.addAffection(0, 50);
            const result = affectionManager.addAffection(0, 10);

            expect(result.triggeredEvent).toBeNull();
        });

        it('應該檢查事件條件', () => {
            // shopkeeper_close 需要 80 好感度和 close_friend 關係
            // 先觸發 friend 事件（50 好感度）
            affectionManager.addAffection(0, 50);

            // 再增加到 80，觸發 close_friend 事件
            affectionManager.addAffection(0, 30);

            const employee = gameState.employees[0];
            expect(employee.affection.events).toContain('shopkeeper_friend');
            expect(employee.affection.events).toContain('shopkeeper_close');
        });

        it('不滿足條件的事件不應該觸發', () => {
            // chef_close 需要 righteous >= 30
            gameState.player.personality.righteous = 10;
            affectionManager.addAffection(1, 80);

            const employee = gameState.employees[1];
            const hasChefCloseEvent = employee.affection.events?.includes('chef_close');
            expect(hasChefCloseEvent).toBeFalsy();
        });
    });

    describe('事件獎勵應用', () => {
        it('應該能應用屬性提升獎勵', () => {
            const initialIntelligence = gameState.employees[0].attributes.intelligence;

            const rewards = [
                { type: 'attribute_boost', key: 'intelligence', value: 5 }
            ];

            affectionManager.applyEventRewards(0, rewards);

            expect(gameState.employees[0].attributes.intelligence).toBe(initialIntelligence + 5);
        });

        it('應該能應用物品獎勵', () => {
            const rewards = [
                { type: 'item', itemId: 'test_item', quantity: 3 }
            ];

            affectionManager.applyEventRewards(0, rewards);

            expect(gameState.inventory.hasItem('test_item', 3)).toBe(true);
        });

        it('應該能應用銀兩獎勵', () => {
            const initialSilver = gameState.silver;

            const rewards = [
                { type: 'silver', value: 200 }
            ];

            affectionManager.applyEventRewards(0, rewards);

            expect(gameState.silver).toBe(initialSilver + 200);
        });

        it('應該能應用技能解鎖獎勵', () => {
            const rewards = [
                { type: 'skill_unlock', skillId: 'test_skill' }
            ];

            affectionManager.applyEventRewards(0, rewards);

            const employee = gameState.employees[0];
            const hasSkill = employee.skills?.some(s => s.id === 'test_skill');
            expect(hasSkill).toBe(true);
        });
    });

    describe('技能解鎖', () => {
        it('應該能解鎖員工技能', () => {
            const result = affectionManager.unlockSkill(0, 'new_skill');

            expect(result.success).toBe(true);

            const employee = gameState.employees[0];
            const skill = employee.skills.find(s => s.id === 'new_skill');
            expect(skill).toBeDefined();
            expect(skill.level).toBe(1);
        });

        it('重複解鎖同一技能應該失敗', () => {
            affectionManager.unlockSkill(0, 'duplicate_skill');
            const result = affectionManager.unlockSkill(0, 'duplicate_skill');

            expect(result.success).toBe(false);
        });

        it('對不存在的員工解鎖技能應該失敗', () => {
            const result = affectionManager.unlockSkill(999, 'skill');
            expect(result.success).toBe(false);
        });
    });

    describe('好感度信息獲取', () => {
        it('應該能獲取員工好感度信息', () => {
            affectionManager.addAffection(0, 30);

            const info = affectionManager.getAffectionInfo(0);

            expect(info.success).toBe(true);
            expect(info.points).toBe(30);
            expect(info.relationship).toBe('acquaintance');
            expect(info.relationshipName).toBe('熟人');
            expect(info.nextThreshold).toBe(50);
            expect(info.nextRelationship).toBe('朋友');
        });

        it('最高等級應該沒有下一個等級', () => {
            affectionManager.addAffection(0, 150);

            const info = affectionManager.getAffectionInfo(0);

            expect(info.nextThreshold).toBeNull();
            expect(info.nextRelationship).toBeNull();
        });

        it('對不存在的員工獲取信息應該失敗', () => {
            const info = affectionManager.getAffectionInfo(999);
            expect(info.success).toBe(false);
        });
    });

    describe('所有員工好感度摘要', () => {
        it('應該能獲取所有已雇用員工的好感度', () => {
            // 掌櫃默認已雇用
            affectionManager.addAffection(0, 30);

            const summary = affectionManager.getAllAffectionSummary();

            expect(summary.length).toBeGreaterThan(0);
            expect(summary[0].id).toBe(0);
            expect(summary[0].points).toBe(30);
        });

        it('未雇用的員工不應該出現在摘要中', () => {
            const summary = affectionManager.getAllAffectionSummary();

            // 只有掌櫃（ID 0）默認雇用
            const unlockedCount = summary.length;
            expect(unlockedCount).toBe(1);
        });
    });

    describe('每日好感度衰減', () => {
        it('心情低落的員工應該好感度下降', () => {
            const employee = gameState.employees[0];
            affectionManager.addAffection(0, 50);

            // 設置低心情
            employee.status.mood = 20;

            const result = affectionManager.dailyAffectionDecay();

            expect(result.totalDecay).toBeGreaterThan(0);
            expect(employee.affection.points).toBeLessThan(50);
        });

        it('心情好的員工好感度不應該下降', () => {
            const employee = gameState.employees[0];
            affectionManager.addAffection(0, 50);

            // 設置高心情
            employee.status.mood = 80;

            const initialAffection = employee.affection.points;
            affectionManager.dailyAffectionDecay();

            expect(employee.affection.points).toBe(initialAffection);
        });

        it('好感度衰減不應該低於0', () => {
            const employee = gameState.employees[0];
            affectionManager.addAffection(0, 1);
            employee.status.mood = 10;

            affectionManager.dailyAffectionDecay();

            expect(employee.affection.points).toBe(0);
        });
    });

    describe('序列化', () => {
        it('應該能序列化', () => {
            affectionManager.addAffection(0, 50);
            const data = affectionManager.serialize();

            // AffectionManager 的數據主要存在 employees 中，serialize 返回空對象
            expect(data).toBeDefined();
        });

        it('應該能反序列化', () => {
            const data = {};
            affectionManager.deserialize(data);

            // 應該成功執行（不拋出錯誤）
            expect(true).toBe(true);
        });
    });

    describe('條件檢查', () => {
        it('應該能檢查關係條件', () => {
            const employee = gameState.employees[0];
            affectionManager.addAffection(0, 50);

            const conditions = [
                { type: 'relationship', value: 'friend' }
            ];

            const result = affectionManager.checkEventConditions(conditions, employee);
            expect(result).toBe(true);
        });

        it('應該能檢查玩家屬性條件', () => {
            gameState.player.attributes.intelligence = 50;

            const employee = gameState.employees[0];
            const conditions = [
                { type: 'player_attribute', key: 'intelligence', value: 30 }
            ];

            const result = affectionManager.checkEventConditions(conditions, employee);
            expect(result).toBe(true);
        });

        it('應該能檢查玩家個性條件', () => {
            gameState.player.personality.righteous = 40;

            const employee = gameState.employees[0];
            const conditions = [
                { type: 'player_personality', key: 'righteous', operator: '>=', value: 30 }
            ];

            const result = affectionManager.checkEventConditions(conditions, employee);
            expect(result).toBe(true);
        });

        it('不滿足條件應該返回false', () => {
            gameState.player.personality.righteous = 10;

            const employee = gameState.employees[0];
            const conditions = [
                { type: 'player_personality', key: 'righteous', operator: '>=', value: 30 }
            ];

            const result = affectionManager.checkEventConditions(conditions, employee);
            expect(result).toBe(false);
        });
    });
});
