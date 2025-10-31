/**
 * BGMController 測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const BGMController = require('../src/managers/BGMController.js');

describe('BGMController', () => {
  let mockAudioManager;
  let bgmController;

  beforeEach(() => {

    // 創建 mock AudioManager
    mockAudioManager = {
      setScene: vi.fn(),
      playBGM: vi.fn((key, config) => {
        return { isPlaying: true }; // 模擬成功播放
      }),
      stopBGM: vi.fn(),
      pauseBGM: vi.fn(),
      resumeBGM: vi.fn(),
      currentBGM: null,
      getStatus: vi.fn(() => ({
        bgmPlaying: false,
        bgmKey: null,
        musicEnabled: true,
        sfxEnabled: true
      }))
    };

    // 創建 BGMController 實例
    bgmController = new BGMController(mockAudioManager);
  });

  describe('初始化', () => {
    it('應該正確初始化 BGMController', () => {
      expect(bgmController.audioManager).toBe(mockAudioManager);
      expect(bgmController.currentBGMKey).toBeNull();
      expect(bgmController.sceneBGMConfig).toBeDefined();
      expect(bgmController.storyBGMConfig).toBeDefined();
    });

    it('應該有預設的場景 BGM 配置', () => {
      expect(bgmController.sceneBGMConfig['MainMenuScene']).toBe('main-menu-bgm');
      expect(bgmController.sceneBGMConfig['StoryScene']).toBe('story-bgm');
      expect(bgmController.sceneBGMConfig['BattleScene']).toBe('battle-bgm');
    });

    it('應該有預設的故事 BGM 配置', () => {
      expect(bgmController.storyBGMConfig['opening']).toBe('intro-story-bgm');
      expect(bgmController.storyBGMConfig['chef_meeting']).toBe('story-bgm');
    });
  });

  describe('場景 BGM 播放', () => {
    let mockScene;

    beforeEach(() => {
      mockScene = {
        scene: { key: 'MainMenuScene' }
      };
    });

    it('應該播放場景對應的 BGM', () => {
      bgmController.playSceneBGM(mockScene, { fadeIn: true });

      expect(mockAudioManager.setScene).toHaveBeenCalledWith(mockScene);
      expect(mockAudioManager.playBGM).toHaveBeenCalledWith('main-menu-bgm', {
        loop: true,
        fadeIn: true
      });
      expect(bgmController.currentBGMKey).toBe('main-menu-bgm');
    });

    it('場景配置為 null 時應該停止 BGM', () => {
      mockScene.scene.key = 'SettingsScene';

      // 設置當前有 BGM 在播放
      mockAudioManager.currentBGM = { isPlaying: true };
      bgmController.currentBGMKey = 'some-bgm';

      bgmController.playSceneBGM(mockScene);

      expect(mockAudioManager.stopBGM).toHaveBeenCalledWith(true);
    });

    it('場景未配置時應該保持當前 BGM', () => {
      mockScene.scene.key = 'UnknownScene';
      const initialKey = bgmController.currentBGMKey;

      bgmController.playSceneBGM(mockScene);

      expect(bgmController.currentBGMKey).toBe(initialKey);
      expect(mockAudioManager.playBGM).not.toHaveBeenCalled();
    });
  });

  describe('故事 BGM 播放', () => {
    let mockScene;

    beforeEach(() => {
      mockScene = {
        scene: { key: 'StoryScene' }
      };
    });

    it('應該播放故事對應的 BGM', () => {
      bgmController.playStoryBGM('opening', mockScene, { fadeIn: true });

      expect(mockAudioManager.setScene).toHaveBeenCalledWith(mockScene);
      expect(mockAudioManager.playBGM).toHaveBeenCalledWith('intro-story-bgm', {
        loop: true,
        fadeIn: true
      });
      expect(bgmController.currentBGMKey).toBe('intro-story-bgm');
    });

    it('故事配置為 null 時應該停止 BGM', () => {
      bgmController.setStoryBGM('silent_story', null);

      // 設置當前有 BGM 在播放
      mockAudioManager.currentBGM = { isPlaying: true };
      bgmController.currentBGMKey = 'some-bgm';

      bgmController.playStoryBGM('silent_story', mockScene);

      expect(mockAudioManager.stopBGM).toHaveBeenCalledWith(true);
    });

    it('故事未配置時應該使用場景的預設 BGM', () => {
      bgmController.playStoryBGM('unknown_story', mockScene, { fadeIn: true });

      // 應該回退到場景 BGM（StoryScene -> story-bgm）
      expect(mockAudioManager.playBGM).toHaveBeenCalledWith('story-bgm', {
        loop: true,
        fadeIn: true
      });
    });
  });

  describe('節點 BGM 播放', () => {
    let mockScene;

    beforeEach(() => {
      mockScene = {
        scene: { key: 'StoryScene' }
      };
    });

    it('應該播放節點指定的 BGM', () => {
      bgmController.playNodeBGM('battle-bgm', mockScene, { fadeIn: true });

      expect(mockAudioManager.setScene).toHaveBeenCalledWith(mockScene);
      expect(mockAudioManager.playBGM).toHaveBeenCalledWith('battle-bgm', {
        loop: true,
        fadeIn: true
      });
      expect(bgmController.currentBGMKey).toBe('battle-bgm');
    });

    it('節點指定 null 時應該停止 BGM', () => {
      // 設置當前有 BGM 在播放
      mockAudioManager.currentBGM = { isPlaying: true };
      bgmController.currentBGMKey = 'some-bgm';

      bgmController.playNodeBGM(null, mockScene);

      expect(mockAudioManager.stopBGM).toHaveBeenCalledWith(true);
    });

    it('節點 BGM 預設強制播放', () => {
      // 先設置一個當前 BGM
      mockAudioManager.currentBGM = { isPlaying: true };
      bgmController.currentBGMKey = 'story-bgm';

      // 播放節點 BGM（即使是相同的 BGM）
      bgmController.playNodeBGM('story-bgm', mockScene);

      // 應該強制重新播放（因為 force: true）
      expect(mockAudioManager.playBGM).toHaveBeenCalled();
    });
  });

  describe('避免重複播放', () => {
    let mockScene;

    beforeEach(() => {
      mockScene = {
        scene: { key: 'MainMenuScene' }
      };
      mockAudioManager.currentBGM = { isPlaying: true };
    });

    it('已在播放相同 BGM 時應該跳過', () => {
      bgmController.currentBGMKey = 'main-menu-bgm';

      bgmController.playSceneBGM(mockScene);

      // 應該跳過播放（因為已經在播放相同的 BGM）
      expect(mockAudioManager.playBGM).not.toHaveBeenCalled();
    });

    it('force: true 時應該強制重新播放', () => {
      bgmController.currentBGMKey = 'main-menu-bgm';

      // 先設置一個不同的 BGM 在播放，然後強制重新播放相同的 BGM
      mockAudioManager.currentBGM = { isPlaying: true };

      bgmController.playSceneBGM(mockScene, { force: true });

      // 即使是相同的 BGM，也應該重新播放
      expect(mockAudioManager.stopBGM).toHaveBeenCalled();
      expect(mockAudioManager.playBGM).toHaveBeenCalled();
    });
  });

  describe('配置管理', () => {
    it('應該能設置場景 BGM', () => {
      bgmController.setSceneBGM('CustomScene', 'custom-bgm');

      expect(bgmController.sceneBGMConfig['CustomScene']).toBe('custom-bgm');
    });

    it('應該能設置故事 BGM', () => {
      bgmController.setStoryBGM('custom_story', 'custom-story-bgm');

      expect(bgmController.storyBGMConfig['custom_story']).toBe('custom-story-bgm');
    });

    it('應該能獲取場景配置', () => {
      const config = bgmController.getSceneConfig();

      expect(config).toEqual(bgmController.sceneBGMConfig);
      expect(config).not.toBe(bgmController.sceneBGMConfig); // 應該是副本
    });

    it('應該能獲取故事配置', () => {
      const config = bgmController.getStoryConfig();

      expect(config).toEqual(bgmController.storyBGMConfig);
      expect(config).not.toBe(bgmController.storyBGMConfig); // 應該是副本
    });
  });

  describe('手動控制', () => {
    it('應該能停止 BGM', () => {
      mockAudioManager.currentBGM = { isPlaying: true };
      bgmController.currentBGMKey = 'main-menu-bgm';

      bgmController.stopBGM(true);

      expect(mockAudioManager.stopBGM).toHaveBeenCalledWith(true);
      expect(bgmController.currentBGMKey).toBeNull();
    });

    it('應該能暫停 BGM', () => {
      bgmController.pauseBGM();

      expect(mockAudioManager.pauseBGM).toHaveBeenCalled();
    });

    it('應該能恢復 BGM', () => {
      bgmController.resumeBGM();

      expect(mockAudioManager.resumeBGM).toHaveBeenCalled();
    });
  });

  describe('狀態查詢', () => {
    it('應該能獲取 BGM 狀態', () => {
      bgmController.currentBGMKey = 'main-menu-bgm';
      mockAudioManager.currentBGM = { isPlaying: true };

      const status = bgmController.getStatus();

      expect(status.currentBGMKey).toBe('main-menu-bgm');
      expect(status.isPlaying).toBe(true);
      expect(status.audioManagerStatus).toBeDefined();
    });

    it('沒有 BGM 播放時應該回報正確狀態', () => {
      const status = bgmController.getStatus();

      expect(status.currentBGMKey).toBeNull();
      expect(status.isPlaying).toBe(false);
    });
  });
});
