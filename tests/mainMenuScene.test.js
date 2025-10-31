import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * MainMenuScene 測試
 *
 * 主菜單場景提供遊戲的入口點，包含：
 * - 開啟新遊戲：啟動開場劇情
 * - 讀取遊戲：顯示存檔列表
 * - 選項：遊戲設置
 * - 退出：關閉遊戲
 */

// Mock Phaser globally
global.Phaser = {
  Scene: class {
    constructor(config) {
      this.scene = { key: config?.key };
    }
  }
};

// Mock Phaser Scene
class MockScene {
  constructor() {
    // Mock 返回值需要支持鏈式調用
    const createChainableMock = () => {
      const mock = {
        setDisplaySize: vi.fn().mockReturnThis(),
        setOrigin: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        setTint: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis()
      };
      return mock;
    };

    // Mock video object
    const createVideoMock = () => {
      const mock = createChainableMock();
      mock.play = vi.fn().mockReturnThis();
      mock.setLoop = vi.fn().mockReturnThis(); // 添加 setLoop 方法
      mock.setMute = vi.fn().mockReturnThis(); // 添加 setMute 方法
      mock.setPlaybackRate = vi.fn().mockReturnThis();
      mock.setDisplaySize = vi.fn().mockReturnThis();
      mock.width = 1920;
      mock.height = 1080;
      // Mock video element
      mock.video = {
        addEventListener: vi.fn(),
        muted: false,
        volume: 1,
        videoWidth: 1920,
        videoHeight: 1080
      };
      return mock;
    };

    // Mock container
    const createContainerMock = () => {
      const mock = createChainableMock();
      mock.setVisible = vi.fn().mockReturnThis();
      mock.add = vi.fn().mockReturnThis();
      return mock;
    };

    // Mock graphics
    const createGraphicsMock = () => {
      const mock = createChainableMock();
      mock.fillStyle = vi.fn().mockReturnThis();
      mock.fillCircle = vi.fn().mockReturnThis();
      mock.fillEllipse = vi.fn().mockReturnThis();
      mock.setAlpha = vi.fn().mockReturnThis();
      mock.setBlendMode = vi.fn().mockReturnThis();
      return mock;
    };

    this.add = {
      image: vi.fn(() => createChainableMock()),
      text: vi.fn(() => createChainableMock()),
      rectangle: vi.fn(() => createChainableMock()),
      video: vi.fn(() => createVideoMock()),
      container: vi.fn(() => createContainerMock()),
      graphics: vi.fn(() => createGraphicsMock())
    };

    this.time = {
      delayedCall: vi.fn((delay, callback) => {
        // 立即執行回調以模擬延遲
        callback();
      })
    };
    this.scene = {
      start: vi.fn(),
      launch: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn()
    };
    this.input = {
      on: vi.fn()
    };
    this.registry = {
      get: vi.fn(),
      set: vi.fn()
    };
    this.game = {
      config: {
        width: 1280,
        height: 720
      }
    };
    this.cameras = {
      main: {
        fadeIn: vi.fn().mockReturnThis(),
        fadeOut: vi.fn().mockReturnThis(),
        once: vi.fn((event, callback) => {
          if (event === 'camerafadeincomplete' || event === 'camerafadeoutcomplete') {
            callback();
          }
        })
      }
    };
    this.tweens = {
      add: vi.fn(() => ({
        play: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn()
      })),
      killTweensOf: vi.fn()
    };
  }
}

describe('MainMenuScene', () => {
  let MainMenuScene;
  let scene;

  beforeEach(async () => {
    // 動態導入 MainMenuScene
    const module = await import('../src/scenes/MainMenuScene.js');
    MainMenuScene = module.default;

    scene = new MainMenuScene();

    // 模擬 Phaser 方法
    Object.assign(scene, new MockScene());
  });

  // ==================== 場景初始化 ====================

  describe('場景初始化', () => {
    it('應該有正確的場景 key', () => {
      expect(scene.constructor.name).toBe('MainMenuScene');
    });

    it('應該定義 create 方法', () => {
      expect(typeof scene.create).toBe('function');
    });

    it('應該在 create 時建立背景', () => {
      scene.create();

      // 背景現在使用影片而非圖片
      expect(scene.add.video).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        'menu-background-video'
      );
    });

    it('應該在 create 時建立標題', () => {
      scene.create();

      // 新版本使用 logo 圖片而非文字標題
      const logoCall = scene.add.image.mock.calls.find(call =>
        call[2] === 'guiyan-inn-logo'
      );

      expect(logoCall).toBeDefined();
    });
  });

  // ==================== 菜單按鈕 ====================

  describe('菜單按鈕', () => {
    it('應該創建 4 個菜單按鈕', () => {
      scene.create();

      expect(scene.menuButtons).toBeDefined();
      expect(scene.menuButtons.length).toBe(4);
    });

    it('應該創建「開張營業」按鈕', () => {
      scene.create();

      const newGameButton = scene.menuButtons.find(btn =>
        btn.text === '開張營業'
      );

      expect(newGameButton).toBeDefined();
    });

    it('應該創建「續掌櫃台」按鈕', () => {
      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '續掌櫃台'
      );

      expect(loadButton).toBeDefined();
    });

    it('應該創建「掌櫃手札」按鈕', () => {
      scene.create();

      const optionsButton = scene.menuButtons.find(btn =>
        btn.text === '掌櫃手札'
      );

      expect(optionsButton).toBeDefined();
    });

    it('應該創建「關門歇業」按鈕', () => {
      scene.create();

      const exitButton = scene.menuButtons.find(btn =>
        btn.text === '關門歇業'
      );

      expect(exitButton).toBeDefined();
    });
  });

  // ==================== 按鈕交互 ====================

  describe('按鈕交互', () => {
    it('點擊「開張營業」應該啟動開場劇情場景', () => {
      scene.create();

      const newGameButton = scene.menuButtons.find(btn =>
        btn.text === '開張營業'
      );

      newGameButton.callback();

      // 實際啟動的是 StoryScene，並傳入 opening 故事 ID
      expect(scene.scene.start).toHaveBeenCalledWith('StoryScene', expect.objectContaining({
        storyId: 'opening'
      }));
    });

    it('點擊「續掌櫃台」應該啟動讀取場景', () => {
      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '續掌櫃台'
      );

      loadButton.callback();

      expect(scene.scene.start).toHaveBeenCalledWith('LoadGameScene');
    });

    it('點擊「掌櫃手札」應該啟動設定場景', () => {
      scene.create();

      const optionsButton = scene.menuButtons.find(btn =>
        btn.text === '掌櫃手札'
      );

      optionsButton.callback();

      // openSettings 使用 pause + launch，不是 start
      expect(scene.scene.pause).toHaveBeenCalledWith('MainMenuScene');
      expect(scene.scene.launch).toHaveBeenCalledWith('SettingsScene', expect.objectContaining({
        returnScene: 'MainMenuScene'
      }));
    });

    it('點擊「關門歇業」應該關閉遊戲', () => {
      // Mock window.close
      global.window = global.window || {};
      const originalClose = global.window.close;
      global.window.close = vi.fn();

      scene.create();

      const exitButton = scene.menuButtons.find(btn =>
        btn.text === '關門歇業'
      );

      exitButton.callback();

      expect(global.window.close).toHaveBeenCalled();

      // 恢復
      if (originalClose === undefined) {
        delete global.window.close;
      } else {
        global.window.close = originalClose;
      }
    });
  });

  // ==================== 視覺效果 ====================

  describe('視覺效果', () => {
    it('應該在進入時有淡入效果', () => {
      scene.create();

      expect(scene.cameras.main.fadeIn).toHaveBeenCalled();
    });

    it('按鈕應該有懸停效果', () => {
      scene.create();

      const button = scene.menuButtons[0];
      // 新版本使用光暈效果
      expect(button.glowContainer).toBeDefined();
      expect(button.glowLayers).toBeDefined();
      expect(button.glowTweens).toBeDefined();
    });
  });

  // ==================== 存檔檢查 ====================

  describe('存檔檢查', () => {
    it('如果沒有存檔，「續掌櫃台」按鈕應該禁用', () => {
      scene.registry.get.mockReturnValue(null);
      scene.hasSaveFiles = vi.fn().mockReturnValue(false);

      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '續掌櫃台'
      );

      expect(loadButton.disabled).toBe(true);
    });

    it('如果有存檔，「續掌櫃台」按鈕應該啟用', () => {
      scene.hasSaveFiles = vi.fn().mockReturnValue(true);

      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '續掌櫃台'
      );

      expect(loadButton.disabled).toBeFalsy();
    });
  });

  // ==================== 版本信息 ====================

  describe('版本信息', () => {
    it('應該顯示遊戲版本號', () => {
      scene.create();

      const versionCall = scene.add.text.mock.calls.find(call =>
        call[2] && typeof call[2] === 'string' && call[2].includes('v0.')
      );

      expect(versionCall).toBeDefined();
    });
  });
});
