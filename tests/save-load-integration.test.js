/**
 * 保存/讀取系統整合測試
 *
 * 測試 SaveManager 和 LoadGameScene 之間的完整保存/讀取流程
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const fs = require('fs');
const path = require('path');

// Mock localStorage（雖然 SaveManager 不使用它，但其他系統可能需要）
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

const SaveManager = require('../src/managers/SaveManager.js');

describe('保存/讀取系統整合測試', () => {
  let saveManager;
  let gameState;

  beforeEach(() => {
    localStorage.clear();

    // 清理 saves 目錄
    const savesDir = path.join(process.cwd(), 'saves');
    if (fs.existsSync(savesDir)) {
      const files = fs.readdirSync(savesDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(savesDir, file));
        }
      });
    }

    // 創建完整的遊戲狀態模擬
    gameState = {
      // 玩家數據
      player: {
        name: '測試玩家',
        experience: {
          level: 5,
          currentExp: 120,
          expToNext: 200
        },
        serialize: function() {
          return {
            name: this.name,
            experience: this.experience
          };
        },
        deserialize: function(data) {
          this.name = data.name;
          this.experience = data.experience;
        }
      },

      // 背包數據
      inventory: {
        items: [
          { id: 'item1', name: '木劍', quantity: 1 },
          { id: 'item2', name: '回復藥', quantity: 5 }
        ],
        capacity: 20,
        serialize: function() {
          return {
            items: this.items,
            capacity: this.capacity
          };
        },
        deserialize: function(data) {
          this.items = data.items || [];
          this.capacity = data.capacity || 20;
        }
      },

      // 員工數據（10 個角色）
      employees: [
        {
          id: 'emp1',
          hired: { unlocked: true, date: 1 },
          attributes: { cooking: 80, service: 60 },
          status: { hp: 100, mp: 50 },
          level: 3,
          affection: 50
        },
        {
          id: 'emp2',
          hired: { unlocked: true, date: 2 },
          attributes: { cooking: 60, service: 80 },
          status: { hp: 100, mp: 50 },
          level: 2,
          affection: 30
        },
        // 其他 8 個員工未解鎖
        { id: 'emp3', hired: { unlocked: false } },
        { id: 'emp4', hired: { unlocked: false } },
        { id: 'emp5', hired: { unlocked: false } },
        { id: 'emp6', hired: { unlocked: false } },
        { id: 'emp7', hired: { unlocked: false } },
        { id: 'emp8', hired: { unlocked: false } },
        { id: 'emp9', hired: { unlocked: false } },
        { id: 'emp10', hired: { unlocked: false } }
      ],

      // 資源
      silver: 1500,
      totalSilver: 5000,

      // 客棧數據
      inn: {
        level: 3,
        reputation: 75,
        facilities: ['kitchen', 'room1', 'room2']
      },

      // 工作調度
      workSchedule: {
        assignments: {
          kitchen: 'emp1',
          service: 'emp2'
        }
      },

      // 場景數據
      sceneData: {
        lastScene: 'MainGameScene',
        visitedScenes: ['IntroScene', 'MainGameScene']
      },

      // 統計數據
      stats: {
        totalDays: 15,
        totalGuests: 120,
        totalIncome: 5000
      },

      // 遊戲時間
      playTime: 3600,

      // 設定
      settings: {
        volume: 0.8,
        language: 'zh-TW'
      },

      // 時間管理器
      timeManager: {
        currentTime: {
          dayCount: 15,
          hour: 12,
          period: 'day'
        },
        getSaveData: function() {
          return { currentTime: this.currentTime };
        },
        loadSaveData: function(data) {
          this.currentTime = data.currentTime;
        }
      },

      // 客棧管理器
      innManager: {
        inn: {
          level: 3,
          gold: 1500,
          reputation: 75
        },
        getSaveData: function() {
          return { inn: this.inn };
        },
        loadSaveData: function(data) {
          this.inn = data.inn;
        }
      },

      // 其他管理器（模擬）
      inventoryManager: {
        getSaveData: function() { return { data: 'inventory' }; },
        loadSaveData: function(data) { this.data = data; }
      },
      affectionManager: {
        getSaveData: function() { return { data: 'affection' }; },
        loadSaveData: function(data) { this.data = data; }
      },
      achievementManager: {
        getSaveData: function() { return { data: 'achievement' }; },
        loadSaveData: function(data) { this.data = data; }
      }
    };

    saveManager = new SaveManager();
  });

  afterEach(() => {
    localStorage.clear();

    // 清理 saves 目錄
    const savesDir = path.join(process.cwd(), 'saves');
    if (fs.existsSync(savesDir)) {
      const files = fs.readdirSync(savesDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(savesDir, file));
        }
      });
    }
  });

  describe('完整保存/讀取流程', () => {
    it('應該成功保存並讀取完整的遊戲狀態', () => {
      // 1. 保存遊戲
      const saveResult = saveManager.saveGame(gameState, 1, '測試存檔');

      expect(saveResult.success).toBe(true);

      // 2. 列出存檔
      const saves = saveManager.listSaves();
      expect(saves.length).toBe(1);
      expect(saves[0].slotId).toBe(1);
      expect(saves[0].saveName).toBe('測試存檔');
      expect(saves[0].playerName).toBe('測試玩家');
      expect(saves[0].playerLevel).toBe(5);
      expect(saves[0].innLevel).toBe(3);
      expect(saves[0].dayCount).toBe(15);
      expect(saves[0].gold).toBe(1500);
      expect(saves[0].employeeCount).toBe(2);  // 只有 2 個已解鎖

      // 3. 讀取遊戲
      const loadResult = saveManager.loadGame(1);

      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data.metadata.slotId).toBe(1);
      expect(loadResult.data.metadata.saveName).toBe('測試存檔');

      // 4. 驗證遊戲狀態
      const { gameState: loadedState } = loadResult.data;

      // 驗證玩家數據
      expect(loadedState.player.name).toBe('測試玩家');
      expect(loadedState.player.experience.level).toBe(5);

      // 驗證背包數據
      expect(loadedState.inventory.items.length).toBe(2);
      expect(loadedState.inventory.items[0].id).toBe('item1');
      expect(loadedState.inventory.capacity).toBe(20);

      // 驗證員工數據
      expect(loadedState.employees.length).toBe(10);
      expect(loadedState.employees[0].id).toBe('emp1');
      expect(loadedState.employees[0].hired.unlocked).toBe(true);
      expect(loadedState.employees[0].level).toBe(3);
      expect(loadedState.employees[0].affection).toBe(50);
      expect(loadedState.employees[2].hired.unlocked).toBe(false);

      // 驗證資源
      expect(loadedState.silver).toBe(1500);
      expect(loadedState.totalSilver).toBe(5000);

      // 驗證客棧數據
      expect(loadedState.inn.level).toBe(3);
      expect(loadedState.inn.reputation).toBe(75);

      // 驗證工作調度
      expect(loadedState.workSchedule.assignments.kitchen).toBe('emp1');

      // 驗證場景數據
      expect(loadedState.sceneData.lastScene).toBe('MainGameScene');

      // 驗證統計數據
      expect(loadedState.stats.totalDays).toBe(15);

      // 驗證遊戲時間
      expect(loadedState.playTime).toBe(3600);

      // 驗證管理器數據
      expect(loadedState.timeManager.currentTime.dayCount).toBe(15);
      expect(loadedState.innManager.inn.level).toBe(3);
    });

    it('應該支持多個存檔槽位', () => {
      // 創建 3 個不同的存檔
      gameState.player.name = '玩家1';
      gameState.timeManager.currentTime.dayCount = 10;
      saveManager.saveGame(gameState, 1, '存檔1');

      gameState.player.name = '玩家2';
      gameState.timeManager.currentTime.dayCount = 20;
      saveManager.saveGame(gameState, 2, '存檔2');

      gameState.player.name = '玩家3';
      gameState.timeManager.currentTime.dayCount = 30;
      saveManager.saveGame(gameState, 3, '存檔3');

      // 列出所有存檔
      const saves = saveManager.listSaves();
      expect(saves.length).toBe(3);

      // 驗證每個存檔
      const save1 = saves.find(s => s.slotId === 1);
      expect(save1.playerName).toBe('玩家1');
      expect(save1.dayCount).toBe(10);

      const save2 = saves.find(s => s.slotId === 2);
      expect(save2.playerName).toBe('玩家2');
      expect(save2.dayCount).toBe(20);

      const save3 = saves.find(s => s.slotId === 3);
      expect(save3.playerName).toBe('玩家3');
      expect(save3.dayCount).toBe(30);

      // 讀取特定存檔
      const load2 = saveManager.loadGame(2);
      expect(load2.data.gameState.player.name).toBe('玩家2');
      expect(load2.data.gameState.timeManager.currentTime.dayCount).toBe(20);
    });

    it('應該支持覆蓋現有存檔', () => {
      // 第一次保存
      gameState.player.name = '初始玩家';
      gameState.silver = 100;
      saveManager.saveGame(gameState, 1, '初始存檔');

      // 覆蓋保存
      gameState.player.name = '更新玩家';
      gameState.silver = 500;
      saveManager.saveGame(gameState, 1, '更新存檔');

      // 驗證只有一個存檔
      const saves = saveManager.listSaves();
      expect(saves.length).toBe(1);

      // 驗證數據已更新
      const load = saveManager.loadGame(1);
      expect(load.data.metadata.saveName).toBe('更新存檔');
      expect(load.data.gameState.player.name).toBe('更新玩家');
      expect(load.data.gameState.silver).toBe(500);
    });

    it('應該支持刪除存檔', () => {
      // 創建 2 個存檔
      saveManager.saveGame(gameState, 1, '存檔1');
      saveManager.saveGame(gameState, 2, '存檔2');

      expect(saveManager.listSaves().length).toBe(2);

      // 刪除存檔 1
      const deleteResult = saveManager.deleteSave(1);
      expect(deleteResult.success).toBe(true);

      // 驗證只剩 1 個存檔
      const saves = saveManager.listSaves();
      expect(saves.length).toBe(1);
      expect(saves[0].slotId).toBe(2);

      // 嘗試讀取已刪除的存檔應該失敗
      const loadResult = saveManager.loadGame(1);
      expect(loadResult.success).toBe(false);
    });

    it('應該正確處理員工數據的保存和讀取', () => {
      // 設置員工數據
      gameState.employees[0].attributes.cooking = 95;
      gameState.employees[0].affection = 80;
      gameState.employees[0].skills = ['master_chef', 'speed_cooking'];

      // 保存
      saveManager.saveGame(gameState, 1, '員工測試');

      // 讀取
      const loadResult = saveManager.loadGame(1);
      const loadedEmp = loadResult.data.gameState.employees[0];

      // 驗證員工數據完整性
      expect(loadedEmp.attributes.cooking).toBe(95);
      expect(loadedEmp.affection).toBe(80);
      expect(loadedEmp.skills).toEqual(['master_chef', 'speed_cooking']);
    });

    it('應該正確處理背包數據的保存和讀取', () => {
      // 添加更多物品
      gameState.inventory.items.push(
        { id: 'item3', name: '傳說武器', quantity: 1, rarity: 'legendary' }
      );

      // 保存
      saveManager.saveGame(gameState, 1, '背包測試');

      // 讀取
      const loadResult = saveManager.loadGame(1);
      const loadedInventory = loadResult.data.gameState.inventory;

      // 驗證背包數據
      expect(loadedInventory.items.length).toBe(3);
      expect(loadedInventory.items[2].rarity).toBe('legendary');
    });
  });

  describe('資料完整性驗證', () => {
    it('應該在缺少玩家數據時使用預設值', () => {
      delete gameState.player;

      const saveResult = saveManager.saveGame(gameState, 1, '無玩家');
      expect(saveResult.success).toBe(true);

      const loadResult = saveManager.loadGame(1);
      expect(loadResult.data.gameState.player).toEqual({});
      expect(loadResult.data.metadata.playerName).toBe('未知玩家');
      expect(loadResult.data.metadata.playerLevel).toBe(1);
    });

    it('應該在缺少背包數據時返回 null', () => {
      delete gameState.inventory;

      const saveResult = saveManager.saveGame(gameState, 1, '無背包');
      expect(saveResult.success).toBe(true);

      const loadResult = saveManager.loadGame(1);
      expect(loadResult.data.gameState.inventory).toBeNull();
    });

    it('應該在缺少員工數據時返回空陣列', () => {
      delete gameState.employees;

      const saveResult = saveManager.saveGame(gameState, 1, '無員工');
      expect(saveResult.success).toBe(true);

      const loadResult = saveManager.loadGame(1);
      expect(loadResult.data.gameState.employees).toEqual([]);
      expect(loadResult.data.metadata.employeeCount).toBe(0);
    });

    it('應該正確計算已解鎖員工數量', () => {
      // 解鎖 5 個員工
      for (let i = 0; i < 5; i++) {
        gameState.employees[i].hired = { unlocked: true, date: i + 1 };
      }

      saveManager.saveGame(gameState, 1, '5個員工');
      const saves = saveManager.listSaves();

      expect(saves[0].employeeCount).toBe(5);
      expect(saves[0].totalEmployees).toBe(10);
    });

    it('應該正確格式化大額金錢顯示', () => {
      gameState.silver = 50000;

      saveManager.saveGame(gameState, 1, '富豪');
      const saves = saveManager.listSaves();

      // gold 應該是實際數值，不是格式化後的字串
      expect(saves[0].gold).toBe(50000);
    });
  });

  describe('錯誤處理', () => {
    it('應該在讀取不存在的存檔時返回錯誤', () => {
      const result = saveManager.loadGame(999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('無效的槽位號');
    });

    it('應該在刪除不存在的存檔時返回錯誤', () => {
      const result = saveManager.deleteSave(999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('無效的槽位號');
    });

    it('應該在無效槽位時拒絕保存', () => {
      const result1 = saveManager.saveGame(gameState, 0, '無效槽位');
      expect(result1.success).toBe(false);

      const result2 = saveManager.saveGame(gameState, 11, '無效槽位');
      expect(result2.success).toBe(false);
    });
  });

  describe('元數據生成', () => {
    it('應該生成正確的保存時間戳', () => {
      const beforeSave = new Date();

      saveManager.saveGame(gameState, 1, '時間測試');

      const afterSave = new Date();
      const saves = saveManager.listSaves();
      const savedAt = new Date(saves[0].savedAt);

      // 驗證時間戳在合理範圍內
      expect(savedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    it('應該生成遊戲版本信息', () => {
      saveManager.saveGame(gameState, 1, '版本測試');

      const saves = saveManager.listSaves();
      expect(saves[0].version).toBeDefined();
    });
  });
});
