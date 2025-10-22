/**
 * 啟動場景 - 負責載入資源
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 創建載入進度條
        this.createLoadingBar();

        // TODO: 載入遊戲資源
        // this.load.image('hero', 'assets/sprites/hero.png');
        // this.load.image('enemy', 'assets/sprites/enemy.png');
        // this.load.audio('bgm', 'assets/audio/battle.mp3');

        // 暫時用 Phaser 的內建圖形代替
        console.log('Loading assets...');
    }

    create() {
        console.log('Assets loaded, starting game...');

        // 資源載入完成，切換到戰鬥場景
        this.scene.start('BattleScene');
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 進度條背景
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        // 載入文字
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: '載入中...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // 百分比文字
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // 載入進度事件
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });

        // 載入完成事件
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }
}

module.exports = BootScene;
