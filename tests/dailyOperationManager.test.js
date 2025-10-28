import { describe, it, expect, beforeEach, vi } from 'vitest';
import DailyOperationManager from '../src/managers/DailyOperationManager.js';

describe('DailyOperationManager', () => {
  let manager;
  let mockGameState;
  let mockTimeManager;

  beforeEach(() => {
    mockTimeManager = {
      currentTime: {
        dayCount: 1,
        hour: 8,
        minute: 0,
        totalMinutes: 480
      }
    };

    mockGameState = {
      timeManager: mockTimeManager,
      inn: {
        gold: 1000,
        reputation: 100,
        name: '測試客棧'
      },
      innManager: {
        getFacilityLevel: vi.fn((facilityId) => {
          return facilityId === 'lobby' ? 2 : 1;
        }),
        getAllFacilities: vi.fn(() => [
          { id: 'lobby', level: 2, unlocked: true },
          { id: 'kitchen', level: 1, unlocked: true }
        ])
      },
      notificationManager: {
        info: vi.fn(),
        success: vi.fn(),
        warning: vi.fn()
      }
    };

    manager = new DailyOperationManager(mockGameState);
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    it('應該正確初始化營運狀態', () => {
      expect(manager.isOperating).toBe(false);
      expect(manager.currentGuests).toBeDefined();
      expect(Array.isArray(manager.currentGuests)).toBe(true);
    });

    it('應該初始化客人生成配置', () => {
      const config = manager.getGuestSpawnConfig();

      expect(config).toBeDefined();
      expect(config.baseSpawnRate).toBeGreaterThan(0);
      expect(config.reputationMultiplier).toBeDefined();
      expect(config.facilityMultiplier).toBeDefined();
    });
  });

  // ==================== 營業控制 ====================

  describe('營業控制', () => {
    it('應該能開始營業', () => {
      const result = manager.startOperation();

      expect(result.success).toBe(true);
      expect(manager.isOperating).toBe(true);
    });

    it('應該能結束營業', () => {
      manager.startOperation();
      const result = manager.stopOperation();

      expect(result.success).toBe(true);
      expect(manager.isOperating).toBe(false);
    });

    it('重複開始營業應該失敗', () => {
      manager.startOperation();
      const result = manager.startOperation();

      expect(result.success).toBe(false);
      expect(result.reason).toContain('已經');
    });

    it('未營業時停止營業應該失敗', () => {
      const result = manager.stopOperation();

      expect(result.success).toBe(false);
    });
  });

  // ==================== 客人生成 ====================

  describe('客人生成', () => {
    beforeEach(() => {
      manager.startOperation();
    });

    it('應該能生成一般客人', () => {
      const guest = manager.spawnGuest('dining');

      expect(guest).toBeDefined();
      expect(guest.id).toBeDefined();
      expect(guest.type).toBe('dining');
      expect(guest.arrivalTime).toBeDefined();
      expect(guest.expectedStayDuration).toBeGreaterThan(0);
    });

    it('應該能生成住宿客人', () => {
      const guest = manager.spawnGuest('lodging');

      expect(guest).toBeDefined();
      expect(guest.type).toBe('lodging');
      // 住宿客人停留時間應該更長
      expect(guest.expectedStayDuration).toBeGreaterThan(300);
    });

    it('客人應該有隨機的消費傾向', () => {
      const guest = manager.spawnGuest('dining');

      expect(guest.spendingTier).toBeDefined();
      expect(['low', 'medium', 'high', 'vip']).toContain(guest.spendingTier);
    });

    it('高聲譽應該增加生成高級客人的機率', () => {
      mockGameState.inn.reputation = 500;
      manager = new DailyOperationManager(mockGameState);

      const guests = [];
      for (let i = 0; i < 100; i++) {
        guests.push(manager.spawnGuest('dining'));
      }

      const highTierCount = guests.filter(g =>
        g.spendingTier === 'high' || g.spendingTier === 'vip'
      ).length;

      // 高聲譽時至少 20% 是高級客人
      expect(highTierCount).toBeGreaterThan(20);
    });
  });

  // ==================== 自動生成機制 ====================

  describe('自動生成機制', () => {
    it('營業時應該根據時間自動生成客人', () => {
      manager.startOperation();
      const initialCount = manager.currentGuests.length;

      // 模擬 30 分鐘（1800 秒）
      manager.update(1800);

      // 應該有新客人到達
      expect(manager.currentGuests.length).toBeGreaterThan(initialCount);
    });

    it('未營業時不應該生成客人', () => {
      const initialCount = manager.currentGuests.length;

      manager.update(1800);

      expect(manager.currentGuests.length).toBe(initialCount);
    });

    it('聲譽越高，生成頻率越高', () => {
      // 低聲譽
      mockGameState.inn.reputation = 50;
      const lowRepManager = new DailyOperationManager(mockGameState);
      lowRepManager.startOperation();
      lowRepManager.update(3600);
      const lowRepCount = lowRepManager.currentGuests.length;

      // 高聲譽
      mockGameState.inn.reputation = 500;
      const highRepManager = new DailyOperationManager(mockGameState);
      highRepManager.startOperation();
      highRepManager.update(3600);
      const highRepCount = highRepManager.currentGuests.length;

      // 高聲譽應該生成更多客人
      expect(highRepCount).toBeGreaterThan(lowRepCount);
    });
  });

  // ==================== 客人消費 ====================

  describe('客人消費', () => {
    it('應該能處理客人點餐', () => {
      const guest = manager.spawnGuest('dining');
      const order = {
        dishId: 'dish_001',
        dishName: '紅燒肉',
        price: 50
      };

      const result = manager.processOrder(guest.id, order);

      expect(result.success).toBe(true);
      expect(guest.orders).toBeDefined();
      expect(guest.orders.length).toBe(1);
      expect(guest.totalSpent).toBe(50);
    });

    it('應該能處理客人住宿', () => {
      const guest = manager.spawnGuest('lodging');
      const booking = {
        roomId: 'room_001',
        roomName: '普通房',
        price: 100
      };

      const result = manager.processRoomBooking(guest.id, booking);

      expect(result.success).toBe(true);
      expect(guest.roomBooking).toBeDefined();
      expect(guest.totalSpent).toBe(100);
    });

    it('客人消費應該根據消費等級調整', () => {
      const lowSpender = manager.spawnGuest('dining');
      lowSpender.spendingTier = 'low';

      const highSpender = manager.spawnGuest('dining');
      highSpender.spendingTier = 'vip';

      // VIP 客人應該點更多菜
      const lowOrders = manager.generateOrdersForGuest(lowSpender);
      const highOrders = manager.generateOrdersForGuest(highSpender);

      expect(highOrders.length).toBeGreaterThanOrEqual(lowOrders.length);
    });
  });

  // ==================== 客人離開 ====================

  describe('客人離開', () => {
    it('應該能處理客人結帳離開', () => {
      manager.startOperation();
      const guest = manager.spawnGuest('dining');
      guest.totalSpent = 100;

      const result = manager.checkoutGuest(guest.id);

      expect(result.success).toBe(true);
      expect(result.payment).toBe(100);
      expect(manager.currentGuests.find(g => g.id === guest.id)).toBeUndefined();
    });

    it('結帳時應該記錄收入', () => {
      manager.startOperation();
      const guest = manager.spawnGuest('dining');
      guest.totalSpent = 150;

      const initialRevenue = manager.getTodayRevenue();
      manager.checkoutGuest(guest.id);
      const finalRevenue = manager.getTodayRevenue();

      expect(finalRevenue).toBe(initialRevenue + 150);
    });

    it('應該自動移除停留超時的客人', () => {
      manager.startOperation();
      const guest = manager.spawnGuest('dining');
      guest.expectedStayDuration = 60; // 1 分鐘
      guest.arrivalTime = mockTimeManager.currentTime.totalMinutes;

      // 經過 2 分鐘
      mockTimeManager.currentTime.totalMinutes += 120;
      manager.update(120);

      // 客人應該已經離開
      expect(manager.currentGuests.find(g => g.id === guest.id)).toBeUndefined();
    });
  });

  // ==================== 住宿客人特殊處理 ====================

  describe('住宿客人', () => {
    it('住宿客人應該在隔天早上離開', () => {
      mockTimeManager.currentTime.hour = 20;
      mockTimeManager.currentTime.totalMinutes = 1200;

      manager.startOperation();
      const lodger = manager.spawnGuest('lodging');

      // 隔天早上 8 點（1440 + 480 = 1920）
      const checkoutTime = manager.calculateLodgerCheckoutTime(lodger);

      expect(checkoutTime).toBeGreaterThan(1440); // 超過一天
      expect(checkoutTime).toBeLessThan(1440 + 660); // 不超過隔天 11:00
    });

    it('住宿客人應該在 07:00-11:00 之間離開', () => {
      const lodger = manager.spawnGuest('lodging');
      const checkoutTime = manager.calculateLodgerCheckoutTime(lodger);
      const checkoutHour = Math.floor((checkoutTime % 1440) / 60);

      expect(checkoutHour).toBeGreaterThanOrEqual(7);
      expect(checkoutHour).toBeLessThanOrEqual(11);
    });
  });

  // ==================== 營運統計 ====================

  describe('營運統計', () => {
    it('應該能獲取今日收入', () => {
      manager.startOperation();
      const guest1 = manager.spawnGuest('dining');
      guest1.totalSpent = 100;
      manager.checkoutGuest(guest1.id);

      const revenue = manager.getTodayRevenue();
      expect(revenue).toBe(100);
    });

    it('應該能獲取今日客人數', () => {
      manager.startOperation();
      manager.spawnGuest('dining');
      manager.spawnGuest('dining');

      expect(manager.getTodayGuestCount()).toBe(2);
    });

    it('應該能獲取當前在店客人數', () => {
      manager.startOperation();
      manager.spawnGuest('dining');
      manager.spawnGuest('dining');

      expect(manager.getCurrentGuestCount()).toBe(2);

      // 一位客人離開
      manager.checkoutGuest(manager.currentGuests[0].id);

      expect(manager.getCurrentGuestCount()).toBe(1);
    });

    it('應該能重置每日統計', () => {
      manager.startOperation();
      const guest = manager.spawnGuest('dining');
      guest.totalSpent = 200;
      manager.checkoutGuest(guest.id);

      expect(manager.getTodayRevenue()).toBe(200);

      manager.resetDailyStats();

      expect(manager.getTodayRevenue()).toBe(0);
      expect(manager.getTodayGuestCount()).toBe(0);
    });
  });

  // ==================== 邊界條件 ====================

  describe('邊界條件', () => {
    it('應該處理不存在的客人結帳', () => {
      const result = manager.checkoutGuest('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('不存在');
    });

    it('應該處理 innManager 不存在的情況', () => {
      mockGameState.innManager = null;
      const newManager = new DailyOperationManager(mockGameState);

      expect(() => {
        newManager.startOperation();
      }).not.toThrow();
    });

    it('應該處理時間管理器不存在的情況', () => {
      mockGameState.timeManager = null;
      const newManager = new DailyOperationManager(mockGameState);

      expect(() => {
        newManager.update(60);
      }).not.toThrow();
    });
  });
});
