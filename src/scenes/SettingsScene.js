/**
 * SettingsScene - 設定場景
 *
 * 提供遊戲設定介面：
 * - 音量控制（主音量、BGM、音效）
 * - 畫面設定（解析度、全螢幕）
 */

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });

    this.settingsManager = null;
    this.audioManager = null;

    // UI 元件
    this.sliders = {};
    this.buttons = {};
    this.texts = {};

    // 返回場景
    this.returnScene = 'MainMenuScene';
  }

  init(data) {
    // 記錄從哪個場景進入
    if (data && data.returnScene) {
      this.returnScene = data.returnScene;
    }
  }

  create() {
    // 獲取管理器
    this.settingsManager = this.registry.get('gameState').settingsManager;
    this.audioManager = this.registry.get('audioManager');

    // 設置背景
    this.createBackground();

    // 創建標題
    this.createTitle();

    // 創建音量設定區塊
    this.createAudioSettings();

    // 創建畫面設定區塊
    this.createDisplaySettings();

    // 創建底部按鈕
    this.createBottomButtons();

    // 鍵盤控制
    this.setupKeyboardControls();
  }

  /**
   * 創建背景
   */
  createBackground() {
    // 半透明黑色背景
    const bg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.85
    );

    // 主面板
    const panelWidth = 1200;
    const panelHeight = 800;
    const panel = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      panelWidth,
      panelHeight,
      0x1a1a1a,
      1
    );

    // 面板邊框
    const border = this.add.graphics();
    border.lineStyle(3, 0xd4af37, 1);
    border.strokeRect(
      this.cameras.main.centerX - panelWidth / 2,
      this.cameras.main.centerY - panelHeight / 2,
      panelWidth,
      panelHeight
    );
  }

  /**
   * 創建標題
   */
  createTitle() {
    const title = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 350,
      '遊戲設定',
      {
        fontSize: '48px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#d4af37',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
  }

  /**
   * 創建音量設定
   */
  createAudioSettings() {
    const startY = this.cameras.main.centerY - 250;
    const lineHeight = 100;

    // 區塊標題
    this.add.text(
      this.cameras.main.centerX - 500,
      startY,
      '音量設定',
      {
        fontSize: '32px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#ffffff'
      }
    );

    // 主音量
    this.createVolumeSlider(
      '主音量',
      'master',
      startY + 60,
      this.settingsManager.get('audio', 'masterVolume')
    );

    // BGM 音量
    this.createVolumeSlider(
      'BGM 音量',
      'bgm',
      startY + 60 + lineHeight,
      this.settingsManager.get('audio', 'bgmVolume')
    );

    // 音效音量
    this.createVolumeSlider(
      '音效音量',
      'sfx',
      startY + 60 + lineHeight * 2,
      this.settingsManager.get('audio', 'sfxVolume')
    );
  }

  /**
   * 創建音量滑桿
   */
  createVolumeSlider(label, type, y, initialValue) {
    const centerX = this.cameras.main.centerX;

    // 標籤
    this.add.text(
      centerX - 500,
      y,
      label,
      {
        fontSize: '24px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#ffffff'
      }
    );

    // 滑桿軌道
    const trackWidth = 400;
    const trackHeight = 6;
    const trackX = centerX - 50;

    const track = this.add.rectangle(
      trackX,
      y + 15,
      trackWidth,
      trackHeight,
      0x555555
    );

    // 滑桿填充（顯示當前值）
    const fill = this.add.rectangle(
      trackX - trackWidth / 2,
      y + 15,
      trackWidth * initialValue,
      trackHeight,
      0xd4af37
    ).setOrigin(0, 0.5);

    // 滑桿把手
    const handleSize = 24;
    const handle = this.add.circle(
      trackX - trackWidth / 2 + trackWidth * initialValue,
      y + 15,
      handleSize / 2,
      0xffffff
    ).setInteractive({ draggable: true, useHandCursor: true });

    // 數值顯示
    const valueText = this.add.text(
      centerX + 400,
      y,
      `${Math.round(initialValue * 100)}%`,
      {
        fontSize: '24px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#d4af37'
      }
    );

    // 拖曳事件
    handle.on('drag', (pointer, dragX) => {
      // 限制在軌道範圍內
      const minX = trackX - trackWidth / 2;
      const maxX = trackX + trackWidth / 2;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);

      handle.x = clampedX;

      // 更新填充寬度
      const fillWidth = clampedX - minX;
      fill.width = fillWidth;

      // 計算音量值（0-1）
      const volume = (clampedX - minX) / trackWidth;

      // 更新數值顯示
      valueText.setText(`${Math.round(volume * 100)}%`);

      // 更新設定
      this.updateVolume(type, volume);
    });

    // 點擊軌道直接跳到該位置
    track.setInteractive();
    track.on('pointerdown', (pointer) => {
      const localX = pointer.x;
      const minX = trackX - trackWidth / 2;
      const maxX = trackX + trackWidth / 2;
      const clampedX = Phaser.Math.Clamp(localX, minX, maxX);

      handle.x = clampedX;
      const fillWidth = clampedX - minX;
      fill.width = fillWidth;

      const volume = (clampedX - minX) / trackWidth;
      valueText.setText(`${Math.round(volume * 100)}%`);
      this.updateVolume(type, volume);
    });

    // 存儲元件引用
    this.sliders[type] = { handle, fill, valueText, track };
  }

  /**
   * 更新音量
   */
  updateVolume(type, volume) {
    switch (type) {
      case 'master':
        this.audioManager.setMasterVolume(volume);
        break;
      case 'bgm':
        this.audioManager.setBGMVolume(volume);
        break;
      case 'sfx':
        this.audioManager.setSFXVolume(volume);
        // 播放測試音效
        this.audioManager.playSFX('click');
        break;
    }
  }

  /**
   * 創建畫面設定
   */
  createDisplaySettings() {
    const startY = this.cameras.main.centerY + 100;
    const lineHeight = 80;

    // 區塊標題
    this.add.text(
      this.cameras.main.centerX - 500,
      startY,
      '畫面設定',
      {
        fontSize: '32px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#ffffff'
      }
    );

    // 解析度設定
    this.createResolutionSelector(startY + 60);

    // 全螢幕設定
    this.createFullscreenToggle(startY + 60 + lineHeight);
  }

  /**
   * 創建解析度選擇器
   */
  createResolutionSelector(y) {
    const centerX = this.cameras.main.centerX;

    // 標籤
    this.add.text(
      centerX - 500,
      y,
      '解析度',
      {
        fontSize: '24px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#ffffff'
      }
    );

    // 當前解析度
    const currentResolution = this.settingsManager.get('display', 'resolution');
    const resolutions = this.settingsManager.supportedResolutions;
    const currentIndex = resolutions.indexOf(currentResolution);

    // 左箭頭按鈕
    const leftArrow = this.add.text(
      centerX - 150,
      y,
      '◀',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#d4af37'
      }
    ).setInteractive({ useHandCursor: true });

    // 解析度顯示
    const resolutionText = this.add.text(
      centerX,
      y,
      currentResolution,
      {
        fontSize: '24px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#ffffff'
      }
    ).setOrigin(0.5, 0);

    // 右箭頭按鈕
    const rightArrow = this.add.text(
      centerX + 150,
      y,
      '▶',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#d4af37'
      }
    ).setInteractive({ useHandCursor: true });

    // 點擊事件
    leftArrow.on('pointerdown', () => {
      this.audioManager.playSFX('click');
      const currentIdx = resolutions.indexOf(resolutionText.text);
      const newIdx = (currentIdx - 1 + resolutions.length) % resolutions.length;
      const newResolution = resolutions[newIdx];
      resolutionText.setText(newResolution);
      this.updateResolution(newResolution);
    });

    rightArrow.on('pointerdown', () => {
      this.audioManager.playSFX('click');
      const currentIdx = resolutions.indexOf(resolutionText.text);
      const newIdx = (currentIdx + 1) % resolutions.length;
      const newResolution = resolutions[newIdx];
      resolutionText.setText(newResolution);
      this.updateResolution(newResolution);
    });

    // 懸停效果
    leftArrow.on('pointerover', () => leftArrow.setColor('#ffffff'));
    leftArrow.on('pointerout', () => leftArrow.setColor('#d4af37'));
    rightArrow.on('pointerover', () => rightArrow.setColor('#ffffff'));
    rightArrow.on('pointerout', () => rightArrow.setColor('#d4af37'));

    this.texts.resolution = resolutionText;
  }

  /**
   * 更新解析度
   */
  updateResolution(resolution) {
    // 更新設定
    this.settingsManager.setResolution(resolution);

    // 如果在 Electron 環境中，通知主進程
    if (typeof require !== 'undefined') {
      try {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('set-resolution', resolution);
      } catch (error) {
        console.log('瀏覽器模式：無法動態切換解析度');
      }
    }
  }

  /**
   * 創建全螢幕切換
   */
  createFullscreenToggle(y) {
    const centerX = this.cameras.main.centerX;

    // 標籤
    this.add.text(
      centerX - 500,
      y,
      '全螢幕',
      {
        fontSize: '24px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#ffffff'
      }
    );

    // 當前狀態
    const isFullscreen = this.settingsManager.get('display', 'fullscreen');

    // 切換按鈕（修正顯示邏輯：true 顯示"關閉"，false 顯示"開啟"）
    const toggleButton = this.add.text(
      centerX,
      y,
      isFullscreen ? '關閉' : '開啟',
      {
        fontSize: '24px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#d4af37',
        backgroundColor: '#333333',
        padding: { x: 30, y: 10 }
      }
    ).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    // 點擊事件
    toggleButton.on('pointerdown', () => {
      this.audioManager.playSFX('click');
      const newState = !this.settingsManager.get('display', 'fullscreen');
      toggleButton.setText(newState ? '關閉' : '開啟');
      this.updateFullscreen(newState);
    });

    // 懸停效果
    toggleButton.on('pointerover', () => {
      toggleButton.setBackgroundColor('#555555');
    });
    toggleButton.on('pointerout', () => {
      toggleButton.setBackgroundColor('#333333');
    });

    this.buttons.fullscreen = toggleButton;
  }

  /**
   * 更新全螢幕
   */
  updateFullscreen(fullscreen) {
    // 更新設定
    this.settingsManager.set('display', 'fullscreen', fullscreen);

    // 如果在 Electron 環境中，通知主進程
    if (typeof require !== 'undefined') {
      try {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('set-fullscreen', fullscreen);
      } catch (error) {
        console.log('瀏覽器模式：使用 F11 切換全螢幕');
      }
    }
  }

  /**
   * 創建底部按鈕
   */
  createBottomButtons() {
    const centerX = this.cameras.main.centerX;
    const y = this.cameras.main.centerY + 330;

    // 重置按鈕
    const resetButton = this.createButton(
      centerX - 250,
      y,
      '重置預設值',
      () => {
        this.resetSettings();
      }
    );

    // 套用並返回按鈕
    const applyButton = this.createButton(
      centerX + 80,
      y,
      '套用並返回',
      () => {
        this.applyAndReturn();
      }
    );

    // 返回按鈕
    const backButton = this.createButton(
      centerX + 350,
      y,
      '返回',
      () => {
        this.returnToPreviousScene();
      }
    );
  }

  /**
   * 創建按鈕輔助方法
   */
  createButton(x, y, text, callback) {
    const button = this.add.text(
      x,
      y,
      text,
      {
        fontSize: '24px',
        fontFamily: 'Arial, "Microsoft JhengHei", sans-serif',
        color: '#ffffff',
        backgroundColor: '#d4af37',
        padding: { x: 30, y: 15 }
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // 點擊事件
    button.on('pointerdown', () => {
      this.audioManager.playSFX('confirm');
      callback();
    });

    // 懸停效果
    button.on('pointerover', () => {
      button.setBackgroundColor('#e5c158');
      button.setScale(1.05);
    });
    button.on('pointerout', () => {
      button.setBackgroundColor('#d4af37');
      button.setScale(1);
    });

    return button;
  }

  /**
   * 重置設定
   */
  resetSettings() {
    // 重置音量和顯示設定
    this.settingsManager.resetCategory('audio');
    this.settingsManager.resetCategory('display');

    // 刷新場景
    this.scene.restart();
  }

  /**
   * 套用並返回
   */
  applyAndReturn() {
    // 設定已經實時保存，直接返回
    this.returnToPreviousScene();
  }

  /**
   * 返回上一個場景
   */
  returnToPreviousScene() {
    this.scene.stop('SettingsScene');
    this.scene.resume(this.returnScene);
  }

  /**
   * 設置鍵盤控制
   */
  setupKeyboardControls() {
    // ESC 返回
    this.input.keyboard.on('keydown-ESC', () => {
      this.returnToPreviousScene();
    });
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsScene;
}
