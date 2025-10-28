/**
 * SettingsManager 測試
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
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

const SettingsManager = require('../src/managers/SettingsManager.js');

describe('SettingsManager', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    manager = new SettingsManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初始化', () => {
    it('應該正確初始化預設設定', () => {
      expect(manager.settings.audio.masterVolume).toBe(1.0);
      expect(manager.settings.display.resolution).toBe('1280x720');
      expect(manager.settings.gameplay.language).toBe('zh-TW');
    });

    it('應該載入支持的解析度列表', () => {
      expect(manager.supportedResolutions).toContain('1920x1080');
      expect(manager.supportedResolutions).toContain('1280x720');
    });

    it('應該載入支持的語言列表', () => {
      expect(manager.supportedLanguages.length).toBeGreaterThan(0);
      expect(manager.supportedLanguages[0]).toHaveProperty('code');
      expect(manager.supportedLanguages[0]).toHaveProperty('name');
    });
  });

  describe('音量控制', () => {
    it('應該正確設置主音量', () => {
      const result = manager.setVolume('master', 0.5);
      expect(result.success).toBe(true);
      expect(manager.settings.audio.masterVolume).toBe(0.5);
    });

    it('應該正確設置 BGM 音量', () => {
      const result = manager.setVolume('bgm', 0.7);
      expect(result.success).toBe(true);
      expect(manager.settings.audio.bgmVolume).toBe(0.7);
    });

    it('應該正確設置 SFX 音量', () => {
      const result = manager.setVolume('sfx', 0.9);
      expect(result.success).toBe(true);
      expect(manager.settings.audio.sfxVolume).toBe(0.9);
    });

    it('應該限制音量在 0-1 範圍內', () => {
      manager.setVolume('master', 1.5);
      expect(manager.settings.audio.masterVolume).toBe(1.0);

      manager.setVolume('master', -0.5);
      expect(manager.settings.audio.masterVolume).toBe(0.0);
    });

    it('應該正確計算實際音量', () => {
      manager.setVolume('master', 0.8);
      manager.setVolume('bgm', 0.5);

      const actualVolume = manager.getActualVolume('bgm');
      expect(actualVolume).toBe(0.4);  // 0.8 * 0.5
    });
  });

  describe('音頻開關', () => {
    it('應該切換音樂開關', () => {
      const initialState = manager.settings.audio.musicEnabled;
      const result = manager.toggleAudio('music');

      expect(result.success).toBe(true);
      expect(manager.settings.audio.musicEnabled).toBe(!initialState);
    });

    it('應該切換音效開關', () => {
      const initialState = manager.settings.audio.sfxEnabled;
      const result = manager.toggleAudio('sfx');

      expect(result.success).toBe(true);
      expect(manager.settings.audio.sfxEnabled).toBe(!initialState);
    });
  });

  describe('解析度設定', () => {
    it('應該設置支持的解析度', () => {
      const result = manager.setResolution('1920x1080');
      expect(result.success).toBe(true);
      expect(manager.settings.display.resolution).toBe('1920x1080');
    });

    it('應該拒絕不支持的解析度', () => {
      const result = manager.setResolution('999x999');
      expect(result.success).toBe(false);
    });
  });

  describe('全螢幕切換', () => {
    it('應該切換全螢幕設定', () => {
      const initialState = manager.settings.display.fullscreen;
      const result = manager.toggleFullscreen();

      expect(result.success).toBe(true);
      expect(manager.settings.display.fullscreen).toBe(!initialState);
    });
  });

  describe('按鍵綁定', () => {
    it('應該設置按鍵綁定', () => {
      const result = manager.setKeyBinding('confirm', ['Enter', 'Space']);
      expect(result.success).toBe(true);
      expect(manager.settings.keyBindings.confirm).toEqual(['Enter', 'Space']);
    });

    it('應該獲取按鍵綁定', () => {
      const bindings = manager.getKeyBinding('confirm');
      expect(Array.isArray(bindings)).toBe(true);
    });

    it('應該檢查按鍵是否綁定到動作', () => {
      manager.setKeyBinding('menu', ['Escape', 'M']);
      expect(manager.isKeyFor('Escape', 'menu')).toBe(true);
      expect(manager.isKeyFor('M', 'menu')).toBe(true);
      expect(manager.isKeyFor('X', 'menu')).toBe(false);
    });
  });

  describe('語言設定', () => {
    it('應該設置支持的語言', () => {
      const result = manager.setLanguage('en-US');
      expect(result.success).toBe(true);
      expect(manager.settings.gameplay.language).toBe('en-US');
    });

    it('應該拒絕不支持的語言', () => {
      const result = manager.setLanguage('xx-XX');
      expect(result.success).toBe(false);
    });
  });

  describe('設定持久化', () => {
    it('應該保存設定到 localStorage', () => {
      manager.setVolume('master', 0.7);
      manager.saveSettings();

      const saved = localStorage.getItem('gameSettings');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved);
      expect(parsed.audio.masterVolume).toBe(0.7);
    });

    it('應該從 localStorage 載入設定', () => {
      // 先保存一些設定
      manager.setVolume('master', 0.6);
      manager.saveSettings();

      // 創建新實例
      const newManager = new SettingsManager();
      expect(newManager.settings.audio.masterVolume).toBe(0.6);
    });
  });

  describe('設定重置', () => {
    it('應該重置所有設定為預設值', () => {
      manager.setVolume('master', 0.5);
      manager.setResolution('1920x1080');

      const result = manager.resetToDefaults();
      expect(result.success).toBe(true);
      expect(manager.settings.audio.masterVolume).toBe(1.0);
      expect(manager.settings.display.resolution).toBe('1280x720');
    });

    it('應該重置特定類別的設定', () => {
      manager.setVolume('master', 0.5);
      manager.setResolution('1920x1080');

      manager.resetCategory('audio');

      expect(manager.settings.audio.masterVolume).toBe(1.0);
      expect(manager.settings.display.resolution).toBe('1920x1080');  // 未改變
    });
  });

  describe('getter 和 setter', () => {
    it('應該獲取特定設定', () => {
      const volume = manager.get('audio', 'masterVolume');
      expect(volume).toBe(1.0);
    });

    it('應該獲取整個類別的設定', () => {
      const audioSettings = manager.get('audio');
      expect(audioSettings).toHaveProperty('masterVolume');
      expect(audioSettings).toHaveProperty('bgmVolume');
    });

    it('應該設置特定設定', () => {
      const result = manager.set('audio', 'masterVolume', 0.8);
      expect(result.success).toBe(true);
      expect(manager.settings.audio.masterVolume).toBe(0.8);
    });
  });

  describe('序列化和反序列化', () => {
    it('應該正確序列化設定', () => {
      const serialized = manager.serialize();
      expect(serialized).toHaveProperty('settings');
      expect(serialized.settings).toHaveProperty('audio');
    });

    it('應該正確反序列化設定', () => {
      const data = {
        settings: {
          audio: {
            masterVolume: 0.6
          }
        }
      };

      manager.deserialize(data);
      expect(manager.settings.audio.masterVolume).toBe(0.6);
    });

    it('應該支持 getSaveData 接口', () => {
      const saveData = manager.getSaveData();
      expect(saveData).toHaveProperty('settings');
    });

    it('應該支持 loadSaveData 接口', () => {
      const saveData = {
        settings: {
          audio: {
            masterVolume: 0.7
          }
        }
      };

      manager.loadSaveData(saveData);
      expect(manager.settings.audio.masterVolume).toBe(0.7);
    });
  });

  describe('輔助功能', () => {
    it('應該設置高對比度模式', () => {
      manager.set('accessibility', 'highContrast', true);
      expect(manager.settings.accessibility.highContrast).toBe(true);
    });

    it('應該設置大字體', () => {
      manager.set('accessibility', 'largeText', true);
      expect(manager.settings.accessibility.largeText).toBe(true);
    });

    it('應該設置色盲模式', () => {
      manager.set('accessibility', 'colorBlindMode', 'protanopia');
      expect(manager.settings.accessibility.colorBlindMode).toBe('protanopia');
    });
  });

  describe('摘要生成', () => {
    it('應該生成設定摘要', () => {
      const summary = manager.getSummary();
      expect(summary).toHaveProperty('解析度');
      expect(summary).toHaveProperty('全螢幕');
      expect(summary).toHaveProperty('主音量');
      expect(summary).toHaveProperty('語言');
    });
  });
});
