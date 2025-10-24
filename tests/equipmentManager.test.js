/**
 * EquipmentManager 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const EquipmentManager = require('../src/managers/EquipmentManager');
const GameState = require('../src/core/GameState');

describe('裝備管理器', () => {
    let gameState;
    let equipmentManager;

    beforeEach(() => {
        gameState = new GameState();
        equipmentManager = gameState.equipmentManager;
    });

    describe('初始化', () => {
        it('應該成功載入裝備數據', () => {
            const result = equipmentManager.loadEquipmentData();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
        });

        it('裝備數據庫應該包含預期的裝備', () => {
            expect(equipmentManager.equipmentDatabase['weapon_001']).toBeDefined();
            expect(equipmentManager.equipmentDatabase['armor_001']).toBeDefined();
            expect(equipmentManager.equipmentDatabase['accessory_001']).toBeDefined();
        });
    });

    describe('裝備需求檢查', () => {
        it('應該能檢查等級需求', () => {
            const player = gameState.player;
            player.experience.level = 1;

            const item = equipmentManager.equipmentDatabase['weapon_001']; // 需要等級5
            const result = equipmentManager.checkRequirements(player, item);

            expect(result.success).toBe(false);
            expect(result.message).toContain('等級');
        });

        it('等級足夠時應該通過檢查', () => {
            const player = gameState.player;
            player.experience.level = 10;
            player.attributes.strength = 30;

            const item = equipmentManager.equipmentDatabase['weapon_001'];
            const result = equipmentManager.checkRequirements(player, item);

            expect(result.success).toBe(true);
        });

        it('應該能檢查屬性需求', () => {
            const player = gameState.player;
            player.experience.level = 10;
            player.attributes.strength = 10; // 不足

            const item = equipmentManager.equipmentDatabase['weapon_001']; // 需要武力20
            const result = equipmentManager.checkRequirements(player, item);

            expect(result.success).toBe(false);
            expect(result.message).toContain('武力');
        });

        it('無需求的裝備應該直接通過', () => {
            const player = gameState.player;
            const item = equipmentManager.equipmentDatabase['weapon_002']; // 木棍，只需等級1

            const result = equipmentManager.checkRequirements(player, item);
            expect(result.success).toBe(true);
        });
    });

    describe('裝備穿戴（玩家）', () => {
        beforeEach(() => {
            // 給玩家添加裝備到背包
            gameState.inventory.addItem('weapon_002', 1);
            gameState.inventory.addItem('armor_001', 1);
            gameState.inventory.addItem('accessory_001', 1);
        });

        it('應該能裝備武器', () => {
            const result = equipmentManager.equip('player', 'player', 'weapon', 'weapon_002');

            expect(result.success).toBe(true);
            expect(gameState.player.equipment.weapon).toBe('weapon_002');
            expect(gameState.inventory.hasItem('weapon_002')).toBe(false);
        });

        it('應該能裝備防具', () => {
            const result = equipmentManager.equip('player', 'player', 'armor', 'armor_001');

            expect(result.success).toBe(true);
            expect(gameState.player.equipment.armor).toBe('armor_001');
        });

        it('應該能裝備飾品', () => {
            const result = equipmentManager.equip('player', 'player', 'accessory', 'accessory_001');

            expect(result.success).toBe(true);
            expect(gameState.player.equipment.accessory).toBe('accessory_001');
        });

        it('裝備新裝備應該卸下舊裝備', () => {
            // 需要滿足weapon_003的裝備需求：等級3，武力15
            gameState.player.experience.level = 5;
            gameState.player.attributes.strength = 20;

            gameState.inventory.addItem('weapon_003', 1);

            equipmentManager.equip('player', 'player', 'weapon', 'weapon_002');
            const result = equipmentManager.equip('player', 'player', 'weapon', 'weapon_003');

            expect(result.success).toBe(true);
            expect(result.oldItem).toBe('weapon_002');
            expect(result.newItem).toBe('weapon_003');
            expect(gameState.player.equipment.weapon).toBe('weapon_003');
            expect(gameState.inventory.hasItem('weapon_002')).toBe(true);
        });

        it('無效的裝備欄位應該失敗', () => {
            const result = equipmentManager.equip('player', 'player', 'invalid_slot', 'weapon_002');
            expect(result.success).toBe(false);
        });

        it('不存在的裝備應該失敗', () => {
            const result = equipmentManager.equip('player', 'player', 'weapon', 'nonexistent_item');
            expect(result.success).toBe(false);
        });

        it('裝備類型不匹配應該失敗', () => {
            const result = equipmentManager.equip('player', 'player', 'armor', 'weapon_002');
            expect(result.success).toBe(false);
            expect(result.message).toContain('類型');
        });

        it('不滿足需求應該無法裝備', () => {
            gameState.inventory.addItem('weapon_001', 1); // 需要等級5，武力20
            gameState.player.experience.level = 1;
            gameState.player.attributes.strength = 10;

            const result = equipmentManager.equip('player', 'player', 'weapon', 'weapon_001');
            expect(result.success).toBe(false);
        });
    });

    describe('卸下裝備', () => {
        beforeEach(() => {
            gameState.inventory.addItem('weapon_002', 1);
            equipmentManager.equip('player', 'player', 'weapon', 'weapon_002');
        });

        it('應該能卸下裝備', () => {
            const result = equipmentManager.unequip('player', 'player', 'weapon');

            expect(result.success).toBe(true);
            expect(gameState.player.equipment.weapon).toBeNull();
            expect(gameState.inventory.hasItem('weapon_002')).toBe(true);
        });

        it('卸下空欄位應該失敗', () => {
            const result = equipmentManager.unequip('player', 'player', 'armor');
            expect(result.success).toBe(false);
        });

        it('無效的欄位應該失敗', () => {
            const result = equipmentManager.unequip('player', 'player', 'invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('屬性加成計算', () => {
        it('空裝備應該返回零加成', () => {
            const bonus = equipmentManager.calculateBonus(gameState.player.equipment);

            expect(bonus.physique).toBe(0);
            expect(bonus.strength).toBe(0);
            expect(bonus.intelligence).toBe(0);
            expect(bonus.charisma).toBe(0);
            expect(bonus.dexterity).toBe(0);
        });

        it('應該正確計算單件裝備加成', () => {
            gameState.inventory.addItem('weapon_002', 1);
            equipmentManager.equip('player', 'player', 'weapon', 'weapon_002');

            const bonus = equipmentManager.calculateBonus(gameState.player.equipment);
            expect(bonus.strength).toBe(3); // 木棍 +3 武力
        });

        it('應該正確累加多件裝備加成', () => {
            gameState.inventory.addItem('weapon_002', 1);
            gameState.inventory.addItem('armor_001', 1);
            gameState.inventory.addItem('accessory_001', 1);

            equipmentManager.equip('player', 'player', 'weapon', 'weapon_002');
            equipmentManager.equip('player', 'player', 'armor', 'armor_001');
            equipmentManager.equip('player', 'player', 'accessory', 'accessory_001');

            const bonus = equipmentManager.calculateBonus(gameState.player.equipment);

            expect(bonus.physique).toBe(7); // 布衣+5, 木質護符+2
            expect(bonus.strength).toBe(3); // 木棍+3
        });
    });

    describe('裝備效果', () => {
        it('應該能獲取裝備效果列表', () => {
            gameState.inventory.addItem('weapon_001', 1);
            gameState.player.experience.level = 10;
            gameState.player.attributes.strength = 30;

            equipmentManager.equip('player', 'player', 'weapon', 'weapon_001');

            const effects = equipmentManager.getEquipmentEffects(gameState.player.equipment);

            expect(effects.length).toBeGreaterThan(0);
            expect(effects[0].source).toBe('青鋒劍');
        });

        it('空裝備應該返回空效果列表', () => {
            const effects = equipmentManager.getEquipmentEffects(gameState.player.equipment);
            expect(effects.length).toBe(0);
        });
    });

    describe('獲取裝備信息', () => {
        it('應該能獲取裝備詳細信息', () => {
            const result = equipmentManager.getEquipmentInfo('weapon_001');

            expect(result.success).toBe(true);
            expect(result.item.name).toBe('青鋒劍');
            expect(result.item.type).toBe('weapon');
        });

        it('不存在的裝備應該返回失敗', () => {
            const result = equipmentManager.getEquipmentInfo('nonexistent');
            expect(result.success).toBe(false);
        });
    });

    describe('獲取已裝備物品', () => {
        it('應該能獲取玩家的裝備信息', () => {
            gameState.inventory.addItem('weapon_002', 1);
            equipmentManager.equip('player', 'player', 'weapon', 'weapon_002');

            const result = equipmentManager.getEquippedItems('player', 'player');

            expect(result.success).toBe(true);
            expect(result.items.weapon).toBeDefined();
            expect(result.items.weapon.name).toBe('木棍');
            expect(result.bonus).toBeDefined();
        });

        it('無裝備時應該返回空物品列表', () => {
            const result = equipmentManager.getEquippedItems('player', 'player');

            expect(result.success).toBe(true);
            expect(Object.keys(result.items).length).toBe(0);
        });
    });

    describe('員工裝備系統', () => {
        beforeEach(() => {
            // 解鎖並雇用掌櫃
            const shopkeeper = gameState.employees[0];
            shopkeeper.hired.unlocked = true;

            gameState.inventory.addItem('weapon_002', 1);
        });

        it('應該能為員工裝備物品', () => {
            const result = equipmentManager.equip('employee', 0, 'weapon', 'weapon_002');

            expect(result.success).toBe(true);
            expect(gameState.employees[0].equipment.weapon).toBe('weapon_002');
        });

        it('員工也應該遵循裝備需求', () => {
            gameState.inventory.addItem('weapon_001', 1);

            const employee = gameState.employees[0];
            employee.level = 1;
            employee.attributes.strength = 10;

            const result = equipmentManager.equip('employee', 0, 'weapon', 'weapon_001');
            expect(result.success).toBe(false);
        });

        it('應該能計算員工裝備加成', () => {
            equipmentManager.equip('employee', 0, 'weapon', 'weapon_002');

            const bonus = equipmentManager.calculateBonus(gameState.employees[0].equipment);
            expect(bonus.strength).toBe(3);
        });
    });

    describe('裝備檢查', () => {
        it('應該能檢查是否可以裝備', () => {
            gameState.player.experience.level = 10;
            gameState.player.attributes.strength = 30;

            const result = equipmentManager.canEquip('player', 'player', 'weapon_001');
            expect(result.success).toBe(true);
        });

        it('不滿足條件時應該返回失敗', () => {
            gameState.player.experience.level = 1;

            const result = equipmentManager.canEquip('player', 'player', 'weapon_001');
            expect(result.success).toBe(false);
        });
    });
});
