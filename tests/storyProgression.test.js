import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * 故事進度追蹤系統測試
 *
 * 測試以下功能:
 * - 故事完成狀態追蹤
 * - 玩家選擇記錄
 * - 基於選擇的劇情差分
 * - 全局旗標系統
 * - 存檔整合
 */

describe('故事進度追蹤系統', () => {
  let StoryManager;
  let storyManager;
  let mockStories;

  beforeEach(async () => {
    // 載入 StoryManager
    const module = await import('../src/managers/StoryManager.js');
    StoryManager = module.default;

    // 創建完整的模擬 gameState
    const mockGameState = {
      player: {
        changePersonality: vi.fn(),
        addAttribute: vi.fn()
      },
      addSilver: vi.fn(),
      addReputation: vi.fn(),
      employees: {},
      inventory: {
        addItem: vi.fn()
      },
      variables: {}
    };

    // 創建 StoryManager 實例
    storyManager = new StoryManager(mockGameState);

    // 載入故事數據
    storyManager.loadStoryData();
  });

  // ==================== 故事完成追蹤 ====================

  describe('故事完成追蹤', () => {
    it('應該記錄已完成的故事', () => {
      storyManager.startStory('opening');

      // 模擬完成故事
      storyManager.endStory();

      expect(storyManager.hasCompletedStory('opening')).toBe(true);
      expect(storyManager.storyProgress.completedStories).toContain('opening');
    });

    it('應該記錄故事完成時間', () => {
      const startTime = Date.now();
      storyManager.startStory('opening');

      storyManager.endStory();
      const record = storyManager.getStoryRecord('opening');

      expect(record.startedAt).toBeGreaterThanOrEqual(startTime);
      expect(record.completedAt).toBeGreaterThanOrEqual(record.startedAt);
    });

    it('應該記錄故事遊玩次數', () => {
      // 第一次遊玩
      storyManager.startStory('opening');
      storyManager.endStory();

      let record = storyManager.getStoryRecord('opening');
      expect(record.playCount).toBe(1);

      // 第二次遊玩
      storyManager.startStory('opening');
      storyManager.endStory();

      record = storyManager.getStoryRecord('opening');
      expect(record.playCount).toBe(2);
    });

    it('應該記錄故事遊玩時長', () => {
      storyManager.startStory('opening');

      // 模擬時間流逝 (這裡只是驗證結構)
      storyManager.endStory();

      const record = storyManager.getStoryRecord('opening');
      expect(record.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== 玩家選擇記錄 ====================

  describe('玩家選擇記錄', () => {
    it('應該記錄玩家的選擇', () => {
      storyManager.startStory('opening');

      // 前進到選擇節點 (節點 10)
      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      const currentNode = storyManager.getCurrentNode();
      expect(currentNode.type).toBe('choice');

      // 選擇第一個選項 (重振客棧)
      storyManager.nextNode(0);

      const record = storyManager.currentStoryRecord;
      expect(record.choices.length).toBeGreaterThan(0);

      const lastChoice = record.choices[record.choices.length - 1];
      expect(lastChoice.nodeId).toBe(10);
      expect(lastChoice.choiceIndex).toBe(0);
      expect(lastChoice.choiceText).toContain('重振客棧');
    });

    it('應該記錄多個選擇', () => {
      storyManager.startStory('opening');

      // 前進到第一個選擇點
      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(0);

      const record = storyManager.currentStoryRecord;
      expect(record.choices.length).toBe(1);
    });

    it('應該包含選擇的時間戳', () => {
      storyManager.startStory('opening');

      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      const beforeChoice = Date.now();
      storyManager.nextNode(0);
      const afterChoice = Date.now();

      const record = storyManager.currentStoryRecord;
      const lastChoice = record.choices[record.choices.length - 1];

      expect(lastChoice.timestamp).toBeGreaterThanOrEqual(beforeChoice);
      expect(lastChoice.timestamp).toBeLessThanOrEqual(afterChoice);
    });
  });

  // ==================== 劇情差分條件判定 ====================

  describe('劇情差分條件判定', () => {
    it('應該正確判定 story_completed 條件', () => {
      // 還沒完成
      let canPlay = storyManager.canPlayStory('meet_chef');
      expect(canPlay.canPlay).toBe(false);
      expect(canPlay.reason).toContain('opening');

      // 完成開場劇情
      storyManager.startStory('opening');
      storyManager.endStory();

      // 現在應該可以玩
      canPlay = storyManager.canPlayStory('meet_chef');
      expect(canPlay.canPlay).toBe(true);
    });

    it('應該正確判定 story_choice 條件', () => {
      // 完成開場劇情並選擇第一個選項 (重振客棧)
      storyManager.startStory('opening');

      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(0); // 選擇第一個選項
      storyManager.endStory();

      // 載入 meet_chef 故事
      storyManager.startStory('meet_chef');

      // 前進到條件分支節點
      for (let i = 0; i < 4; i++) {
        storyManager.nextNode();
      }

      const currentNode = storyManager.getCurrentNode();

      // 應該進入正面分支 (節點 11)
      expect(currentNode.id).toBe(11);
      expect(currentNode.text).toContain('有志氣');
    });

    it('應該根據不同選擇顯示不同劇情 - 謹慎選項', () => {
      // 完成開場劇情並選擇第二個選項 (先看看情況)
      storyManager.startStory('opening');

      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(1); // 選擇第二個選項
      storyManager.endStory();

      // 載入 meet_chef 故事
      storyManager.startStory('meet_chef');

      // 前進到分支結果
      for (let i = 0; i < 4; i++) {
        storyManager.nextNode();
      }

      const currentNode = storyManager.getCurrentNode();

      // 應該進入謹慎分支 (節點 21)
      expect(currentNode.id).toBe(21);
      expect(currentNode.text).toContain('謹慎');
    });

    it('應該根據不同選擇顯示不同劇情 - 放棄選項', () => {
      // 完成開場劇情並選擇第三個選項 (賣掉)
      storyManager.startStory('opening');

      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(2); // 選擇第三個選項
      storyManager.endStory();

      // 載入 meet_chef 故事
      storyManager.startStory('meet_chef');

      // 前進到分支結果
      for (let i = 0; i < 4; i++) {
        storyManager.nextNode();
      }

      const currentNode = storyManager.getCurrentNode();

      // 應該進入負面分支 (節點 30)
      expect(currentNode.id).toBe(30);
      expect(currentNode.text).toContain('賣掉');
    });
  });

  // ==================== 全局旗標系統 ====================

  describe('全局旗標系統', () => {
    it('應該設定全局旗標', () => {
      // 先完成opening並做出選擇
      storyManager.startStory('opening');

      // 前進到選擇節點
      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(0); // 選擇重振客棧
      storyManager.endStory();

      // 載入meet_chef
      storyManager.startStory('meet_chef');

      // 前進到張大廚的選擇節點 (0→1→2→3→10→11→12→13)
      for (let i = 0; i < 7; i++) {
        storyManager.nextNode();
      }

      // 在 meet_chef 中做選擇會設定 chef_relationship 旗標
      storyManager.nextNode(0); // 熱情回應

      const relationship = storyManager.storyProgress.globalFlags['chef_relationship'];
      expect(relationship).toBeDefined();
      expect(['excellent', 'good', 'neutral', 'reluctant', 'left']).toContain(relationship);
    });

    it('應該能檢索全局旗標', () => {
      storyManager.storyProgress.globalFlags['test_flag'] = 'test_value';

      const value = storyManager.storyProgress.globalFlags['test_flag'];
      expect(value).toBe('test_value');
    });

    it('應該支援布林旗標', () => {
      storyManager.storyProgress.globalFlags['chef_left'] = true;

      expect(storyManager.storyProgress.globalFlags['chef_left']).toBe(true);
    });
  });

  // ==================== 序列化與反序列化 ====================

  describe('序列化與反序列化', () => {
    it('應該正確序列化故事進度', () => {
      storyManager.startStory('opening');

      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(0);
      storyManager.endStory();

      const serialized = storyManager.serialize();

      expect(serialized.storyProgress).toBeDefined();
      expect(serialized.storyProgress.completedStories).toContain('opening');
      expect(serialized.storyProgress.storyRecords['opening']).toBeDefined();
    });

    it('應該正確反序列化故事進度', () => {
      // 創建一些進度
      storyManager.startStory('opening');
      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }
      storyManager.nextNode(1);
      storyManager.endStory();

      const serialized = storyManager.serialize();

      // 創建新的 StoryManager 並載入進度
      const newStoryManager = new StoryManager(mockStories);
      newStoryManager.deserialize(serialized);

      expect(newStoryManager.hasCompletedStory('opening')).toBe(true);

      const record = newStoryManager.getStoryRecord('opening');
      expect(record.choices.length).toBeGreaterThan(0);
      expect(record.choices[0].choiceIndex).toBe(1);
    });

    it('應該保留全局旗標', () => {
      storyManager.storyProgress.globalFlags['test_flag'] = 'preserved';

      const serialized = storyManager.serialize();
      const newStoryManager = new StoryManager(mockStories);
      newStoryManager.deserialize(serialized);

      expect(newStoryManager.storyProgress.globalFlags['test_flag']).toBe('preserved');
    });
  });

  // ==================== 完整劇情流程測試 ====================

  describe('完整劇情流程測試', () => {
    it('應該完整執行開場→張大廚劇情 (正面路線)', () => {
      // 第一步: 完成開場劇情
      storyManager.startStory('opening');

      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(0); // 重振客棧
      storyManager.endStory();

      // 驗證開場完成
      expect(storyManager.hasCompletedStory('opening')).toBe(true);

      // 第二步: 載入張大廚劇情
      const canPlay = storyManager.canPlayStory('meet_chef');
      expect(canPlay.canPlay).toBe(true);

      storyManager.startStory('meet_chef');

      // 前進到張大廚的反應 (0→1→2→3→10→11)
      for (let i = 0; i < 4; i++) {
        storyManager.nextNode();
      }

      const chefResponse = storyManager.getCurrentNode();
      expect(chefResponse.text).toContain('有志氣');

      // 繼續前進到選擇節點 (11→12→13)
      for (let i = 0; i < 3; i++) {
        storyManager.nextNode();
      }

      // 做出選擇
      storyManager.nextNode(0); // 熱情回應

      // 驗證旗標設定
      expect(storyManager.storyProgress.globalFlags['chef_relationship']).toBe('excellent');
    });

    it('應該完整執行開場→張大廚劇情 (負面路線)', () => {
      // 第一步: 完成開場劇情 - 選擇賣掉
      storyManager.startStory('opening');

      for (let i = 0; i < 10; i++) {
        storyManager.nextNode();
      }

      storyManager.nextNode(2); // 賣掉客棧
      storyManager.endStory();

      // 第二步: 載入張大廚劇情
      storyManager.startStory('meet_chef');

      // 前進到張大廚的反應 (0→1→2→3→10→20→30)
      for (let i = 0; i < 4; i++) {
        storyManager.nextNode();
      }

      const chefResponse = storyManager.getCurrentNode();
      expect(chefResponse.text).toContain('賣掉');

      // 繼續前進到選擇節點 (30→31→32→33)
      for (let i = 0; i < 3; i++) {
        storyManager.nextNode();
      }

      // 選擇讓他走
      storyManager.nextNode(1); // 保重

      // 驗證旗標設定
      expect(storyManager.storyProgress.globalFlags['chef_left']).toBe(true);
    });
  });

  // ==================== 邊界情況測試 ====================

  describe('邊界情況測試', () => {
    it('應該處理未完成的故事查詢', () => {
      const record = storyManager.getStoryRecord('non_existent_story');
      expect(record).toBeNull();
    });

    it('應該處理故事未完成時的條件檢查', () => {
      const canPlay = storyManager.canPlayStory('meet_chef');
      expect(canPlay.canPlay).toBe(false);
    });

    it('應該處理空的故事進度反序列化', () => {
      const newStoryManager = new StoryManager(mockStories);
      newStoryManager.deserialize({
        storyProgress: {
          completedStories: [],
          storyRecords: {},
          globalFlags: {}
        }
      });

      expect(newStoryManager.storyProgress.completedStories).toEqual([]);
    });

    it('應該處理重複完成同一故事', () => {
      storyManager.startStory('opening');
      storyManager.endStory();

      storyManager.startStory('opening');
      storyManager.endStory();

      const record = storyManager.getStoryRecord('opening');
      expect(record.playCount).toBe(2);
    });
  });
});
