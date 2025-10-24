/**
 * 客棧外觀場景 - 小視窗模式（300x400）
 * 桌面寵物狀態
 */
const TimeManager = require('../managers/TimeManager');

class ExteriorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ExteriorScene' });
        this.gameState = null;
        this.timeManager = null;

        // UI 元素
        this.silverText = null;
        this.incomeText = null;
        this.timeText = null;
        this.innSprite = null;
    }

    init(data) {
        this.gameState = data.gameState;
        this.timeManager = data.timeManager;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 創建背景（佔位圖 - 未來替換為客棧外觀圖片）
        this.createPlaceholderBackground();

        // 創建客棧圖標（可點擊進入）
        this.createInnSprite();

        // 創建資訊顯示
        this.createInfoDisplay();

        // 設置點擊事件
        this.input.on('pointerdown', () => {
            this.expandToInterior();
        });

        // 監聽時間事件
        this.setupTimeListeners();
    }

    /**
     * 創建佔位背景
     */
    createPlaceholderBackground() {
        const { width, height } = this.cameras.main;

        // 漸變背景
        const graphics = this.add.graphics();

        // 根據時辰改變背景色
        const hour = this.timeManager.currentTime.hour.index;
        let color1, color2;

        if (hour >= 4 && hour < 8) {
            // 清晨 - 淺藍
            color1 = 0x87CEEB;
            color2 = 0xFFE4B5;
        } else if (hour >= 8 && hour < 17) {
            // 白天 - 天藍
            color1 = 0x87CEFA;
            color2 = 0xF0E68C;
        } else if (hour >= 17 && hour < 19) {
            // 傍晚 - 橙色
            color1 = 0xFF8C00;
            color2 = 0xFFDAB9;
        } else {
            // 夜晚 - 深藍
            color1 = 0x191970;
            color2 = 0x4B0082;
        }

        graphics.fillGradientStyle(color1, color1, color2, color2, 1);
        graphics.fillRect(0, 0, width, height - 80);

        // 地面
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(0, height - 80, width, 80);

        this.backgroundGraphics = graphics;
    }

    /**
     * 創建客棧精靈
     */
    createInnSprite() {
        const { width, height } = this.cameras.main;
        const hour = this.timeManager.currentTime.hour.index;

        // 佔位圖 - 簡單的房子形狀
        const innContainer = this.add.container(width / 2, height / 2 - 30);

        // 房子主體
        const houseBody = this.add.rectangle(0, 0, 180, 120, 0x8B4513);
        houseBody.setStrokeStyle(3, 0x654321);

        // 屋頂
        const roof = this.add.triangle(0, -60, 0, 0, 90, 60, -90, 60, 0xDC143C);
        roof.setStrokeStyle(3, 0x8B0000);

        // 門
        const door = this.add.rectangle(0, 30, 40, 60, 0x654321);
        door.setStrokeStyle(2, 0x000000);

        // 招牌
        const sign = this.add.rectangle(0, -100, 100, 30, 0x000000, 0.7);
        const signText = this.add.text(0, -100, '悅來客棧', {
            fontSize: '16px',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        signText.setOrigin(0.5);

        // 燈籠（根據時間顯示）
        const lantern = this.add.circle(-60, -20, 10, 0xFF0000);
        lantern.setAlpha(hour >= 17 || hour < 6 ? 1 : 0.3);

        innContainer.add([houseBody, roof, door, sign, signText, lantern]);

        // 添加浮動動畫
        this.tweens.add({
            targets: innContainer,
            y: innContainer.y - 5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.innSprite = innContainer;

        // 點擊提示
        const clickHint = this.add.text(width / 2, height / 2 + 80, '點擊進入客棧 ▶', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        clickHint.setOrigin(0.5);

        // 提示閃爍
        this.tweens.add({
            targets: clickHint,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 創建資訊顯示
     */
    createInfoDisplay() {
        const { width, height } = this.cameras.main;

        // 半透明背景
        const infoBg = this.add.rectangle(width / 2, height - 40, width - 20, 60, 0x000000, 0.7);
        infoBg.setStrokeStyle(2, 0xFFD700);

        // 銀兩
        this.silverText = this.add.text(15, height - 60, '', {
            fontSize: '14px',
            color: '#FFD43B',
            fontStyle: 'bold'
        });

        // 收入/秒
        this.incomeText = this.add.text(15, height - 40, '', {
            fontSize: '12px',
            color: '#51CF66'
        });

        // 時間顯示
        this.timeText = this.add.text(15, height - 20, '', {
            fontSize: '12px',
            color: '#FFFFFF'
        });

        // 更新顯示
        this.updateDisplay();
    }

    /**
     * 更新顯示
     */
    updateDisplay() {
        const income = this.gameState.calculateIncomePerSecond();

        this.silverText.setText(`💰 ${Math.floor(this.gameState.silver).toLocaleString()}`);
        this.incomeText.setText(`📈 ${income}/秒`);

        if (this.timeManager) {
            const timeStr = this.timeManager.getShortTimeString();
            const weatherIcon = this.timeManager.getWeatherIcon();
            this.timeText.setText(`⏰ ${timeStr} ${weatherIcon}`);
        }
    }

    /**
     * 設置時間監聽器
     */
    setupTimeListeners() {
        if (!this.timeManager) return;

        // 監聽時辰變化
        this.timeManager.on('onHourChange', (data) => {
            console.log(`時辰變化: ${data.previous} → ${data.current}`);
            this.updateBackgroundByTime();
        });

        // 監聽天氣變化
        this.timeManager.on('onWeatherChange', (data) => {
            console.log(`天氣變化: ${data.previous} → ${data.current}`);
            this.updateDisplay();
        });

        // 監聽開始營業
        this.timeManager.on('onBusinessOpen', () => {
            console.log('客棧開始營業！');
            this.showNotification('🌅 客棧開始營業');
        });

        // 監聽打烊
        this.timeManager.on('onBusinessClose', () => {
            console.log('客棧打烊休息');
            this.showNotification('🌙 客棧打烊休息');
        });
    }

    /**
     * 根據時間更新背景
     */
    updateBackgroundByTime() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
            this.createPlaceholderBackground();
        }
    }

    /**
     * 顯示通知
     */
    showNotification(text) {
        const { width } = this.cameras.main;

        const notification = this.add.text(width / 2, 50, text, {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        });
        notification.setOrigin(0.5);
        notification.setDepth(1000);

        // 淡入淡出
        this.tweens.add({
            targets: notification,
            alpha: 0,
            y: 30,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => notification.destroy()
        });
    }

    /**
     * 展開到內部場景
     */
    expandToInterior() {
        console.log('展開到客棧內部');

        // 通知主進程放大視窗
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('toggle-window-size', 'large');
            } catch (e) {
                console.log('非 Electron 環境');
            }
        }

        // 淡出效果
        this.cameras.main.fadeOut(300, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            // 切換到大廳場景
            this.scene.start('LobbyScene', {
                gameState: this.gameState,
                timeManager: this.timeManager
            });
        });
    }

    /**
     * 更新（每幀調用）
     */
    update(time, delta) {
        // 更新時間系統
        if (this.timeManager) {
            this.timeManager.update(delta);
        }

        // 更新掛機收益
        this.gameState.updateIdleIncome();

        // 更新顯示（每秒一次即可）
        if (!this.lastDisplayUpdate || time - this.lastDisplayUpdate > 1000) {
            this.updateDisplay();
            this.lastDisplayUpdate = time;
        }
    }
}

module.exports = ExteriorScene;
