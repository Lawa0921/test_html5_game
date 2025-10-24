/**
 * Inventory 類別測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const Inventory = require('../src/core/Inventory');

describe('背包系統', () => {
    let inventory;

    beforeEach(() => {
        inventory = new Inventory();
    });

    describe('初始化', () => {
        it('應該有空的物品列表', () => {
            expect(Object.keys(inventory.items).length).toBe(0);
        });

        it('應該有默認的最大容量', () => {
            expect(inventory.maxSlots).toBe(100);
        });
    });

    describe('添加物品', () => {
        it('應該能添加新物品', () => {
            const result = inventory.addItem('item_001', 1);

            expect(result.success).toBe(true);
            expect(result.itemId).toBe('item_001');
            expect(result.quantity).toBe(1);
            expect(inventory.items['item_001']).toBe(1);
        });

        it('應該能添加多個數量', () => {
            const result = inventory.addItem('item_001', 5);

            expect(result.success).toBe(true);
            expect(result.quantity).toBe(5);
            expect(inventory.items['item_001']).toBe(5);
        });

        it('應該能累加相同物品', () => {
            inventory.addItem('item_001', 3);
            const result = inventory.addItem('item_001', 2);

            expect(result.success).toBe(true);
            expect(result.quantity).toBe(5);
            expect(inventory.items['item_001']).toBe(5);
        });

        it('不指定數量時應該默認添加1個', () => {
            const result = inventory.addItem('item_001');

            expect(result.success).toBe(true);
            expect(result.quantity).toBe(1);
        });
    });

    describe('移除物品', () => {
        beforeEach(() => {
            inventory.addItem('item_001', 10);
        });

        it('應該能移除物品', () => {
            const result = inventory.removeItem('item_001', 3);

            expect(result.success).toBe(true);
            expect(result.itemId).toBe('item_001');
            expect(result.remaining).toBe(7);
            expect(inventory.items['item_001']).toBe(7);
        });

        it('移除全部數量應該刪除該項', () => {
            const result = inventory.removeItem('item_001', 10);

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(0);
            expect(inventory.items['item_001']).toBeUndefined();
        });

        it('不指定數量時應該默認移除1個', () => {
            const result = inventory.removeItem('item_001');

            expect(result.success).toBe(true);
            expect(result.remaining).toBe(9);
        });

        it('數量不足時應該失敗', () => {
            const result = inventory.removeItem('item_001', 20);

            expect(result.success).toBe(false);
            expect(result.message).toContain('數量不足');
            expect(inventory.items['item_001']).toBe(10); // 數量不變
        });

        it('移除不存在的物品應該失敗', () => {
            const result = inventory.removeItem('nonexistent', 1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('數量不足');
        });
    });

    describe('檢查物品', () => {
        beforeEach(() => {
            inventory.addItem('item_001', 5);
            inventory.addItem('item_002', 3);
        });

        it('應該能檢查是否擁有物品', () => {
            expect(inventory.hasItem('item_001')).toBe(true);
            expect(inventory.hasItem('item_002')).toBe(true);
        });

        it('應該能檢查是否擁有足夠數量', () => {
            expect(inventory.hasItem('item_001', 5)).toBe(true);
            expect(inventory.hasItem('item_001', 6)).toBe(false);
        });

        it('不存在的物品應該返回false', () => {
            expect(inventory.hasItem('nonexistent')).toBe(false);
        });

        it('不指定數量時應該默認檢查1個', () => {
            expect(inventory.hasItem('item_001')).toBe(true);
        });
    });

    describe('獲取物品數量', () => {
        beforeEach(() => {
            inventory.addItem('item_001', 7);
        });

        it('應該能獲取物品數量', () => {
            const count = inventory.getItemCount('item_001');
            expect(count).toBe(7);
        });

        it('不存在的物品應該返回0', () => {
            const count = inventory.getItemCount('nonexistent');
            expect(count).toBe(0);
        });
    });

    describe('獲取所有物品', () => {
        beforeEach(() => {
            inventory.addItem('item_001', 5);
            inventory.addItem('item_002', 3);
            inventory.addItem('item_003', 8);
        });

        it('應該能獲取所有物品', () => {
            const items = inventory.getAllItems();

            expect(Object.keys(items).length).toBe(3);
            expect(items['item_001']).toBe(5);
            expect(items['item_002']).toBe(3);
            expect(items['item_003']).toBe(8);
        });

        it('返回的應該是副本而非引用', () => {
            const items = inventory.getAllItems();
            items['item_999'] = 999;

            expect(inventory.items['item_999']).toBeUndefined();
        });
    });

    describe('獲取物品總數', () => {
        it('空背包應該返回0', () => {
            expect(inventory.getTotalItemCount()).toBe(0);
        });

        it('應該能計算物品總數', () => {
            inventory.addItem('item_001', 5);
            inventory.addItem('item_002', 3);
            inventory.addItem('item_003', 8);

            expect(inventory.getTotalItemCount()).toBe(16);
        });

        it('移除物品後應該更新總數', () => {
            inventory.addItem('item_001', 10);
            inventory.addItem('item_002', 5);
            inventory.removeItem('item_001', 3);

            expect(inventory.getTotalItemCount()).toBe(12);
        });
    });

    describe('序列化', () => {
        beforeEach(() => {
            inventory.addItem('item_001', 5);
            inventory.addItem('item_002', 3);
        });

        it('應該能序列化', () => {
            const data = inventory.serialize();

            expect(data.items).toBeDefined();
            expect(data.items['item_001']).toBe(5);
            expect(data.items['item_002']).toBe(3);
            expect(data.maxSlots).toBe(100);
        });

        it('應該返回副本而非引用', () => {
            const data = inventory.serialize();
            data.items['item_999'] = 999;

            expect(inventory.items['item_999']).toBeUndefined();
        });
    });

    describe('反序列化', () => {
        it('應該能反序列化物品', () => {
            const data = {
                items: {
                    'item_001': 7,
                    'item_002': 4
                },
                maxSlots: 100
            };

            inventory.deserialize(data);

            expect(inventory.items['item_001']).toBe(7);
            expect(inventory.items['item_002']).toBe(4);
            expect(inventory.maxSlots).toBe(100);
        });

        it('應該能更新最大容量', () => {
            const data = {
                items: {},
                maxSlots: 200
            };

            inventory.deserialize(data);
            expect(inventory.maxSlots).toBe(200);
        });

        it('缺少字段時應該保持原值', () => {
            inventory.maxSlots = 150;
            inventory.addItem('item_001', 5);

            const data = {
                items: {
                    'item_002': 3
                }
            };

            inventory.deserialize(data);

            expect(inventory.items['item_002']).toBe(3);
            expect(inventory.maxSlots).toBe(150); // 保持原值
        });
    });

    describe('綜合場景', () => {
        it('應該能完整模擬物品流轉', () => {
            // 添加初始物品
            inventory.addItem('potion', 5);
            inventory.addItem('sword', 1);

            // 檢查擁有
            expect(inventory.hasItem('potion', 3)).toBe(true);

            // 使用藥水
            inventory.removeItem('potion', 2);
            expect(inventory.getItemCount('potion')).toBe(3);

            // 獲得更多藥水
            inventory.addItem('potion', 3);
            expect(inventory.getItemCount('potion')).toBe(6);

            // 賣掉劍
            inventory.removeItem('sword', 1);
            expect(inventory.hasItem('sword')).toBe(false);

            // 總數檢查
            expect(inventory.getTotalItemCount()).toBe(6);
        });

        it('應該能序列化並恢復狀態', () => {
            inventory.addItem('item_001', 5);
            inventory.addItem('item_002', 3);
            inventory.maxSlots = 150;

            const data = inventory.serialize();

            const newInventory = new Inventory();
            newInventory.deserialize(data);

            expect(newInventory.getItemCount('item_001')).toBe(5);
            expect(newInventory.getItemCount('item_002')).toBe(3);
            expect(newInventory.maxSlots).toBe(150);
            expect(newInventory.getTotalItemCount()).toBe(8);
        });
    });
});
