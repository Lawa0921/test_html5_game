import { describe, it, expect } from 'vitest';

/**
 * 範例測試文件
 *
 * 這些是基本的範例測試，用於驗證測試框架正常運作。
 * 實際的遊戲功能測試位於各專門的測試文件中：
 * - player.test.js: 主角系統測試
 * - inventory.test.js: 背包系統測試
 * - gameState.test.js: 遊戲狀態與掛機系統測試
 * - 等等...
 */

describe('範例測試', () => {
    it('應該通過基本測試', () => {
        expect(1 + 1).toBe(2);
    });

    it('應該測試字串', () => {
        const greeting = 'Hello, RPG!';
        expect(greeting).toContain('RPG');
    });

    it('應該測試陣列', () => {
        const numbers = [1, 2, 3, 4, 5];
        expect(numbers).toHaveLength(5);
        expect(numbers).toContain(3);
    });

    it('應該測試物件', () => {
        const player = { name: '林修然', level: 1, silver: 100 };
        expect(player).toHaveProperty('name');
        expect(player.level).toBe(1);
        expect(player.silver).toBeGreaterThan(0);
    });
});
