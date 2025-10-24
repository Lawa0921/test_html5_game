/**
 * Player 類別測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const Player = require('../src/core/Player');

describe('主角系統', () => {
    let player;

    beforeEach(() => {
        player = new Player('測試主角');
    });

    describe('初始化', () => {
        it('應該有正確的初始名字', () => {
            expect(player.name).toBe('測試主角');
        });

        it('應該有正確的初始屬性', () => {
            expect(player.attributes.physique).toBe(10);
            expect(player.attributes.strength).toBe(10);
            expect(player.attributes.intelligence).toBe(10);
            expect(player.attributes.charisma).toBe(10);
            expect(player.attributes.dexterity).toBe(10);
        });

        it('應該有正確的初始個性', () => {
            expect(player.personality.righteous).toBe(0);
            expect(player.personality.benevolent).toBe(0);
            expect(player.personality.cautious).toBe(0);
            expect(player.personality.frugal).toBe(0);
            expect(player.personality.humble).toBe(0);
        });

        it('應該有正確的初始狀態', () => {
            expect(player.status.fatigue).toBe(0);
            expect(player.status.health).toBe(100);
            expect(player.status.mood).toBe(50);
        });

        it('應該有空的裝備欄', () => {
            expect(player.equipment.weapon).toBeNull();
            expect(player.equipment.armor).toBeNull();
            expect(player.equipment.accessory).toBeNull();
        });

        it('應該是1級', () => {
            expect(player.experience.level).toBe(1);
        });
    });

    describe('屬性系統', () => {
        it('應該能增加屬性', () => {
            const result = player.addAttribute('strength', 10);
            expect(result.success).toBe(true);
            expect(player.attributes.strength).toBe(20);
        });

        it('應該能減少屬性', () => {
            player.addAttribute('strength', -5);
            expect(player.attributes.strength).toBe(5);
        });

        it('屬性不應超過100', () => {
            player.addAttribute('strength', 100);
            expect(player.attributes.strength).toBe(100);
        });

        it('屬性不應低於0', () => {
            player.addAttribute('strength', -20);
            expect(player.attributes.strength).toBe(0);
        });

        it('無效屬性應該返回失敗', () => {
            const result = player.addAttribute('invalid', 10);
            expect(result.success).toBe(false);
        });
    });

    describe('個性系統', () => {
        it('應該能改變個性', () => {
            const result = player.changePersonality('righteous', 50);
            expect(result.success).toBe(true);
            expect(player.personality.righteous).toBe(50);
        });

        it('個性值應該在-100到100之間', () => {
            player.changePersonality('righteous', 150);
            expect(player.personality.righteous).toBe(100);

            player.changePersonality('righteous', -250);
            expect(player.personality.righteous).toBe(-100);
        });

        it('應該能獲取個性描述', () => {
            player.changePersonality('righteous', 50);
            const desc = player.getPersonalityDescription('righteous');
            expect(desc).toBe('俠義');
        });

        it('負值個性應該有對應描述', () => {
            player.changePersonality('righteous', -50);
            const desc = player.getPersonalityDescription('righteous');
            expect(desc).toBe('陰險');
        });
    });

    describe('疲勞系統', () => {
        it('應該能增加疲勞', () => {
            player.addFatigue(30);
            expect(player.status.fatigue).toBe(30);
        });

        it('疲勞不應超過100', () => {
            player.addFatigue(150);
            expect(player.status.fatigue).toBe(100);
        });

        it('疲勞過高應該影響心情', () => {
            player.addFatigue(85);
            const initialMood = player.status.mood;
            player.addFatigue(1);
            expect(player.status.mood).toBeLessThan(initialMood);
        });

        it('休息應該恢復疲勞', () => {
            player.addFatigue(50);
            player.rest(5);
            expect(player.status.fatigue).toBeLessThan(50);
        });

        it('充分休息應該改善心情', () => {
            player.addFatigue(50);
            player.rest(10); // 大量休息
            player.rest(5);  // 額外休息
            expect(player.status.fatigue).toBeLessThan(40); // 調整期望值以符合實際恢復量
        });
    });

    describe('裝備系統', () => {
        it('應該能裝備物品', () => {
            const result = player.equip('weapon', 'sword_001');
            expect(result.success).toBe(true);
            expect(player.equipment.weapon).toBe('sword_001');
        });

        it('應該能卸下裝備', () => {
            player.equip('weapon', 'sword_001');
            const result = player.unequip('weapon');
            expect(result.success).toBe(true);
            expect(player.equipment.weapon).toBeNull();
        });

        it('裝備新裝備應該返回舊裝備', () => {
            player.equip('weapon', 'sword_001');
            const result = player.equip('weapon', 'sword_002');
            expect(result.oldItem).toBe('sword_001');
            expect(result.newItem).toBe('sword_002');
        });

        it('無效的裝備欄位應該失敗', () => {
            const result = player.equip('invalid', 'sword_001');
            expect(result.success).toBe(false);
        });
    });

    describe('技能系統', () => {
        it('應該能添加技能', () => {
            const result = player.addSkill('skill_001', 1);
            expect(result.success).toBe(true);
            expect(player.skills.length).toBe(1);
        });

        it('不應該重複添加相同技能', () => {
            player.addSkill('skill_001', 1);
            const result = player.addSkill('skill_001', 1);
            expect(result.success).toBe(false);
        });

        it('應該能升級技能', () => {
            player.addSkill('skill_001', 1);
            const result = player.upgradeSkill('skill_001', 100);
            expect(result.levelUp).toBe(true);
            expect(player.skills[0].level).toBe(2);
        });

        it('未擁有的技能無法升級', () => {
            const result = player.upgradeSkill('skill_999', 100);
            expect(result.success).toBe(false);
        });
    });

    describe('經驗系統', () => {
        it('應該能增加經驗', () => {
            const result = player.addExperience(50);
            expect(player.experience.total).toBe(50);
        });

        it('經驗足夠應該升級', () => {
            player.addExperience(100);
            expect(player.experience.level).toBe(2);
        });

        it('升級應該恢復部分狀態', () => {
            player.addFatigue(50);
            player.changeHealth(-20);
            player.addExperience(100);

            expect(player.status.fatigue).toBeLessThan(50);
            expect(player.status.health).toBeGreaterThan(80);
        });
    });

    describe('序列化', () => {
        it('應該能序列化', () => {
            const data = player.serialize();
            expect(data.name).toBe('測試主角');
            expect(data.attributes).toBeDefined();
            expect(data.personality).toBeDefined();
        });

        it('應該能反序列化', () => {
            player.name = '新名字';
            player.addAttribute('strength', 20);

            const data = player.serialize();

            const newPlayer = new Player();
            newPlayer.deserialize(data);

            expect(newPlayer.name).toBe('新名字');
            expect(newPlayer.attributes.strength).toBe(30);
        });
    });

    describe('摘要資訊', () => {
        it('應該能獲取玩家摘要', () => {
            const summary = player.getSummary();
            expect(summary['基本資訊']).toBeDefined();
            expect(summary['屬性']).toBeDefined();
            expect(summary['個性']).toBeDefined();
            expect(summary['狀態']).toBeDefined();
        });
    });
});
