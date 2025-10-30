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

    // 金色邊框 Graphics 物件
    const borderWidth = 8;
    const borderGraphics = this.add.graphics();

    // 繪製邊框的函數
    const drawBorder = () => {
      // 使用固定的影片尺寸計算（因為我們知道縮放是 0.5）
      // 假設原始影片尺寸，邊框應該基於縮放後的尺寸
      const videoElement = video.video;

      if (videoElement && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        // 獲取原始影片尺寸
        const originalWidth = videoElement.videoWidth;
        const originalHeight = videoElement.videoHeight;

        // 應用縮放
        const scale = 0.5;
        const scaledWidth = originalWidth * scale;
        const scaledHeight = originalHeight * scale;

        // 清除舊邊框並繪製新邊框
        borderGraphics.clear();
        borderGraphics.lineStyle(borderWidth, 0xFFD700);
        borderGraphics.strokeRect(
          centerX - scaledWidth / 2 - borderWidth / 2,
          centerY + 100 - scaledHeight / 2 - borderWidth / 2,
          scaledWidth + borderWidth,
          scaledHeight + borderWidth
        );

        console.log(`邊框繪製完成: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)} (原始: ${originalWidth}x${originalHeight})`);
        return true;
      }
      return false;
    };

    // 監聽 HTML5 video 元素的 loadedmetadata 事件
    video.video.addEventListener('loadedmetadata', () => {
      console.log('影片元數據已加載');
      drawBorder();
    });

    // 設置縮放並播放
    video.setScale(0.5);
    video.play(false);

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
