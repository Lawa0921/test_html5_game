/**
 * BootScene - 資源預載場景
 *
 * 負責載入遊戲啟動所需的所有基礎資源
 * 包含載入進度顯示
 */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
    console.log('🎬 BootScene constructor 被調用');
  }

  init() {
    console.log('🎬 BootScene init 開始');
  }

  preload() {
    console.log('📦 BootScene preload 開始');

    const { width, height } = this.game.config;
    const centerX = width / 2;
    const centerY = height / 2;

    console.log(`   螢幕尺寸: ${width}x${height}`);

    // 黑色背景
    this.cameras.main.setBackgroundColor('#000000');

    // 載入提示文字
    const loadingText = this.add.text(centerX, centerY - 50, '載入遊戲資源...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 載入進度條背景
    const progressBarWidth = 400;
    const progressBarHeight = 30;
    const progressBarX = centerX - progressBarWidth / 2;
    const progressBarY = centerY;

    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x222222);
    progressBg.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    // 載入進度條
    const progressBar = this.add.graphics();

    // 百分比文字
    const percentText = this.add.text(centerX, centerY + 50, '0%', {
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // 檔案名稱文字
    const fileText = this.add.text(centerX, centerY + 90, '', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    // 監聽載入進度
    this.load.on('progress', (value) => {
      // 更新進度條
      progressBar.clear();
      progressBar.fillStyle(0xffd700);
      progressBar.fillRect(
        progressBarX + 2,
        progressBarY + 2,
        (progressBarWidth - 4) * value,
        progressBarHeight - 4
      );

      // 更新百分比
      percentText.setText(Math.floor(value * 100) + '%');
    });

    // 監聽檔案載入
    this.load.on('fileprogress', (file) => {
      fileText.setText('載入: ' + file.key);
    });

    // 載入完成
    this.load.on('complete', () => {
      loadingText.setText('載入完成！');
      fileText.setText('');
      progressBar.destroy();
      progressBg.destroy();
    });

    // ===== 載入 SplashScene 需要的資源 =====
    console.log('📦 載入啟動畫面資源...');
    console.log('   - 影片: assets/videos/splash-intro.mp4');
    console.log('   - Logo: assets/ui/branding/game-logo.png');

    // 載入啟動影片
    this.load.video('intro-video', 'assets/videos/splash-intro.mp4', 'loadeddata', false, true);

    // 載入遊戲 logo
    this.load.image('game-logo', 'assets/ui/branding/game-logo.png');

    // ===== 載入 MainMenuScene 需要的資源 =====
    console.log('📦 載入主選單資源...');
    console.log('   - 背景影片: assets/videos/menu-background.mp4');

    // 載入主選單背景影片
    this.load.video('menu-background-video', 'assets/videos/menu-background.mp4', 'loadeddata', false, true);

    // ===== 載入 BGM 音樂資源 =====
    console.log('📦 載入 BGM 音樂資源...');

    // 主選單音樂
    this.load.audio('main-menu-bgm', 'assets/audio/bgm/main-menu.mp3');
    console.log('   ✓ 主選單 BGM');

    // 故事場景音樂
    this.load.audio('story-bgm', 'assets/audio/bgm/bgm_story.wav');
    this.load.audio('intro-story-bgm', 'assets/audio/bgm/intro-story.mp3');
    console.log('   ✓ 故事場景 BGM');

    // 戰鬥音樂
    this.load.audio('battle-bgm', 'assets/audio/bgm/bgm_battle.wav');
    console.log('   ✓ 戰鬥 BGM');

    // 客棧場景音樂
    this.load.audio('inn-day-bgm', 'assets/audio/bgm/bgm_inn_day.wav');
    this.load.audio('inn-night-bgm', 'assets/audio/bgm/bgm_inn_night.wav');
    this.load.audio('day-operation-bgm', 'assets/audio/bgm/day-operation.mp3');
    this.load.audio('night-time-bgm', 'assets/audio/bgm/night-time.mp3');
    console.log('   ✓ 客棧場景 BGM');

    // 城鎮音樂
    this.load.audio('town-bgm', 'assets/audio/bgm/bgm_town.wav');
    console.log('   ✓ 城鎮 BGM');

    // 其他系統音樂
    this.load.audio('settlement-bgm', 'assets/audio/bgm/settlement.mp3');
    this.load.audio('work-assignment-bgm', 'assets/audio/bgm/work-assignment.mp3');
    console.log('   ✓ 系統 BGM');

    // ===== 載入音效資源 =====
    console.log('📦 載入音效資源...');
    this.load.audio('click', 'assets/audio/sfx/click.mp3');
    this.load.audio('confirm', 'assets/audio/sfx/confirm.mp3');
    this.load.audio('cancel', 'assets/audio/sfx/cancel.mp3');
    this.load.audio('coin', 'assets/audio/sfx/coin.mp3');
    this.load.audio('notification', 'assets/audio/sfx/notification.mp3');
    this.load.audio('level-up', 'assets/audio/sfx/level-up.mp3');
    this.load.audio('affection-up', 'assets/audio/sfx/affection-up.mp3');
    this.load.audio('cooking', 'assets/audio/sfx/cooking.mp3');
    this.load.audio('guest-arrive', 'assets/audio/sfx/guest-arrive.mp3');
    this.load.audio('guest-leave', 'assets/audio/sfx/guest-leave.mp3');
    console.log('   ✓ UI 音效與遊戲音效');

    // ===== 載入 UI 圖片資源 =====
    console.log('📦 載入 UI 資源...');
    console.log('   - 遊戲 Logo: assets/ui/branding/game-logo.png');
    console.log('   - 歸雁棧 Logo: assets/ui/branding/guiyan-inn-logo.png');
    this.load.image('game-logo', 'assets/ui/branding/game-logo.png');
    this.load.image('guiyan-inn-logo', 'assets/ui/branding/guiyan-inn-logo.png');

    // ===== 載入場景背景圖片 =====
    console.log('📦 載入場景背景...');
    console.log('   - 客棧大廳: assets/scenes/lobby-interior.png');
    this.load.image('lobby-interior', 'assets/scenes/lobby-interior.png');
    console.log('   ✓ 場景背景');

    // ===== 其他基礎資源（可選） =====
    // 這裡可以載入更多通用資源，如 UI 元素、音效等
  }

  create() {
    console.log('✅ BootScene create 開始');
    console.log('✅ 資源載入完成');

    // 淡出後切換到 SplashScene
    console.log('🎬 準備切換到 SplashScene...');
    this.cameras.main.fadeOut(300, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      console.log('✅ 淡出完成，啟動 SplashScene');
      // 切換到啟動畫面
      this.scene.start('SplashScene');
    });
  }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BootScene;
}
