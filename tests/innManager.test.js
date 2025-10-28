/**
 * InnManager 測試套件
 * 測試客棧設施管理系統的所有功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
const InnManager = require('../src/managers/InnManager');

describe('InnManager', () => {
  let gameState;
  let innManager;

  beforeEach(() => {
    // 模擬 GameState
    gameState = {
      notificationManager: {
        success: () => {},
        info: () => {},
        warning: () => {}
      }
    };

    innManager = new InnManager(gameState);
  });

  // ==================== 初始化測試 ====================

  describe('初始化', () => {
    it('應該正確初始化客棧狀態', () => {
      expect(innManager.inn.level).toBe(1);
      expect(innManager.inn.exp).toBe(0);
      expect(innManager.inn.gold).toBe(1000);
      expect(innManager.inn.reputation).toBe(0);
    });

    it('應該包含所有設施定義', () => {
      const facilities = innManager.facilityDefinitions;
      expect(facilities.lobby).toBeDefined();
      expect(facilities.kitchen).toBeDefined();
      expect(facilities.storage).toBeDefined();
      expect(facilities.river).toBeDefined();
      expect(facilities.mine).toBeDefined();
      expect(facilities.farm).toBeDefined();
      expect(facilities.trainingGround).toBeDefined();
      expect(facilities.stable).toBeDefined();
      expect(facilities.clinic).toBeDefined();
      expect(facilities.noticeBoard).toBeDefined();
      expect(facilities.secretRoom).toBeDefined();
    });

    it('初始應該有4個設施已解鎖', () => {
      expect(innManager.facilities.lobby.unlocked).toBe(true);
      expect(innManager.facilities.lobby.level).toBe(1);
      expect(innManager.facilities.kitchen.unlocked).toBe(true);
      expect(innManager.facilities.kitchen.level).toBe(1);
      expect(innManager.facilities.river.unlocked).toBe(true);
      expect(innManager.facilities.river.level).toBe(1);
      expect(innManager.facilities.storage.unlocked).toBe(true);
      expect(innManager.facilities.storage.level).toBe(1);
    });

    it('其他設施應該初始未解鎖', () => {
      expect(innManager.facilities.mine.unlocked).toBe(false);
      expect(innManager.facilities.mine.level).toBe(0);
      expect(innManager.facilities.farm.unlocked).toBe(false);
      expect(innManager.facilities.stable.unlocked).toBe(false);
      expect(innManager.facilities.clinic.unlocked).toBe(false);
      expect(innManager.facilities.noticeBoard.unlocked).toBe(false);
      expect(innManager.facilities.secretRoom.unlocked).toBe(false);
    });

    it('應該正確初始化統計數據', () => {
      expect(innManager.statistics.totalUpgrades).toBe(0);
      expect(innManager.statistics.totalGoldSpent).toBe(0);
      expect(innManager.statistics.facilitiesUnlocked).toBe(4); // lobby, kitchen, river, storage
    });
  });

  // ==================== 設施訪問檢查 ====================

  describe('設施訪問檢查', () => {
    it('isFacilityUnlocked 應該正確判斷設施解鎖狀態', () => {
      expect(innManager.isFacilityUnlocked('kitchen')).toBe(true);
      expect(innManager.isFacilityUnlocked('storage')).toBe(true);
      expect(innManager.isFacilityUnlocked('farm')).toBe(false);
    });

    it('canAccessFacility 應該正確判斷設施可訪問性', () => {
      expect(innManager.canAccessFacility('kitchen')).toBe(true); // 已解鎖且level>0
      expect(innManager.canAccessFacility('farm')).toBe(false); // 未解鎖
    });

    it('canAccessScene 應該允許訪問非設施場景', () => {
      expect(innManager.canAccessScene('LobbyScene')).toBe(true);
      expect(innManager.canAccessScene('ExteriorScene')).toBe(true);
      expect(innManager.canAccessScene('StoryScene')).toBe(true);
    });

    it('canAccessScene 應該正確判斷設施場景', () => {
      expect(innManager.canAccessScene('KitchenScene')).toBe(true); // 廚房已解鎖
      expect(innManager.canAccessScene('StorageScene')).toBe(true); // 儲藏室已解鎖
      expect(innManager.canAccessScene('FarmScene')).toBe(false); // 農田未解鎖
    });

    // 目前沒有設施對應多個場景，跳過此測試
    // it('canAccessScene 應該支援多場景設施', () => {
    //   // 客房初始未解鎖
    //   expect(innManager.canAccessScene('RoomAScene')).toBe(false);
    //   expect(innManager.canAccessScene('RoomBScene')).toBe(false);
    //
    //   // 解鎖客房後
    //   innManager.inn.level = 2;
    //   innManager.inn.gold = 10000;
    //   innManager.unlockFacility('guestRooms');
    //
    //   expect(innManager.canAccessScene('RoomAScene')).toBe(true);
    //   expect(innManager.canAccessScene('RoomBScene')).toBe(true);
    // });
  });

  // ==================== 設施解鎖 ====================

  describe('設施解鎖', () => {
    it('canUnlockFacility 應該檢查客棧等級', () => {
      const result = innManager.canUnlockFacility('farm');
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('客棧等級');
    });

    it('canUnlockFacility 應該檢查金錢', () => {
      innManager.inn.level = 3; // 滿足等級要求
      innManager.inn.gold = 100; // 不足金錢

      const result = innManager.canUnlockFacility('farm');
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toContain('金錢');
    });

    it('canUnlockFacility 應該檢查已解鎖狀態', () => {
      const result = innManager.canUnlockFacility('kitchen');
      expect(result.canUnlock).toBe(false);
      expect(result.reason).toBe('設施已解鎖');
    });

    it('unlockFacility 應該成功解鎖設施', () => {
      innManager.inn.level = 3;
      innManager.inn.gold = 10000;

      const result = innManager.unlockFacility('farm');

      expect(result.success).toBe(true);
      expect(result.facilityId).toBe('farm');
      expect(result.facilityName).toBe('農田');
      expect(result.newLevel).toBe(1);
      expect(innManager.facilities.farm.unlocked).toBe(true);
      expect(innManager.facilities.farm.level).toBe(1);
    });

    it('unlockFacility 應該扣除金錢', () => {
      innManager.inn.level = 3;
      innManager.inn.gold = 10000;
      const initialGold = innManager.inn.gold;
      const farmUnlockCost = innManager.facilityDefinitions.farm.upgradeCosts[0];

      innManager.unlockFacility('farm');

      expect(innManager.inn.gold).toBe(initialGold - farmUnlockCost);
    });

    it('unlockFacility 應該更新統計數據', () => {
      innManager.inn.level = 3;
      innManager.inn.gold = 10000;
      const initialUnlockedCount = innManager.statistics.facilitiesUnlocked;

      innManager.unlockFacility('farm');

      expect(innManager.statistics.facilitiesUnlocked).toBe(initialUnlockedCount + 1);
    });

    it('unlockFacility 應該在條件不足時失敗', () => {
      innManager.inn.level = 1; // 不足等級
      const result = innManager.unlockFacility('farm');

      expect(result.success).toBe(false);
      expect(result.reason).toBeDefined();
      expect(innManager.facilities.farm.unlocked).toBe(false);
    });
  });

  // ==================== 設施升級 ====================

  describe('設施升級', () => {
    it('canUpgradeFacility 應該檢查設施是否已解鎖', () => {
      const result = innManager.canUpgradeFacility('farm');
      expect(result.canUpgrade).toBe(false);
      expect(result.reason).toBe('設施未解鎖');
    });

    it('canUpgradeFacility 應該檢查是否達到最高等級', () => {
      innManager.facilities.kitchen.level = 5; // 最高等級

      const result = innManager.canUpgradeFacility('kitchen');
      expect(result.canUpgrade).toBe(false);
      expect(result.reason).toBe('已達最高等級');
    });

    it('canUpgradeFacility 應該檢查金錢', () => {
      innManager.inn.gold = 100; // 不足金錢

      const result = innManager.canUpgradeFacility('kitchen');
      expect(result.canUpgrade).toBe(false);
      expect(result.reason).toContain('金錢');
    });

    it('upgradeFacility 應該成功升級設施', () => {
      innManager.inn.gold = 10000;

      const result = innManager.upgradeFacility('kitchen');

      expect(result.success).toBe(true);
      expect(result.facilityId).toBe('kitchen');
      expect(result.facilityName).toBe('廚房');
      expect(result.newLevel).toBe(2);
      expect(innManager.facilities.kitchen.level).toBe(2);
    });

    it('upgradeFacility 應該扣除正確的金錢', () => {
      innManager.inn.gold = 10000;
      const initialGold = innManager.inn.gold;
      const kitchenLevel = innManager.facilities.kitchen.level;
      const upgradeCost = innManager.facilityDefinitions.kitchen.upgradeCosts[kitchenLevel];

      innManager.upgradeFacility('kitchen');

      expect(innManager.inn.gold).toBe(initialGold - upgradeCost);
    });

    it('upgradeFacility 應該返回新等級的效果', () => {
      innManager.inn.gold = 10000;

      const result = innManager.upgradeFacility('kitchen');

      expect(result.newEffects).toBeDefined();
      expect(result.newEffects.cookingSpeed).toBe(1.2);
      expect(result.newEffects.recipeSlots).toBe(8);
    });

    it('upgradeFacility 應該更新統計數據', () => {
      innManager.inn.gold = 10000;
      const initialUpgrades = innManager.statistics.totalUpgrades;

      innManager.upgradeFacility('kitchen');

      expect(innManager.statistics.totalUpgrades).toBe(initialUpgrades + 1);
    });

    it('upgradeFacility 應該支援多次升級', () => {
      innManager.inn.gold = 20000;

      innManager.upgradeFacility('kitchen'); // Lv.1 → Lv.2
      expect(innManager.facilities.kitchen.level).toBe(2);

      innManager.upgradeFacility('kitchen'); // Lv.2 → Lv.3
      expect(innManager.facilities.kitchen.level).toBe(3);

      innManager.upgradeFacility('kitchen'); // Lv.3 → Lv.4
      expect(innManager.facilities.kitchen.level).toBe(4);
    });

    it('upgradeFacility 應該在條件不足時失敗', () => {
      innManager.inn.gold = 100; // 不足金錢

      const result = innManager.upgradeFacility('kitchen');

      expect(result.success).toBe(false);
      expect(innManager.facilities.kitchen.level).toBe(1); // 等級未改變
    });
  });

  // ==================== 設施資訊查詢 ====================

  describe('設施資訊查詢', () => {
    it('getFacilityInfo 應該返回完整的設施資訊', () => {
      const info = innManager.getFacilityInfo('kitchen');

      expect(info.id).toBe('kitchen');
      expect(info.name).toBe('廚房');
      expect(info.currentLevel).toBe(1);
      expect(info.unlocked).toBe(true);
      expect(info.currentEffects).toBeDefined();
      expect(info.nextEffects).toBeDefined();
      expect(info.upgradeCost).toBe(500); // Lv.1→Lv.2 的成本
    });

    it('getFacilityInfo 應該正確處理未解鎖設施', () => {
      const info = innManager.getFacilityInfo('farm');

      expect(info.unlocked).toBe(false);
      expect(info.currentLevel).toBe(0);
      expect(info.currentEffects).toBeNull();
    });

    it('getFacilityInfo 應該正確處理最高等級設施', () => {
      innManager.facilities.kitchen.level = 5;

      const info = innManager.getFacilityInfo('kitchen');

      expect(info.currentLevel).toBe(5);
      expect(info.nextEffects).toBeNull();
      expect(info.upgradeCost).toBeNull();
    });

    it('getAllFacilities 應該返回所有設施', () => {
      const all = innManager.getAllFacilities();

      expect(all.length).toBe(11); // 11個設施
      expect(all.every(f => f.id && f.name)).toBe(true);
    });

    it('getUnlockedFacilities 應該只返回已解鎖設施', () => {
      const unlocked = innManager.getUnlockedFacilities();

      expect(unlocked.length).toBe(4); // lobby, kitchen, river, storage
      expect(unlocked.every(f => f.unlocked)).toBe(true);
    });

    it('getAvailableToUnlock 應該返回可解鎖的設施', () => {
      innManager.inn.level = 3; // 滿足等級要求

      const available = innManager.getAvailableToUnlock();

      // 等級3可解鎖客房、練武場、農田
      expect(available.length).toBeGreaterThan(0);
      expect(available.every(f => !f.unlocked && innManager.inn.level >= f.unlockAtInnLevel)).toBe(true);
    });
  });

  // ==================== 客棧升級 ====================

  describe('客棧升級', () => {
    it('addInnExp 應該增加經驗值', () => {
      innManager.addInnExp(500);
      expect(innManager.inn.exp).toBe(500);
    });

    it('addInnExp 應該在經驗值足夠時升級', () => {
      innManager.addInnExp(1000); // Lv.1 需要 1000 經驗

      expect(innManager.inn.level).toBe(2);
      expect(innManager.inn.exp).toBe(0); // 經驗值歸零
    });

    it('addInnExp 應該返回升級資訊', () => {
      const result = innManager.addInnExp(1000);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
    });

    it('addInnExp 應該在未升級時返回正確資訊', () => {
      const result = innManager.addInnExp(500);

      expect(result.leveledUp).toBe(false);
    });

    it('addInnExp 應該支援連續升級', () => {
      innManager.addInnExp(1000); // Lv.1 → Lv.2
      expect(innManager.inn.level).toBe(2);

      innManager.addInnExp(2000); // Lv.2 → Lv.3
      expect(innManager.inn.level).toBe(3);
    });

    it('客棧升級應該解鎖新設施', () => {
      innManager.inn.level = 1;
      const initialAvailable = innManager.getAvailableToUnlock().length;

      innManager.addInnExp(1000); // Lv.1 → Lv.2

      const newAvailable = innManager.getAvailableToUnlock().length;
      expect(newAvailable).toBeGreaterThan(initialAvailable);
    });
  });

  // ==================== 金錢管理 ====================

  describe('金錢管理', () => {
    it('addGold 應該增加金錢', () => {
      const initialGold = innManager.inn.gold;
      innManager.addGold(500);

      expect(innManager.inn.gold).toBe(initialGold + 500);
    });

    it('addGold 應該支援負值（扣除金錢）', () => {
      const initialGold = innManager.inn.gold;
      innManager.addGold(-200);

      expect(innManager.inn.gold).toBe(initialGold - 200);
    });
  });

  // ==================== 統計數據 ====================

  describe('統計數據', () => {
    it('getStatistics 應該返回完整統計', () => {
      const stats = innManager.getStatistics();

      expect(stats.innLevel).toBe(1);
      expect(stats.innExp).toBe(0);
      expect(stats.gold).toBe(1000);
      expect(stats.totalFacilities).toBe(11); // 11個設施
      expect(stats.facilitiesUnlocked).toBe(4); // lobby, kitchen, river, storage
      expect(stats.totalUpgrades).toBe(0);
      expect(stats.totalGoldSpent).toBe(0);
    });

    it('統計數據應該隨操作更新', () => {
      innManager.inn.gold = 20000;
      innManager.inn.level = 3;

      innManager.unlockFacility('farm');
      innManager.upgradeFacility('kitchen');

      const stats = innManager.getStatistics();

      expect(stats.facilitiesUnlocked).toBe(5); // 4個初始 + farm
      expect(stats.totalUpgrades).toBe(1);
      expect(stats.totalGoldSpent).toBeGreaterThan(0);
    });
  });

  // ==================== 整合測試 ====================

  describe('整合測試', () => {
    it('完整遊戲流程：解鎖→升級→客棧升級→解鎖新設施', () => {
      // 初始狀態
      expect(innManager.inn.level).toBe(1);
      expect(innManager.getUnlockedFacilities().length).toBe(4); // lobby, kitchen, river, storage

      // 升級廚房
      innManager.inn.gold = 50000;
      innManager.upgradeFacility('kitchen');
      expect(innManager.facilities.kitchen.level).toBe(2);

      // 客棧升級
      innManager.addInnExp(1000);
      expect(innManager.inn.level).toBe(2);

      // 解鎖礦坑（等級2可用）
      const unlockResult = innManager.unlockFacility('mine');
      expect(unlockResult.success).toBe(true);
      expect(innManager.getUnlockedFacilities().length).toBe(5); // lobby, kitchen, river, storage, mine

      // 客棧再升級
      innManager.addInnExp(2000);
      expect(innManager.inn.level).toBe(3);

      // 檢查新設施可用
      const available = innManager.getAvailableToUnlock();
      expect(available.length).toBeGreaterThan(0);
    });

    it('設施效果應該隨等級提升', () => {
      innManager.inn.gold = 50000;

      // Lv.1 效果
      const level1Effects = innManager.getFacilityInfo('kitchen').currentEffects;
      expect(level1Effects.cookingSpeed).toBe(1.0);

      // 升級到 Lv.2
      innManager.upgradeFacility('kitchen');
      const level2Effects = innManager.getFacilityInfo('kitchen').currentEffects;
      expect(level2Effects.cookingSpeed).toBe(1.2);

      // 升級到 Lv.3
      innManager.upgradeFacility('kitchen');
      const level3Effects = innManager.getFacilityInfo('kitchen').currentEffects;
      expect(level3Effects.cookingSpeed).toBe(1.4);
    });
  });
});
