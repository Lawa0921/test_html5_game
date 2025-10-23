/**
 * 桌面主場景 - 客棧經營掛機遊戲
 * 中式客棧透明桌面寵物系統
 */
const GameState = require('../core/GameState');
const UIManager = require('../ui/UIManager');
const { ipcRenderer } = require('electron');

class DesktopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DesktopScene' });
        this.gameState = null;
        this.uiManager = null;
        this.employeeSprites = {};
        this.eventPopup = null;
        this.silverText = null;
        this.incomeText = null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 初始化遊戲狀態
        this.gameState = new GameState();

        // 嘗試讀檔
        const loadResult = this.gameState.load();
        if (loadResult.success) {
            console.log('讀取存檔成功');

            if (loadResult.offline) {
                this.showOfflineRewardPopup(loadResult);
            }
        } else {
            console.log('開始新遊戲 - 悅來客棧');
        }

        // 完全透明背景(生產環境)
        // 開發時可以設置為 0.05 以便看到遊戲區域
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.0);  // 完全透明
        bg.fillRect(0, 0, width, height);

        // 創建員工精靈
        this.createEmployees();

        // 創建客棧信息顯示（小視窗模式下顯示在左上角）
        this.createInnInfo();

        // 創建 UI 管理器(右下角)
        this.uiManager = new UIManager(this, this.gameState);

        // 啟動掛機收益循環
        this.startIdleIncomeLoop();

        // 定期自動存檔(每30秒)
        this.time.addEvent({
            delay: 30000,
            callback: () => {
                this.gameState.save();
                console.log('🏮 自動存檔');
            },
            loop: true
        });

        // 隨機事件觸發器(3-5分鐘)
        this.setupRandomEvents();

        console.log('🏮 悅來客棧已開張');
        console.log('快捷鍵: Ctrl+Shift+D 顯示/隱藏, Ctrl+Shift+Q 退出');
    }

    /**
     * 創建客棧信息顯示
     */
    createInnInfo() {
        const { width } = this.cameras.main;

        // 客棧名稱
        const innNameText = this.add.text(10, 10, this.gameState.inn.name, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ff6b6b',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });

        // 銀兩顯示
        this.silverText = this.add.text(10, 35, `💰 ${this.gameState.silver}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffd43b',
            stroke: '#000000',
            strokeThickness: 2
        });

        // 每秒收益顯示
        const incomePerSecond = this.gameState.calculateIncomePerSecond();
        this.incomeText = this.add.text(10, 55, `📈 ${incomePerSecond}/秒`, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#51cf66',
            stroke: '#000000',
            strokeThickness: 2
        });
    }

    /**
     * 創建員工精靈
     */
    createEmployees() {
        this.gameState.employees.forEach(employee => {
            if (employee.unlocked) {
                this.createEmployeeSprite(employee);
            }
        });
    }

    /**
     * 創建單個員工精靈
     */
    createEmployeeSprite(employee) {
        // 員工類型顏色映射
        const colors = {
            manager: 0xff6b6b,      // 掌櫃 - 紅色
            chef: 0xff922b,         // 廚師 - 橙色
            waiter: 0x51cf66,       // 服務員 - 綠色
            guard: 0x5f3dc4,        // 保鏢 - 紫色
            runner: 0x4a69ff,       // 跑堂 - 藍色
            herbalist: 0x37b24d,    // 藥師 - 深綠
            storyteller: 0xffd43b,  // 說書人 - 金色
            musician: 0xfa5252,     // 樂師 - 粉紅
            accountant: 0x2f2f2f,   // 賬房 - 灰色
            doorman: 0x9c36b5       // 門童 - 紫紅
        };

        // 創建員工圓形(暫時,之後替換為 Sprite)
        const color = colors[employee.type] || 0xffffff;
        const circle = this.add.circle(employee.x, employee.y, 20, color);
        circle.setStrokeStyle(2, 0xffffff);

        // 員工名稱
        const nameText = this.add.text(employee.x, employee.y - 30, employee.name, {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 員工等級
        const levelText = this.add.text(employee.x, employee.y, `Lv.${employee.level}`, {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 簡單的移動動畫
        this.tweens.add({
            targets: circle,
            y: employee.y + 10,
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: [nameText, levelText],
            y: employee.y - 20,
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 保存引用
        this.employeeSprites[employee.id] = {
            employee: employee,
            circle: circle,
            nameText: nameText,
            levelText: levelText
        };
    }

    /**
     * 啟動掛機收益循環
     */
    startIdleIncomeLoop() {
        // 每秒更新掛機收益
        this.time.addEvent({
            delay: 1000,  // 1秒
            callback: () => {
                // 更新掛機收益
                this.gameState.updateIdleIncome();

                // 更新顯示
                this.updateDisplay();

                // 檢查新員工解鎖
                this.checkNewEmployeeUnlocks();
            },
            loop: true
        });
    }

    /**
     * 更新顯示
     */
    updateDisplay() {
        // 更新銀兩顯示
        if (this.silverText) {
            this.silverText.setText(`💰 ${Math.floor(this.gameState.silver)}`);
        }

        // 更新收益顯示
        if (this.incomeText) {
            const incomePerSecond = this.gameState.calculateIncomePerSecond();
            this.incomeText.setText(`📈 ${incomePerSecond}/秒`);
        }

        // 更新員工等級顯示
        this.updateEmployeeLevels();

        // 通知 UI 管理器更新
        if (this.uiManager) {
            this.uiManager.updateDisplay();
        }
    }

    /**
     * 更新員工等級顯示
     */
    updateEmployeeLevels() {
        Object.values(this.employeeSprites).forEach(empSprite => {
            empSprite.levelText.setText(`Lv.${empSprite.employee.level}`);
        });
    }

    /**
     * 檢查新員工解鎖
     */
    checkNewEmployeeUnlocks() {
        this.gameState.employees.forEach(employee => {
            if (employee.unlocked && !this.employeeSprites[employee.id]) {
                // 新解鎖的員工,創建精靈
                this.createEmployeeSprite(employee);
                this.showNotification(`🎉 新員工加入: ${employee.name}`, 0x00ff00);
            }
        });
    }

    /**
     * 設置隨機事件
     */
    setupRandomEvents() {
        // 每 3-5 分鐘觸發一次隨機事件
        this.time.addEvent({
            delay: (180 + Math.random() * 120) * 1000,  // 3-5分鐘
            callback: () => {
                this.triggerRandomEvent();

                // 遞迴設置下一次事件
                this.setupRandomEvents();
            },
            loop: false
        });
    }

    /**
     * 觸發隨機事件
     */
    triggerRandomEvent() {
        const events = [
            {
                type: 'merchant',
                title: '🎭 商隊來訪',
                description: '一隊商旅路過客棧，消費了大量酒菜',
                silver: 500,
                reputation: 5
            },
            {
                type: 'robber',
                title: '⚔️ 山賊打劫',
                description: '山賊前來鬧事！保鏢擊退了他們',
                silver: -200,
                reputation: 10
            },
            {
                type: 'knight',
                title: '🗡️ 俠客投宿',
                description: '一位江湖俠客在此住宿，提升了客棧名氣',
                silver: 300,
                reputation: 15
            },
            {
                type: 'inspection',
                title: '📜 官府巡查',
                description: '官府前來檢查，客棧通過了所有標準',
                silver: 0,
                reputation: 20
            },
            {
                type: 'festival',
                title: '🎊 宴會舉辦',
                description: '客棧舉辦了一場盛大宴會，賓客雲集',
                silver: 1000,
                reputation: 25
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];

        // 應用事件效果
        if (event.silver > 0) {
            this.gameState.addSilver(event.silver);
        } else if (event.silver < 0) {
            this.gameState.spendSilver(Math.abs(event.silver));
        }

        if (event.reputation > 0) {
            this.gameState.addReputation(event.reputation);
        }

        // 更新統計
        switch (event.type) {
            case 'merchant':
                this.gameState.stats.merchantsServed++;
                break;
            case 'robber':
                this.gameState.stats.robbersDefeated++;
                break;
            case 'knight':
                this.gameState.stats.knightsRecruited++;
                break;
            case 'inspection':
                this.gameState.stats.inspectionsPassed++;
                break;
            case 'festival':
                this.gameState.stats.festivalsHeld++;
                break;
        }

        // 記錄事件
        this.gameState.addEvent(event);

        // 顯示事件彈窗
        this.showEventPopup(event);

        console.log('隨機事件觸發:', event.title);
    }

    /**
     * 顯示事件彈窗
     */
    showEventPopup(event) {
        const { width, height } = this.cameras.main;

        // 如果已有彈窗，先移除
        if (this.eventPopup) {
            this.eventPopup.destroy();
        }

        // 創建彈窗容器
        this.eventPopup = this.add.container(width / 2, height / 2);

        // 背景
        const bg = this.add.rectangle(0, 0, 250, 150, 0x1a1a1a, 0.95);
        bg.setStrokeStyle(3, 0xffd43b);

        // 標題
        const title = this.add.text(0, -50, event.title, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffd43b',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // 描述
        const desc = this.add.text(0, -20, event.description, {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 220 }
        }).setOrigin(0.5);

        // 獎勵顯示
        let rewardText = '';
        if (event.silver > 0) {
            rewardText += `💰 +${event.silver} 銀兩\n`;
        } else if (event.silver < 0) {
            rewardText += `💰 ${event.silver} 銀兩\n`;
        }
        if (event.reputation > 0) {
            rewardText += `⭐ +${event.reputation} 名聲`;
        }

        const reward = this.add.text(0, 20, rewardText, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#51cf66',
            align: 'center'
        }).setOrigin(0.5);

        // 關閉按鈕
        const closeBtn = this.add.text(0, 55, '[ 確定 ]', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#4a69ff',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.eventPopup.destroy();
            this.eventPopup = null;
        });

        this.eventPopup.add([bg, title, desc, reward, closeBtn]);
        this.eventPopup.setDepth(2000);

        // 3秒後自動關閉
        this.time.delayedCall(3000, () => {
            if (this.eventPopup) {
                this.eventPopup.destroy();
                this.eventPopup = null;
            }
        });
    }

    /**
     * 顯示離線獎勵彈窗
     */
    showOfflineRewardPopup(loadResult) {
        const { width, height } = this.cameras.main;

        const offlineMinutes = Math.floor(loadResult.offlineTime / 60);
        const offlineHours = Math.floor(offlineMinutes / 60);

        let timeText = '';
        if (offlineHours > 0) {
            timeText = `${offlineHours}小時${offlineMinutes % 60}分鐘`;
        } else {
            timeText = `${offlineMinutes}分鐘`;
        }

        // 創建彈窗
        const popup = this.add.container(width / 2, height / 2);

        const bg = this.add.rectangle(0, 0, 280, 180, 0x1a1a1a, 0.95);
        bg.setStrokeStyle(3, 0x51cf66);

        const title = this.add.text(0, -60, '🌙 離線收益', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#51cf66',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const timeMsg = this.add.text(0, -30, `離線時間: ${timeText}`, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        const silverMsg = this.add.text(0, -5, `獲得銀兩: ${loadResult.offlineIncome}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffd43b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const info = this.add.text(0, 25, '(離線收益為在線的50%)', {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#888888'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(0, 65, '[ 確定 ]', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#4a69ff',
            fontStyle: 'bold'
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            popup.destroy();
        });

        popup.add([bg, title, timeMsg, silverMsg, info, closeBtn]);
        popup.setDepth(3000);
    }

    /**
     * 顯示通知
     */
    showNotification(message, color = 0xffffff) {
        const { width } = this.cameras.main;

        const notification = this.add.text(width / 2, 80, message, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: `#${color.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // 淡入
        notification.setAlpha(0);
        this.tweens.add({
            targets: notification,
            alpha: 1,
            duration: 300,
            onComplete: () => {
                // 停留2秒後淡出
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: notification,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            notification.destroy();
                        }
                    });
                });
            }
        });
    }
}

module.exports = DesktopScene;
