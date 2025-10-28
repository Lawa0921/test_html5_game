/**
 * OptionsScene - 選項設定場景
 *
 * 功能：
 * - 音頻設定（主音量、BGM、SFX）
 * - 顯示設定（解析度、全螢幕）
 * - 遊戲設定（語言、自動存檔）
 * - 按鍵設定
 * - 輔助功能設定
 */

class OptionsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OptionsScene' });

    // 當前選擇的標籤頁
    this.currentTab = 'audio';  // audio, display, gameplay, controls, accessibility

    // UI 元素
    this.tabButtons = [];
    this.contentContainers = [];
  }

  create() {
    // 獲取遊戲狀態和設定管理器
    this.gameState = window.gameState;
    this.settingsManager = this.gameState.settingsManager;
    this.audioManager = this.gameState.audioManager;

    // 創建背景
    this.createBackground();

    // 創建標題
    this.createTitle();

    // 創建標籤頁按鈕
    this.createTabButtons();

    // 創建內容區域
    this.createContentArea();

    // 創建底部按鈕
    this.createBottomButtons();

    // 顯示初始標籤頁
    this.showTab(this.currentTab);
  }

  /**
   * 創建背景
   */
  createBackground() {
    const { width, height } = this.cameras.main;

    // 背景圖片
    const bg = this.add.image(width / 2, height / 2, 'options-background');
    bg.setDisplaySize(width, height);

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);
  }

  /**
   * 創建標題
   */
  createTitle() {
    const { width } = this.cameras.main;

    const title = this.add.text(width / 2, 50, '遊戲設定', {
      fontFamily: 'Arial',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
  }

  /**
   * 創建標籤頁按鈕
   */
  createTabButtons() {
    const { width } = this.cameras.main;

    const tabs = [
      { key: 'audio', label: '音頻' },
      { key: 'display', label: '顯示' },
      { key: 'gameplay', label: '遊戲' },
      { key: 'controls', label: '按鍵' },
      { key: 'accessibility', label: '輔助' }
    ];

    const tabWidth = 140;
    const tabHeight = 50;
    const spacing = 10;
    const totalWidth = tabs.length * tabWidth + (tabs.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + tabWidth / 2;
    const y = 120;

    tabs.forEach((tab, index) => {
      const x = startX + index * (tabWidth + spacing);

      const button = this.createTabButton(x, y, tabWidth, tabHeight, tab.key, tab.label);
      this.tabButtons.push(button);
    });
  }

  /**
   * 創建單個標籤頁按鈕
   */
  createTabButton(x, y, width, height, key, label) {
    const container = this.add.container(x, y);

    // 按鈕背景
    const bg = this.add.rectangle(0, 0, width, height, 0x444444);
    bg.setStrokeStyle(2, 0xffffff);
    bg.setInteractive({ useHandCursor: true });

    // 按鈕文字
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    text.setOrigin(0.5);

    container.add([bg, text]);

    // 存儲引用
    container.setData('key', key);
    container.setData('bg', bg);
    container.setData('text', text);

    // 事件監聽
    bg.on('pointerover', () => {
      if (this.currentTab !== key) {
        bg.setFillStyle(0x555555);
      }
    });

    bg.on('pointerout', () => {
      if (this.currentTab !== key) {
        bg.setFillStyle(0x444444);
      }
    });

    bg.on('pointerdown', () => {
      this.showTab(key);
      this.playUISound('click');
    });

    return container;
  }

  /**
   * 創建內容區域
   */
  createContentArea() {
    const { width, height } = this.cameras.main;

    // 內容背景
    const contentBg = this.add.rectangle(
      width / 2,
      (height - 120) / 2 + 170,
      width - 100,
      height - 340,
      0x222222,
      0.9
    );
    contentBg.setStrokeStyle(2, 0x666666);

    // 創建各個標籤頁的內容容器
    this.audioContent = this.createAudioContent();
    this.displayContent = this.createDisplayContent();
    this.gameplayContent = this.createGameplayContent();
    this.controlsContent = this.createControlsContent();
    this.accessibilityContent = this.createAccessibilityContent();

    this.contentContainers = {
      audio: this.audioContent,
      display: this.displayContent,
      gameplay: this.gameplayContent,
      controls: this.controlsContent,
      accessibility: this.accessibilityContent
    };
  }

  /**
   * 創建音頻設定內容
   */
  createAudioContent() {
    const { width } = this.cameras.main;
    const container = this.add.container(width / 2, 240);

    const settings = this.settingsManager.get('audio');
    let yOffset = 0;
    const lineHeight = 60;

    // 主音量
    this.createSlider(container, 0, yOffset, '主音量', settings.masterVolume, (value) => {
      this.audioManager.setMasterVolume(value);
    });
    yOffset += lineHeight;

    // BGM 音量
    this.createSlider(container, 0, yOffset, 'BGM 音量', settings.bgmVolume, (value) => {
      this.audioManager.setBGMVolume(value);
    });
    yOffset += lineHeight;

    // SFX 音量
    this.createSlider(container, 0, yOffset, 'SFX 音量', settings.sfxVolume, (value) => {
      this.audioManager.setSFXVolume(value);
    });
    yOffset += lineHeight;

    // 音樂開關
    yOffset += 20;
    this.createToggle(container, 0, yOffset, '啟用背景音樂', settings.musicEnabled, (value) => {
      this.settingsManager.set('audio', 'musicEnabled', value);
      if (value) {
        this.audioManager.resumeBGM();
      } else {
        this.audioManager.pauseBGM();
      }
    });
    yOffset += lineHeight;

    // 音效開關
    this.createToggle(container, 0, yOffset, '啟用音效', settings.sfxEnabled, (value) => {
      this.settingsManager.set('audio', 'sfxEnabled', value);
    });

    container.setVisible(false);
    return container;
  }

  /**
   * 創建顯示設定內容
   */
  createDisplayContent() {
    const { width } = this.cameras.main;
    const container = this.add.container(width / 2, 240);

    const settings = this.settingsManager.get('display');
    let yOffset = 0;
    const lineHeight = 60;

    // 解析度選擇
    this.createDropdown(
      container,
      0,
      yOffset,
      '解析度',
      settings.resolution,
      this.settingsManager.supportedResolutions,
      (value) => {
        this.settingsManager.setResolution(value);
        this.showMessage('解析度已更改，將在重啟後生效', 0xffaa00);
      }
    );
    yOffset += lineHeight;

    // 全螢幕開關
    yOffset += 20;
    this.createToggle(container, 0, yOffset, '全螢幕模式', settings.fullscreen, (value) => {
      this.settingsManager.set('display', 'fullscreen', value);
      this.toggleFullscreen(value);
    });
    yOffset += lineHeight;

    // 垂直同步
    this.createToggle(container, 0, yOffset, '垂直同步 (VSync)', settings.vsync, (value) => {
      this.settingsManager.set('display', 'vsync', value);
      this.showMessage('VSync 設定將在重啟後生效', 0xffaa00);
    });
    yOffset += lineHeight;

    // 顯示 FPS
    this.createToggle(container, 0, yOffset, '顯示 FPS', settings.showFPS, (value) => {
      this.settingsManager.set('display', 'showFPS', value);
      // TODO: 實際切換 FPS 顯示
    });

    container.setVisible(false);
    return container;
  }

  /**
   * 創建遊戲設定內容
   */
  createGameplayContent() {
    const { width } = this.cameras.main;
    const container = this.add.container(width / 2, 240);

    const settings = this.settingsManager.get('gameplay');
    let yOffset = 0;
    const lineHeight = 60;

    // 語言選擇
    const languages = this.settingsManager.supportedLanguages.map(lang => lang.code);
    this.createDropdown(
      container,
      0,
      yOffset,
      '語言',
      settings.language,
      languages,
      (value) => {
        this.settingsManager.setLanguage(value);
        this.showMessage('語言已更改，部分內容將在重啟後生效', 0xffaa00);
      }
    );
    yOffset += lineHeight;

    // 文字速度
    yOffset += 20;
    this.createSlider(container, 0, yOffset, '文字顯示速度', settings.textSpeed, (value) => {
      this.settingsManager.set('gameplay', 'textSpeed', value);
    });
    yOffset += lineHeight;

    // 自動存檔開關
    this.createToggle(container, 0, yOffset, '啟用自動存檔', settings.autoSaveEnabled, (value) => {
      this.settingsManager.set('gameplay', 'autoSaveEnabled', value);
    });
    yOffset += lineHeight;

    // 退出確認
    this.createToggle(container, 0, yOffset, '退出時確認', settings.confirmOnExit, (value) => {
      this.settingsManager.set('gameplay', 'confirmOnExit', value);
    });
    yOffset += lineHeight;

    // 工具提示
    this.createToggle(container, 0, yOffset, '顯示工具提示', settings.tooltipsEnabled, (value) => {
      this.settingsManager.set('gameplay', 'tooltipsEnabled', value);
    });

    container.setVisible(false);
    return container;
  }

  /**
   * 創建按鍵設定內容
   */
  createControlsContent() {
    const { width } = this.cameras.main;
    const container = this.add.container(width / 2, 240);

    const text = this.add.text(0, 0, '按鍵設定功能開發中...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    text.setOrigin(0.5);

    container.add(text);
    container.setVisible(false);
    return container;
  }

  /**
   * 創建輔助功能設定內容
   */
  createAccessibilityContent() {
    const { width } = this.cameras.main;
    const container = this.add.container(width / 2, 240);

    const settings = this.settingsManager.get('accessibility');
    let yOffset = 0;
    const lineHeight = 60;

    // 高對比度
    this.createToggle(container, 0, yOffset, '高對比度模式', settings.highContrast, (value) => {
      this.settingsManager.set('accessibility', 'highContrast', value);
    });
    yOffset += lineHeight;

    // 大字體
    this.createToggle(container, 0, yOffset, '大字體', settings.largeText, (value) => {
      this.settingsManager.set('accessibility', 'largeText', value);
      this.showMessage('字體設定將在重啟後生效', 0xffaa00);
    });
    yOffset += lineHeight;

    // 螢幕震動
    this.createToggle(container, 0, yOffset, '螢幕震動效果', settings.screenShake, (value) => {
      this.settingsManager.set('accessibility', 'screenShake', value);
    });
    yOffset += lineHeight;

    // 閃爍效果
    this.createToggle(container, 0, yOffset, '閃爍效果', settings.flashingEffects, (value) => {
      this.settingsManager.set('accessibility', 'flashingEffects', value);
    });

    container.setVisible(false);
    return container;
  }

  /**
   * 創建滑動條
   */
  createSlider(container, x, y, label, initialValue, onChange) {
    // 標籤
    const labelText = this.add.text(x - 250, y, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    labelText.setOrigin(0, 0.5);

    // 滑動條背景
    const sliderBg = this.add.rectangle(x + 80, y, 200, 10, 0x666666);

    // 滑動條填充
    const sliderFill = this.add.rectangle(x + 80 - 100, y, initialValue * 200, 10, 0x00ff00);
    sliderFill.setOrigin(0, 0.5);

    // 滑動按鈕
    const sliderThumb = this.add.circle(x + 80 - 100 + initialValue * 200, y, 12, 0xffffff);
    sliderThumb.setInteractive({ draggable: true, useHandCursor: true });

    // 數值顯示
    const valueText = this.add.text(x + 200, y, `${Math.round(initialValue * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    valueText.setOrigin(0, 0.5);

    // 拖動事件
    sliderThumb.on('drag', (pointer, dragX) => {
      const minX = x + 80 - 100;
      const maxX = x + 80 + 100;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);

      sliderThumb.x = clampedX;
      sliderFill.width = clampedX - minX;

      const value = (clampedX - minX) / 200;
      valueText.setText(`${Math.round(value * 100)}%`);

      onChange(value);
    });

    container.add([labelText, sliderBg, sliderFill, sliderThumb, valueText]);
  }

  /**
   * 創建開關
   */
  createToggle(container, x, y, label, initialValue, onChange) {
    // 標籤
    const labelText = this.add.text(x - 250, y, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    labelText.setOrigin(0, 0.5);

    // 開關背景
    const toggleBg = this.add.rectangle(x + 150, y, 60, 30, initialValue ? 0x00ff00 : 0x666666);
    toggleBg.setStrokeStyle(2, 0xffffff);
    toggleBg.setInteractive({ useHandCursor: true });

    // 開關按鈕
    const toggleThumb = this.add.circle(
      x + 150 + (initialValue ? 15 : -15),
      y,
      12,
      0xffffff
    );

    // 狀態文字
    const statusText = this.add.text(x + 200, y, initialValue ? '開' : '關', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    statusText.setOrigin(0, 0.5);

    // 點擊事件
    let isOn = initialValue;
    toggleBg.on('pointerdown', () => {
      isOn = !isOn;

      toggleBg.setFillStyle(isOn ? 0x00ff00 : 0x666666);
      toggleThumb.x = x + 150 + (isOn ? 15 : -15);
      statusText.setText(isOn ? '開' : '關');

      onChange(isOn);
      this.playUISound('click');
    });

    container.add([labelText, toggleBg, toggleThumb, statusText]);
  }

  /**
   * 創建下拉選單
   */
  createDropdown(container, x, y, label, initialValue, options, onChange) {
    // 標籤
    const labelText = this.add.text(x - 250, y, label, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    });
    labelText.setOrigin(0, 0.5);

    // 當前值顯示
    const valueBg = this.add.rectangle(x + 100, y, 200, 40, 0x444444);
    valueBg.setStrokeStyle(2, 0xffffff);
    valueBg.setInteractive({ useHandCursor: true });

    const valueText = this.add.text(x + 100, y, initialValue, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    });
    valueText.setOrigin(0.5);

    // 箭頭
    const arrow = this.add.text(x + 180, y, '▼', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    });
    arrow.setOrigin(0.5);

    // 點擊事件（簡化版：循環切換選項）
    let currentIndex = options.indexOf(initialValue);
    valueBg.on('pointerdown', () => {
      currentIndex = (currentIndex + 1) % options.length;
      const newValue = options[currentIndex];
      valueText.setText(newValue);
      onChange(newValue);
      this.playUISound('click');
    });

    container.add([labelText, valueBg, valueText, arrow]);
  }

  /**
   * 創建底部按鈕
   */
  createBottomButtons() {
    const { width, height } = this.cameras.main;

    // 重置按鈕
    const resetButton = this.createButton(width / 2 - 220, height - 60, 200, 50, '重置設定', () => {
      this.resetSettings();
    });

    // 應用按鈕
    const applyButton = this.createButton(width / 2, height - 60, 200, 50, '應用', () => {
      this.applySettings();
    });

    // 返回按鈕
    const backButton = this.createButton(width / 2 + 220, height - 60, 200, 50, '返回', () => {
      this.scene.start('MainMenuScene');
    });
  }

  /**
   * 創建按鈕
   */
  createButton(x, y, width, height, label, onClick) {
    const bg = this.add.rectangle(x, y, width, height, 0x4444ff);
    bg.setStrokeStyle(2, 0xffffff);
    bg.setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    });
    text.setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x5555ff));
    bg.on('pointerout', () => bg.setFillStyle(0x4444ff));
    bg.on('pointerdown', () => {
      onClick();
      this.playUISound('click');
    });

    return { bg, text };
  }

  /**
   * 顯示標籤頁
   */
  showTab(tabKey) {
    this.currentTab = tabKey;

    // 更新標籤頁按鈕樣式
    this.tabButtons.forEach(button => {
      const key = button.getData('key');
      const bg = button.getData('bg');

      if (key === tabKey) {
        bg.setFillStyle(0x666666);
      } else {
        bg.setFillStyle(0x444444);
      }
    });

    // 顯示/隱藏內容
    Object.keys(this.contentContainers).forEach(key => {
      this.contentContainers[key].setVisible(key === tabKey);
    });
  }

  /**
   * 重置設定
   */
  resetSettings() {
    this.settingsManager.resetToDefaults();
    this.showMessage('設定已重置為預設值', 0x66ff66);

    // 重新載入場景以顯示更新後的設定
    this.scene.restart();
  }

  /**
   * 應用設定
   */
  applySettings() {
    this.settingsManager.saveSettings();
    this.showMessage('設定已保存', 0x66ff66);
  }

  /**
   * 切換全螢幕
   */
  toggleFullscreen(enabled) {
    if (enabled) {
      if (this.scale.isFullscreen) return;
      this.scale.startFullscreen();
    } else {
      if (!this.scale.isFullscreen) return;
      this.scale.stopFullscreen();
    }
  }

  /**
   * 播放 UI 音效
   */
  playUISound(type) {
    if (this.audioManager) {
      this.audioManager.playUISound(type);
    }
  }

  /**
   * 顯示消息提示
   */
  showMessage(text, color = 0xffffff) {
    const { width, height } = this.cameras.main;

    // 移除舊消息
    if (this.currentMessage) {
      this.currentMessage.destroy();
    }

    const message = this.add.text(width / 2, height - 120, text, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    });
    message.setOrigin(0.5);

    if (color === 0x66ff66) {
      message.setBackgroundColor('#00aa00');
    } else if (color === 0xffaa00) {
      message.setBackgroundColor('#aa7700');
    }

    this.currentMessage = message;

    // 3秒後消失
    this.time.delayedCall(3000, () => {
      if (this.currentMessage === message) {
        message.destroy();
        this.currentMessage = null;
      }
    });
  }
}

// 導出場景類
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OptionsScene;
}
