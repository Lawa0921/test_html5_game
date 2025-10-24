import { describe, it, expect, beforeEach, vi } from 'vitest';
import CharacterDispatchManager from '../src/managers/CharacterDispatchManager.js';

describe('CharacterDispatchManager', () => {
  let manager;
  let mockGameState;

  beforeEach(() => {
    mockGameState = {
      timeManager: {
        currentTime: { dayCount: 1 }
      },
      notificationManager: {
        info: vi.fn(),
        success: vi.fn(),
        warning: vi.fn()
      },
      inn: {
        gold: 1000,
        reputation: 100
      }
    };

    manager = new CharacterDispatchManager(mockGameState);
  });

  describe('任務定義', () => {
    it('應該有正確的任務定義', () => {
      const tasks = manager.taskDefinitions;

      expect(tasks).toHaveProperty('cooking');
      expect(tasks).toHaveProperty('serving');
      expect(tasks).toHaveProperty('greeting');
      expect(tasks).toHaveProperty('cleaning');
      expect(tasks).toHaveProperty('performing');
      expect(tasks).toHaveProperty('healing');
    });

    it('每個任務應該有必要的屬性', () => {
      const cooking = manager.taskDefinitions.cooking;

      expect(cooking).toHaveProperty('name');
      expect(cooking).toHaveProperty('category');
      expect(cooking).toHaveProperty('duration');
      expect(cooking).toHaveProperty('animation');
      expect(cooking).toHaveProperty('animationFrames');
      expect(cooking).toHaveProperty('animationFPS');
      expect(cooking).toHaveProperty('animationLoop');
    });
  });

  describe('默認技能等級', () => {
    it('應該為所有角色定義默認技能', () => {
      const skills = manager.defaultSkills;

      expect(skills['001']).toBeDefined(); // 林修然
      expect(skills['002']).toBeDefined(); // 林語嫣
      expect(skills['011']).toBeDefined(); // 秦婉柔
    });

    it('林語嫣應該是烹飪專家', () => {
      const yuyan = manager.defaultSkills['002'];
      expect(yuyan.cooking).toBe(5);
    });

    it('溫如玉應該是服務專家', () => {
      const ruyu = manager.defaultSkills['003'];
      expect(ruyu.serving).toBe(5);
      expect(ruyu.greeting).toBe(5);
    });

    it('顧青鸞應該是治療專家', () => {
      const qingluan = manager.defaultSkills['004'];
      expect(qingluan.healing).toBe(5);
    });
  });

  describe('派遣系統', () => {
    it('應該能成功派遣角色執行任務', () => {
      const result = manager.dispatch('001', 'cooking');

      expect(result.success).toBe(true);
      expect(result.task).toBeDefined();
      expect(result.task.type).toBe('cooking');
      expect(result.task.characterId).toBe('001');
    });

    it('派遣時應該發送通知', () => {
      manager.dispatch('001', 'cooking');

      expect(mockGameState.notificationManager.info).toHaveBeenCalledWith(
        '派遣成功',
        expect.stringContaining('林修然')
      );
    });

    it('不應該派遣不存在的任務', () => {
      const result = manager.dispatch('001', 'invalid_task');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('未知任務類型');
    });

    it('不應該重複派遣同一角色', () => {
      manager.dispatch('001', 'cooking');
      const result = manager.dispatch('001', 'serving');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('角色已被派遣執行其他任務');
    });

    it('限制性任務只能由特定角色執行', () => {
      // 演奏任務限制為蘇妙音、秦婉柔、方無忌
      const result = manager.dispatch('001', 'performing');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('該角色無法執行此任務');
    });

    it('蘇妙音應該可以執行演奏任務', () => {
      const result = manager.dispatch('005', 'performing');

      expect(result.success).toBe(true);
      expect(result.task.type).toBe('performing');
    });

    it('秦婉柔應該可以執行演奏任務', () => {
      const result = manager.dispatch('011', 'performing');

      expect(result.success).toBe(true);
    });

    it('只有顧青鸞可以執行治療任務', () => {
      const result1 = manager.dispatch('001', 'healing');
      const result2 = manager.dispatch('004', 'healing');

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(true);
    });
  });

  describe('效率計算', () => {
    it('應該根據技能等級計算效率', () => {
      const character = { id: '002', name: '林語嫣', experience: {} };
      const efficiency = manager.calculateEfficiency(character, 'cooking');

      expect(efficiency.baseSkill).toBe(5); // 林語嫣烹飪5星
      expect(efficiency.quality).toBe(5);
      expect(efficiency.speed).toBeGreaterThan(1);
    });

    it('低技能角色應該有較低效率', () => {
      const character = { id: '008', name: '蕭鐵峰', experience: {} };
      const efficiency = manager.calculateEfficiency(character, 'cooking');

      expect(efficiency.baseSkill).toBe(1); // 蕭鐵峰烹飪1星
      expect(efficiency.quality).toBe(1);
      expect(efficiency.successRate).toBeLessThan(0.7);
    });

    it('疲勞應該降低效率', () => {
      const character = {
        id: '001',
        name: '林修然',
        experience: {},
        fatigue: 0.5
      };

      const efficiency = manager.calculateEfficiency(character, 'cooking');

      expect(efficiency.fatiguePenalty).toBe(0.15); // 50% * 0.3 = 0.15
      expect(efficiency.speed).toBeLessThan(3); // 應該被疲勞降低
    });

    it('經驗應該提升效率', () => {
      const character = {
        id: '001',
        name: '林修然',
        experience: { cooking: 200 }, // 200經驗
        fatigue: 0
      };

      const efficiency = manager.calculateEfficiency(character, 'cooking');

      expect(efficiency.experienceBonus).toBe(0.2); // 200/100 * 0.1 = 0.2
      expect(efficiency.speed).toBeGreaterThan(3); // 基礎3 * (1+0.2)
    });
  });

  describe('任務完成', () => {
    it('成功完成任務應該獲得獎勵', () => {
      const task = {
        id: 'task_1',
        type: 'cooking',
        characterId: '002',
        definition: manager.taskDefinitions.cooking,
        efficiency: {
          speed: 5,
          quality: 5,
          successRate: 0.95
        },
        status: 'completed',
        progress: 1.0
      };

      const initialGold = mockGameState.inn.gold;
      const result = manager.completeTask(task);

      if (result.success) {
        expect(mockGameState.inn.gold).toBeGreaterThan(initialGold);
      }
    });

    it('失敗任務應該扣除聲望', () => {
      const task = {
        id: 'task_1',
        type: 'cooking',
        characterId: '008',
        definition: manager.taskDefinitions.cooking,
        efficiency: {
          speed: 1,
          quality: 1,
          successRate: 0.1 // 很低的成功率
        },
        status: 'completed',
        progress: 1.0
      };

      // 模擬失敗（設置隨機數為0.9，大於0.1的成功率）
      vi.spyOn(Math, 'random').mockReturnValue(0.9);

      const initialRep = mockGameState.inn.reputation;
      manager.completeTask(task);

      expect(mockGameState.inn.reputation).toBeLessThan(initialRep);

      vi.restoreAllMocks();
    });
  });

  describe('經驗系統', () => {
    it('成功任務應該獲得經驗', () => {
      const character = {
        id: '001',
        name: '林修然',
        experience: {}
      };

      manager.gainExperience(character, 'cooking', true);

      expect(character.experience.cooking).toBeGreaterThan(0);
    });

    it('失敗任務也應該獲得少量經驗', () => {
      const character = {
        id: '001',
        name: '林修然',
        experience: {}
      };

      manager.gainExperience(character, 'cooking', false);

      expect(character.experience.cooking).toBe(5); // 失敗獲得5經驗
    });

    it('低技能角色應該獲得更多經驗', () => {
      const character = {
        id: '008', // 蕭鐵峰，烹飪1星
        name: '蕭鐵峰',
        experience: {}
      };

      manager.gainExperience(character, 'cooking', true);

      expect(character.experience.cooking).toBe(15); // 10 * 1.5
    });

    it('達到100經驗應該觸發技能升級', () => {
      const character = {
        id: '008',
        name: '蕭鐵峰',
        experience: { cooking: 95 }
      };

      const initialSkill = manager.defaultSkills['008'].cooking;
      manager.gainExperience(character, 'cooking', true);

      expect(manager.defaultSkills['008'].cooking).toBe(initialSkill + 1);
    });
  });

  describe('疲勞系統', () => {
    it('執行任務應該增加疲勞', () => {
      const character = {
        id: '001',
        name: '林修然',
        fatigue: 0
      };

      manager.addFatigue(character, 600); // 10分鐘任務

      expect(character.fatigue).toBeGreaterThan(0);
    });

    it('疲勞不應該超過100%', () => {
      const character = {
        id: '001',
        name: '林修然',
        fatigue: 0.9
      };

      manager.addFatigue(character, 10000); // 超長任務

      expect(character.fatigue).toBe(1.0); // 最多100%
    });

    it('休息應該恢復疲勞', () => {
      const character = {
        id: '001',
        name: '林修然',
        fatigue: 0.5
      };

      // 模擬獲取角色
      vi.spyOn(manager, 'getCharacter').mockReturnValue(character);

      const result = manager.rest('001', 1800); // 休息30分鐘

      expect(result.success).toBe(true);
      expect(character.fatigue).toBeLessThan(0.5);

      vi.restoreAllMocks();
    });
  });

  describe('任務管理', () => {
    it('應該能取消派遣', () => {
      manager.dispatch('001', 'cooking');
      const result = manager.cancel('001');

      expect(result.success).toBe(true);
      expect(manager.assignments.has('001')).toBe(false);
    });

    it('應該能獲取當前任務', () => {
      manager.dispatch('001', 'cooking');
      const task = manager.getCurrentTask('001');

      expect(task).toBeDefined();
      expect(task.type).toBe('cooking');
    });

    it('應該能獲取所有派遣', () => {
      manager.dispatch('001', 'cooking');
      manager.dispatch('002', 'serving');

      const assignments = manager.getAllAssignments();

      expect(assignments.length).toBe(2);
    });
  });

  describe('統計數據', () => {
    it('應該記錄任務統計', () => {
      const initialStats = manager.getStatistics();

      expect(initialStats.totalTasks).toBe(0);
      expect(initialStats.successfulTasks).toBe(0);
    });

    it('完成任務應該更新統計', () => {
      const task = {
        id: 'task_1',
        type: 'cooking',
        characterId: '002',
        definition: manager.taskDefinitions.cooking,
        efficiency: {
          speed: 5,
          quality: 5,
          successRate: 1.0 // 必定成功
        },
        status: 'completed',
        progress: 1.0
      };

      manager.completeTask(task);

      const stats = manager.getStatistics();
      expect(stats.totalTasks).toBe(1);
      expect(stats.successfulTasks).toBe(1);
    });
  });

  describe('角色名稱', () => {
    it('應該能獲取所有角色名稱', () => {
      expect(manager.getCharacterName('001')).toBe('林修然');
      expect(manager.getCharacterName('002')).toBe('林語嫣');
      expect(manager.getCharacterName('011')).toBe('秦婉柔');
    });

    it('未知角色應該返回"未知"', () => {
      expect(manager.getCharacterName('999')).toBe('未知');
    });
  });
});
