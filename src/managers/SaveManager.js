/**
 * SaveManager - 存檔管理器
 *
 * 負責遊戲的保存和讀取：
 * - 手動存檔/讀檔（10 個槽位）
 * - 自動保存
 * - 快速存檔/讀檔
 * - 存檔列表管理
 * - 存檔驗證
 */

const fs = require('fs');
const path = require('path');

class SaveManager {
  constructor() {
    // 嘗試獲取 Electron app 路徑，如果失敗則使用當前目錄
    try {
      const { app } = require('electron');
      const userDataPath = app.getPath('userData');
      this.saveDirectory = path.join(userDataPath, 'saves');
    } catch (error) {
      // 非 Electron 環境（測試環境）
      this.saveDirectory = path.join(process.cwd(), 'saves');
    }

    // 最大存檔槽位數
    this.maxSaveSlots = 10;

    // 確保存檔目錄存在
    this.ensureSaveDirectory();
  }

  /**
   * 確保存檔目錄存在
   */
  ensureSaveDirectory() {
    if (!fs.existsSync(this.saveDirectory)) {
      fs.mkdirSync(this.saveDirectory, { recursive: true });
    }
  }

  /**
   * 驗證槽位號是否有效
   */
  isValidSlot(slotId) {
    return Number.isInteger(slotId) && slotId >= 1 && slotId <= this.maxSaveSlots;
  }

  /**
   * 獲取存檔文件路徑
   */
  getSaveFilePath(slotId) {
    return path.join(this.saveDirectory, `slot_${slotId}.json`);
  }

  /**
   * 獲取自動保存文件路徑
   */
  getAutoSaveFilePath() {
    return path.join(this.saveDirectory, 'autosave.json');
  }

  /**
   * 獲取快速存檔文件路徑
   */
  getQuickSaveFilePath() {
    return path.join(this.saveDirectory, 'quicksave.json');
  }

  /**
   * 從遊戲狀態提取可保存的數據
   */
  extractSaveData(gameState) {
    const saveData = {
      // 序列化主角數據
      player: gameState.player && typeof gameState.player.serialize === 'function'
        ? gameState.player.serialize()
        : (gameState.player || {}),

      // 序列化背包數據
      inventory: gameState.inventory && typeof gameState.inventory.serialize === 'function'
        ? gameState.inventory.serialize()
        : null,

      // 保存員工數據
      employees: gameState.employees ? gameState.employees.map(emp => ({
        id: emp.id,
        hired: emp.hired,
        attributes: emp.attributes,
        status: emp.status,
        work: emp.work,
        equipment: emp.equipment,
        affection: emp.affection,
        skills: emp.skills,
        position: emp.position,
        level: emp.level,
        upgradeCost: emp.upgradeCost
      })) : [],

      // 保存資源數據
      silver: gameState.silver || 0,
      totalSilver: gameState.totalSilver || 0,

      // 客棧數據
      inn: gameState.inn || {},

      // 工作調度
      workSchedule: gameState.workSchedule || {},

      // 場景數據
      sceneData: gameState.sceneData || {},

      // 統計數據
      stats: gameState.stats || {},

      // 遊戲時間
      playTime: gameState.playTime || 0,

      // 設定
      settings: gameState.settings || null
    };

    // 所有需要保存的管理器列表
    const managers = [
      'timeManager',
      'gameFlowManager',
      'characterDispatchManager',
      'dailyOperationManager',
      'innManager',
      'affectionManager',
      'achievementManager',
      'equipmentManager',
      'combatManager',
      'tradeManager',
      'learningManager',
      'guestManager',
      'technologyManager',
      'recipeManager',
      'endingManager',
      'missionManager',
      'seasonManager',
      'eventManager',
      'storyManager',
      'notificationManager'
    ];

    // 從各個管理器提取數據
    managers.forEach(managerName => {
      const manager = gameState[managerName];
      if (manager && typeof manager.getSaveData === 'function') {
        try {
          saveData[managerName] = manager.getSaveData();
        } catch (error) {
          console.warn(`無法從 ${managerName} 提取存檔數據:`, error.message);
          saveData[managerName] = null;
        }
      } else {
        saveData[managerName] = null;
      }
    });

    return saveData;
  }

  /**
   * 創建存檔元數據
   */
  createMetadata(slotId, saveName, gameState) {
    const now = new Date();

    // 獲取金錢（優先使用 silver，其次是 innManager 的金錢）
    const gold = gameState.silver ||
                 gameState.innManager?.inn?.gold ||
                 gameState.inn?.gold ||
                 0;

    // 獲取客棧等級
    const innLevel = gameState.innManager?.inn?.level ||
                     gameState.inn?.level ||
                     1;

    return {
      slotId: slotId,
      saveName: saveName || `存檔 ${slotId}`,
      savedAt: now.toISOString(),
      version: '0.1.0',
      // 遊戲進度信息（用於顯示在存檔列表）
      playerName: gameState.player?.name || '未知玩家',
      playerLevel: gameState.player?.experience?.level || 1,
      innName: gameState.inn?.name || '未命名客棧',
      innLevel: innLevel,
      dayCount: gameState.timeManager?.currentTime?.dayCount || 1,
      gold: gold,
      reputation: gameState.innManager?.inn?.reputation ||
                  gameState.inn?.reputation ||
                  0,
      playtime: gameState.timeManager?.currentTime?.totalMinutes || 0,
      // 額外顯示信息
      employeeCount: gameState.employees?.filter(e => e.hired?.unlocked).length || 0,
      totalEmployees: gameState.employees?.length || 0
    };
  }

  /**
   * 保存遊戲
   */
  saveGame(gameState, slotId, saveName = null) {
    try {
      // 驗證槽位號
      if (!this.isValidSlot(slotId)) {
        return {
          success: false,
          error: `無效的槽位號：${slotId}。槽位號必須在 1-${this.maxSaveSlots} 之間。`
        };
      }

      // 提取遊戲數據
      const gameData = this.extractSaveData(gameState);

      // 創建元數據
      const metadata = this.createMetadata(slotId, saveName, gameState);

      // 構建完整的存檔對象
      const saveObject = {
        metadata: metadata,
        gameState: gameData
      };

      // 寫入文件
      const saveFilePath = this.getSaveFilePath(slotId);
      fs.writeFileSync(saveFilePath, JSON.stringify(saveObject, null, 2), 'utf-8');

      return {
        success: true,
        slot: slotId,
        savedAt: metadata.savedAt
      };
    } catch (error) {
      return {
        success: false,
        error: `保存失敗：${error.message}`
      };
    }
  }

  /**
   * 讀取遊戲
   */
  loadGame(slotId) {
    try {
      // 驗證槽位號
      if (!this.isValidSlot(slotId)) {
        return {
          success: false,
          error: `無效的槽位號：${slotId}`
        };
      }

      const saveFilePath = this.getSaveFilePath(slotId);

      // 檢查文件是否存在
      if (!fs.existsSync(saveFilePath)) {
        return {
          success: false,
          error: `槽位 ${slotId} 的存檔不存在`
        };
      }

      // 讀取文件
      const fileContent = fs.readFileSync(saveFilePath, 'utf-8');
      const saveData = JSON.parse(fileContent);

      // 驗證存檔
      if (!saveData.metadata || !saveData.gameState) {
        return {
          success: false,
          error: '存檔文件損壞：缺少必要數據'
        };
      }

      return {
        success: true,
        data: saveData
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: '存檔文件損壞：無法解析 JSON'
        };
      }

      return {
        success: false,
        error: `讀取失敗：${error.message}`
      };
    }
  }

  /**
   * 列出所有存檔
   */
  listSaves() {
    try {
      const saves = [];

      for (let i = 1; i <= this.maxSaveSlots; i++) {
        const saveFilePath = this.getSaveFilePath(i);

        if (fs.existsSync(saveFilePath)) {
          try {
            const fileContent = fs.readFileSync(saveFilePath, 'utf-8');
            const saveData = JSON.parse(fileContent);

            if (saveData.metadata) {
              saves.push(saveData.metadata);
            }
          } catch (error) {
            // 忽略損壞的存檔文件
            console.warn(`存檔槽位 ${i} 損壞，已跳過`);
          }
        }
      }

      // 按槽位號排序
      saves.sort((a, b) => a.slotId - b.slotId);

      return saves;
    } catch (error) {
      console.error('列出存檔失敗：', error);
      return [];
    }
  }

  /**
   * 刪除存檔
   */
  deleteSave(slotId) {
    try {
      if (!this.isValidSlot(slotId)) {
        return {
          success: false,
          error: `無效的槽位號：${slotId}`
        };
      }

      const saveFilePath = this.getSaveFilePath(slotId);

      if (!fs.existsSync(saveFilePath)) {
        return {
          success: false,
          error: `槽位 ${slotId} 的存檔不存在`
        };
      }

      fs.unlinkSync(saveFilePath);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: `刪除失敗：${error.message}`
      };
    }
  }

  /**
   * 自動保存
   */
  autoSave(gameState) {
    try {
      const gameData = this.extractSaveData(gameState);
      const metadata = {
        type: 'autosave',
        savedAt: new Date().toISOString(),
        dayCount: gameState.timeManager?.currentTime?.dayCount || 1
      };

      const saveObject = {
        metadata: metadata,
        gameState: gameData
      };

      const autoSaveFilePath = this.getAutoSaveFilePath();
      fs.writeFileSync(autoSaveFilePath, JSON.stringify(saveObject, null, 2), 'utf-8');

      return {
        success: true,
        savedAt: metadata.savedAt
      };
    } catch (error) {
      return {
        success: false,
        error: `自動保存失敗：${error.message}`
      };
    }
  }

  /**
   * 讀取自動保存
   */
  loadAutoSave() {
    try {
      const autoSaveFilePath = this.getAutoSaveFilePath();

      if (!fs.existsSync(autoSaveFilePath)) {
        return {
          success: false,
          error: '自動保存不存在'
        };
      }

      const fileContent = fs.readFileSync(autoSaveFilePath, 'utf-8');
      const saveData = JSON.parse(fileContent);

      return {
        success: true,
        data: saveData
      };
    } catch (error) {
      return {
        success: false,
        error: `讀取自動保存失敗：${error.message}`
      };
    }
  }

  /**
   * 快速存檔
   */
  quickSave(gameState) {
    try {
      const gameData = this.extractSaveData(gameState);
      const metadata = {
        type: 'quicksave',
        savedAt: new Date().toISOString(),
        dayCount: gameState.timeManager?.currentTime?.dayCount || 1
      };

      const saveObject = {
        metadata: metadata,
        gameState: gameData
      };

      const quickSaveFilePath = this.getQuickSaveFilePath();
      fs.writeFileSync(quickSaveFilePath, JSON.stringify(saveObject, null, 2), 'utf-8');

      return {
        success: true,
        savedAt: metadata.savedAt
      };
    } catch (error) {
      return {
        success: false,
        error: `快速存檔失敗：${error.message}`
      };
    }
  }

  /**
   * 快速讀檔
   */
  quickLoad() {
    try {
      const quickSaveFilePath = this.getQuickSaveFilePath();

      if (!fs.existsSync(quickSaveFilePath)) {
        return {
          success: false,
          error: '快速存檔不存在'
        };
      }

      const fileContent = fs.readFileSync(quickSaveFilePath, 'utf-8');
      const saveData = JSON.parse(fileContent);

      return {
        success: true,
        data: saveData
      };
    } catch (error) {
      return {
        success: false,
        error: `快速讀檔失敗：${error.message}`
      };
    }
  }

  /**
   * 驗證存檔
   */
  validateSave(slotId) {
    try {
      const saveFilePath = this.getSaveFilePath(slotId);

      if (!fs.existsSync(saveFilePath)) {
        return false;
      }

      const fileContent = fs.readFileSync(saveFilePath, 'utf-8');
      const saveData = JSON.parse(fileContent);

      // 檢查必要字段
      if (!saveData.metadata || !saveData.gameState) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 獲取存檔信息
   */
  getSaveInfo(slotId) {
    try {
      const saveFilePath = this.getSaveFilePath(slotId);

      if (!fs.existsSync(saveFilePath)) {
        return null;
      }

      const fileStats = fs.statSync(saveFilePath);
      const fileContent = fs.readFileSync(saveFilePath, 'utf-8');
      const saveData = JSON.parse(fileContent);

      if (!saveData.metadata) {
        return null;
      }

      return {
        ...saveData.metadata,
        fileSize: fileStats.size,
        lastModified: fileStats.mtime.toISOString()
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 檢查槽位是否為空
   */
  isSlotEmpty(slotId) {
    const saveFilePath = this.getSaveFilePath(slotId);
    return !fs.existsSync(saveFilePath);
  }

  /**
   * 獲取下一個空閒槽位
   */
  getNextEmptySlot() {
    for (let i = 1; i <= this.maxSaveSlots; i++) {
      if (this.isSlotEmpty(i)) {
        return i;
      }
    }
    return null; // 所有槽位已滿
  }
}

module.exports = SaveManager;
