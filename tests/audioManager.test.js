/**
 * AudioManager 測試
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
const AudioManager = require('../src/managers/AudioManager.js');

describe('AudioManager', () => {
  let settingsManager;
  let audioManager;
  let mockScene;
  let mockSound;
  let mockTweens;

  beforeEach(() => {
    localStorage.clear();

    // Mock Phaser Scene
    mockSound = null;

    mockScene = {
      scene: { key: 'TestScene' }, // 添加 scene 屬性以模擬真實的 Phaser.Scene
      sound: {
        add: vi.fn((key, config) => {
          mockSound = {
            key: key,
            config: config,
            isPlaying: false,
            isPaused: false,
            volume: config.volume || 1.0,
            play: vi.fn(function() {
              this.isPlaying = true;
              this.isPaused = false;
            }),
            stop: vi.fn(function() {
              this.isPlaying = false;
              this.isPaused = false;
            }),
            pause: vi.fn(function() {
              this.isPaused = true;
              this.isPlaying = false;
            }),
            resume: vi.fn(function() {
              this.isPaused = false;
              this.isPlaying = true;
            }),
            destroy: vi.fn(),
            setVolume: vi.fn(function(vol) {
              this.volume = vol;
            }),
            once: vi.fn((event, callback) => {
              if (event === 'complete') {
                // 模擬音效播放完成
                setTimeout(callback, 0);
              }
            })
          };
          return mockSound;
        })
      },
      tweens: {
        add: vi.fn((config) => {
          // 模擬 tween 立即完成
          if (config.onComplete) {
            setTimeout(config.onComplete, 0);
          }
          // 如果有 targets，立即設置目標值
          if (config.targets && config.volume !== undefined) {
            if (Array.isArray(config.targets)) {
              config.targets.forEach(target => {
                if (target) target.volume = config.volume;
              });
            } else {
              config.targets.volume = config.volume;
            }
          }
        })
      }
    };

    settingsManager = new SettingsManager();
    audioManager = new AudioManager(mockScene, settingsManager);
    audioManager.setScene(mockScene); // 設置場景以便使用 Tween
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初始化', () => {
    it('應該正確初始化 AudioManager', () => {
      expect(audioManager.game).toBe(mockScene);
      expect(audioManager.settingsManager).toBe(settingsManager);
      expect(audioManager.currentBGM).toBeNull();
      expect(audioManager.bgmKey).toBeNull();
      expect(audioManager.fadeDuration).toBe(1000);
    });
  });

  describe('BGM 播放', () => {
    it('應該成功播放 BGM', () => {
      const result = audioManager.playBGM('test-bgm');

      expect(result).not.toBeNull();
      expect(mockScene.sound.add).toHaveBeenCalledWith('test-bgm', expect.objectContaining({
        loop: true
      }));
      expect(mockSound.play).toHaveBeenCalled();
      expect(audioManager.currentBGM).toBe(mockSound);
      expect(audioManager.bgmKey).toBe('test-bgm');
    });

    it('應該使用正確的音量設定', () => {
      settingsManager.setVolume('master', 0.8);
      settingsManager.setVolume('bgm', 0.5);

      audioManager.playBGM('test-bgm');

      expect(mockScene.sound.add).toHaveBeenCalledWith('test-bgm', expect.objectContaining({
        volume: 0.4  // 0.8 * 0.5
      }));
    });

    it('應該在音樂關閉時不播放', () => {
      settingsManager.toggleAudio('music');  // 關閉音樂

      const result = audioManager.playBGM('test-bgm');

      expect(result).toBeNull();
      expect(mockScene.sound.add).not.toHaveBeenCalled();
    });

    it('應該在播放新 BGM 前停止舊 BGM', () => {
      audioManager.playBGM('bgm-1');
      const firstBGMKey = audioManager.bgmKey;

      audioManager.playBGM('bgm-2');

      // 驗證 bgmKey 已更新（等待 tween 完成後會清除舊的 bgmKey）
      expect(audioManager.bgmKey).toBe('bgm-2');
      expect(firstBGMKey).toBe('bgm-1');

      // 驗證 stopBGM 被調用（通過 tweens.add 被調用來驗證）
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('應該支持淡入效果', () => {
      audioManager.playBGM('test-bgm', { fadeIn: true });

      expect(mockScene.sound.add).toHaveBeenCalledWith('test-bgm', expect.objectContaining({
        volume: 0  // 從 0 開始
      }));
      expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
        duration: 1000,
        ease: 'Linear'
      }));
    });

    it('應該在已經播放相同音樂時不重新播放', () => {
      audioManager.playBGM('test-bgm');
      mockScene.sound.add.mockClear();

      audioManager.playBGM('test-bgm');

      expect(mockScene.sound.add).not.toHaveBeenCalled();
    });
  });

  describe('BGM 停止', () => {
    beforeEach(() => {
      audioManager.playBGM('test-bgm');
    });

    it('應該正確停止 BGM', () => {
      audioManager.stopBGM();

      expect(mockSound.stop).toHaveBeenCalled();
      expect(mockSound.destroy).toHaveBeenCalled();
      expect(audioManager.currentBGM).toBeNull();
      expect(audioManager.bgmKey).toBeNull();
    });

    it('應該支持淡出效果', () => {
      audioManager.stopBGM(true);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
        volume: 0,
        duration: 1000
      }));
    });

    it('在沒有 BGM 時不應該報錯', () => {
      audioManager.stopBGM();
      audioManager.stopBGM();  // 再次調用

      expect(() => audioManager.stopBGM()).not.toThrow();
    });
  });

  describe('BGM 暫停和恢復', () => {
    beforeEach(() => {
      audioManager.playBGM('test-bgm');
    });

    it('應該正確暫停 BGM', () => {
      audioManager.pauseBGM();

      expect(mockSound.pause).toHaveBeenCalled();
    });

    it('應該正確恢復 BGM', () => {
      audioManager.pauseBGM();
      mockSound.isPaused = true;
      mockSound.isPlaying = false;

      audioManager.resumeBGM();

      expect(mockSound.resume).toHaveBeenCalled();
    });

    it('在沒有播放時暫停不應該報錯', () => {
      audioManager.stopBGM();

      expect(() => audioManager.pauseBGM()).not.toThrow();
    });

    it('在沒有暫停時恢復不應該報錯', () => {
      expect(() => audioManager.resumeBGM()).not.toThrow();
    });
  });

  describe('音效播放', () => {
    it('應該成功播放音效', () => {
      const result = audioManager.playSFX('test-sfx');

      expect(result).not.toBeNull();
      expect(mockScene.sound.add).toHaveBeenCalledWith('test-sfx', expect.any(Object));
      expect(mockSound.play).toHaveBeenCalled();
    });

    it('應該使用正確的音量設定', () => {
      settingsManager.setVolume('master', 0.8);
      settingsManager.setVolume('sfx', 0.9);

      audioManager.playSFX('test-sfx');

      // 取得實際調用的參數
      const callArgs = mockScene.sound.add.mock.calls[0];
      expect(callArgs[0]).toBe('test-sfx');
      expect(callArgs[1].volume).toBeCloseTo(0.72, 2);  // 0.8 * 0.9
    });

    it('應該在音效關閉時不播放', () => {
      settingsManager.toggleAudio('sfx');  // 關閉音效

      const result = audioManager.playSFX('test-sfx');

      expect(result).toBeNull();
      expect(mockScene.sound.add).not.toHaveBeenCalled();
    });

    it('應該在播放完成後自動清理', () => {
      audioManager.playSFX('test-sfx');

      expect(mockSound.once).toHaveBeenCalledWith('complete', expect.any(Function));
    });
  });

  describe('UI 音效', () => {
    it('應該播放點擊音效', () => {
      audioManager.playUISound('click');

      expect(mockScene.sound.add).toHaveBeenCalledWith('click', expect.any(Object));
    });

    it('應該播放確認音效', () => {
      audioManager.playUISound('confirm');

      expect(mockScene.sound.add).toHaveBeenCalledWith('confirm', expect.any(Object));
    });

    it('應該播放取消音效', () => {
      audioManager.playUISound('cancel');

      expect(mockScene.sound.add).toHaveBeenCalledWith('cancel', expect.any(Object));
    });

    it('應該播放錯誤音效', () => {
      audioManager.playUISound('error');

      expect(mockScene.sound.add).toHaveBeenCalledWith('error', expect.any(Object));
    });

    it('應該播放成功音效', () => {
      audioManager.playUISound('success');

      expect(mockScene.sound.add).toHaveBeenCalledWith('success', expect.any(Object));
    });

    it('應該播放通知音效', () => {
      audioManager.playUISound('notification');

      expect(mockScene.sound.add).toHaveBeenCalledWith('notification', expect.any(Object));
    });

    it('應該在未知類型時返回 null', () => {
      const result = audioManager.playUISound('unknown');

      expect(result).toBeNull();
    });
  });

  describe('音量控制', () => {
    it('應該設置主音量', () => {
      const result = audioManager.setMasterVolume(0.6);

      expect(result.success).toBe(true);
      expect(settingsManager.get('audio', 'masterVolume')).toBe(0.6);
    });

    it('應該設置主音量並更新當前 BGM', () => {
      audioManager.playBGM('test-bgm');

      audioManager.setMasterVolume(0.5);

      expect(mockSound.setVolume).toHaveBeenCalled();
    });

    it('應該設置 BGM 音量', () => {
      const result = audioManager.setBGMVolume(0.7);

      expect(result.success).toBe(true);
      expect(settingsManager.get('audio', 'bgmVolume')).toBe(0.7);
    });

    it('應該設置 BGM 音量並更新當前 BGM', () => {
      audioManager.playBGM('test-bgm');

      audioManager.setBGMVolume(0.6);

      expect(mockSound.setVolume).toHaveBeenCalled();
    });

    it('應該設置音效音量', () => {
      const result = audioManager.setSFXVolume(0.8);

      expect(result.success).toBe(true);
      expect(settingsManager.get('audio', 'sfxVolume')).toBe(0.8);
    });
  });

  describe('音頻開關', () => {
    it('應該切換音樂開關', () => {
      const initialState = settingsManager.get('audio', 'musicEnabled');

      const result = audioManager.toggleMusic();

      expect(result.success).toBe(true);
      expect(settingsManager.get('audio', 'musicEnabled')).toBe(!initialState);
    });

    it('應該在關閉音樂時停止當前 BGM', () => {
      audioManager.playBGM('test-bgm');
      settingsManager.set('audio', 'musicEnabled', true);

      audioManager.toggleMusic();  // 切換為關閉

      expect(mockSound.stop).toHaveBeenCalled();
    });

    it('應該在開啟音樂時恢復之前的 BGM', () => {
      // 先播放音樂
      audioManager.playBGM('test-bgm');

      // 關閉音樂（會停止播放但保留 bgmKey）
      audioManager.toggleMusic();

      // 清除 mock 記錄
      mockScene.sound.add.mockClear();

      // 重新開啟音樂（應該恢復播放之前的音樂）
      audioManager.toggleMusic();

      expect(mockScene.sound.add).toHaveBeenCalledWith('test-bgm', expect.any(Object));
    });

    it('應該切換音效開關', () => {
      const initialState = settingsManager.get('audio', 'sfxEnabled');

      const result = audioManager.toggleSFX();

      expect(result.success).toBe(true);
      expect(settingsManager.get('audio', 'sfxEnabled')).toBe(!initialState);
    });
  });

  describe('資源預載入', () => {
    it('應該預載入所有音頻資源', () => {
      const mockLoadScene = {
        load: {
          audio: vi.fn()
        }
      };

      audioManager.preloadAudio(mockLoadScene);

      // 驗證 BGM 被載入
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('bgm-menu', 'assets/audio/bgm/menu.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('bgm-day', 'assets/audio/bgm/day-operation.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('bgm-night', 'assets/audio/bgm/night-time.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('bgm-intro', 'assets/audio/bgm/intro-story.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('bgm-settlement', 'assets/audio/bgm/settlement.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('bgm-work', 'assets/audio/bgm/work-assignment.mp3');

      // 驗證音效被載入
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('click', 'assets/audio/sfx/click.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('confirm', 'assets/audio/sfx/confirm.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('cancel', 'assets/audio/sfx/cancel.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('coin', 'assets/audio/sfx/coin.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('notification', 'assets/audio/sfx/notification.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('level-up', 'assets/audio/sfx/level-up.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('affection-up', 'assets/audio/sfx/affection-up.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('cooking', 'assets/audio/sfx/cooking.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('guest-arrive', 'assets/audio/sfx/guest-arrive.mp3');
      expect(mockLoadScene.load.audio).toHaveBeenCalledWith('guest-leave', 'assets/audio/sfx/guest-leave.mp3');
    });
  });

  describe('清理', () => {
    it('應該清理所有音頻', () => {
      audioManager.playBGM('test-bgm');

      audioManager.cleanup();

      expect(mockSound.stop).toHaveBeenCalled();
      expect(mockSound.destroy).toHaveBeenCalled();
      expect(audioManager.currentBGM).toBeNull();
    });
  });

  describe('狀態查詢', () => {
    it('應該返回正確的狀態（無 BGM）', () => {
      const status = audioManager.getStatus();

      expect(status).toEqual({
        bgmPlaying: false,
        bgmKey: null,
        musicEnabled: true,
        sfxEnabled: true,
        masterVolume: 1.0,
        bgmVolume: 0.8,
        sfxVolume: 0.9
      });
    });

    it('應該返回正確的狀態（有 BGM）', () => {
      audioManager.playBGM('test-bgm');

      const status = audioManager.getStatus();

      expect(status.bgmPlaying).toBe(true);
      expect(status.bgmKey).toBe('test-bgm');
    });

    it('應該反映設定的變化', () => {
      settingsManager.setVolume('master', 0.7);
      settingsManager.toggleAudio('music');

      const status = audioManager.getStatus();

      expect(status.masterVolume).toBe(0.7);
      expect(status.musicEnabled).toBe(false);
    });
  });
});
