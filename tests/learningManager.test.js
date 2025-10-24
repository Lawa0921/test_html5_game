/**
 * LearningManager 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const LearningManager = require('../src/managers/LearningManager');
const GameState = require('../src/core/GameState');

describe('學習管理器', () => {
    let gameState;
    let learningManager;

    beforeEach(() => {
        gameState = new GameState();
        learningManager = gameState.learningManager;
    });

    describe('初始化', () => {
        it('應該成功載入書籍數據', () => {
            const result = learningManager.loadBookData();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
        });

        it('書籍數據庫應該包含預期的書籍', () => {
            expect(learningManager.bookDatabase['basic_arithmetic']).toBeDefined();
            expect(learningManager.bookDatabase['inn_management_basics']).toBeDefined();
            expect(learningManager.bookDatabase['gourmet_cooking']).toBeDefined();
        });
    });

    describe('讀書學習', () => {
        beforeEach(() => {
            // 添加一本書到背包
            gameState.inventory.addItem('basic_arithmetic', 1);
        });

        it('應該能讀書學習', () => {
            const result = learningManager.study('basic_arithmetic', 1);

            expect(result.success).toBe(true);
            expect(result.bookTitle).toBe('算術啟蒙');
            expect(result.hoursSpent).toBe(1);
            expect(result.results.length).toBeGreaterThan(0);
        });

        it('讀書應該增加玩家屬性', () => {
            const initialIntelligence = gameState.player.attributes.intelligence;

            learningManager.study('basic_arithmetic', 1);

            expect(gameState.player.attributes.intelligence).toBeGreaterThan(initialIntelligence);
        });

        it('讀書應該增加經驗', () => {
            const initialExp = gameState.player.experience.total;

            learningManager.study('basic_arithmetic', 1);

            expect(gameState.player.experience.total).toBeGreaterThan(initialExp);
        });

        it('智慧應該影響學習效率', () => {
            gameState.player.attributes.intelligence = 50;

            const result1 = learningManager.study('basic_arithmetic', 1);

            // 重新設置
            gameState.player.attributes.intelligence = 10;
            gameState.inventory.addItem('basic_arithmetic', 1);

            const result2 = learningManager.study('basic_arithmetic', 1);

            // 高智慧應該有更高的效率
            expect(result1.efficiency).toBeGreaterThan(result2.efficiency);
        });

        it('讀書應該增加疲勞', () => {
            const initialFatigue = gameState.player.status.fatigue;

            learningManager.study('basic_arithmetic', 2);

            expect(gameState.player.status.fatigue).toBeGreaterThan(initialFatigue);
        });

        it('沒有書籍應該無法學習', () => {
            const result = learningManager.study('nonexistent_book', 1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('不存在');
        });

        it('未擁有書籍應該無法學習', () => {
            const result = learningManager.study('gourmet_cooking', 1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('未擁有');
        });

        it('不滿足等級要求的書不能閱讀', () => {
            gameState.inventory.addItem('advanced_accounting', 1);
            gameState.player.experience.level = 1; // 需要等級3

            const result = learningManager.study('advanced_accounting', 1);

            expect(result.success).toBe(false);
        });
    });

    describe('拜師學藝', () => {
        beforeEach(() => {
            // 確保掌櫃已雇用並設置好感度
            const shopkeeper = gameState.employees[0];
            shopkeeper.hired = { unlocked: true };
            shopkeeper.affection = {
                points: 50,
                relationship: 'friend',
                events: []
            };
        });

        it('應該能向師傅學習', () => {
            const result = learningManager.apprentice(0, '經營', 1);

            expect(result.success).toBe(true);
            expect(result.teacher).toBe('沈青山');
            expect(result.skillType).toBe('經營');
            expect(result.results.length).toBe(1);
        });

        it('拜師應該增加對應屬性', () => {
            const initialIntelligence = gameState.player.attributes.intelligence;

            learningManager.apprentice(0, '經營', 1);

            expect(gameState.player.attributes.intelligence).toBeGreaterThan(initialIntelligence);
        });

        it('拜師應該增加師傅好感度', () => {
            const initialAffection = gameState.employees[0].affection.points;

            learningManager.apprentice(0, '經營', 2);

            expect(gameState.employees[0].affection.points).toBeGreaterThan(initialAffection);
        });

        it('拜師應該增加疲勞', () => {
            const initialFatigue = gameState.player.status.fatigue;

            learningManager.apprentice(0, '經營', 2);

            expect(gameState.player.status.fatigue).toBeGreaterThan(initialFatigue);
        });

        it('好感度不足應該無法拜師', () => {
            gameState.employees[0].affection.relationship = 'stranger';

            const result = learningManager.apprentice(0, '經營', 1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('好感度不足');
        });

        it('未雇用的員工應該無法拜師', () => {
            const result = learningManager.apprentice(1, '烹飪', 1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('尚未加入');
        });

        it('師傅不擅長的技能應該無法學習', () => {
            // 測試無效的技能類型
            const result = learningManager.apprentice(0, '無效技能', 1);

            // 技能類型不在 skillMap 中
            expect(result.success).toBe(false);
            expect(result.message).toContain('不擅長');
        });

        it('不存在的師傅應該無法拜師', () => {
            const result = learningManager.apprentice(999, '經營', 1);

            expect(result.success).toBe(false);
        });
    });

    describe('練習訓練', () => {
        it('應該能進行體能訓練', () => {
            const result = learningManager.practice('體能訓練', 1);

            expect(result.success).toBe(true);
            expect(result.trainingType).toBe('體能訓練');
            expect(result.attribute).toBe('physique');
            expect(result.gain).toBeGreaterThan(0);
        });

        it('體能訓練應該增加體質', () => {
            const initialPhysique = gameState.player.attributes.physique;

            learningManager.practice('體能訓練', 2);

            expect(gameState.player.attributes.physique).toBeGreaterThan(initialPhysique);
        });

        it('武術訓練應該增加力量', () => {
            const initialStrength = gameState.player.attributes.strength;

            learningManager.practice('武術訓練', 1);

            expect(gameState.player.attributes.strength).toBeGreaterThan(initialStrength);
        });

        it('讀書習字應該增加智慧', () => {
            const initialIntelligence = gameState.player.attributes.intelligence;

            learningManager.practice('讀書習字', 1);

            expect(gameState.player.attributes.intelligence).toBeGreaterThan(initialIntelligence);
        });

        it('社交訓練應該增加魅力', () => {
            const initialCharisma = gameState.player.attributes.charisma;

            learningManager.practice('社交訓練', 1);

            expect(gameState.player.attributes.charisma).toBeGreaterThan(initialCharisma);
        });

        it('靈巧訓練應該增加靈巧', () => {
            const initialDexterity = gameState.player.attributes.dexterity;

            learningManager.practice('靈巧訓練', 1);

            expect(gameState.player.attributes.dexterity).toBeGreaterThan(initialDexterity);
        });

        it('練習應該增加經驗', () => {
            const initialExp = gameState.player.experience.total;

            learningManager.practice('體能訓練', 1);

            expect(gameState.player.experience.total).toBeGreaterThan(initialExp);
        });

        it('練習應該增加疲勞', () => {
            const initialFatigue = gameState.player.status.fatigue;

            learningManager.practice('體能訓練', 2);

            expect(gameState.player.status.fatigue).toBeGreaterThan(initialFatigue);
        });

        it('疲勞過高應該無法訓練', () => {
            gameState.player.status.fatigue = 85;

            const result = learningManager.practice('體能訓練', 1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('太疲勞');
        });

        it('無效的訓練類型應該失敗', () => {
            const result = learningManager.practice('無效訓練', 1);

            expect(result.success).toBe(false);
            expect(result.message).toContain('無效');
        });
    });

    describe('師傅屬性獲取', () => {
        it('應該能獲取師傅對應的屬性', () => {
            const shopkeeper = gameState.employees[0];

            const attr = learningManager.getTeacherAttribute('經營', shopkeeper);

            expect(attr).toBe(shopkeeper.attributes.intelligence);
        });

        it('無效技能類型應該返回null', () => {
            const shopkeeper = gameState.employees[0];

            const attr = learningManager.getTeacherAttribute('無效技能', shopkeeper);

            expect(attr).toBeNull();
        });
    });

    describe('技能學習類型', () => {
        it('應該能獲取正確的學習類型', () => {
            const type = learningManager.getSkillLearningType('烹飪');

            expect(type.attribute).toBe('dexterity');
            expect(type.baseGain).toBe(2);
        });

        it('無效技能應該返回默認類型', () => {
            const type = learningManager.getSkillLearningType('無效技能');

            expect(type.attribute).toBe('intelligence');
            expect(type.baseGain).toBe(1);
        });
    });

    describe('可拜師員工列表', () => {
        beforeEach(() => {
            // 設置一些員工為已雇用且好感度夠
            gameState.employees[0].hired = { unlocked: true };
            gameState.employees[0].affection = {
                points: 60,
                relationship: 'friend'
            };
        });

        it('應該能獲取可拜師的員工', () => {
            const teachers = learningManager.getAvailableTeachers();

            expect(teachers.length).toBeGreaterThan(0);
            expect(teachers[0].id).toBe(0);
            expect(teachers[0].name).toBe('沈青山');
        });

        it('未雇用的員工不應該在列表中', () => {
            const teachers = learningManager.getAvailableTeachers();

            const unlockedIds = teachers.map(t => t.id);
            expect(unlockedIds).not.toContain(1); // 廚師未雇用
        });

        it('好感度不足的員工不應該在列表中', () => {
            gameState.employees[0].affection.relationship = 'acquaintance';

            const teachers = learningManager.getAvailableTeachers();

            expect(teachers.length).toBe(0);
        });
    });

    describe('員工專長', () => {
        it('應該能獲取員工專長', () => {
            const shopkeeper = gameState.employees[0];
            const specialties = learningManager.getEmployeeSpecialties(shopkeeper);

            expect(Array.isArray(specialties)).toBe(true);
        });

        it('高屬性應該對應相關專長', () => {
            const employee = gameState.employees[0];
            employee.attributes.intelligence = 70;

            const specialties = learningManager.getEmployeeSpecialties(employee);

            expect(specialties).toContain('經營');
            expect(specialties).toContain('醫術');
        });
    });

    describe('擁有的書籍', () => {
        it('應該能獲取擁有的書籍', () => {
            gameState.inventory.addItem('basic_arithmetic', 1);
            gameState.inventory.addItem('inn_management_basics', 2);

            const books = learningManager.getOwnedBooks();

            expect(books.length).toBe(2);
            expect(books[0].id).toBe('basic_arithmetic');
            expect(books[0].quantity).toBe(1);
        });

        it('沒有書籍應該返回空數組', () => {
            const books = learningManager.getOwnedBooks();

            expect(books.length).toBe(0);
        });

        it('書籍應該包含完整信息', () => {
            gameState.inventory.addItem('basic_arithmetic', 1);

            const books = learningManager.getOwnedBooks();

            expect(books[0].title).toBe('算術啟蒙');
            expect(books[0].description).toBeDefined();
            expect(books[0].effects).toBeDefined();
        });
    });

    describe('學習進度', () => {
        beforeEach(() => {
            gameState.employees[0].hired = { unlocked: true };
            gameState.employees[0].affection = {
                points: 60,
                relationship: 'friend'
            };
            gameState.inventory.addItem('basic_arithmetic', 1);
        });

        it('應該能獲取學習進度摘要', () => {
            const progress = learningManager.getLearningProgress();

            expect(progress.player).toBeDefined();
            expect(progress.player.level).toBe(gameState.player.experience.level);
            expect(progress.player.attributes).toBeDefined();
            expect(progress.availableTeachers).toBe(1);
            expect(progress.ownedBooks).toBe(1);
        });
    });

    describe('需求檢查', () => {
        it('應該能檢查等級需求', () => {
            gameState.player.experience.level = 5;

            const result = learningManager.checkRequirements({
                level: 3
            });

            expect(result.success).toBe(true);
        });

        it('等級不足應該失敗', () => {
            gameState.player.experience.level = 2;

            const result = learningManager.checkRequirements({
                level: 5
            });

            expect(result.success).toBe(false);
        });

        it('應該能檢查屬性需求', () => {
            gameState.player.attributes.intelligence = 30;

            const result = learningManager.checkRequirements({
                attributes: {
                    intelligence: 20
                }
            });

            expect(result.success).toBe(true);
        });

        it('屬性不足應該失敗', () => {
            gameState.player.attributes.intelligence = 10;

            const result = learningManager.checkRequirements({
                attributes: {
                    intelligence: 25
                }
            });

            expect(result.success).toBe(false);
        });
    });

    describe('序列化', () => {
        it('應該能序列化', () => {
            const data = learningManager.serialize();

            // LearningManager 的數據主要存在 player 中，serialize 返回空對象
            expect(data).toBeDefined();
        });

        it('應該能反序列化', () => {
            const data = {};
            learningManager.deserialize(data);

            // 應該成功執行（不拋出錯誤）
            expect(true).toBe(true);
        });
    });
});
