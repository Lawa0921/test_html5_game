/**
 * AudioManager - 音頻管理器
 *
 * 管理遊戲的所有音頻：
 * - 背景音樂 (BGM)
 * - 音效 (SFX)
 * - 語音 (Voice)
 * - 音量控制
 * - 淡入淡出
 */

class AudioManager {
  constructor(sceneOrGame, settingsManager) {
    // 兼容 Phaser.Game 或 Phaser.Scene
    // 如果傳入的是 Game 對象，使用全局 sound 管理器
    // 如果是 Scene 對象，使用場景的 sound 管理器
    this.game = sceneOrGame.scene ? sceneOrGame : null; // Phaser.Scene
    this.phaserGame = sceneOrGame.sound ? sceneOrGame : null; // Phaser.Game
    this.settingsManager = settingsManager;

    // 當前播放的音頻
    this.currentBGM = null;
    this.bgmKey = null;
    this.bgmTween = null; // 當前 BGM 的 Tween 動畫

    // 音效緩存
    this.sfxCache = new Map();

    // 淡入淡出配置
    this.fadeDuration = 1000; // 毫秒

    // 存儲當前使用的 Scene（用於 Tween 管理）
    this.currentScene = null;
  }

  /**
   * 設置當前場景（用於 Tween 管理）
   */
  setScene(scene) {
    this.currentScene = scene;
  }

  /**
   * 獲取音頻管理器（優先使用 Game 的全局音頻）
   */
  getSoundManager() {
    return this.phaserGame ? this.phaserGame.sound : (this.game ? this.game.sound : null);
  }

  /**
   * 獲取 Tween 管理器
   */
  getTweenManager() {
    // 優先使用存儲的場景，其次使用構造時的場景
    const scene = this.currentScene || this.game;
    return scene ? scene.tweens : null;
  }

  /**
   * 播放背景音樂
   */
  playBGM(key, config = {}) {
    // 檢查音樂是否啟用
    if (!this.settingsManager.get('audio', 'musicEnabled')) {
      return null;
    }

    // 如果已經在播放同一首音樂，不做處理
    if (this.bgmKey === key && this.currentBGM && this.currentBGM.isPlaying) {
      return this.currentBGM;
    }

    // 停止當前音樂（帶淡出，預設會清除 bgmKey）
    if (this.currentBGM) {
      this.stopBGM(true);
    }

    // 獲取音頻管理器
    const soundManager = this.getSoundManager();
    if (!soundManager) {
      console.error('無法獲取音頻管理器');
      return null;
    }

    // 獲取音量設定
    const volume = this.settingsManager.getActualVolume('bgm');

    // 播放新音樂
    const bgmConfig = {
      loop: true,
      volume: config.fadeIn ? 0 : volume,
      ...config
    };

    try {
      this.currentBGM = soundManager.add(key, bgmConfig);
      this.bgmKey = key;
      this.currentBGM.play();

      // 淡入效果（需要 Tween 管理器）
      if (config.fadeIn) {
        const tweenManager = this.getTweenManager();
        if (tweenManager) {
          this.bgmTween = tweenManager.add({
            targets: this.currentBGM,
            volume: volume,
            duration: this.fadeDuration,
            ease: 'Linear',
            onUpdate: (tween) => {
              // 安全檢查：如果音頻對象已失效，停止 Tween
              if (!this.currentBGM || !this.currentBGM.setVolume) {
                tween.stop();
                this.bgmTween = null;
              }
            }
          });
        } else {
          // 如果沒有 Tween 管理器，直接設置音量
          this.currentBGM.setVolume(volume);
        }
      }

      return this.currentBGM;
    } catch (error) {
      console.error(`播放 BGM 失敗：${key}`, error);
      // 清理已設置的狀態
      this.currentBGM = null;
      this.bgmKey = null;
      // 清理可能已創建的 Tween
      if (this.bgmTween) {
        this.bgmTween.stop();
        this.bgmTween = null;
      }
      return null;
    }
  }

  /**
   * 停止背景音樂
   * @param {boolean} fadeOut - 是否使用淡出效果
   * @param {boolean} keepKey - 是否保留 bgmKey（預設 false，用於音樂開關時保留 key 以便恢復）
   */
  stopBGM(fadeOut = false, keepKey = false) {
    if (!this.currentBGM) {
      return;
    }

    // 先清理現有的 BGM Tween（避免衝突）
    if (this.bgmTween) {
      this.bgmTween.stop();
      this.bgmTween = null;
    }

    if (fadeOut) {
      // 淡出效果
      const tweenManager = this.getTweenManager();
      if (tweenManager) {
        this.bgmTween = tweenManager.add({
          targets: this.currentBGM,
          volume: 0,
          duration: this.fadeDuration,
          ease: 'Linear',
          onUpdate: (tween) => {
            // 安全檢查：如果音頻對象已失效，立即停止並清理
            if (!this.currentBGM || !this.currentBGM.setVolume) {
              tween.stop();
              this.bgmTween = null;
              this.currentBGM = null;
              if (!keepKey) {
                this.bgmKey = null;
              }
            }
          },
          onComplete: () => {
            if (this.currentBGM) {
              this.currentBGM.stop();
              this.currentBGM.destroy();
              this.currentBGM = null;
              if (!keepKey) {
                this.bgmKey = null;
              }
            }
            this.bgmTween = null;
          }
        });
      } else {
        // 如果沒有 Tween 管理器，直接停止
        this.currentBGM.stop();
        this.currentBGM.destroy();
        this.currentBGM = null;
        if (!keepKey) {
          this.bgmKey = null;
        }
      }
    } else {
      this.currentBGM.stop();
      this.currentBGM.destroy();
      this.currentBGM = null;
      if (!keepKey) {
        this.bgmKey = null;
      }
    }
  }

  /**
   * 暫停背景音樂
   */
  pauseBGM() {
    if (this.currentBGM && this.currentBGM.isPlaying) {
      this.currentBGM.pause();
    }
  }

  /**
   * 恢復背景音樂
   */
  resumeBGM() {
    if (this.currentBGM && this.currentBGM.isPaused) {
      this.currentBGM.resume();
    }
  }

  /**
   * 播放音效
   */
  playSFX(key, config = {}) {
    // 檢查音效是否啟用
    if (!this.settingsManager.get('audio', 'sfxEnabled')) {
      return null;
    }

    // 獲取音量設定
    const volume = this.settingsManager.getActualVolume('sfx');

    const sfxConfig = {
      volume: volume,
      ...config
    };

    try {
      const soundManager = this.getSoundManager();
      if (!soundManager) {
        console.error('無法獲取音頻管理器');
        return null;
      }

      const sfx = soundManager.add(key, sfxConfig);
      sfx.play();

      // 播放完成後自動清理
      sfx.once('complete', () => {
        sfx.destroy();
      });

      return sfx;
    } catch (error) {
      console.error(`播放音效失敗：${key}`, error);
      return null;
    }
  }

  /**
   * 播放 UI 音效
   */
  playUISound(type) {
    const soundMap = {
      click: 'click',
      confirm: 'confirm',
      cancel: 'cancel',
      error: 'error',
      success: 'success',
      notification: 'notification'
    };

    const key = soundMap[type];
    if (key) {
      return this.playSFX(key);
    }

    return null;
  }

  /**
   * 設置主音量
   */
  setMasterVolume(volume) {
    const result = this.settingsManager.setVolume('master', volume);

    if (result.success) {
      // 更新當前播放的 BGM 音量
      if (this.currentBGM) {
        const newVolume = this.settingsManager.getActualVolume('bgm');
        this.currentBGM.setVolume(newVolume);
      }
    }

    return result;
  }

  /**
   * 設置 BGM 音量
   */
  setBGMVolume(volume) {
    const result = this.settingsManager.setVolume('bgm', volume);

    if (result.success) {
      // 更新當前播放的 BGM 音量
      if (this.currentBGM) {
        const newVolume = this.settingsManager.getActualVolume('bgm');
        this.currentBGM.setVolume(newVolume);
      }
    }

    return result;
  }

  /**
   * 設置音效音量
   */
  setSFXVolume(volume) {
    return this.settingsManager.setVolume('sfx', volume);
  }

  /**
   * 切換音樂開關
   */
  toggleMusic() {
    const result = this.settingsManager.toggleAudio('music');

    if (result.success) {
      if (result.enabled) {
        // 如果有之前的音樂，恢復播放
        if (this.bgmKey) {
          this.playBGM(this.bgmKey);
        }
      } else {
        // 停止當前音樂（保留 bgmKey 以便恢復）
        this.stopBGM(false, true);
      }
    }

    return result;
  }

  /**
   * 切換音效開關
   */
  toggleSFX() {
    return this.settingsManager.toggleAudio('sfx');
  }

  /**
   * 預載入音頻資源
   */
  preloadAudio(scene) {
    // BGM
    scene.load.audio('bgm-menu', 'assets/audio/bgm/menu.mp3');
    scene.load.audio('bgm-day', 'assets/audio/bgm/day-operation.mp3');
    scene.load.audio('bgm-night', 'assets/audio/bgm/night-time.mp3');
    scene.load.audio('bgm-intro', 'assets/audio/bgm/intro-story.mp3');
    scene.load.audio('bgm-settlement', 'assets/audio/bgm/settlement.mp3');
    scene.load.audio('bgm-work', 'assets/audio/bgm/work-assignment.mp3');

    // SFX
    scene.load.audio('click', 'assets/audio/sfx/click.mp3');
    scene.load.audio('confirm', 'assets/audio/sfx/confirm.mp3');
    scene.load.audio('cancel', 'assets/audio/sfx/cancel.mp3');
    scene.load.audio('coin', 'assets/audio/sfx/coin.mp3');
    scene.load.audio('notification', 'assets/audio/sfx/notification.mp3');
    scene.load.audio('level-up', 'assets/audio/sfx/level-up.mp3');
    scene.load.audio('affection-up', 'assets/audio/sfx/affection-up.mp3');
    scene.load.audio('cooking', 'assets/audio/sfx/cooking.mp3');
    scene.load.audio('guest-arrive', 'assets/audio/sfx/guest-arrive.mp3');
    scene.load.audio('guest-leave', 'assets/audio/sfx/guest-leave.mp3');
  }

  /**
   * 清理所有音頻
   */
  cleanup() {
    this.stopBGM();
    this.sfxCache.clear();
  }

  /**
   * 獲取當前狀態
   */
  getStatus() {
    return {
      bgmPlaying: this.currentBGM !== null && this.currentBGM.isPlaying,
      bgmKey: this.bgmKey,
      musicEnabled: this.settingsManager.get('audio', 'musicEnabled'),
      sfxEnabled: this.settingsManager.get('audio', 'sfxEnabled'),
      masterVolume: this.settingsManager.get('audio', 'masterVolume'),
      bgmVolume: this.settingsManager.get('audio', 'bgmVolume'),
      sfxVolume: this.settingsManager.get('audio', 'sfxVolume')
    };
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
