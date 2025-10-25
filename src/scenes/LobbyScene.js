/**
 * 客棧大廳場景 - 展開模式（900x650）
 * 2.5D 斜向視角
 */
const CharacterSprite = require('../sprites/CharacterSprite');
const UIManager = require('../ui/UIManager');

class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
        this.gameState = null;
        this.timeManager = null;

        // 角色精靈
        this.characterSprites = {};

        // UI 元素
        this.topBar = null;
        this.bottomBar = null;
        this.uiManager = null;
    }

    init(data) {
        this.gameState = data.gameState;
        this.timeManager = data.timeManager;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 創建背景
        this.createBackground();

        // 創建場景元素（桌子、櫃台等）
        this.createSceneObjects();

        // 創建角色精靈
        this.createCharacters();

        // 創建頂部資訊欄
        this.createTopBar();

        // 創建底部控制欄
        this.createBottomBar();

        // 創建 UI 管理器
        this.uiManager = new UIManager(this, this.gameState);

        // 設置時間監聽
        this.setupTimeListeners();

        // 淡入效果
        this.cameras.main.fadeIn(300);
    }

    /**
     * 創建背景（佔位圖）
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 地板（棋盤格）
        const graphics = this.add.graphics();

        // 根據時辰調整光線
        const hour = this.timeManager.currentTime.hour.index;
        let floorColor = 0x8B7355;
        let brightness = 1.0;

        if (hour >= 4 && hour < 8) {
            brightness = 0.8;  // 清晨較暗
        } else if (hour >= 17 && hour < 19) {
            brightness = 0.9;  // 傍晚微暗
        } else if (hour >= 19 || hour < 4) {
            brightness = 0.6;  // 夜晚很暗
        }

        // 繪製地板
        const tileSize = 50;
        for (let y = 0; y < height - 100; y += tileSize) {
            for (let x = 0; x < width; x += tileSize) {
                const isDark = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                const color = isDark ? 0x8B7355 : 0xA0826D;
                graphics.fillStyle(color, brightness);
                graphics.fillRect(x, y + 50, tileSize, tileSize);
            }
        }

        // 牆壁
        graphics.fillStyle(0x654321, brightness);
        graphics.fillRect(0, 0, width, 50);

        this.backgroundGraphics = graphics;

        // 添加標題
        this.add.text(width / 2, 25, `🏮 ${this.gameState.inn.name} - 一樓大廳`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * 創建場景物件
     */
    createSceneObjects() {
        const { width, height } = this.cameras.main;

        // 櫃台
        const counter = this.createInteractiveObject(200, 150, 120, 60, '櫃台', 0x8B4513, () => {
            console.log('點擊櫃台');
            this.showWorkStationMenu('management');
        });

        // 桌子 1
        const table1 = this.createInteractiveObject(350, 250, 80, 80, '桌子', 0x654321);

        // 桌子 2
        const table2 = this.createInteractiveObject(550, 250, 80, 80, '桌子', 0x654321);

        // 樓梯
        const stairs = this.createInteractiveObject(750, 150, 100, 150, '樓梯', 0x8B7355, () => {
            console.log('前往二樓');
            this.showMessage('二樓場景開發中...');
        });

        // 廚房入口
        const kitchenDoor = this.createInteractiveObject(50, 250, 60, 80, '廚房', 0x654321, () => {
            console.log('進入廚房');
            this.showMessage('廚房場景開發中...');
        });

        // 客房入口
        const roomDoor = this.createInteractiveObject(50, 400, 60, 80, '客房', 0x654321, () => {
            console.log('前往客房');
            this.showMessage('客房場景開發中...');
        });
    }

    /**
     * 創建可交互物件
     */
    createInteractiveObject(x, y, width, height, label, color, onClick) {
        const container = this.add.container(x, y);

        // 物件主體
        const rect = this.add.rectangle(0, 0, width, height, color);
        rect.setStrokeStyle(2, 0x000000);

        // 標籤
        const text = this.add.text(0, 0, label, {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        });
        text.setOrigin(0.5);

        container.add([rect, text]);
        container.setDepth(y);  // 根據Y軸設置深度

        // 如果有點擊事件，設置交互
        if (onClick) {
            rect.setInteractive({ useHandCursor: true });
            rect.on('pointerdown', onClick);

            rect.on('pointerover', () => {
                rect.setFillStyle(Phaser.Display.Color.GetColor(
                    ...Phaser.Display.Color.IntegerToRGB(color)
                ).lighten(20).color);
            });

            rect.on('pointerout', () => {
                rect.setFillStyle(color);
            });
        }

        return container;
    }

    /**
     * 創建角色精靈
     */
    createCharacters() {
        // 只顯示已解鎖的員工
        this.gameState.employees.forEach(employee => {
            if (employee.unlocked) {
                const sprite = new CharacterSprite(
                    this,
                    employee,
                    employee.workStatus.position.x,
                    employee.workStatus.position.y
                );

                // 設置可點擊
                sprite.setInteractive((clickedEmployee) => {
                    this.showEmployeeMenu(clickedEmployee);
                });

                this.characterSprites[employee.id] = sprite;

                // 根據工作狀態設置精靈狀態
                if (employee.workStatus.currentState === 'WORKING') {
                    sprite.startWork();
                } else if (employee.workStatus.currentState === 'SLEEPING') {
                    sprite.sleep();
                }
            }
        });
    }

    /**
     * 創建頂部資訊欄
     */
    createTopBar() {
        const { width } = this.cameras.main;

        const bar = this.add.container(width - 250, 60);
        bar.setDepth(1000);

        // 背景
        const bg = this.add.rectangle(0, 0, 240, 100, 0x000000, 0.7);
        bg.setStrokeStyle(2, 0xFFD700);

        // 銀兩
        this.silverText = this.add.text(-110, -35, '', {
            fontSize: '16px',
            color: '#FFD43B',
            fontStyle: 'bold'
        });

        // 收入/秒
        this.incomeText = this.add.text(-110, -15, '', {
            fontSize: '14px',
            color: '#51CF66'
        });

        // 名聲
        this.reputationText = this.add.text(-110, 5, '', {
            fontSize: '14px',
            color: '#FF6B6B'
        });

        // 時間
        this.timeText = this.add.text(-110, 25, '', {
            fontSize: '14px',
            color: '#FFFFFF'
        });

        bar.add([bg, this.silverText, this.incomeText, this.reputationText, this.timeText]);
        this.topBar = bar;

        this.updateTopBar();
    }

    /**
     * 更新頂部資訊欄
     */
    updateTopBar() {
        const income = this.gameState.calculateIncomePerSecond();

        this.silverText.setText(`💰 ${Math.floor(this.gameState.silver).toLocaleString()}`);
        this.incomeText.setText(`📈 ${income}/秒`);
        this.reputationText.setText(`⭐ 名聲: ${this.gameState.inn.reputation}`);

        if (this.timeManager) {
            const timeStr = this.timeManager.getShortTimeString();
            const weatherIcon = this.timeManager.getWeatherIcon();
            const season = this.timeManager.currentTime.season;
            this.timeText.setText(`⏰ ${timeStr} ${weatherIcon} ${season}`);
        }
    }

    /**
     * 創建底部控制欄
     */
    createBottomBar() {
        const { width, height } = this.cameras.main;

        const bar = this.add.container(0, height - 50);
        bar.setDepth(1000);

        // 背景
        const bg = this.add.rectangle(width / 2, 0, width, 50, 0x000000, 0.8);
        bg.setStrokeStyle(2, 0xFFD700);

        // 收起按鈕
        const collapseBtn = this.createButton(width - 100, 0, 180, 40, '收起客棧', () => {
            this.collapseToExterior();
        }, 0x34495E);

        // 自動排班按鈕
        const autoScheduleBtn = this.createButton(200, 0, 180, 40, '自動排班', () => {
            this.autoScheduleWork();
        }, 0x27AE60);

        // 全部休息按鈕
        const restAllBtn = this.createButton(400, 0, 180, 40, '全部休息', () => {
            this.restAllEmployees();
        }, 0x95A5A6);

        bar.add([bg, collapseBtn, autoScheduleBtn, restAllBtn]);
        this.bottomBar = bar;
    }

    /**
     * 創建按鈕
     */
    createButton(x, y, width, height, label, onClick, color = 0x4A90E2) {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, width, height, color);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0xFFFFFF);

        const text = this.add.text(0, 0, label, {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // 事件
        const originalColor = color;
        const hoverColor = Phaser.Display.Color.IntegerToColor(color).lighten(20).color;

        bg.on('pointerover', () => bg.setFillStyle(hoverColor));
        bg.on('pointerout', () => bg.setFillStyle(originalColor));
        bg.on('pointerdown', onClick);

        return container;
    }

    /**
     * 顯示員工菜單
     */
    showEmployeeMenu(employee) {
        console.log('點擊員工:', employee.name);

        const { width, height } = this.cameras.main;

        // 創建菜單背景
        const menu = this.add.container(width / 2, height / 2);
        menu.setDepth(2000);

        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive();  // 阻止點擊穿透

        // 員工信息
        const title = this.add.text(0, -120, `${employee.name} (${employee.realName})`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const info = this.add.text(0, -80, `等級: Lv.${employee.level}  狀態: ${employee.workStatus.currentState}`, {
            fontSize: '14px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // 技能顯示
        const skillsText = Object.entries(employee.skills)
            .map(([skill, level]) => `${this.getSkillName(skill)}: ${level}`)
            .join('  ');

        const skills = this.add.text(0, -50, skillsText, {
            fontSize: '12px',
            color: '#AAAAAA'
        }).setOrigin(0.5);

        // 按鈕
        const upgradeBtn = this.createButton(0, 0, 150, 40, '升級', () => {
            const result = this.gameState.upgradeEmployee(employee.id);
            this.showMessage(result.message);
            menu.destroy();
        }, 0x27AE60);

        const restBtn = this.createButton(0, 50, 150, 40, '休息', () => {
            this.gameState.unassignWork(employee.id);
            this.characterSprites[employee.id].stopWork();
            this.showMessage(`${employee.name}已休息`);
            menu.destroy();
        }, 0x95A5A6);

        const closeBtn = this.createButton(0, 100, 150, 40, '關閉', () => {
            menu.destroy();
        }, 0xE74C3C);

        menu.add([bg, title, info, skills, upgradeBtn, restBtn, closeBtn]);
        this.currentMenu = menu;
    }

    /**
     * 顯示工作崗位菜單
     */
    showWorkStationMenu(stationId) {
        console.log('工作崗位:', stationId);

        const { width, height } = this.cameras.main;

        const menu = this.add.container(width / 2, height / 2);
        menu.setDepth(2000);

        const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive();

        const title = this.add.text(0, -180, '分配員工到此崗位', {
            fontSize: '20px',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 列出可用員工
        const availableEmployees = this.gameState.employees.filter(e => e.unlocked);
        let yOffset = -140;

        availableEmployees.forEach((employee, index) => {
            const btn = this.createButton(0, yOffset + index * 50, 400, 40,
                `${employee.name} - Lv.${employee.level}`,
                () => {
                    const result = this.gameState.assignWork(employee.id, stationId);
                    this.showMessage(result.message);
                    if (result.success && this.characterSprites[employee.id]) {
                        this.characterSprites[employee.id].startWork();
                    }
                    menu.destroy();
                },
                employee.workStatus.currentState === 'WORKING' ? 0x95A5A6 : 0x3498DB
            );
            menu.add(btn);
        });

        const closeBtn = this.createButton(0, 160, 150, 40, '關閉', () => {
            menu.destroy();
        }, 0xE74C3C);

        menu.add([bg, title, closeBtn]);
    }

    /**
     * 獲取技能名稱
     */
    getSkillName(skill) {
        const names = {
            cooking: '烹飪',
            service: '服務',
            combat: '戰鬥',
            medicine: '醫療',
            entertainment: '娛樂',
            management: '管理',
            crafting: '製作'
        };
        return names[skill] || skill;
    }

    /**
     * 自動排班
     */
    autoScheduleWork() {
        console.log('自動排班');

        // 簡單的自動排班邏輯
        const stations = ['management', 'kitchen', 'lobby', 'security'];
        let assigned = 0;

        stations.forEach(station => {
            // 找最適合的員工
            const bestEmployee = this.gameState.employees
                .filter(e => e.unlocked && !e.workStatus.assignedStation)
                .find(e => e.preferredWork.includes(station));

            if (bestEmployee) {
                const result = this.gameState.assignWork(bestEmployee.id, station);
                if (result.success) {
                    if (this.characterSprites[bestEmployee.id]) {
                        this.characterSprites[bestEmployee.id].startWork();
                    }
                    assigned++;
                }
            }
        });

        this.showMessage(`已自動分配 ${assigned} 位員工`);
    }

    /**
     * 全部休息
     */
    restAllEmployees() {
        console.log('全部休息');

        this.gameState.employees.forEach(employee => {
            if (employee.workStatus.assignedStation) {
                this.gameState.unassignWork(employee.id);
                if (this.characterSprites[employee.id]) {
                    this.characterSprites[employee.id].stopWork();
                }
            }
        });

        this.showMessage('所有員工已休息');
    }

    /**
     * 收起到外部場景
     */
    collapseToExterior() {
        console.log('收起客棧');

        // 通知主進程縮小視窗
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('toggle-window-size', 'small');
            } catch (e) {
                console.log('非 Electron 環境');
            }
        }

        // 淡出效果
        this.cameras.main.fadeOut(300, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('ExteriorScene', {
                gameState: this.gameState,
                timeManager: this.timeManager
            });
        });
    }

    /**
     * 顯示訊息
     */
    showMessage(text) {
        const { width } = this.cameras.main;

        const message = this.add.text(width / 2, 100, text, {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        });
        message.setOrigin(0.5);
        message.setDepth(3000);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 70,
            duration: 2000,
            onComplete: () => message.destroy()
        });
    }

    /**
     * 設置時間監聽
     */
    setupTimeListeners() {
        if (!this.timeManager) return;

        this.timeManager.on('onHourChange', (data) => {
            this.updateBackgroundByTime();
        });

        this.timeManager.on('onBusinessClose', () => {
            // 營業結束，所有員工下班
            this.gameState.employees.forEach(emp => {
                if (emp.workStatus.currentState === 'WORKING') {
                    emp.workStatus.currentState = 'SLEEPING';
                    if (this.characterSprites[emp.id]) {
                        this.characterSprites[emp.id].sleep();
                    }
                }
            });
            this.showMessage('🌙 打烊了，員工下班休息');
        });

        this.timeManager.on('onBusinessOpen', () => {
            // 營業開始，喚醒員工
            this.gameState.employees.forEach(emp => {
                if (emp.workStatus.currentState === 'SLEEPING') {
                    emp.workStatus.currentState = 'IDLE';
                    if (this.characterSprites[emp.id]) {
                        this.characterSprites[emp.id].wakeUp();
                    }
                }
            });
            this.showMessage('🌅 開始營業！');
        });
    }

    /**
     * 根據時間更新背景
     */
    updateBackgroundByTime() {
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
            this.createBackground();
        }
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

        // 更新角色精靈
        Object.values(this.characterSprites).forEach(sprite => {
            sprite.update(delta);
        });

        // 更新頂部資訊欄（每秒一次）
        if (!this.lastUpdate || time - this.lastUpdate > 1000) {
            this.updateTopBar();
            this.lastUpdate = time;
        }
    }
}

module.exports = LobbyScene;
