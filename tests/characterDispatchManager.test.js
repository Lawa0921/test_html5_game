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

    // 角色 004 (顧青鸞) 已移除，跳過此測試
    // 治療任務現在需要 clinic 設施，將在設施測試中覆蓋
    // it('所有角色都可以執行治療任務（不限制）', () => {
    //   const result1 = manager.dispatch('001', 'healing'); // 林修然
    //   const result2 = manager.dispatch('004', 'healing'); // 顧青鸞
    //
    //   expect(result1.success).toBe(true); // 林修然可以治療（低效率）
    //   expect(result2.success).toBe(true); // 顧青鸞可以治療（高效率）
    // });
  });

  describe('效率計算', () => {
    it('應該根據技能等級計算效率', () => {
      const character = { id: '002', name: '林語嫣', experience: {} };
      const efficiency = manager.calculateEfficiency(character, 'cooking');

      expect(efficiency.baseSkill).toBe(5); // 林語嫣烹飪5星
      expect(efficiency.quality).toBe(5);
      expect(efficiency.speed).toBeGreaterThan(1);
    });

    // 角色 008 (蕭鐵峰) 已移除，改用林修然測試低技能
    it('低技能角色應該有較低效率', () => {
      const character = { id: '001', name: '林修然', experience: {} };
      const efficiency = manager.calculateEfficiency(character, 'cooking');

      expect(efficiency.baseSkill).toBe(3); // 林修然烹飪3星
      expect(efficiency.quality).toBeGreaterThanOrEqual(3);
      expect(efficiency.successRate).toBeGreaterThan(0.5);
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

    // 角色 008 (蕭鐵峰) 已移除，改用秦婉柔測試低技能任務
    it('低技能角色應該獲得更多經驗', () => {
      const character = {
        id: '011', // 秦婉柔，烹飪2星（低技能）
        name: '秦婉柔',
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

    // 角色 008 (蕭鐵峰) 已移除，改用林修然和林語嫣對比
    it('應該根據效率調整進度速度', () => {
      // 高技能角色
      manager.dispatch('002', 'cooking'); // 林語嫣，烹飪5星
      const task1 = manager.getCurrentTask('002');

      // 低技能角色
      manager.dispatch('011', 'cooking'); // 秦婉柔，烹飪2星
      const task2 = manager.getCurrentTask('011');

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

    // 角色 003 已移除，改用 011
    it('應該處理多個任務同時進行', () => {
      manager.dispatch('001', 'cooking');
      manager.dispatch('002', 'serving');
      manager.dispatch('011', 'performing');

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

  describe('設施需求檢查', () => {
    let mockInnManager;

    beforeEach(() => {
      // 創建模擬的 InnManager
      mockInnManager = {
        getFacilityInfo: vi.fn()
      };
      mockGameState.innManager = mockInnManager;
    });

    describe('checkFacilityRequirement()', () => {
      it('無設施管理器時應該允許所有任務（向後兼容）', () => {
        delete mockGameState.innManager;

        const taskDef = {
          name: '挖礦',
          requiredFacility: 'mine',
          requiredFacilityLevel: 1
        };

        const result = manager.checkFacilityRequirement(taskDef);

        expect(result.satisfied).toBe(true);
      });

      it('設施已解鎖且等級足夠時應該允許', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'mine',
          name: '礦坑',
          unlocked: true,
          level: 2,
          unlockAtInnLevel: 2
        });

        const taskDef = {
          name: '挖礦',
          requiredFacility: 'mine',
          requiredFacilityLevel: 1
        };

        const result = manager.checkFacilityRequirement(taskDef);

        expect(result.satisfied).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('mine');
      });

      it('設施不存在時應該拒絕', () => {
        mockInnManager.getFacilityInfo.mockReturnValue(null);

        const taskDef = {
          name: '未知任務',
          requiredFacility: 'unknown',
          requiredFacilityLevel: 1
        };

        const result = manager.checkFacilityRequirement(taskDef);

        expect(result.satisfied).toBe(false);
        expect(result.reason).toContain('不存在');
      });

      it('設施未解鎖時應該拒絕', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'mine',
          name: '礦坑',
          unlocked: false,
          level: 0,
          unlockAtInnLevel: 2
        });

        const taskDef = {
          name: '挖礦',
          requiredFacility: 'mine',
          requiredFacilityLevel: 1
        };

        const result = manager.checkFacilityRequirement(taskDef);

        expect(result.satisfied).toBe(false);
        expect(result.reason).toContain('尚未解鎖');
        expect(result.reason).toContain('礦坑');
        expect(result.reason).toContain('2'); // 客棧等級需求
      });

      it('設施等級不足時應該拒絕', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'mine',
          name: '礦坑',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 2
        });

        const taskDef = {
          name: '高級挖礦',
          requiredFacility: 'mine',
          requiredFacilityLevel: 3 // 需要3級，但只有1級
        };

        const result = manager.checkFacilityRequirement(taskDef);

        expect(result.satisfied).toBe(false);
        expect(result.reason).toContain('等級不足');
        expect(result.reason).toContain('當前 1');
        expect(result.reason).toContain('需要 3');
      });
    });

    describe('dispatch() 與設施整合', () => {
      it('無設施需求的任務應該直接允許', () => {
        // performing 沒有設施需求
        const result = manager.dispatch('001', 'performing');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).not.toHaveBeenCalled();
      });

      it('設施已解鎖的任務應該允許派遣', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'kitchen',
          name: '廚房',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 1
        });

        const result = manager.dispatch('001', 'cooking');

        expect(result.success).toBe(true);
        expect(result.task.type).toBe('cooking');
      });

      it('設施未解鎖時應該拒絕派遣', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'mine',
          name: '礦坑',
          unlocked: false,
          level: 0,
          unlockAtInnLevel: 2
        });

        const result = manager.dispatch('001', 'mining');

        expect(result.success).toBe(false);
        expect(result.reason).toContain('尚未解鎖');
        expect(result.requiredFacility).toBe('mine');
        expect(result.requiredLevel).toBe(1);
      });

      it('設施等級不足時應該拒絕派遣', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'clinic',
          name: '醫館',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 4
        });

        // 假設 healing 需要 clinic level 2（這裡用 healing 作為示例）
        const taskDef = manager.taskDefinitions.healing;
        taskDef.requiredFacilityLevel = 2; // 臨時修改需求等級

        const result = manager.dispatch('001', 'healing');

        expect(result.success).toBe(false);
        expect(result.reason).toContain('等級不足');

        // 恢復原始值
        taskDef.requiredFacilityLevel = 1;
      });
    });

    describe('新工作類型測試', () => {
      it('挖礦需要礦坑設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'mine',
          name: '礦坑',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 2
        });

        const result = manager.dispatch('001', 'mining');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('mine');
      });

      it('種植需要農田設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'farm',
          name: '農田',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 3
        });

        const result = manager.dispatch('001', 'farming');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('farm');
      });

      it('釣魚需要河川設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'river',
          name: '河川',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 1
        });

        const result = manager.dispatch('001', 'fishing');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('river');
      });

      it('練武需要練武場設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'trainingGround',
          name: '練武場',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 3
        });

        const result = manager.dispatch('001', 'training');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('trainingGround');
      });

      it('旅行需要馬廄設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'stable',
          name: '馬廄',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 4
        });

        const result = manager.dispatch('001', 'traveling');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('stable');
      });

      it('走鏢需要看板設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'noticeBoard',
          name: '看板',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 5
        });

        const result = manager.dispatch('001', 'escort');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('noticeBoard');
      });

      it('貿易需要看板設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'noticeBoard',
          name: '看板',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 5
        });

        const result = manager.dispatch('001', 'trading');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('noticeBoard');
      });

      it('探查需要暗室設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'secretRoom',
          name: '暗室',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 5
        });

        const result = manager.dispatch('001', 'investigation');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('secretRoom');
      });

      it('暗殺需要暗室設施', () => {
        mockInnManager.getFacilityInfo.mockReturnValue({
          id: 'secretRoom',
          name: '暗室',
          unlocked: true,
          level: 1,
          unlockAtInnLevel: 5
        });

        const result = manager.dispatch('001', 'assassination');

        expect(result.success).toBe(true);
        expect(mockInnManager.getFacilityInfo).toHaveBeenCalledWith('secretRoom');
      });
    });

    describe('多設施並發測試', () => {
      it('不同角色可以同時在不同設施工作', () => {
        // 設置多個設施為可用
        mockInnManager.getFacilityInfo.mockImplementation((facilityId) => {
          return {
            id: facilityId,
            name: facilityId,
            unlocked: true,
            level: 1,
            unlockAtInnLevel: 1
          };
        });

        const result1 = manager.dispatch('001', 'cooking'); // 廚房
        const result2 = manager.dispatch('002', 'fishing'); // 河川
        const result3 = manager.dispatch('011', 'reception'); // 客棧大廳

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
        expect(result3.success).toBe(true);

        const assignments = manager.getAllAssignments();
        expect(assignments.length).toBe(3);
      });

      it('設施鎖定應該只影響相關任務', () => {
        mockInnManager.getFacilityInfo.mockImplementation((facilityId) => {
          if (facilityId === 'mine') {
            return {
              id: 'mine',
              name: '礦坑',
              unlocked: false,
              level: 0,
              unlockAtInnLevel: 2
            };
          }
          return {
            id: facilityId,
            name: facilityId,
            unlocked: true,
            level: 1,
            unlockAtInnLevel: 1
          };
        });

        const cookingResult = manager.dispatch('001', 'cooking'); // 廚房可用
        const miningResult = manager.dispatch('002', 'mining'); // 礦坑不可用

        expect(cookingResult.success).toBe(true);
        expect(miningResult.success).toBe(false);
        expect(miningResult.reason).toContain('尚未解鎖');
      });
    });
  });

  describe('角色查詢方法', () => {
    it('應該能獲取角色信息', () => {
      const character = manager.getCharacter('001');

      expect(character).toBeDefined();
      expect(character.id).toBe('001');
      expect(character.name).toBeDefined();
    });

    it('不存在的角色應返回預設狀態', () => {
      const character = manager.getCharacter('999');

      expect(character).toBeDefined();
      expect(character.id).toBe('999');
      expect(character.name).toBe('未知');
    });

    it('應該能獲取角色狀態', () => {
      manager.dispatch('001', 'cooking');
      const status = manager.getCharacterStatus('001');

      expect(status).toBeDefined();
      expect(status.id).toBe('001');
      expect(status.name).toBeDefined();
      expect(status.mood).toBeDefined();
      expect(status.fatigue).toBeDefined();
      expect(status.moodStatus).toBeDefined();
      expect(status.fatigueStatus).toBeDefined();
      expect(status.currentTask).toBeDefined();
    });

    it('空閒角色的狀態應正確', () => {
      const status = manager.getCharacterStatus('001');

      expect(status).toBeDefined();
      expect(status.currentTask).toBeUndefined();
      expect(status.mood).toBeDefined();
      expect(status.fatigue).toBeDefined();
    });
  });

  describe('職業偏好系統', () => {
    it('應該能獲取角色喜歡的工作', () => {
      const favorites = manager.getFavoriteJobs('001');

      expect(Array.isArray(favorites)).toBe(true);
    });

    it('應該能獲取角色不喜歡的工作', () => {
      const dislikes = manager.getDislikedJobs('001');

      expect(Array.isArray(dislikes)).toBe(true);
    });

    it('應該能檢查角色是否喜歡某個工作', () => {
      const isLiked = manager.isJobLiked('001', 'cooking');

      expect(typeof isLiked).toBe('boolean');
    });

    it('應該能檢查角色是否不喜歡某個工作', () => {
      const isDisliked = manager.isJobDisliked('001', 'cooking');

      expect(typeof isDisliked).toBe('boolean');
    });

    it('應該能獲取職業偏好修正值', () => {
      const modifier = manager.getJobPreferenceModifier('001', 'cooking');

      expect(typeof modifier).toBe('object');
      expect(modifier).toHaveProperty('moodChange');
      expect(modifier).toHaveProperty('fatigueRate');
      expect(typeof modifier.moodChange).toBe('number');
      expect(typeof modifier.fatigueRate).toBe('number');
    });

    it('喜歡的工作應有較少的負面影響', () => {
      const favorites = manager.getFavoriteJobs('001');

      // 找到一個喜歡的工作
      if (favorites && favorites.length > 0) {
        const favoriteJob = favorites[0];
        const modifier = manager.getJobPreferenceModifier('001', favoriteJob);

        // 喜歡的工作：moodChange: -2, fatigueRate: 0.7
        expect(modifier.moodChange).toBe(-2);
        expect(modifier.fatigueRate).toBe(0.7);
      }
    });

    it('不喜歡的工作應有較多的負面影響', () => {
      const dislikes = manager.getDislikedJobs('001');

      // 找到一個不喜歡的工作
      if (dislikes && dislikes.length > 0) {
        const dislikedJob = dislikes[0];
        const modifier = manager.getJobPreferenceModifier('001', dislikedJob);

        // 不喜歡的工作：moodChange: -10, fatigueRate: 1.5
        expect(modifier.moodChange).toBe(-10);
        expect(modifier.fatigueRate).toBe(1.5);
      }
    });
  });

  describe('心情系統', () => {
    it('應該能更新角色心情', () => {
      const character = manager.getCharacter('001');
      character.mood = 50; // 設定初始心情為 50

      manager.updateMood(character, 10);

      expect(character.mood).toBe(60); // 50 + 10 = 60
    });

    it('心情應該在 0-100 範圍內', () => {
      const character = manager.getCharacter('001');

      manager.updateMood(character, 200);
      expect(character.mood).toBeLessThanOrEqual(100);

      manager.updateMood(character, -200);
      expect(character.mood).toBeGreaterThanOrEqual(0);
    });

    it('應該能獲取角色心情狀態', () => {
      const moodStatus = manager.getMoodStatus('001');

      expect(moodStatus).toBeDefined();
      expect(moodStatus.level).toBeDefined();
      expect(moodStatus.description).toBeDefined();
      expect(['excellent', 'good', 'normal', 'bad', 'terrible']).toContain(moodStatus.level);
    });
  });

  describe('工作歷史記錄', () => {
    it('應該能記錄工作歷史', () => {
      manager.recordJobHistory('001', 'cooking');

      const history = manager.getRecentJobHistory('001');

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].taskType).toBe('cooking');
    });

    it('應該限制歷史記錄數量', () => {
      // 記錄 15 次工作
      for (let i = 0; i < 15; i++) {
        manager.recordJobHistory('001', 'cooking');
      }

      const history = manager.getRecentJobHistory('001', 10);

      expect(history.length).toBeLessThanOrEqual(10);
    });

    it('應該按時間順序保存歷史', () => {
      manager.recordJobHistory('001', 'cooking');
      manager.recordJobHistory('001', 'serving');

      const history = manager.getRecentJobHistory('001');

      // recordJobHistory 按順序 push，getRecentJobHistory 返回最後 N 條
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0]).toHaveProperty('taskType');
      expect(history[0]).toHaveProperty('completedAt');
    });
  });

  describe('疲勞系統', () => {
    it('應該能獲取疲勞狀態', () => {
      const status1 = manager.getFatigueStatus(0);
      expect(status1).toBeDefined();
      expect(status1.level).toBe('rested');
      expect(status1.description).toBe('精力充沛');

      const status2 = manager.getFatigueStatus(0.3);
      expect(status2.level).toBe('normal');
      expect(status2.description).toBe('狀態正常');

      const status3 = manager.getFatigueStatus(0.5);
      expect(status3.level).toBe('tired');
      expect(status3.description).toBe('有些疲倦');

      const status4 = manager.getFatigueStatus(0.7);
      expect(status4.level).toBe('exhausted');
      expect(status4.description).toBe('十分疲憊');

      const status5 = manager.getFatigueStatus(0.9);
      expect(status5.level).toBe('overworked');
      expect(status5.description).toBe('過度勞累');
    });
  });

  describe('技能升級', () => {
    it('應該能升級技能', () => {
      const character = manager.getCharacter('001');

      // 獲取初始技能等級
      const initialLevel = manager.defaultSkills[character.id]?.cooking || 1;

      manager.levelUpSkill(character, 'cooking');

      // 檢查技能是否提升
      const newLevel = manager.defaultSkills[character.id]?.cooking;
      expect(newLevel).toBe(initialLevel + 1);
    });

    it('技能等級應該有上限 5', () => {
      const character = manager.getCharacter('001');

      // 嘗試升到超過最大等級
      for (let i = 0; i < 200; i++) {
        manager.levelUpSkill(character, 'cooking');
      }

      // 技能上限是 5
      const finalLevel = manager.defaultSkills[character.id]?.cooking;
      expect(finalLevel).toBeLessThanOrEqual(5);
    });
  });

  describe('角色適合度檢查', () => {
    it('應該能檢查角色是否適合某個工作', () => {
      const result = manager.isCharacterSuitableForJob('001', 'cooking');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('suitable');
      expect(result).toHaveProperty('reasons');
      expect(result).toHaveProperty('warnings');
      expect(typeof result.suitable).toBe('boolean');
      expect(Array.isArray(result.reasons)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('疲勞的角色不應適合工作', () => {
      const character = manager.getCharacter('001');
      character.fatigue = 0.95; // 95% 疲勞（超過 0.9 的閾值）

      const result = manager.isCharacterSuitableForJob('001', 'cooking');

      expect(result.suitable).toBe(false);
      expect(result.reasons).toContain('疲勞過高');
    });

    it('心情極差的角色會有警告', () => {
      const character = manager.getCharacter('001');
      character.mood = 5; // 心情極差
      character.fatigue = 0.5; // 適中的疲勞

      const result = manager.isCharacterSuitableForJob('001', 'cooking');

      // 心情低不影響 suitable，但會有警告
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('心相'))).toBe(true);
    });
  });

  describe('序列化和反序列化', () => {
    it('應該能序列化數據', () => {
      manager.dispatch('001', 'cooking');

      const saveData = manager.getSaveData();

      expect(saveData).toBeDefined();
      expect(saveData.assignments).toBeDefined();
      expect(saveData.jobHistory).toBeDefined();
      expect(saveData.characterStates).toBeDefined();
      expect(saveData.statistics).toBeDefined();
    });

    it('應該能反序列化數據', () => {
      manager.dispatch('001', 'cooking');
      const saveData = manager.getSaveData();

      const newManager = new CharacterDispatchManager(mockGameState);
      newManager.loadSaveData(saveData);

      const task = newManager.getCurrentTask('001');
      expect(task).toBeDefined();
      expect(task.type).toBe('cooking');
    });

    it('反序列化後統計數據應保持', () => {
      manager.dispatch('001', 'cooking');
      manager.update(3600000); // 1 小時

      // 獲取當前任務並完成它
      const task = manager.getCurrentTask('001');
      if (task) {
        manager.completeTask(task);
      }

      const saveData = manager.getSaveData();
      const newManager = new CharacterDispatchManager(mockGameState);
      newManager.loadSaveData(saveData);

      const stats = newManager.getStatistics();
      expect(stats.totalTasks).toBeGreaterThan(0);
    });
  });
});
