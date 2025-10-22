import { describe, it, expect } from 'vitest';

/**
 * 範例測試文件
 *
 * 運行測試：./test.sh
 */

describe('範例測試', () => {
    it('應該通過基本測試', () => {
        expect(1 + 1).toBe(2);
    });

    it('應該測試字串', () => {
        const greeting = 'Hello, RPG!';
        expect(greeting).toContain('RPG');
    });
});

/**
 * 戰鬥系統測試範例（待實作）
 */
describe('戰鬥系統', () => {
    it.todo('應該正確計算傷害');
    it.todo('應該在 HP 歸零時觸發死亡');
    it.todo('應該正確應用技能效果');
});

/**
 * 角色系統測試範例（待實作）
 */
describe('角色系統', () => {
    it.todo('應該正確升級角色');
    it.todo('應該計算正確的屬性值');
    it.todo('應該管理角色背包');
});
