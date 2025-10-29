/**
 * SettingsManager - 設定管理器
 *
 * 管理遊戲的所有設定：
 * - 按鍵綁定
 * - 解析度/視窗模式
 * - 音頻設定
 * - 語言設定
 * - 遊戲性設定
 */

class SettingsManager {
  constructor() {
    // 預設設定
    this.settings = {
      // 音頻設定
      audio: {
        masterVolume: 1.0,     // 主音量 (0.0 - 1.0)
        bgmVolume: 0.8,        // 背景音樂音量
        sfxVolume: 0.9,        // 音效音量
        voiceVolume: 1.0,      // 語音音量
        musicEnabled: true,    // 音樂開關
        sfxEnabled: true       // 音效開關
      },

      // 視覺設定
      display: {
        resolution: '1280x720',  // 解析度
        fullscreen: false,       // 全螢幕
        vsync: true,            // 垂直同步
        showFPS: false          // 顯示 FPS
      },

      // 按鍵綁定（預設配置）
      keyBindings: {
        // 基本操作
        confirm: ['Enter', 'Space'],
        cancel: ['Escape', 'Backspace'],
        menu: ['Escape', 'M'],

        // 移動
        up: ['ArrowUp', 'W'],
        down: ['ArrowDown', 'S'],
        left: ['ArrowLeft', 'A'],
        right: ['ArrowRight', 'D'],

        // 遊戲功能
        quickSave: ['F5'],
        quickLoad: ['F9'],
        screenshot: ['F12'],

        // UI 導航
        nextTab: ['Tab'],
        prevTab: ['Shift+Tab'],

        // 快捷鍵
        inventory: ['I'],
        character: ['C'],
        quest: ['Q'],
        map: ['M'],
        skills: ['K']
      },

      // 遊戲性設定
      gameplay: {
        language: 'zh-TW',        // 語言
        textSpeed: 1.0,           // 文字顯示速度
        autoSaveInterval: 5,      // 自動存檔間隔（分鐘）
        autoSaveEnabled: true,    // 自動存檔開關
        skipReadText: false,      // 跳過已讀文本
        confirmOnExit: true,      // 退出確認
        tooltipsEnabled: true,    // 工具提示
        tutorialEnabled: true     // 教學提示
      },

      // 輔助功能
      accessibility: {
        colorBlindMode: 'none',   // 色盲模式 (none/protanopia/deuteranopia/tritanopia)
        highContrast: false,      // 高對比度
        largeText: false,         // 大字體
        screenShake: true,        // 螢幕震動效果
        flashingEffects: true     // 閃爍效果
      }
    };

    // 支持的解析度列表
    this.supportedResolutions = [
      '1920x1080',  // Full HD
      '1600x900',   // HD+
      '1366x768',   // HD
      '1280x720',   // 720p
      '1024x768',   // XGA
      '800x600'     // SVGA
    ];

    // 支持的語言
    this.supportedLanguages = [
      { code: 'zh-TW', name: '繁體中文' },
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en-US', name: 'English' },
      { code: 'ja-JP', name: '日本語' }
    ];

    // 從 localStorage 載入設定
    this.loadSettings();
  }

  /**
   * 從 localStorage 載入設定
   */
  loadSettings() {
    try {
      // 檢查 localStorage 是否可用（在瀏覽器/Electron 環境中）
      if (typeof localStorage === 'undefined') {
        // Node.js 測試環境中，使用預設設定
        return;
      }

      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        const loadedSettings = JSON.parse(saved);
        // 深度合併設定（保留新增的預設值）
        this.settings = this.mergeDeep(this.settings, loadedSettings);
      }
    } catch (error) {
      console.error('載入設定失敗：', error);
    }
  }

  /**
   * 保存設定到 localStorage
   */
  saveSettings() {
    try {
      // 檢查 localStorage 是否可用（在瀏覽器/Electron 環境中）
      if (typeof localStorage === 'undefined') {
        // Node.js 測試環境中，不需要保存
        return { success: true };
      }

      localStorage.setItem('gameSettings', JSON.stringify(this.settings));
      return { success: true };
    } catch (error) {
      console.error('保存設定失敗：', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 深度合併對象
   */
  mergeDeep(target, source) {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  /**
   * 判斷是否為對象
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * 獲取設定值
   */
  get(category, key) {
    if (category && key) {
      return this.settings[category]?.[key];
    } else if (category) {
      return this.settings[category];
    }
    return this.settings;
  }

  /**
   * 設置設定值
   */
  set(category, key, value) {
    if (!this.settings[category]) {
      this.settings[category] = {};
    }

    this.settings[category][key] = value;
    this.saveSettings();

    return { success: true, value };
  }

  /**
   * 設置音量
   */
  setVolume(type, value) {
    // 確保音量在 0.0 - 1.0 範圍內
    const clampedValue = Math.max(0, Math.min(1, value));

    switch (type) {
      case 'master':
        this.settings.audio.masterVolume = clampedValue;
        break;
      case 'bgm':
        this.settings.audio.bgmVolume = clampedValue;
        break;
      case 'sfx':
        this.settings.audio.sfxVolume = clampedValue;
        break;
      case 'voice':
        this.settings.audio.voiceVolume = clampedValue;
        break;
      default:
        return { success: false, error: '無效的音量類型' };
    }

    this.saveSettings();
    return { success: true, value: clampedValue };
  }

  /**
   * 獲取實際音量（考慮主音量）
   */
  getActualVolume(type) {
    const master = this.settings.audio.masterVolume;

    switch (type) {
      case 'bgm':
        return master * this.settings.audio.bgmVolume;
      case 'sfx':
        return master * this.settings.audio.sfxVolume;
      case 'voice':
        return master * this.settings.audio.voiceVolume;
      default:
        return master;
    }
  }

  /**
   * 切換音頻開關
   */
  toggleAudio(type) {
    switch (type) {
      case 'music':
        this.settings.audio.musicEnabled = !this.settings.audio.musicEnabled;
        break;
      case 'sfx':
        this.settings.audio.sfxEnabled = !this.settings.audio.sfxEnabled;
        break;
      default:
        return { success: false, error: '無效的音頻類型' };
    }

    this.saveSettings();
    return { success: true, enabled: this.settings.audio[type + 'Enabled'] };
  }

  /**
   * 設置解析度
   */
  setResolution(resolution) {
    if (!this.supportedResolutions.includes(resolution)) {
      return { success: false, error: '不支持的解析度' };
    }

    this.settings.display.resolution = resolution;
    this.saveSettings();

    return { success: true, resolution };
  }

  /**
   * 切換全螢幕
   */
  toggleFullscreen() {
    this.settings.display.fullscreen = !this.settings.display.fullscreen;
    this.saveSettings();

    return { success: true, fullscreen: this.settings.display.fullscreen };
  }

  /**
   * 設置按鍵綁定
   */
  setKeyBinding(action, keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    this.settings.keyBindings[action] = keys;
    this.saveSettings();

    return { success: true, action, keys };
  }

  /**
   * 獲取按鍵綁定
   */
  getKeyBinding(action) {
    return this.settings.keyBindings[action] || [];
  }

  /**
   * 檢查按鍵是否觸發某個動作
   */
  isKeyFor(key, action) {
    const bindings = this.getKeyBinding(action);
    return bindings.includes(key);
  }

  /**
   * 設置語言
   */
  setLanguage(languageCode) {
    const supported = this.supportedLanguages.find(lang => lang.code === languageCode);
    if (!supported) {
      return { success: false, error: '不支持的語言' };
    }

    this.settings.gameplay.language = languageCode;
    this.saveSettings();

    return { success: true, language: languageCode };
  }

  /**
   * 重置為預設設定
   */
  resetToDefaults() {
    // 清除 localStorage（如果可用）
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('gameSettings');
    }

    // 創建新的預設設定（不會載入 localStorage）
    const tempSettings = {
      audio: {
        masterVolume: 1.0,
        bgmVolume: 0.8,
        sfxVolume: 0.9,
        voiceVolume: 1.0,
        musicEnabled: true,
        sfxEnabled: true
      },
      display: {
        resolution: '1280x720',
        fullscreen: false,
        vsync: true,
        showFPS: false
      },
      keyBindings: {
        confirm: ['Enter', 'Space'],
        cancel: ['Escape', 'Backspace'],
        menu: ['Escape', 'M'],
        up: ['ArrowUp', 'W'],
        down: ['ArrowDown', 'S'],
        left: ['ArrowLeft', 'A'],
        right: ['ArrowRight', 'D'],
        quickSave: ['F5'],
        quickLoad: ['F9'],
        screenshot: ['F12'],
        nextTab: ['Tab'],
        prevTab: ['Shift+Tab'],
        inventory: ['I'],
        character: ['C'],
        quest: ['Q'],
        map: ['M'],
        skills: ['K']
      },
      gameplay: {
        language: 'zh-TW',
        textSpeed: 1.0,
        autoSaveInterval: 5,
        autoSaveEnabled: true,
        skipReadText: false,
        confirmOnExit: true,
        tooltipsEnabled: true,
        tutorialEnabled: true
      },
      accessibility: {
        colorBlindMode: 'none',
        highContrast: false,
        largeText: false,
        screenShake: true,
        flashingEffects: true
      }
    };

    this.settings = tempSettings;
    this.saveSettings();

    return { success: true, message: '已重置為預設設定' };
  }

  /**
   * 重置特定類別的設定
   */
  resetCategory(category) {
    const defaultSettings = {
      audio: {
        masterVolume: 1.0,
        bgmVolume: 0.8,
        sfxVolume: 0.9,
        voiceVolume: 1.0,
        musicEnabled: true,
        sfxEnabled: true
      },
      display: {
        resolution: '1280x720',
        fullscreen: false,
        vsync: true,
        showFPS: false
      },
      gameplay: {
        language: 'zh-TW',
        textSpeed: 1.0,
        autoSaveInterval: 5,
        autoSaveEnabled: true,
        skipReadText: false,
        confirmOnExit: true,
        tooltipsEnabled: true,
        tutorialEnabled: true
      },
      accessibility: {
        colorBlindMode: 'none',
        highContrast: false,
        largeText: false,
        screenShake: true,
        flashingEffects: true
      }
    };

    if (!defaultSettings[category]) {
      return { success: false, error: '無效的設定類別' };
    }

    this.settings[category] = defaultSettings[category];
    this.saveSettings();

    return { success: true, message: `已重置 ${category} 設定` };
  }

  /**
   * 序列化（存檔）
   */
  serialize() {
    return {
      settings: JSON.parse(JSON.stringify(this.settings))
    };
  }

  /**
   * 反序列化（讀檔）
   */
  deserialize(data) {
    if (data.settings) {
      this.settings = this.mergeDeep(this.settings, data.settings);
      this.saveSettings();
    }
  }

  /**
   * 獲取存檔數據（SaveManager 接口）
   */
  getSaveData() {
    return this.serialize();
  }

  /**
   * 加載存檔數據（SaveManager 接口）
   */
  loadSaveData(data) {
    this.deserialize(data);
  }

  /**
   * 獲取設定摘要
   */
  getSummary() {
    return {
      解析度: this.settings.display.resolution,
      全螢幕: this.settings.display.fullscreen ? '是' : '否',
      主音量: `${Math.round(this.settings.audio.masterVolume * 100)}%`,
      BGM音量: `${Math.round(this.settings.audio.bgmVolume * 100)}%`,
      SFX音量: `${Math.round(this.settings.audio.sfxVolume * 100)}%`,
      語言: this.settings.gameplay.language,
      自動存檔: this.settings.gameplay.autoSaveEnabled ? '開啟' : '關閉'
    };
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsManager;
}
