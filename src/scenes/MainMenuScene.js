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
    this.bgVideo = null; // 保存背景影片引用以便清理
  }

  create() {
    const { width, height } = this.game.config;
    const centerX = width / 2;
    const centerY = height / 2;

    // 獲取 AudioManager 並播放主選單音樂
    const audioManager = this.registry.get('audioManager');
    if (audioManager) {
      // 播放主選單 BGM（loop 默認為 true）
      audioManager.playBGM('main-menu-bgm', { fadeIn: true });
    }

    // 淡入效果
    this.cameras.main.fadeIn(1000);

    // 黑色背景
    this.add.rectangle(centerX, centerY, width, height, 0x000000);

    // 背景影片（0.7 倍速、無限循環）
    this.bgVideo = this.add.video(centerX, centerY, 'menu-background-video');

    // 設置循環播放和播放速度
    this.bgVideo.setLoop(true);
    this.bgVideo.setPlaybackRate(0.7);

    // 縮放影片的函數
    const scaleVideo = () => {
      const videoElement = this.bgVideo.video;

      if (videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        // 獲取原始影片尺寸
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        // 計算縮放比例以填滿螢幕（類似 CSS object-fit: cover）
        const scaleX = width / videoWidth;
        const scaleY = height / videoHeight;
        const scale = Math.max(scaleX, scaleY);

        // 使用 setScale 而不是 setDisplaySize，保持長寬比
        this.bgVideo.setScale(scale);

        console.log(`背景影片縮放: ${scale.toFixed(3)}x (原始: ${videoWidth}x${videoHeight} → 顯示: ${(videoWidth * scale).toFixed(0)}x${(videoHeight * scale).toFixed(0)})`);
        return true;
      }
      return false;
    };

    // 監聽 HTML5 video 元素的 loadedmetadata 事件
    this.bgVideo.video.addEventListener('loadedmetadata', () => {
      console.log('主選單影片元數據已加載');
      scaleVideo();
    });

    // 立即播放以觸發 texture 載入
    this.bgVideo.play(true);

    // 遊戲標題
    this.add.text(centerX, 150, '客棧物語', {
      fontSize: '72px',
      fontFamily: 'LXGW WenKai TC',
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
      fontFamily: 'LXGW WenKai TC',
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
      fontFamily: 'LXGW WenKai TC',
      color: '#888888'
    }).setOrigin(1, 1);

    // 版權信息
    this.add.text(centerX, height - 20, '© 2025 RPG Game. All rights reserved.', {
      fontSize: '14px',
      fontFamily: 'LXGW WenKai TC',
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
      fontFamily: 'LXGW WenKai TC',
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

  /**
   * 場景關閉時的清理
   */
  shutdown() {
    console.log('MainMenuScene shutdown - 清理資源');

    // 停止並銷毀背景影片
    if (this.bgVideo) {
      this.bgVideo.stop();
      this.bgVideo.destroy();
      this.bgVideo = null;
    }

    // 清理所有 Tweens（避免淡入淡出動畫累積）
    this.tweens.killAll();

    // 清理場景事件監聽器
    this.events.removeAllListeners();
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainMenuScene;
}
