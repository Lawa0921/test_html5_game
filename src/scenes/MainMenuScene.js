/**
 * MainMenuScene - 主菜單場景
 *
 * 遊戲的主入口，提供以下功能：
 * - 開啟新遊戲：開始新的遊戲進度
 * - 讀取遊戲：從存檔繼續遊戲
 * - 選項：調整遊戲設置
 * - 退出：關閉遊戲
 */

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
    this.menuButtons = [];
  }

  create() {
    const { width, height } = this.game.config;
    const centerX = width / 2;
    const centerY = height / 2;

    // 獲取 AudioManager 並播放主選單音樂
    const audioManager = this.registry.get('audioManager');
    if (audioManager) {
      // 播放主選單 BGM（循環播放）
      audioManager.playBGM('main-menu-bgm', true);
    }

    // 淡入效果
    this.cameras.main.fadeIn(1000);

    // 黑色背景
    this.add.rectangle(centerX, centerY, width, height, 0x000000);

    // 背景影片（0.7 倍速、無限循環）
    const bgVideo = this.add.video(centerX, centerY, 'menu-background-video');

    // 簡單直接：先啟動播放，然後設置尺寸
    bgVideo.play(true); // 循環播放
    bgVideo.setPlaybackRate(0.7); // 0.7 倍速播放

    // 延遲一小段時間後設置縮放（給影片時間載入尺寸資訊）
    this.time.delayedCall(100, () => {
      if (bgVideo.width > 0 && bgVideo.height > 0) {
        const scaleX = width / bgVideo.width;
        const scaleY = height / bgVideo.height;
        const scale = Math.max(scaleX, scaleY);
        bgVideo.setScale(scale);
        console.log(`影片縮放: ${scale.toFixed(3)}x (${bgVideo.width}x${bgVideo.height} → ${width}x${height})`);
      } else {
        console.warn('影片尺寸未就緒，使用備用方案');
        // 備用方案：直接設置顯示尺寸
        bgVideo.setDisplaySize(width, height);
      }
    });

    // 遊戲標題
    this.add.text(centerX, 150, '客棧物語', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);

    // 副標題
    this.add.text(centerX, 220, '經營你的夢想客棧', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 檢查是否有存檔
    const hasSaves = this.hasSaveFiles();

    // 創建菜單按鈕
    const buttonY = 320;
    const buttonSpacing = 80;

    const buttons = [
      { text: '開啟新遊戲', action: () => this.startNewGame(), enabled: true },
      { text: '讀取遊戲', action: () => this.loadGame(), enabled: hasSaves },
      { text: '選項', action: () => this.openOptions(), enabled: true },
      { text: '退出', action: () => this.exitGame(), enabled: true }
    ];

    buttons.forEach((buttonData, index) => {
      const y = buttonY + index * buttonSpacing;
      const button = this.createMenuButton(centerX, y, buttonData.text, buttonData.action, buttonData.enabled);
      this.menuButtons.push(button);
    });

    // 版本信息
    this.add.text(width - 20, height - 20, 'v0.1.0', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(1, 1);

    // 版權信息
    this.add.text(centerX, height - 20, '© 2025 RPG Game. All rights reserved.', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5, 1);
  }

  /**
   * 創建菜單按鈕
   */
  createMenuButton(x, y, text, callback, enabled = true) {
    const buttonWidth = 300;
    const buttonHeight = 60;

    // 按鈕背景
    const bg = this.add.rectangle(x, y, buttonWidth, buttonHeight, enabled ? 0x4a4a4a : 0x2a2a2a)
      .setStrokeStyle(2, enabled ? 0xffffff : 0x666666);

    // 按鈕文字
    const label = this.add.text(x, y, text, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: enabled ? '#FFFFFF' : '#666666',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const button = {
      bg,
      label,
      text,
      callback,
      enabled,
      disabled: !enabled,
      hoverTint: 0x6a6a6a,
      normalTint: 0x4a4a4a
    };

    if (enabled) {
      // 互動效果
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerover', () => {
        bg.setFillStyle(button.hoverTint);
        label.setScale(1.05);
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(button.normalTint);
        label.setScale(1);
      });

      bg.on('pointerdown', () => {
        label.setScale(0.95);
      });

      bg.on('pointerup', () => {
        label.setScale(1.05);
        callback();
      });
    }

    return button;
  }

  /**
   * 檢查是否有存檔文件
   */
  hasSaveFiles() {
    // 從 registry 獲取 SaveManager
    const saveManager = this.registry.get('saveManager');

    if (!saveManager) {
      return false;
    }

    // 檢查是否有任何存檔
    const saves = saveManager.listSaves();
    return saves && saves.length > 0;
  }

  /**
   * 停止主選單音樂（帶淡出效果）
   */
  stopMenuMusic() {
    const audioManager = this.registry.get('audioManager');
    if (audioManager) {
      audioManager.stopBGM(true); // 淡出停止
    }
  }

  /**
   * 開始新遊戲
   */
  startNewGame() {
    // 停止主選單音樂
    this.stopMenuMusic();

    // 淡出效果
    this.cameras.main.fadeOut(500);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // 清空現有遊戲狀態
      this.registry.set('gameState', null);

      // 啟動開場劇情場景
      this.scene.start('IntroStoryScene');
    });
  }

  /**
   * 讀取遊戲
   */
  loadGame() {
    // 停止主選單音樂
    this.stopMenuMusic();

    this.cameras.main.fadeOut(500);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LoadGameScene');
    });
  }

  /**
   * 打開選項
   */
  openOptions() {
    // 不停止音樂，因為設定頁面可能會調整音量
    this.cameras.main.fadeOut(500);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('OptionsScene');
    });
  }

  /**
   * 退出遊戲
   */
  exitGame() {
    // 在 Electron 環境中關閉窗口
    if (typeof window !== 'undefined' && window.close) {
      window.close();
    } else {
      // 在瀏覽器中顯示提示
      alert('請關閉瀏覽器標籤頁');
    }
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainMenuScene;
}
