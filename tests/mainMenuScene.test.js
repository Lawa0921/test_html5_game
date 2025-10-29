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
      mock.setPlaybackRate = vi.fn().mockReturnThis();
      mock.setDisplaySize = vi.fn().mockReturnThis();
      mock.width = 1920;
      mock.height = 1080;
      return mock;
    };

    this.add = {
      image: vi.fn(() => createChainableMock()),
      text: vi.fn(() => createChainableMock()),
      rectangle: vi.fn(() => createChainableMock()),
      video: vi.fn(() => createVideoMock())
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
      stop: vi.fn()
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

      const titleCall = scene.add.text.mock.calls.find(call =>
        call[2] && typeof call[2] === 'string' && call[2].includes('客棧')
      );

      expect(titleCall).toBeDefined();
    });
  });

  // ==================== 菜單按鈕 ====================

  describe('菜單按鈕', () => {
    it('應該創建 4 個菜單按鈕', () => {
      scene.create();

      expect(scene.menuButtons).toBeDefined();
      expect(scene.menuButtons.length).toBe(4);
    });

    it('應該創建「開啟新遊戲」按鈕', () => {
      scene.create();

      const newGameButton = scene.menuButtons.find(btn =>
        btn.text === '開啟新遊戲' || btn.text === '新遊戲'
      );

      expect(newGameButton).toBeDefined();
    });

    it('應該創建「讀取遊戲」按鈕', () => {
      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '讀取遊戲' || btn.text === '讀取'
      );

      expect(loadButton).toBeDefined();
    });

    it('應該創建「選項」按鈕', () => {
      scene.create();

      const optionsButton = scene.menuButtons.find(btn =>
        btn.text === '選項' || btn.text === '設置'
      );

      expect(optionsButton).toBeDefined();
    });

    it('應該創建「退出」按鈕', () => {
      scene.create();

      const exitButton = scene.menuButtons.find(btn =>
        btn.text === '退出' || btn.text === '離開'
      );

      expect(exitButton).toBeDefined();
    });
  });

  // ==================== 按鈕交互 ====================

  describe('按鈕交互', () => {
    it('點擊「開啟新遊戲」應該啟動開場劇情場景', () => {
      scene.create();

      const newGameButton = scene.menuButtons.find(btn =>
        btn.text === '開啟新遊戲' || btn.text === '新遊戲'
      );

      newGameButton.callback();

      expect(scene.scene.start).toHaveBeenCalledWith('IntroStoryScene');
    });

    it('點擊「讀取遊戲」應該啟動讀取場景', () => {
      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '讀取遊戲' || btn.text === '讀取'
      );

      loadButton.callback();

      expect(scene.scene.start).toHaveBeenCalledWith('LoadGameScene');
    });

    it('點擊「選項」應該啟動選項場景', () => {
      scene.create();

      const optionsButton = scene.menuButtons.find(btn =>
        btn.text === '選項' || btn.text === '設置'
      );

      optionsButton.callback();

      expect(scene.scene.start).toHaveBeenCalledWith('OptionsScene');
    });

    it('點擊「退出」應該關閉遊戲', () => {
      // Mock window.close
      global.window = global.window || {};
      const originalClose = global.window.close;
      global.window.close = vi.fn();

      scene.create();

      const exitButton = scene.menuButtons.find(btn =>
        btn.text === '退出' || btn.text === '離開'
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
      expect(button.hoverTint).toBeDefined();
    });
  });

  // ==================== 存檔檢查 ====================

  describe('存檔檢查', () => {
    it('如果沒有存檔，「讀取遊戲」按鈕應該禁用', () => {
      scene.registry.get.mockReturnValue(null);
      scene.hasSaveFiles = vi.fn().mockReturnValue(false);

      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '讀取遊戲' || btn.text === '讀取'
      );

      expect(loadButton.disabled).toBe(true);
    });

    it('如果有存檔，「讀取遊戲」按鈕應該啟用', () => {
      scene.hasSaveFiles = vi.fn().mockReturnValue(true);

      scene.create();

      const loadButton = scene.menuButtons.find(btn =>
        btn.text === '讀取遊戲' || btn.text === '讀取'
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
