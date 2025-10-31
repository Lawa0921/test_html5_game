/**
 * BGMController - BGM 控制器
 *
 * 統一管理遊戲中所有場景和故事的背景音樂：
 * - 場景切換時自動播放對應 BGM
 * - 故事劇情節點可指定特定 BGM
 * - 支持場景無 BGM（靜音場景）
 * - 自動處理 BGM 切換時的淡入淡出
 * - 避免重複播放相同 BGM
 */

class BGMController {
  /**
   * @param {AudioManager} audioManager - 音頻管理器實例
   */
  constructor(audioManager) {
    this.audioManager = audioManager;

    // 當前播放的 BGM key
    this.currentBGMKey = null;

    // 場景 BGM 配置表
    this.sceneBGMConfig = {
      'MainMenuScene': 'main-menu-bgm',
      'StoryScene': 'story-bgm',
      'BattleScene': 'battle-bgm',
      'InnDayScene': 'inn-day-bgm',
      'InnNightScene': 'inn-night-bgm',
      'TownScene': 'town-bgm',
      // null 表示該場景不播放 BGM
      'SettingsScene': null,
      'LoadGameScene': null,
    };

    // 故事 BGM 配置表
    // 原則：一個故事片段 = 一個 BGM，保持沉浸感
    this.storyBGMConfig = {
      // 主線故事
      'opening': 'intro-story-bgm',          // 開場故事：寧靜的雨天
      'chef_meeting': 'story-bgm',           // 舊識重逢：溫馨對話

      // 特殊劇情（需要特定氛圍時才使用不同 BGM）
      // 'boss_confrontation': 'tense-bgm',   // Boss 對峙：緊張氣氛
      // 'final_battle': 'battle-bgm',        // 最終戰鬥：激烈音樂
      // 'peaceful_ending': null,              // 溫馨結局：靜音讓對話更突出
    };
  }

  /**
   * 設置場景 BGM 配置
   * @param {string} sceneKey - 場景 key
   * @param {string|null} bgmKey - BGM key，null 表示無 BGM
   */
  setSceneBGM(sceneKey, bgmKey) {
    this.sceneBGMConfig[sceneKey] = bgmKey;
  }

  /**
   * 設置故事 BGM 配置
   * @param {string} storyId - 故事 ID
   * @param {string|null} bgmKey - BGM key，null 表示無 BGM
   */
  setStoryBGM(storyId, bgmKey) {
    this.storyBGMConfig[storyId] = bgmKey;
  }

  /**
   * 場景啟動時播放對應 BGM
   * @param {Phaser.Scene} scene - 場景實例
   * @param {object} options - 播放選項
   * @param {boolean} options.fadeIn - 是否淡入（預設 true）
   * @param {boolean} options.force - 是否強制重新播放（預設 false）
   */
  playSceneBGM(scene, options = {}) {
    const { fadeIn = true, force = false } = options;
    const sceneKey = scene.scene.key;
    const bgmKey = this.sceneBGMConfig[sceneKey];

    // 設置當前場景以便 AudioManager 可以使用 Tween
    this.audioManager.setScene(scene);

    // 如果場景配置為 null，停止當前 BGM
    if (bgmKey === null) {
      this.stopBGM(true); // 淡出停止
      return;
    }

    // 如果場景沒有配置 BGM，保持當前 BGM 繼續播放
    if (bgmKey === undefined) {
      console.log(`場景 ${sceneKey} 未配置 BGM，保持當前 BGM`);
      return;
    }

    // 播放場景 BGM
    this.playBGM(bgmKey, { fadeIn, force });
  }

  /**
   * 故事開始時播放對應 BGM
   * @param {string} storyId - 故事 ID
   * @param {Phaser.Scene} scene - 場景實例
   * @param {object} options - 播放選項
   */
  playStoryBGM(storyId, scene, options = {}) {
    const { fadeIn = true, force = false } = options;
    const bgmKey = this.storyBGMConfig[storyId];

    // 設置當前場景
    this.audioManager.setScene(scene);

    // 如果故事配置為 null，停止當前 BGM
    if (bgmKey === null) {
      this.stopBGM(true);
      return;
    }

    // 如果故事沒有配置 BGM，使用場景的預設 BGM
    if (bgmKey === undefined) {
      this.playSceneBGM(scene, options);
      return;
    }

    // 播放故事 BGM
    this.playBGM(bgmKey, { fadeIn, force });
  }

  /**
   * 故事節點指定 BGM
   * @param {string|null} bgmKey - BGM key，null 表示停止 BGM
   * @param {Phaser.Scene} scene - 場景實例
   * @param {object} options - 播放選項
   */
  playNodeBGM(bgmKey, scene, options = {}) {
    const { fadeIn = true, force = true } = options; // 節點切換預設強制播放

    // 設置當前場景
    this.audioManager.setScene(scene);

    // 如果節點指定為 null，停止當前 BGM
    if (bgmKey === null) {
      this.stopBGM(true);
      return;
    }

    // 播放節點指定的 BGM
    this.playBGM(bgmKey, { fadeIn, force });
  }

  /**
   * 播放 BGM（內部方法，處理重複播放邏輯）
   * @private
   */
  playBGM(bgmKey, options = {}) {
    const { fadeIn = true, force = false } = options;

    // 如果正在播放相同的 BGM，且不強制重新播放，則不做處理
    if (!force && this.currentBGMKey === bgmKey && this.audioManager.currentBGM?.isPlaying) {
      console.log(`BGM "${bgmKey}" 已在播放中，跳過`);
      return;
    }

    // 停止當前 BGM（如果有）
    // 當 force=true 或 BGM key 不同時，都需要停止當前 BGM
    if (this.audioManager.currentBGM && (force || this.currentBGMKey !== bgmKey)) {
      this.audioManager.stopBGM(true); // 淡出停止
    }

    // 播放新 BGM
    console.log(`🎵 播放 BGM: ${bgmKey}${fadeIn ? ' (淡入)' : ''}`);
    const result = this.audioManager.playBGM(bgmKey, { loop: true, fadeIn });

    if (result) {
      this.currentBGMKey = bgmKey;
    } else {
      console.warn(`⚠️  BGM "${bgmKey}" 播放失敗（可能音樂已禁用或資源未載入）`);
    }
  }

  /**
   * 停止 BGM
   * @param {boolean} fadeOut - 是否淡出
   */
  stopBGM(fadeOut = true) {
    if (this.audioManager.currentBGM) {
      console.log(`🔇 停止 BGM${fadeOut ? ' (淡出)' : ''}`);
      this.audioManager.stopBGM(fadeOut);
      this.currentBGMKey = null;
    }
  }

  /**
   * 暫停 BGM
   */
  pauseBGM() {
    this.audioManager.pauseBGM();
  }

  /**
   * 恢復 BGM
   */
  resumeBGM() {
    this.audioManager.resumeBGM();
  }

  /**
   * 獲取當前 BGM 狀態
   */
  getStatus() {
    return {
      currentBGMKey: this.currentBGMKey,
      isPlaying: this.audioManager.currentBGM?.isPlaying || false,
      audioManagerStatus: this.audioManager.getStatus()
    };
  }

  /**
   * 獲取場景配置
   */
  getSceneConfig() {
    return { ...this.sceneBGMConfig };
  }

  /**
   * 獲取故事配置
   */
  getStoryConfig() {
    return { ...this.storyBGMConfig };
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BGMController;
}
