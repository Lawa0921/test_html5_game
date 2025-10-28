import { describe, it, expect, beforeEach } from 'vitest';
import CharacterDispatchManager from '../src/managers/CharacterDispatchManager.js';

describe('CharacterStatus - 角色狀態擴展', () => {
  let manager;
  let mockGameState;

  beforeEach(() => {
    mockGameState = {
      timeManager: {
        currentTime: { dayCount: 1 }
      },
      notificationManager: {
        info: () => {},
        success: () => {},
        warning: () => {}
      },
      inn: {
        gold: 1000,
        reputation: 100
      },
      innManager: {
        getFacilityInfo: () => ({
          id: 'kitchen',
          name: '廚房',
          unlocked: true,
          level: 1
        })
      }
    };

    manager = new CharacterDispatchManager(mockGameState);
  });

  // ==================== 角色狀態初始化 ====================

  describe('角色狀態初始化', () => {
    it('角色應該有心相屬性（mood）', () => {
      const character = manager.getCharacter('001');

      expect(character.mood).toBeDefined();
      expect(character.mood).toBeGreaterThanOrEqual(0);
      expect(character.mood).toBeLessThanOrEqual(100);
    });

    it('角色應該有疲勞屬性（fatigue）', () => {
      const character = manager.getCharacter('001');

      expect(character.fatigue).toBeDefined();
      expect(character.fatigue).toBeGreaterThanOrEqual(0);
      expect(character.fatigue).toBeLessThanOrEqual(100);
    });

    it('角色應該有喜歡的工作列表', () => {
      const favoriteJobs = manager.getFavoriteJobs('001');

      expect(Array.isArray(favoriteJobs)).toBe(true);
      expect(favoriteJobs.length).toBeGreaterThan(0);
    });

    it('角色應該有討厭的工作列表', () => {
      const dislikedJobs = manager.getDislikedJobs('001');

      expect(Array.isArray(dislikedJobs)).toBe(true);
    });

    it('林修然應該喜歡管理類工作', () => {
      const favoriteJobs = manager.getFavoriteJobs('001');

      expect(favoriteJobs).toContain('accounting');
      expect(favoriteJobs).toContain('greeting');
    });

    it('林語嫣應該喜歡烹飪工作', () => {
      const favoriteJobs = manager.getFavoriteJobs('002');

      expect(favoriteJobs).toContain('cooking');
      expect(favoriteJobs).toContain('prep');
    });
  });

  // ==================== 心相系統 ====================

  describe('心相系統', () => {
    it('執行喜歡的工作應該減少心相下降', () => {
      const character = manager.getCharacter('001');
      const initialMood = character.mood || 100;

      // 執行喜歡的工作
      manager.dispatch('001', 'accounting');
      manager.update(300); // 5分鐘，update() 會自動完成任務

      expect(character.mood).toBeGreaterThanOrEqual(initialMood - 5);
    });

    it('執行討厭的工作應該大幅降低心相', () => {
      const character = manager.getCharacter('001');
      character.mood = 100;

      const dislikedJobs = manager.getDislikedJobs('001');
      if (dislikedJobs.length > 0) {
        // 執行討厭的工作
        manager.dispatch('001', dislikedJobs[0]);
        manager.update(300); // update() 會自動完成任務

        expect(character.mood).toBeLessThan(95);
      }
    });

    it('執行中立工作應該正常降低心相', () => {
      const character = manager.getCharacter('001');
      character.mood = 100;

      const favoriteJobs = manager.getFavoriteJobs('001');
      const dislikedJobs = manager.getDislikedJobs('001');

      // 找一個中立工作（既不喜歡也不討厭）
      const neutralJob = ['serving', 'cleaning', 'security']
        .find(job => !favoriteJobs.includes(job) && !dislikedJobs.includes(job));

      if (neutralJob) {
        manager.dispatch('001', neutralJob);
        manager.update(300); // update() 會自動完成任務

        expect(character.mood).toBeGreaterThanOrEqual(90);
        expect(character.mood).toBeLessThan(100);
      }
    });

    it('心相不應該低於0', () => {
      const character = manager.getCharacter('001');
      character.mood = 5;

      // 執行討厭的工作多次
      const dislikedJobs = manager.getDislikedJobs('001');
      if (dislikedJobs.length > 0) {
        manager.dispatch('001', dislikedJobs[0]);
        manager.update(600); // update() 會自動完成任務

        expect(character.mood).toBeGreaterThanOrEqual(0);
      }
    });

    it('心相不應該高於100', () => {
      const character = manager.getCharacter('001');
      character.mood = 100;

      // 休息恢復心相
      manager.rest('001', 1800);

      expect(character.mood).toBeLessThanOrEqual(100);
    });

    it('應該能獲取角色心相狀態描述', () => {
      const character = manager.getCharacter('001');
      character.mood = 80;

      const status = manager.getMoodStatus('001');

      expect(status).toBeDefined();
      expect(status.level).toBeDefined(); // 'excellent', 'good', 'normal', 'bad', 'terrible'
      expect(status.description).toBeDefined();
    });
  });

  // ==================== 疲勞系統 ====================

  describe('疲勞系統', () => {
    it('執行喜歡的工作應該減少疲勞增加', () => {
      const character = manager.getCharacter('001');
      character.fatigue = 0;

      const favoriteJobs = manager.getFavoriteJobs('001');
      manager.dispatch('001', favoriteJobs[0]);
      manager.update(600); // 10分鐘，update() 會自動完成任務

      // 喜歡的工作疲勞增加較少（使用 0-1.0 浮點數範圍）
      expect(character.fatigue).toBeLessThan(0.15);
    });

    it('執行討厭的工作應該大幅增加疲勞', () => {
      const character = manager.getCharacter('001');
      character.fatigue = 0;

      const dislikedJobs = manager.getDislikedJobs('001');
      if (dislikedJobs.length > 0) {
        manager.dispatch('001', dislikedJobs[0]);
        manager.update(600); // update() 會自動完成任務

        // 討厭的工作疲勞增加較多（使用 0-1.0 浮點數範圍）
        expect(character.fatigue).toBeGreaterThan(0.1);
      }
    });

    it('疲勞值會影響工作效率', () => {
      const character = manager.getCharacter('001');

      // 低疲勞時的效率
      character.fatigue = 0;
      const lowFatigueEfficiency = manager.calculateEfficiency(character, 'cooking');

      // 高疲勞時的效率
      character.fatigue = 80;
      const highFatigueEfficiency = manager.calculateEfficiency(character, 'cooking');

      expect(highFatigueEfficiency.speed).toBeLessThan(lowFatigueEfficiency.speed);
    });

    it('休息應該能恢復疲勞', () => {
      const character = manager.getCharacter('001');
      character.fatigue = 50;

      manager.rest('001', 1800); // 休息30分鐘

      expect(character.fatigue).toBeLessThan(50);
    });

    it('疲勞不應該超過100', () => {
      const character = manager.getCharacter('001');
      character.fatigue = 95;

      // 執行長時間任務
      manager.dispatch('001', 'cooking');
      manager.update(3600); // 1小時，update() 會自動完成任務

      expect(character.fatigue).toBeLessThanOrEqual(100);
    });
  });

  // ==================== 工作偏好影響 ====================

  describe('工作偏好影響', () => {
    it('應該能判斷工作是否被角色喜歡', () => {
      const isLiked = manager.isJobLiked('001', 'accounting');
      expect(typeof isLiked).toBe('boolean');
    });

    it('應該能判斷工作是否被角色討厭', () => {
      const isDisliked = manager.isJobDisliked('001', 'cleaning');
      expect(typeof isDisliked).toBe('boolean');
    });

    it('應該能獲取工作偏好修正係數', () => {
      const favoriteJobs = manager.getFavoriteJobs('001');
      const modifier = manager.getJobPreferenceModifier('001', favoriteJobs[0]);

      expect(modifier).toBeDefined();
      expect(modifier.moodChange).toBeDefined();
      expect(modifier.fatigueRate).toBeDefined();
    });

    it('喜歡的工作應該有正面修正', () => {
      const favoriteJobs = manager.getFavoriteJobs('001');
      const modifier = manager.getJobPreferenceModifier('001', favoriteJobs[0]);

      // 喜歡的工作心相下降較少（仍是負值，但絕對值較小）
      expect(modifier.moodChange).toBeGreaterThan(-5); // 應該大於中立工作的 -5
      expect(modifier.fatigueRate).toBeLessThanOrEqual(1.0);
    });

    it('討厭的工作應該有負面修正', () => {
      const dislikedJobs = manager.getDislikedJobs('001');
      if (dislikedJobs.length > 0) {
        const modifier = manager.getJobPreferenceModifier('001', dislikedJobs[0]);

        expect(modifier.moodChange).toBeLessThan(0);
        expect(modifier.fatigueRate).toBeGreaterThan(1.0);
      }
    });
  });

  // ==================== 連續工作影響 ====================

  describe('連續工作影響', () => {
    it('連續執行相同工作應該增加疲勞累積', () => {
      const character = manager.getCharacter('001');
      character.fatigue = 0;

      // 第一次工作
      manager.dispatch('001', 'cooking');
      manager.update(600); // 自動完成任務
      const firstFatigue = character.fatigue;

      // 第二次相同工作
      manager.dispatch('001', 'cooking');
      manager.update(600); // 自動完成任務
      const secondFatigue = character.fatigue;

      // 疲勞應該累積
      expect(secondFatigue).toBeGreaterThan(firstFatigue);
      expect(secondFatigue).toBeGreaterThan(0);
    });

    it('應該能追蹤角色最近執行的工作歷史', () => {
      manager.dispatch('001', 'cooking');
      manager.update(300); // 完成任務

      const history = manager.getRecentJobHistory('001');

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].taskType).toBe('cooking');
    });
  });

  // ==================== 角色狀態查詢 ====================

  describe('角色狀態查詢', () => {
    it('應該能獲取角色完整狀態', () => {
      const status = manager.getCharacterStatus('001');

      expect(status).toBeDefined();
      expect(status.id).toBe('001');
      expect(status.mood).toBeDefined();
      expect(status.fatigue).toBeDefined();
      expect(status.moodStatus).toBeDefined();
      expect(status.fatigueStatus).toBeDefined();
      expect(status.favoriteJobs).toBeDefined();
      expect(status.dislikedJobs).toBeDefined();
    });

    it('應該能判斷角色是否適合執行某工作', () => {
      const result = manager.isCharacterSuitableForJob('001', 'cooking');

      expect(result).toBeDefined();
      expect(result.suitable).toBeDefined();
      expect(result.reasons).toBeDefined();
    });

    it('疲勞過高時不應該適合執行工作', () => {
      const character = manager.getCharacter('001');
      character.fatigue = 0.95; // 疲勞值是 0-1 的浮點數

      const result = manager.isCharacterSuitableForJob('001', 'cooking');

      expect(result.suitable).toBe(false);
      expect(result.reasons).toContain('疲勞過高');
    });

    it('心相過低時應該給予警告', () => {
      const lowMoodCharacter = {
        id: '001',
        name: '林修然',
        experience: {},
        fatigue: 0,
        mood: 10 // 心相極低
      };

      // Mock getCharacter 方法
      const originalGetCharacter = manager.getCharacter.bind(manager);
      manager.getCharacter = (id) => {
        if (id === '001') return lowMoodCharacter;
        return originalGetCharacter(id);
      };

      const result = manager.isCharacterSuitableForJob('001', 'cooking');

      expect(result.warnings).toBeDefined();
      expect(result.warnings.length).toBeGreaterThan(0);

      // 恢復原始方法
      manager.getCharacter = originalGetCharacter;
    });
  });
});
