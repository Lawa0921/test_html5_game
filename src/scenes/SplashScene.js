/**
 * SplashScene - 遊戲啟動畫面場景
 * 顯示影片和 Logo
 */

class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashScene' });
  }

  init() {
    // 初始化
  }

  create() {
    const { width, height } = this.game.config;
    const centerX = width / 2;
    const centerY = height / 2;

    // 黑色背景
    this.cameras.main.setBackgroundColor('#000000');

    // Logo：螢幕中央往上 100px（更靠近影片）
    const logo = this.add.image(centerX, centerY - 100, 'game-logo');
    logo.setScale(0.35); // 加大 logo
    logo.setAlpha(0);

    // Logo 淡入
    this.tweens.add({
      targets: logo,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });

    // 影片：螢幕中央往下 100px
    const video = this.add.video(centerX, centerY + 100, 'intro-video');
    video.setScale(0.5);
    video.play(false);

    // 簡單的金色邊框（延遲繪製確保影片尺寸正確）
    const borderGraphics = this.add.graphics();
    const borderWidth = 8;

    this.time.delayedCall(50, () => {
      const videoWidth = video.displayWidth;
      const videoHeight = video.displayHeight;

      borderGraphics.lineStyle(borderWidth, 0xFFD700);
      borderGraphics.strokeRect(
        centerX - videoWidth / 2 - borderWidth / 2,
        centerY + 100 - videoHeight / 2 - borderWidth / 2,
        videoWidth + borderWidth,
        videoHeight + borderWidth
      );
    });

    // 影片結束後切換場景
    video.on('complete', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });

    // 點擊跳過
    this.input.once('pointerdown', () => {
      video.stop();
      this.cameras.main.fadeOut(200, 0, 0, 0);
    });
  }

}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SplashScene;
}
