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

    // 播放背景音樂（使用 BGMController 統一管理）
    const bgmController = this.registry.get('bgmController');
    if (bgmController) {
      bgmController.playSceneBGM(this, { fadeIn: true });
    }

    // 相機淡入效果
    this.cameras.main.fadeIn(1000);

    // 黑色背景
    this.add.rectangle(centerX, centerY, width, height, 0x000000);

    // 背景影片（標準倍速、無限循環）
    this.bgVideo = this.add.video(centerX, centerY, 'menu-background-video');

    // 設置循環播放
    this.bgVideo.setLoop(true);

    // 明確靜音影片，防止影片音軌干擾 BGM
    this.bgVideo.setMute(true);

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

      // 雙重保險：確保底層 HTML5 video 元素也是靜音的
      this.bgVideo.video.muted = true;
      this.bgVideo.video.volume = 0;
      console.log('✅ 影片音軌已完全靜音');
    });

    // 立即播放以觸發 texture 載入
    this.bgVideo.play(true);

    // Logo 圖片（替換原本的文字標題和副標題）
    const logo = this.add.image(centerX, 200, 'guiyan-inn-logo');

    // 調整 logo 大小
    const logoScale = 0.5; // 調大 logo
    logo.setScale(logoScale);

    // 保持原色
    logo.setTint(0xffffff);

    // 檢查是否有存檔
    const hasSaves = this.hasSaveFiles();

    // 創建菜單按鈕（調整位置以配合 logo）
    const buttonY = 350; // 向下移動以留出 logo 空間
    const buttonSpacing = 80;

    const buttons = [
      { text: '開張營業', action: () => this.startNewGame(), enabled: true },
      { text: '續掌櫃台', action: () => this.loadGame(), enabled: hasSaves },
      { text: '掌櫃手札', action: () => this.openSettings(), enabled: true },
      { text: '關門歇業', action: () => this.exitGame(), enabled: true }
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
   * 創建菜單按鈕（帶光暈效果）
   */
  createMenuButton(x, y, text, callback, enabled = true) {
    // 光暈容器（在文字下層）
    const glowContainer = this.add.container(x, y);
    glowContainer.setVisible(false); // 預設隱藏

    // 創建多層光暈（5 層，由內到外遞減透明度）
    const glowLayers = [];
    const glowTweens = [];
    const layerCount = 5;

    for (let i = 0; i < layerCount; i++) {
      const layer = this.add.graphics();
      const alpha = 0.15 - (i * 0.02); // 透明度遞減
      const size = 220 - (i * 20);     // 尺寸遞減

      // 繪製橢圓形光暈
      layer.fillStyle(0xFFD700, alpha);
      layer.fillEllipse(0, 0, size, size * 0.4); // 扁平橢圓形

      glowContainer.add(layer);
      glowLayers.push(layer);

      // 為每層光暈創建延遲動畫（波紋效果）
      const tween = this.tweens.add({
        targets: layer,
        alpha: alpha + 0.25,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: i * 100 // 每層延遲 100ms
      });

      tween.pause(); // 預設暫停
      glowTweens.push(tween);
    }

    // 按鈕文字
    const label = this.add.text(x, y, text, {
      fontSize: '32px',
      fontFamily: 'LXGW WenKai TC',
      color: enabled ? '#FFFFFF' : '#666666',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const button = {
      glowContainer,
      glowLayers,
      glowTweens,
      label,
      text,
      callback,
      enabled,
      disabled: !enabled
    };

    if (enabled) {
      label.setInteractive({ useHandCursor: true });

      // 滑鼠懸停 - 顯示光暈並開始動畫
      label.on('pointerover', () => {
        label.setStyle({ color: '#FFD700' });
        glowContainer.setVisible(true);
        glowTweens.forEach(tween => tween.resume());
      });

      // 滑鼠離開 - 隱藏光暈並暫停動畫
      label.on('pointerout', () => {
        label.setStyle({ color: '#FFFFFF' });
        glowContainer.setVisible(false);
        glowTweens.forEach(tween => tween.pause());
      });

      // 點擊事件
      label.on('pointerup', () => {
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
      // 獲取遊戲狀態
      const gameState = this.registry.get('gameState');

      // 啟動開場劇情場景
      this.scene.start('StoryScene', {
        storyId: 'opening',
        gameState: gameState
      });
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
   * 打開設定
   */
  openSettings() {
    // 暫停當前場景（保持音樂播放）
    this.scene.pause('MainMenuScene');

    // 啟動設定場景（疊加顯示）
    this.scene.launch('SettingsScene', { returnScene: 'MainMenuScene' });
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

    // 清理所有按鈕的光暈資源
    if (this.menuButtons && this.menuButtons.length > 0) {
      this.menuButtons.forEach(button => {
        // 停止所有光暈 Tweens
        if (button.glowTweens && button.glowTweens.length > 0) {
          button.glowTweens.forEach(tween => {
            if (tween) tween.stop();
          });
          button.glowTweens = [];
        }

        // 銷毀光暈層 Graphics 物件
        if (button.glowLayers && button.glowLayers.length > 0) {
          button.glowLayers.forEach(layer => {
            if (layer) layer.destroy();
          });
          button.glowLayers = [];
        }

        // 銷毀光暈容器
        if (button.glowContainer) {
          button.glowContainer.destroy();
          button.glowContainer = null;
        }

        // 銷毀文字標籤
        if (button.label) {
          button.label.destroy();
          button.label = null;
        }
      });

      // 清空按鈕數組
      this.menuButtons = [];
      console.log('✅ 已清理所有按鈕資源');
    }

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

    console.log('✅ MainMenuScene 資源清理完成');
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainMenuScene;
}
