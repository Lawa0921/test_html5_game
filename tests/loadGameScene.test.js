/**
 * LoadGameScene 測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Phaser
global.Phaser = {
  Scene: class Scene {
    constructor(config) {
      this.config = config;
    }
  },
  AUTO: 'AUTO',
  GameObjects: {
    Container: class Container {}
  }
};

const LoadGameScene = require('../src/scenes/LoadGameScene.js');

describe('LoadGameScene', () => {
  let scene;

  beforeEach(() => {
    scene = new LoadGameScene();

    // Mock 全局遊戲狀態
    global.window = {
      gameState: {
        player: { name: '測試玩家' },
        inn: { level: 1 },
        settings: { volume: 1.0 },
        saveManager: {
          maxSaveSlots: 10,
          listSaves: vi.fn(() => [
            {
              slotId: 1,
              saveName: '測試存檔1',
              dayCount: 10,
              innLevel: 2,
              savedAt: '2025-01-15T10:30:00.000Z'
            },
            {
              slotId: 3,
              saveName: '測試存檔3',
              dayCount: 25,
              innLevel: 5,
              savedAt: '2025-01-20T15:45:00.000Z'
            }
          ]),
          loadGame: vi.fn((slotId) => {
            if (slotId === 1 || slotId === 3) {
              return {
                success: true,
                data: {
                  metadata: {
                    slotId: slotId,
                    saveName: `測試存檔${slotId}`,
                    dayCount: 10,
                    innLevel: 2
                  },
                  gameState: {
                    player: { name: '已保存的玩家' },
                    inn: { level: 2 },
                    timeManager: { currentDay: 10 }
                  }
                }
              };
            } else {
              return {
                success: false,
                error: '存檔不存在'
              };
            }
          })
        }
      }
    };

    // Mock Phaser 場景方法
    scene.add = {
      image: vi.fn(() => ({
        setDisplaySize: vi.fn(() => ({})),
        setOrigin: vi.fn(() => ({})),
        setInteractive: vi.fn(() => ({})),
        on: vi.fn(),
        setTint: vi.fn(),
        clearTint: vi.fn()
      })),
      text: vi.fn(() => ({
        setOrigin: vi.fn(() => ({})),
        setColor: vi.fn(() => ({})),
        setText: vi.fn(() => ({})),
        setScale: vi.fn(() => ({})),
        setBackgroundColor: vi.fn(() => ({})),
        destroy: vi.fn()
      })),
      rectangle: vi.fn(() => ({})),
      container: vi.fn(() => ({
        add: vi.fn(() => ({})),
        setData: vi.fn(),
        getData: vi.fn()
      }))
    };

    scene.cameras = {
      main: {
        width: 1280,
        height: 720
      }
    };

    scene.time = {
      delayedCall: vi.fn((delay, callback) => callback())
    };

    scene.scene = {
      start: vi.fn()
    };

    scene.gameState = window.gameState;
    scene.saveManager = window.gameState.saveManager;
    scene.saveSlotCards = [];
  });

  describe('場景初始化', () => {
    it('應該正確初始化場景配置', () => {
      expect(scene.config.key).toBe('LoadGameScene');
    });

    it('應該初始化空的存檔卡片數組', () => {
      expect(scene.saveSlotCards).toEqual([]);
    });

    it('應該初始化 selectedSlot 為 null', () => {
      expect(scene.selectedSlot).toBeNull();
    });
  });

  describe('日期格式化', () => {
    it('應該正確格式化 ISO 日期字符串', () => {
      const isoString = '2025-01-15T10:30:00.000Z';
      const formatted = scene.formatDate(isoString);

      // 格式應該是 YYYY-MM-DD HH:MM
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    });

    it('應該處理無效日期字符串', () => {
      const result = scene.formatDate('invalid-date');
      expect(result).toBe('時間格式錯誤');
    });

    it('應該處理 null 或 undefined', () => {
      const result1 = scene.formatDate(null);
      const result2 = scene.formatDate(undefined);

      expect(result1).toBe('時間格式錯誤');
      expect(result2).toBe('時間格式錯誤');
    });
  });

  describe('存檔列表刷新', () => {
    it('應該調用 SaveManager.listSaves', () => {
      // 創建模擬卡片
      for (let i = 1; i <= 10; i++) {
        const mockCard = {
          getData: vi.fn((key) => {
            if (key === 'slotId') return i;
            if (key === 'infoText') return {
              setText: vi.fn(),
              setColor: vi.fn()
            };
            if (key === 'isEmpty') return true;
          }),
          setData: vi.fn()
        };
        scene.saveSlotCards.push(mockCard);
      }

      scene.refreshSaveSlots();

      expect(scene.saveManager.listSaves).toHaveBeenCalled();
    });

    it('應該正確標記有數據的存檔槽', () => {
      // 創建模擬卡片
      for (let i = 1; i <= 10; i++) {
        const infoText = {
          setText: vi.fn(),
          setColor: vi.fn()
        };

        const mockCard = {
          getData: vi.fn((key) => {
            if (key === 'slotId') return i;
            if (key === 'infoText') return infoText;
            if (key === 'isEmpty') return true;
          }),
          setData: vi.fn()
        };
        scene.saveSlotCards.push(mockCard);
      }

      scene.refreshSaveSlots();

      // 槽位 1 和 3 應該有數據
      const slot1 = scene.saveSlotCards[0];
      const slot3 = scene.saveSlotCards[2];

      // 驗證 setData 被調用設置 isEmpty 為 false
      expect(slot1.setData).toHaveBeenCalledWith('isEmpty', false);
      expect(slot3.setData).toHaveBeenCalledWith('isEmpty', false);
    });

    it('應該正確標記空存檔槽', () => {
      // 創建模擬卡片
      for (let i = 1; i <= 10; i++) {
        const infoText = {
          setText: vi.fn(),
          setColor: vi.fn()
        };

        const mockCard = {
          getData: vi.fn((key) => {
            if (key === 'slotId') return i;
            if (key === 'infoText') return infoText;
            if (key === 'isEmpty') return true;
          }),
          setData: vi.fn()
        };
        scene.saveSlotCards.push(mockCard);
      }

      scene.refreshSaveSlots();

      // 槽位 2 應該是空的
      const slot2 = scene.saveSlotCards[1];
      const infoText = slot2.getData('infoText');

      expect(infoText.setText).toHaveBeenCalledWith('[ 空存檔 ]');
      expect(infoText.setColor).toHaveBeenCalledWith('#888888');
    });

    it('應該處理 SaveManager 未初始化的情況', () => {
      scene.saveManager = null;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      scene.refreshSaveSlots();

      expect(consoleErrorSpy).toHaveBeenCalledWith('SaveManager 未初始化');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('加載存檔', () => {
    it('應該成功加載有效的存檔', () => {
      scene.showMessage = vi.fn();
      scene.restoreGameState = vi.fn();

      scene.onLoadSave(1);

      expect(scene.saveManager.loadGame).toHaveBeenCalledWith(1);
      expect(scene.showMessage).toHaveBeenCalledWith('正在讀取存檔...', 0x66ccff);
      expect(scene.restoreGameState).toHaveBeenCalled();
    });

    it('應該處理加載失敗的情況', () => {
      scene.showMessage = vi.fn();
      scene.restoreGameState = vi.fn();

      scene.onLoadSave(5); // 不存在的存檔

      expect(scene.saveManager.loadGame).toHaveBeenCalledWith(5);
      expect(scene.showMessage).toHaveBeenCalledWith('讀取失敗：存檔不存在', 0xff6666);
      expect(scene.restoreGameState).not.toHaveBeenCalled();
    });
  });

  describe('恢復遊戲狀態', () => {
    it('應該恢復玩家數據', () => {
      const saveData = {
        metadata: { slotId: 1 },
        gameState: {
          player: { name: '已保存的玩家', level: 10 },
          inn: { level: 3 },
          settings: { volume: 0.8 }
        }
      };

      scene.restoreGameState(saveData);

      expect(scene.gameState.player.name).toBe('已保存的玩家');
      expect(scene.gameState.player.level).toBe(10);
    });

    it('應該恢復客棧數據', () => {
      const saveData = {
        metadata: { slotId: 1 },
        gameState: {
          player: {},
          inn: { level: 5, gold: 10000 },
          settings: {}
        }
      };

      scene.restoreGameState(saveData);

      expect(scene.gameState.inn.level).toBe(5);
      expect(scene.gameState.inn.gold).toBe(10000);
    });

    it('應該恢復遊戲設置', () => {
      const saveData = {
        metadata: { slotId: 1 },
        gameState: {
          player: {},
          inn: {},
          settings: { volume: 0.5, language: 'en' }
        }
      };

      scene.restoreGameState(saveData);

      expect(scene.gameState.settings.volume).toBe(0.5);
      expect(scene.gameState.settings.language).toBe('en');
    });

    it('應該調用管理器的 loadSaveData 方法', () => {
      const mockManager = {
        loadSaveData: vi.fn()
      };

      scene.gameState.timeManager = mockManager;

      const saveData = {
        metadata: { slotId: 1 },
        gameState: {
          player: {},
          inn: {},
          settings: {},
          timeManager: { currentDay: 10 }
        }
      };

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      scene.restoreGameState(saveData);

      expect(mockManager.loadSaveData).toHaveBeenCalledWith({ currentDay: 10 });

      consoleLogSpy.mockRestore();
    });

    it('應該處理管理器恢復失敗的情況', () => {
      const mockManager = {
        loadSaveData: vi.fn(() => {
          throw new Error('恢復失敗');
        })
      };

      scene.gameState.timeManager = mockManager;

      const saveData = {
        metadata: { slotId: 1 },
        gameState: {
          player: {},
          inn: {},
          settings: {},
          timeManager: { currentDay: 10 }
        }
      };

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // 不應該拋出錯誤
      expect(() => scene.restoreGameState(saveData)).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith('無法恢復 timeManager:', '恢復失敗');

      consoleWarnSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('應該忽略沒有 loadSaveData 方法的管理器', () => {
      const mockManager = {}; // 沒有 loadSaveData 方法

      scene.gameState.timeManager = mockManager;

      const saveData = {
        metadata: { slotId: 1 },
        gameState: {
          player: {},
          inn: {},
          settings: {},
          timeManager: { currentDay: 10 }
        }
      };

      // 不應該拋出錯誤
      expect(() => scene.restoreGameState(saveData)).not.toThrow();
    });
  });

  describe('消息提示', () => {
    it('應該創建新消息', () => {
      scene.showMessage('測試消息', 0xffffff);

      expect(scene.add.text).toHaveBeenCalled();
      expect(scene.currentMessage).toBeDefined();
    });

    it('應該移除舊消息', () => {
      const oldMessage = {
        destroy: vi.fn()
      };

      scene.currentMessage = oldMessage;

      scene.showMessage('新消息', 0xffffff);

      expect(oldMessage.destroy).toHaveBeenCalled();
    });

    it('應該根據顏色設置不同的背景', () => {
      const mockText = {
        setOrigin: vi.fn(() => mockText),
        setBackgroundColor: vi.fn(() => mockText),
        destroy: vi.fn()
      };

      scene.add.text = vi.fn(() => mockText);

      // 測試錯誤消息（紅色）
      scene.showMessage('錯誤', 0xff6666);
      expect(mockText.setBackgroundColor).toHaveBeenCalledWith('#cc0000');

      // 測試成功消息（綠色）
      scene.showMessage('成功', 0x66ff66);
      expect(mockText.setBackgroundColor).toHaveBeenCalledWith('#00cc00');

      // 測試信息消息（藍色）
      scene.showMessage('信息', 0x66ccff);
      expect(mockText.setBackgroundColor).toHaveBeenCalledWith('#0066cc');

      // 測試警告消息（橙色）
      scene.showMessage('警告', 0xffaa00);
      expect(mockText.setBackgroundColor).toHaveBeenCalledWith('#cc8800');
    });
  });

  describe('場景切換', () => {
    it('應該能夠返回主菜單', () => {
      scene.createBackButton();

      // 獲取返回按鈕的點擊處理器
      const buttonCalls = scene.add.image.mock.results[0].value;
      const pointerdownHandler = buttonCalls.on.mock.calls.find(call => call[0] === 'pointerdown');

      if (pointerdownHandler) {
        pointerdownHandler[1](); // 執行點擊處理器
      }

      expect(scene.scene.start).toHaveBeenCalledWith('MainMenuScene');
    });
  });
});
