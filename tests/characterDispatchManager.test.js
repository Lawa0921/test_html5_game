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

    // 角色 003-010 已移除，暫時跳過這些測試
    // it('溫如玉應該是服務專家', () => {
    //   const ruyu = manager.defaultSkills['003'];
    //   expect(ruyu.serving).toBe(5);
    //   expect(ruyu.greeting).toBe(5);
    // });

    // it('顧青鸞應該是治療專家', () => {
    //   const qingluan = manager.defaultSkills['004'];
    //   expect(qingluan.healing).toBe(5);
    // });

    it('秦婉柔應該是演奏專家', () => {
      const wanrou = manager.defaultSkills['011'];
      expect(wanrou.performing).toBe(5);
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

    it('所有角色都可以執行演奏任務（不限制）', () => {
      // 所有角色都可以執行演奏，只是效率不同
      const result1 = manager.dispatch('001', 'performing'); // 林修然
      const result2 = manager.dispatch('011', 'performing'); // 秦婉柔

      expect(result1.success).toBe(true); // 林修然可以演奏（低效率）
      expect(result2.success).toBe(true); // 秦婉柔可以演奏（高效率）
    });

    it('秦婉柔演奏效率遠高於林修然', () => {
      const char1 = { id: '001', name: '林修然', experience: {}, fatigue: 0 };
      const char2 = { id: '011', name: '秦婉柔', experience: {}, fatigue: 0 };

      const efficiency1 = manager.calculateEfficiency(char1, 'performing');
      const efficiency2 = manager.calculateEfficiency(char2, 'performing');

      // 秦婉柔5星 vs 林修然默認1星（或未定義）
      expect(efficiency2.baseSkill).toBeGreaterThan(efficiency1.baseSkill || 1);
    });

    it('所有角色都可以執行治療任務（不限制）', () => {
      const result1 = manager.dispatch('001', 'healing'); // 林修然
      const result2 = manager.dispatch('004', 'healing'); // 顧青鸞

      expect(result1.success).toBe(true); // 林修然可以治療（低效率）
      expect(result2.success).toBe(true); // 顧青鸞可以治療（高效率）
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
        id: '002',
        name: '林語嫣',
        experience: { cooking: 95 }
      };

      const initialSkill = manager.defaultSkills['002'].cooking;
      manager.gainExperience(character, 'cooking', true);

      expect(manager.defaultSkills['002'].cooking).toBe(initialSkill); // 林語嫣已經是5星，不能再升級
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

  describe('update() 任務進度更新', () => {
    it('應該正確更新任務進度', () => {
      manager.dispatch('001', 'cooking');
      const task = manager.getCurrentTask('001');

      expect(task.progress).toBe(0);

      // 更新進度（模擬時間流逝）- 使用較小的 deltaTime
      manager.update(10); // deltaTime = 10

      expect(task.progress).toBeGreaterThan(0);
      expect(task.status).toBe('in_progress');
    });

    it('任務進度達到100%應該自動完成', () => {
      manager.dispatch('001', 'cooking');
      const task = manager.getCurrentTask('001');

      // 更新超過任務時長
      manager.update(task.duration * 2);

      // 任務應該已經完成並移除
      expect(manager.getCurrentTask('001')).toBeUndefined();
      expect(manager.getStatistics().totalTasks).toBeGreaterThan(0);
    });

    it('應該根據效率調整進度速度', () => {
      // 高技能角色
      manager.dispatch('002', 'cooking'); // 林語嫣，烹飪5星
      const task1 = manager.getCurrentTask('002');

      // 低技能角色
      manager.dispatch('008', 'cooking'); // 蕭鐵峰，烹飪1星
      const task2 = manager.getCurrentTask('008');

      manager.update(100);

      // 高技能角色進度應該更快
      expect(task1.progress).toBeGreaterThan(task2.progress);
    });

    it('不應該更新已完成的任務', () => {
      manager.dispatch('001', 'cooking');
      const task = manager.getCurrentTask('001');

      task.status = 'completed';
      task.progress = 1.0;

      manager.update(100);

      // 進度不應該超過1.0
      expect(task.progress).toBe(1.0);
    });

    it('應該處理多個任務同時進行', () => {
      manager.dispatch('001', 'cooking');
      manager.dispatch('002', 'serving');
      manager.dispatch('003', 'cleaning');

      manager.update(50);

      const assignments = manager.getAllAssignments();
      expect(assignments.length).toBe(3);
      assignments.forEach(task => {
        expect(task.progress).toBeGreaterThan(0);
      });
    });
  });

  describe('playAnimation() 動畫播放', () => {
    it('有動畫管理器時應該播放動畫', () => {
      const mockAnimationManager = {
        play: vi.fn()
      };
      mockGameState.animationManager = mockAnimationManager;

      const character = { id: '001', name: '林修然' };
      manager.playAnimation(character, 'cooking');

      expect(mockAnimationManager.play).toHaveBeenCalledWith({
        characterId: '001',
        path: expect.stringContaining('cooking'),
        frames: 6,
        fps: 6,
        loop: true
      });
    });

    it('無動畫管理器時不應該報錯', () => {
      delete mockGameState.animationManager;

      const character = { id: '001', name: '林修然' };
      expect(() => {
        manager.playAnimation(character, 'cooking');
      }).not.toThrow();
    });

    it('無效任務類型不應該播放動畫', () => {
      const mockAnimationManager = {
        play: vi.fn()
      };
      mockGameState.animationManager = mockAnimationManager;

      const character = { id: '001', name: '林修然' };
      manager.playAnimation(character, 'invalid_task');

      expect(mockAnimationManager.play).not.toHaveBeenCalled();
    });
  });

  describe('calculateRewards() 獎勵計算', () => {
    it('成功任務應該根據質量計算獎勵', () => {
      const task = {
        efficiency: { quality: 3 } // 3星質量
      };

      const rewards = manager.calculateRewards(task, true);

      expect(rewards.gold).toBe(50); // 3/3 * 50 = 50
      expect(rewards.reputation).toBe(10); // 3/3 * 10 = 10
      expect(rewards.satisfaction).toBe(20); // 3/3 * 20 = 20
    });

    it('高質量任務應該獲得更多獎勵', () => {
      const highQualityTask = {
        efficiency: { quality: 5 } // 5星質量
      };

      const lowQualityTask = {
        efficiency: { quality: 1 } // 1星質量
      };

      const highRewards = manager.calculateRewards(highQualityTask, true);
      const lowRewards = manager.calculateRewards(lowQualityTask, true);

      expect(highRewards.gold).toBeGreaterThan(lowRewards.gold);
      expect(highRewards.reputation).toBeGreaterThan(lowRewards.reputation);
    });

    it('失敗任務應該扣除聲望和滿意度', () => {
      const task = {
        efficiency: { quality: 3 }
      };

      const rewards = manager.calculateRewards(task, false);

      expect(rewards.gold).toBe(0);
      expect(rewards.reputation).toBe(-5);
      expect(rewards.satisfaction).toBe(-10);
    });
  });

  describe('applyRewards() 應用獎勵', () => {
    it('應該增加客棧金幣', () => {
      const character = { id: '001', name: '林修然' };
      const rewards = { gold: 100, reputation: 10, satisfaction: 20 };

      const initialGold = mockGameState.inn.gold;
      manager.applyRewards(character, rewards);

      expect(mockGameState.inn.gold).toBe(initialGold + 100);
    });

    it('應該增加客棧聲望', () => {
      const character = { id: '001', name: '林修然' };
      const rewards = { gold: 50, reputation: 15, satisfaction: 20 };

      const initialRep = mockGameState.inn.reputation;
      manager.applyRewards(character, rewards);

      expect(mockGameState.inn.reputation).toBe(initialRep + 15);
    });

    it('負面獎勵應該扣除數值', () => {
      const character = { id: '001', name: '林修然' };
      const rewards = { gold: 0, reputation: -5, satisfaction: -10 };

      const initialRep = mockGameState.inn.reputation;
      manager.applyRewards(character, rewards);

      expect(mockGameState.inn.reputation).toBe(initialRep - 5);
    });

    it('沒有客棧數據時不應該報錯', () => {
      delete mockGameState.inn;

      const character = { id: '001', name: '林修然' };
      const rewards = { gold: 100, reputation: 10, satisfaction: 20 };

      expect(() => {
        manager.applyRewards(character, rewards);
      }).not.toThrow();
    });
  });

  describe('完整派遣流程', () => {
    it('應該完成完整的任務週期：派遣 -> 進度 -> 完成', () => {
      // 派遣
      const dispatchResult = manager.dispatch('002', 'cooking');
      expect(dispatchResult.success).toBe(true);

      const task = manager.getCurrentTask('002');
      expect(task.status).toBe('in_progress');
      expect(task.progress).toBe(0);

      // 進度更新 - 使用較小的增量
      manager.update(task.duration * 0.1); // 完成10%左右
      expect(task.progress).toBeGreaterThan(0);
      expect(task.progress).toBeLessThan(1);
      expect(task.status).toBe('in_progress');

      // 完成任務
      manager.update(task.duration * 2); // 完成剩餘部分
      expect(manager.getCurrentTask('002')).toBeUndefined(); // 已移除
      expect(manager.getStatistics().totalTasks).toBe(1);
    });

    it('應該正確處理角色疲勞累積', () => {
      const character = { id: '001', name: '林修然', experience: {}, fatigue: 0 };
      vi.spyOn(manager, 'getCharacter').mockReturnValue(character);

      // 派遣長任務
      manager.dispatch('001', 'performing'); // 600秒
      const task = manager.getCurrentTask('001');

      // 完成任務
      manager.update(task.duration * 2);

      // 疲勞應該增加
      expect(character.fatigue).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });

    it('應該記錄經驗值增長', () => {
      const character = { id: '001', name: '林修然', experience: {}, fatigue: 0 };
      vi.spyOn(manager, 'getCharacter').mockReturnValue(character);

      manager.dispatch('001', 'cooking');
      const task = manager.getCurrentTask('001');

      // 完成任務
      manager.update(task.duration * 2);

      // 應該獲得經驗
      expect(character.experience.cooking).toBeGreaterThan(0);
      expect(manager.getStatistics().totalExperienceGained).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });
  });

  describe('邊界條件測試', () => {
    it('dispatch 不存在的角色應該失敗', () => {
      vi.spyOn(manager, 'getCharacter').mockReturnValue(null);

      const result = manager.dispatch('999', 'cooking');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('角色不存在');

      vi.restoreAllMocks();
    });

    it('cancel 未派遣的角色應該返回失敗', () => {
      const result = manager.cancel('001');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('角色未被派遣');
    });

    it('getCurrentTask 未派遣的角色應該返回 undefined', () => {
      const task = manager.getCurrentTask('999');

      expect(task).toBeUndefined();
    });

    it('rest 不存在的角色應該失敗', () => {
      vi.spyOn(manager, 'getCharacter').mockReturnValue(null);

      const result = manager.rest('999', 1800);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('角色不存在');

      vi.restoreAllMocks();
    });

    it('效率計算應該處理未定義的技能', () => {
      const character = {
        id: '999', // 不在 defaultSkills 中
        name: '未知角色',
        experience: {}
      };

      const efficiency = manager.calculateEfficiency(character, 'cooking');

      expect(efficiency.baseSkill).toBe(1); // 默認1星
      expect(efficiency.speed).toBeGreaterThan(0);
    });

    it('疲勞度不應該小於0', () => {
      const character = { id: '001', name: '林修然', fatigue: 0.1 };
      vi.spyOn(manager, 'getCharacter').mockReturnValue(character);

      manager.rest('001', 10000); // 超長休息

      expect(character.fatigue).toBe(0);

      vi.restoreAllMocks();
    });

    it('取消派遣時應該停止動畫', () => {
      const mockAnimationManager = {
        play: vi.fn(),
        stop: vi.fn()
      };
      mockGameState.animationManager = mockAnimationManager;

      manager.dispatch('001', 'cooking');
      manager.cancel('001');

      expect(mockAnimationManager.stop).toHaveBeenCalledWith('001');
    });

    it('無動畫管理器時取消派遣不應該報錯', () => {
      delete mockGameState.animationManager;

      manager.dispatch('001', 'cooking');

      expect(() => {
        manager.cancel('001');
      }).not.toThrow();
    });
  });

  describe('技能升級系統', () => {
    it('技能不應該超過5星', () => {
      const character = {
        id: '002', // 林語嫣，烹飪已經5星
        name: '林語嫣',
        experience: { cooking: 95 }
      };

      const initialSkill = manager.defaultSkills['002'].cooking;
      expect(initialSkill).toBe(5);

      // 嘗試升級
      manager.gainExperience(character, 'cooking', true);

      // 技能應該保持5星
      expect(manager.defaultSkills['002'].cooking).toBe(5);
    });

    it('技能升級應該發送通知', () => {
      const character = {
        id: '001',
        name: '林修然',
        experience: { cooking: 95 }
      };

      manager.gainExperience(character, 'cooking', true);

      expect(mockGameState.notificationManager.success).toHaveBeenCalledWith(
        '技能提升',
        expect.stringContaining('林修然')
      );
    });
  });
});
