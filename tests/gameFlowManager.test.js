import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameFlowManager from '../src/managers/GameFlowManager.js';

describe('GameFlowManager', () => {
  let manager;
  let mockGameState;
  let mockTimeManager;

  beforeEach(() => {
    mockTimeManager = {
      currentTime: {
        dayCount: 1,
        hour: 5,
        minute: 0,
        totalMinutes: 300 // 05:00
      },
      on: vi.fn(),
      off: vi.fn()
    };

    mockGameState = {
      timeManager: mockTimeManager,
      silver: 1000,
      inn: {
        gold: 1000,
        reputation: 100
      },
      notificationManager: {
        info: vi.fn(),
        success: vi.fn(),
        warning: vi.fn()
      }
    };

    manager = new GameFlowManager(mockGameState);
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    it('應該正確初始化遊戲流程狀態', () => {
      expect(manager.currentPhase).toBe('intro');
      expect(manager.currentDay).toBe(1);
      expect(manager.isInnOpen).toBe(false);
    });

    it('應該初始化每日統計數據', () => {
      expect(manager.dailyStats).toBeDefined();
      expect(manager.dailyStats.income).toBe(0);
      expect(manager.dailyStats.expenses).toBe(0);
      expect(manager.dailyStats.guestCount).toBe(0);
      expect(manager.dailyStats.materials).toBeDefined();
    });

    it('應該註冊時間事件監聽器', () => {
      expect(mockTimeManager.on).toHaveBeenCalled();
    });
  });

  // ==================== 狀態轉換 ====================

  describe('狀態轉換', () => {
    it('應該能從 intro 轉換到 workAssignment', () => {
      manager.currentPhase = 'intro';
      const result = manager.startNewDay();

      expect(result.success).toBe(true);
      expect(manager.currentPhase).toBe('workAssignment');
    });

    it('應該能從 workAssignment 轉換到 menuSetup', () => {
      manager.currentPhase = 'workAssignment';
      const result = manager.finishWorkAssignment();

      expect(result.success).toBe(true);
      expect(manager.currentPhase).toBe('menuSetup');
    });

    it('應該能從 menuSetup 轉換到 operating', () => {
      manager.currentPhase = 'menuSetup';
      mockTimeManager.currentTime.hour = 7;
      mockTimeManager.currentTime.totalMinutes = 420;

      const result = manager.startOperation();

      expect(result.success).toBe(true);
      expect(manager.currentPhase).toBe('operating');
      expect(manager.isInnOpen).toBe(true);
    });

    it('應該能從 operating 轉換到 settlement', () => {
      manager.currentPhase = 'operating';
      manager.isInnOpen = true;
      mockTimeManager.currentTime.hour = 19;
      mockTimeManager.currentTime.totalMinutes = 1140;

      const result = manager.closeOperation();

      expect(result.success).toBe(true);
      expect(manager.currentPhase).toBe('settlement');
      expect(manager.isInnOpen).toBe(false);
    });

    it('應該能從 settlement 轉換到 night', () => {
      manager.currentPhase = 'settlement';
      const result = manager.enterNight();

      expect(result.success).toBe(true);
      expect(manager.currentPhase).toBe('night');
    });

    it('應該能從 night 轉換到 sleep（並進入下一天）', () => {
      manager.currentPhase = 'night';
      manager.currentDay = 1;
      mockTimeManager.currentTime.hour = 22;

      const result = manager.sleep();

      expect(result.success).toBe(true);
      expect(manager.currentPhase).toBe('workAssignment');
      expect(manager.currentDay).toBe(2);
    });

    it('不應該允許非法的狀態轉換', () => {
      manager.currentPhase = 'intro';
      const result = manager.closeOperation();

      expect(result.success).toBe(false);
      expect(result.reason).toContain('非法');
    });
  });

  // ==================== 時辰觸發 ====================

  describe('時辰觸發事件', () => {
    it('05:00（卯時）應該觸發新的一天', () => {
      manager.currentPhase = 'sleep';
      mockTimeManager.currentTime.hour = 5;
      mockTimeManager.currentTime.minute = 0;

      manager.onTimeUpdate(mockTimeManager.currentTime);

      expect(manager.currentPhase).toBe('workAssignment');
    });

    it('07:00（辰時）應該觸發營業開始（如果已完成準備）', () => {
      manager.currentPhase = 'menuSetup';
      mockTimeManager.currentTime.hour = 7;
      mockTimeManager.currentTime.minute = 0;

      manager.onTimeUpdate(mockTimeManager.currentTime);

      expect(manager.currentPhase).toBe('operating');
      expect(manager.isInnOpen).toBe(true);
    });

    it('19:00（酉時結束）應該觸發結算', () => {
      manager.currentPhase = 'operating';
      manager.isInnOpen = true;
      mockTimeManager.currentTime.hour = 19;
      mockTimeManager.currentTime.minute = 0;

      manager.onTimeUpdate(mockTimeManager.currentTime);

      expect(manager.currentPhase).toBe('settlement');
      expect(manager.isInnOpen).toBe(false);
    });

    it('22:00（亥時）應該觸發睡眠', () => {
      manager.currentPhase = 'night';
      manager.currentDay = 1;
      mockTimeManager.currentTime.hour = 22;
      mockTimeManager.currentTime.minute = 0;

      manager.onTimeUpdate(mockTimeManager.currentTime);

      expect(manager.currentPhase).toBe('workAssignment');
      expect(manager.currentDay).toBe(2);
    });
  });

  // ==================== 每日統計 ====================

  describe('每日統計', () => {
    it('應該能記錄收入', () => {
      manager.addIncome(100, '客人消費');

      expect(manager.dailyStats.income).toBe(100);
      expect(manager.dailyStats.incomeDetails.length).toBe(1);
      expect(manager.dailyStats.incomeDetails[0].amount).toBe(100);
    });

    it('應該能記錄支出', () => {
      manager.addExpense(50, '購買食材');

      expect(manager.dailyStats.expenses).toBe(50);
      expect(manager.dailyStats.expenseDetails.length).toBe(1);
    });

    it('應該能記錄材料消耗', () => {
      manager.consumeMaterial('ingredient_001', 10);

      expect(manager.dailyStats.materials['ingredient_001']).toBe(10);
    });

    it('應該能記錄訪客數量', () => {
      manager.addGuest();
      manager.addGuest();

      expect(manager.dailyStats.guestCount).toBe(2);
    });

    it('應該能獲取每日統計摘要', () => {
      manager.addIncome(200, '餐飲');
      manager.addIncome(100, '住宿');
      manager.addExpense(50, '食材');
      manager.addGuest();

      const summary = manager.getDailySummary();

      expect(summary.totalIncome).toBe(300);
      expect(summary.totalExpenses).toBe(50);
      expect(summary.netProfit).toBe(250);
      expect(summary.guestCount).toBe(1);
    });

    it('每日統計應該在新一天重置', () => {
      manager.addIncome(100, '測試');
      manager.addExpense(50, '測試');
      manager.currentDay = 1;
      manager.currentPhase = 'night'; // 必須先進入夜晚狀態

      manager.sleep();

      expect(manager.dailyStats.income).toBe(0);
      expect(manager.dailyStats.expenses).toBe(0);
      expect(manager.dailyStats.guestCount).toBe(0);
      expect(manager.currentDay).toBe(2);
    });
  });

  // ==================== 遊戲進度保存 ====================

  describe('遊戲進度', () => {
    it('應該能判斷是否為首次遊戲', () => {
      expect(manager.isFirstGame()).toBe(true);

      manager.markIntroComplete();

      expect(manager.isFirstGame()).toBe(false);
    });

    it('應該能保存遊戲流程狀態', () => {
      manager.currentPhase = 'operating';
      manager.currentDay = 5;
      manager.addIncome(500, '測試');

      const saveData = manager.getSaveData();

      expect(saveData.currentPhase).toBe('operating');
      expect(saveData.currentDay).toBe(5);
      expect(saveData.introComplete).toBeDefined();
    });

    it('應該能從保存數據恢復', () => {
      const saveData = {
        currentPhase: 'night',
        currentDay: 10,
        isInnOpen: false,
        introComplete: true,
        dailyStats: {
          income: 1000,
          expenses: 200,
          guestCount: 15
        }
      };

      manager.loadSaveData(saveData);

      expect(manager.currentPhase).toBe('night');
      expect(manager.currentDay).toBe(10);
      expect(manager.isFirstGame()).toBe(false);
    });
  });

  // ==================== 邊界條件 ====================

  describe('邊界條件', () => {
    it('營業時間內不應該允許睡眠', () => {
      manager.currentPhase = 'operating';
      const result = manager.sleep();

      expect(result.success).toBe(false);
      expect(result.reason).toContain('非法');
    });

    it('未完成工作分配不應該開始營業', () => {
      manager.currentPhase = 'workAssignment';
      const result = manager.startOperation();

      expect(result.success).toBe(false);
    });

    it('應該處理時間管理器不存在的情況', () => {
      mockGameState.timeManager = null;
      const newManager = new GameFlowManager(mockGameState);

      expect(() => {
        newManager.onTimeUpdate({ hour: 5, minute: 0 });
      }).not.toThrow();
    });

    it('應該處理通知管理器不存在的情況', () => {
      mockGameState.notificationManager = null;
      const newManager = new GameFlowManager(mockGameState);

      expect(() => {
        newManager.startNewDay();
      }).not.toThrow();
    });
  });

  // ==================== 完整流程測試 ====================

  describe('完整遊戲循環', () => {
    it('應該完成完整的一天流程', () => {
      // Day 1 開始
      expect(manager.currentDay).toBe(1);
      expect(manager.currentPhase).toBe('intro');

      // 開始新的一天
      manager.startNewDay();
      expect(manager.currentPhase).toBe('workAssignment');

      // 完成工作分配
      manager.finishWorkAssignment();
      expect(manager.currentPhase).toBe('menuSetup');

      // 開始營業
      mockTimeManager.currentTime.hour = 7;
      manager.startOperation();
      expect(manager.currentPhase).toBe('operating');
      expect(manager.isInnOpen).toBe(true);

      // 模擬營業（收入記錄）
      manager.addIncome(500, '客人消費');
      manager.addGuest();

      // 結束營業
      mockTimeManager.currentTime.hour = 19;
      manager.closeOperation();
      expect(manager.currentPhase).toBe('settlement');
      expect(manager.isInnOpen).toBe(false);

      // 進入夜晚
      manager.enterNight();
      expect(manager.currentPhase).toBe('night');

      // 睡眠進入下一天
      mockTimeManager.currentTime.hour = 22;
      manager.sleep();
      expect(manager.currentPhase).toBe('workAssignment');
      expect(manager.currentDay).toBe(2);

      // 統計數據應該已重置
      expect(manager.dailyStats.income).toBe(0);
      expect(manager.dailyStats.guestCount).toBe(0);
    });
  });
});
