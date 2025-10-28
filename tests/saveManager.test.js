import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SaveManager from '../src/managers/SaveManager.js';
import fs from 'fs';
import path from 'path';

describe.sequential('SaveManager', () => {
  let saveManager;
  let mockGameState;
  // 使用項目目錄下的 saves 文件夾（因為 Electron mock 在 CommonJS 環境下不生效）
  const testSaveDir = path.join(process.cwd(), 'saves');

  beforeEach(() => {
    // 清理整個測試目錄（在創建 SaveManager 之前）
    if (fs.existsSync(testSaveDir)) {
      fs.rmSync(testSaveDir, { recursive: true, force: true });
    }

    // 創建測試用的遊戲狀態
    mockGameState = {
      player: {
        name: '測試玩家',
        level: 5,
        gold: 1000,
        reputation: 200
      },
      inn: {
        name: '測試客棧',
        level: 2,
        gold: 5000,
        reputation: 300
      },
      timeManager: {
        currentTime: {
          dayCount: 10,
          hour: 14,
          minute: 30,
          totalMinutes: 14430
        },
        getSaveData: () => ({
          dayCount: 10,
          hour: 14,
          minute: 30,
          totalMinutes: 14430
        })
      },
      gameFlowManager: {
        currentPhase: 'operating',
        currentDay: 10,
        introComplete: true,
        getSaveData: () => ({
          currentPhase: 'operating',
          currentDay: 10,
          introComplete: true,
          dailyStats: {}
        })
      },
      characterDispatchManager: {
        getSaveData: () => ({
          assignments: {},
          characterStates: {}
        })
      },
      dailyOperationManager: {
        getSaveData: () => ({
          isOperating: true,
          currentGuests: []
        })
      }
    };

    saveManager = new SaveManager();
  });

  afterEach(() => {
    // 清理測試文件
    if (fs.existsSync(testSaveDir)) {
      try {
        fs.rmSync(testSaveDir, { recursive: true, force: true });
      } catch (error) {
        console.warn('清理測試目錄失敗:', error.message);
      }
    }
  });

  // ==================== 初始化 ====================

  describe('初始化', () => {
    it('應該正確初始化存檔目錄', () => {
      expect(saveManager.saveDirectory).toBeDefined();
      expect(saveManager.saveDirectory).toContain('saves');
    });

    it('應該初始化最大存檔數量', () => {
      expect(saveManager.maxSaveSlots).toBe(10);
    });

    it('應該創建存檔目錄（如果不存在）', () => {
      // SaveManager 構造時應該創建目錄
      expect(fs.existsSync(saveManager.saveDirectory)).toBe(true);
    });
  });

  // ==================== 保存遊戲 ====================

  describe('保存遊戲', () => {
    it('應該能保存遊戲到指定槽位', () => {
      const result = saveManager.saveGame(mockGameState, 1, '測試存檔');

      expect(result.success).toBe(true);
      expect(result.slot).toBe(1);
      expect(result.savedAt).toBeDefined();
    });

    it('應該創建包含所有關鍵數據的存檔文件', () => {
      saveManager.saveGame(mockGameState, 1, '測試存檔');

      const saveFile = path.join(saveManager.saveDirectory, 'slot_1.json');
      expect(fs.existsSync(saveFile)).toBe(true);

      const saveData = JSON.parse(fs.readFileSync(saveFile, 'utf-8'));

      expect(saveData.metadata).toBeDefined();
      expect(saveData.metadata.slotId).toBe(1);
      expect(saveData.metadata.saveName).toBe('測試存檔');
      expect(saveData.metadata.savedAt).toBeDefined();

      expect(saveData.gameState).toBeDefined();
      expect(saveData.gameState.player).toEqual(mockGameState.player);
      expect(saveData.gameState.inn).toEqual(mockGameState.inn);
    });

    it('應該能覆蓋已存在的存檔', () => {
      // 第一次保存
      saveManager.saveGame(mockGameState, 1, '第一次存檔');

      // 修改遊戲狀態
      mockGameState.player.gold = 2000;

      // 第二次保存到同一槽位
      const result = saveManager.saveGame(mockGameState, 1, '第二次存檔');

      expect(result.success).toBe(true);

      // 讀取並驗證是新數據
      const saveFile = path.join(saveManager.saveDirectory, 'slot_1.json');
      const saveData = JSON.parse(fs.readFileSync(saveFile, 'utf-8'));

      expect(saveData.gameState.player.gold).toBe(2000);
      expect(saveData.metadata.saveName).toBe('第二次存檔');
    });

    it('應該拒絕無效的槽位號', () => {
      const result1 = saveManager.saveGame(mockGameState, 0, '無效槽位');
      const result2 = saveManager.saveGame(mockGameState, 11, '超出範圍');

      expect(result1.success).toBe(false);
      expect(result1.error).toContain('槽位');

      expect(result2.success).toBe(false);
      expect(result2.error).toContain('槽位');
    });

    it('應該自動生成默認存檔名稱', () => {
      const result = saveManager.saveGame(mockGameState, 1);

      expect(result.success).toBe(true);

      const saveFile = path.join(saveManager.saveDirectory, 'slot_1.json');
      const saveData = JSON.parse(fs.readFileSync(saveFile, 'utf-8'));

      expect(saveData.metadata.saveName).toContain('存檔');
    });
  });

  // ==================== 讀取遊戲 ====================

  describe('讀取遊戲', () => {
    beforeEach(() => {
      // 先保存一個測試存檔
      saveManager.saveGame(mockGameState, 1, '測試讀檔');
    });

    it('應該能從指定槽位讀取存檔', () => {
      const result = saveManager.loadGame(1);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.metadata).toBeDefined();
      expect(result.data.gameState).toBeDefined();
    });

    it('應該正確恢復遊戲狀態', () => {
      const result = saveManager.loadGame(1);

      expect(result.success).toBe(true);

      const loadedState = result.data.gameState;
      expect(loadedState.player.gold).toBe(1000);
      expect(loadedState.inn.name).toBe('測試客棧');
    });

    it('應該處理不存在的存檔', () => {
      const result = saveManager.loadGame(5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });

    it('應該處理損壞的存檔文件', () => {
      // 寫入損壞的 JSON
      const saveFile = path.join(saveManager.saveDirectory, 'slot_2.json');
      fs.writeFileSync(saveFile, '{ invalid json }', 'utf-8');

      const result = saveManager.loadGame(2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('損壞');
    });
  });

  // ==================== 存檔列表 ====================

  describe('存檔列表', () => {
    it('應該能獲取所有存檔的列表', () => {
      // 創建多個存檔
      saveManager.saveGame(mockGameState, 1, '存檔1');
      mockGameState.player.gold = 2000;
      saveManager.saveGame(mockGameState, 3, '存檔3');
      mockGameState.player.gold = 3000;
      saveManager.saveGame(mockGameState, 5, '存檔5');

      const saves = saveManager.listSaves();

      expect(saves.length).toBe(3);
      expect(saves[0].slotId).toBe(1);
      expect(saves[1].slotId).toBe(3);
      expect(saves[2].slotId).toBe(5);
    });

    it('存檔列表應包含元數據', () => {
      saveManager.saveGame(mockGameState, 1, '測試存檔');

      const saves = saveManager.listSaves();

      expect(saves.length).toBe(1);
      expect(saves[0].saveName).toBe('測試存檔');
      expect(saves[0].savedAt).toBeDefined();
      expect(saves[0].dayCount).toBe(10);
      expect(saves[0].playerName).toBe('測試玩家');
      expect(saves[0].innName).toBe('測試客棧');
    });

    it('應該按槽位號排序', () => {
      saveManager.saveGame(mockGameState, 5, '存檔5');
      saveManager.saveGame(mockGameState, 2, '存檔2');
      saveManager.saveGame(mockGameState, 8, '存檔8');

      const saves = saveManager.listSaves();

      expect(saves[0].slotId).toBe(2);
      expect(saves[1].slotId).toBe(5);
      expect(saves[2].slotId).toBe(8);
    });

    it('空目錄應返回空列表', () => {
      const saves = saveManager.listSaves();
      expect(saves).toEqual([]);
    });
  });

  // ==================== 刪除存檔 ====================

  describe('刪除存檔', () => {
    beforeEach(() => {
      saveManager.saveGame(mockGameState, 1, '待刪除存檔');
    });

    it('應該能刪除指定槽位的存檔', () => {
      const result = saveManager.deleteSave(1);

      expect(result.success).toBe(true);

      const saveFile = path.join(saveManager.saveDirectory, 'slot_1.json');
      expect(fs.existsSync(saveFile)).toBe(false);
    });

    it('刪除不存在的存檔應返回錯誤', () => {
      const result = saveManager.deleteSave(9);

      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });
  });

  // ==================== 自動保存 ====================

  describe('自動保存', () => {
    it('應該能保存到自動保存槽位', () => {
      const result = saveManager.autoSave(mockGameState);

      expect(result.success).toBe(true);

      const autoSaveFile = path.join(saveManager.saveDirectory, 'autosave.json');
      expect(fs.existsSync(autoSaveFile)).toBe(true);
    });

    it('應該能讀取自動保存', () => {
      saveManager.autoSave(mockGameState);

      const result = saveManager.loadAutoSave();

      expect(result.success).toBe(true);
      expect(result.data.gameState.player.gold).toBe(1000);
    });

    it('自動保存不應佔用普通槽位', () => {
      saveManager.saveGame(mockGameState, 1, '手動存檔');
      saveManager.autoSave(mockGameState);

      const saves = saveManager.listSaves();

      // 應該只有 1 個手動存檔，自動保存不在列表中
      expect(saves.length).toBe(1);
      expect(saves[0].slotId).toBe(1);
    });
  });

  // ==================== 存檔驗證 ====================

  describe('存檔驗證', () => {
    it('應該能驗證存檔文件的完整性', () => {
      saveManager.saveGame(mockGameState, 1, '測試驗證');

      const isValid = saveManager.validateSave(1);
      expect(isValid).toBe(true);
    });

    it('應該檢測到缺失的必要字段', () => {
      // 創建不完整的存檔
      const incompleteSave = {
        metadata: { slotId: 1 }
        // 缺少 gameState
      };

      const saveFile = path.join(saveManager.saveDirectory, 'slot_2.json');
      fs.writeFileSync(saveFile, JSON.stringify(incompleteSave), 'utf-8');

      const isValid = saveManager.validateSave(2);
      expect(isValid).toBe(false);
    });
  });

  // ==================== 快速存檔/快速讀檔 ====================

  describe('快速存檔/讀檔', () => {
    it('應該支持快速存檔到專用槽位', () => {
      const result = saveManager.quickSave(mockGameState);

      expect(result.success).toBe(true);

      const quickSaveFile = path.join(saveManager.saveDirectory, 'quicksave.json');
      expect(fs.existsSync(quickSaveFile)).toBe(true);
    });

    it('應該能快速讀檔', () => {
      saveManager.quickSave(mockGameState);

      const result = saveManager.quickLoad();

      expect(result.success).toBe(true);
      expect(result.data.gameState.player.gold).toBe(1000);
    });

    it('沒有快速存檔時應返回錯誤', () => {
      const result = saveManager.quickLoad();

      expect(result.success).toBe(false);
      expect(result.error).toContain('不存在');
    });
  });

  // ==================== 存檔信息 ====================

  describe('存檔信息', () => {
    it('應該能獲取單個存檔的詳細信息', () => {
      saveManager.saveGame(mockGameState, 1, '測試存檔');

      const info = saveManager.getSaveInfo(1);

      expect(info).toBeDefined();
      expect(info.slotId).toBe(1);
      expect(info.saveName).toBe('測試存檔');
      expect(info.playerName).toBe('測試玩家');
      expect(info.dayCount).toBe(10);
      expect(info.playtime).toBeDefined();
      expect(info.fileSize).toBeGreaterThan(0);
    });

    it('不存在的存檔應返回 null', () => {
      const info = saveManager.getSaveInfo(9);
      expect(info).toBeNull();
    });
  });

  // ==================== 存檔槽位檢查 ====================

  describe('存檔槽位檢查', () => {
    it('應該能檢查槽位是否為空', () => {
      expect(saveManager.isSlotEmpty(1)).toBe(true);

      saveManager.saveGame(mockGameState, 1, '測試');

      expect(saveManager.isSlotEmpty(1)).toBe(false);
    });

    it('應該能獲取下一個空閒槽位', () => {
      saveManager.saveGame(mockGameState, 1, '存檔1');
      saveManager.saveGame(mockGameState, 2, '存檔2');
      saveManager.saveGame(mockGameState, 4, '存檔4');

      const nextSlot = saveManager.getNextEmptySlot();
      expect(nextSlot).toBe(3);
    });

    it('所有槽位已滿時應返回 null', () => {
      // 填滿所有槽位
      for (let i = 1; i <= 10; i++) {
        saveManager.saveGame(mockGameState, i, `存檔${i}`);
      }

      const nextSlot = saveManager.getNextEmptySlot();
      expect(nextSlot).toBeNull();
    });
  });

  describe('錯誤處理', () => {
    it('應該處理管理器 getSaveData 拋出錯誤的情況', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const badGameState = {
        ...mockGameState,
        timeManager: {
          getSaveData: () => {
            throw new Error('測試錯誤');
          }
        }
      };

      const result = saveManager.saveGame(badGameState, 1, '錯誤測試');

      expect(result.success).toBe(true); // 應該仍然成功
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('無法從 timeManager 提取存檔數據'),
        expect.any(String)
      );

      // 讀取存檔驗證數據
      const loadResult = saveManager.loadGame(1);
      expect(loadResult.success).toBe(true);
      expect(loadResult.data.gameState.timeManager).toBeNull(); // 錯誤的管理器數據應為 null

      consoleWarnSpy.mockRestore();
    });

    it('應該處理沒有 getSaveData 方法的管理器', () => {
      const gameStateWithBadManager = {
        ...mockGameState,
        badManager: {
          someData: 'test'
          // 沒有 getSaveData 方法
        }
      };

      const result = saveManager.saveGame(gameStateWithBadManager, 1, '無方法測試');

      expect(result.success).toBe(true);

      const loadResult = saveManager.loadGame(1);
      expect(loadResult.success).toBe(true);
      // badManager 不在預期的管理器列表中，所以不會被保存
    });
  });

  describe('員工和背包數據序列化', () => {
    it('應該正確序列化員工數據', () => {
      const gameStateWithEmployees = {
        ...mockGameState,
        employees: [
          {
            id: 'emp1',
            hired: { unlocked: true, date: 1 },
            attributes: { cooking: 80 },
            status: { hp: 100 },
            level: 3,
            affection: 50
          },
          {
            id: 'emp2',
            hired: { unlocked: false }
          }
        ]
      };

      saveManager.saveGame(gameStateWithEmployees, 1, '員工測試');
      const loadResult = saveManager.loadGame(1);

      expect(loadResult.data.gameState.employees).toBeDefined();
      expect(loadResult.data.gameState.employees.length).toBe(2);
      expect(loadResult.data.gameState.employees[0].id).toBe('emp1');
      expect(loadResult.data.gameState.employees[0].affection).toBe(50);
    });

    it('應該使用 player.serialize() 如果可用', () => {
      const gameStateWithSerialize = {
        ...mockGameState,
        player: {
          name: '可序列化玩家',
          level: 10,
          serialize: function() {
            return {
              name: this.name,
              level: this.level,
              serialized: true
            };
          }
        }
      };

      saveManager.saveGame(gameStateWithSerialize, 1, '序列化測試');
      const loadResult = saveManager.loadGame(1);

      expect(loadResult.data.gameState.player.serialized).toBe(true);
      expect(loadResult.data.gameState.player.name).toBe('可序列化玩家');
    });

    it('應該使用 inventory.serialize() 如果可用', () => {
      const gameStateWithInventory = {
        ...mockGameState,
        inventory: {
          items: [{ id: 'item1', quantity: 5 }],
          serialize: function() {
            return {
              items: this.items,
              serialized: true
            };
          }
        }
      };

      saveManager.saveGame(gameStateWithInventory, 1, '背包測試');
      const loadResult = saveManager.loadGame(1);

      expect(loadResult.data.gameState.inventory.serialized).toBe(true);
      expect(loadResult.data.gameState.inventory.items[0].id).toBe('item1');
    });
  });

  describe('元數據優先級', () => {
    it('應該優先使用 silver 作為金錢來源', () => {
      const gameState = {
        ...mockGameState,
        silver: 1000,
        innManager: {
          inn: { gold: 500 }
        },
        inn: {
          gold: 300
        }
      };

      saveManager.saveGame(gameState, 1, '金錢優先級');
      const saves = saveManager.listSaves();

      expect(saves[0].gold).toBe(1000); // 應該使用 silver
    });

    it('應該在沒有 silver 時使用 innManager.inn.gold', () => {
      const gameState = {
        ...mockGameState,
        silver: 0,
        innManager: {
          inn: { gold: 500 }
        },
        inn: {
          gold: 300
        }
      };

      saveManager.saveGame(gameState, 1, '次要金錢來源');
      const saves = saveManager.listSaves();

      expect(saves[0].gold).toBe(500); // 應該使用 innManager.inn.gold
    });

    it('應該在前兩者都沒有時使用 inn.gold', () => {
      const gameState = {
        ...mockGameState,
        inn: {
          gold: 300
        }
      };

      delete gameState.silver;

      saveManager.saveGame(gameState, 1, '第三金錢來源');
      const saves = saveManager.listSaves();

      expect(saves[0].gold).toBe(300); // 應該使用 inn.gold
    });

    it('應該優先使用 player.experience.level', () => {
      const gameState = {
        ...mockGameState,
        player: {
          experience: {
            level: 10
          }
        }
      };

      saveManager.saveGame(gameState, 1, '玩家等級');
      const saves = saveManager.listSaves();

      expect(saves[0].playerLevel).toBe(10);
    });

    it('應該計算已解鎖的員工數量', () => {
      const gameState = {
        ...mockGameState,
        employees: [
          { id: 'e1', hired: { unlocked: true } },
          { id: 'e2', hired: { unlocked: true } },
          { id: 'e3', hired: { unlocked: false } },
          { id: 'e4', hired: { unlocked: true } }
        ]
      };

      saveManager.saveGame(gameState, 1, '員工計數');
      const saves = saveManager.listSaves();

      expect(saves[0].employeeCount).toBe(3); // 3 個已解鎖
      expect(saves[0].totalEmployees).toBe(4); // 總共 4 個
    });
  });

  describe('資源數據保存', () => {
    it('應該保存所有資源數據', () => {
      const gameState = {
        ...mockGameState,
        silver: 5000,
        totalSilver: 20000,
        workSchedule: { kitchen: 'emp1' },
        sceneData: { lastScene: 'Main' },
        stats: { totalDays: 30 },
        playTime: 7200
      };

      saveManager.saveGame(gameState, 1, '資源測試');
      const loadResult = saveManager.loadGame(1);

      expect(loadResult.data.gameState.silver).toBe(5000);
      expect(loadResult.data.gameState.totalSilver).toBe(20000);
      expect(loadResult.data.gameState.workSchedule.kitchen).toBe('emp1');
      expect(loadResult.data.gameState.sceneData.lastScene).toBe('Main');
      expect(loadResult.data.gameState.stats.totalDays).toBe(30);
      expect(loadResult.data.gameState.playTime).toBe(7200);
    });

    it('應該為缺失的資源使用預設值', () => {
      const minimalGameState = {
        player: { name: '最小玩家' }
      };

      saveManager.saveGame(minimalGameState, 1, '最小狀態');
      const loadResult = saveManager.loadGame(1);

      expect(loadResult.data.gameState.silver).toBe(0);
      expect(loadResult.data.gameState.totalSilver).toBe(0);
      expect(loadResult.data.gameState.playTime).toBe(0);
      expect(loadResult.data.gameState.inn).toEqual({});
      expect(loadResult.data.gameState.workSchedule).toEqual({});
    });
  });
});
