/**
 * 廚房場景 - 展開模式（900x650）
 * 烹飪工作場所
 */
const CharacterSprite = require('../sprites/CharacterSprite');
const SceneManager = require('../managers/SceneManager');

class KitchenScene extends Phaser.Scene {
    constructor() {
        super({ key: 'KitchenScene' });
        this.gameState = null;
        this.timeManager = null;
        this.sceneManager = null;

        // 角色精靈
        this.characterSprites = {};

        // UI 元素
        this.topBar = null;
        this.bottomBar = null;
    }

    init(data) {
        this.gameState = data.gameState;
        this.timeManager = data.timeManager;
        this.sceneManager = new SceneManager(this, this.gameState, this.timeManager);
    }

    create() {
        const { width, height } = this.cameras.main;

        // 創建背景
        this.createBackground();

        // 創建場景元素（灶台、菜架等）
        this.createSceneObjects();

        // 創建角色精靈
        this.createCharacters();

        // 創建頂部資訊欄
        this.createTopBar();

        // 創建底部控制欄
        this.createBottomBar();

        // 設置時間監聽
        this.setupTimeListeners();

        // 淡入效果
        this.cameras.main.fadeIn(300);
    }

    /**
     * 創建背景（廚房主題）
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 地板（石磚）
        const graphics = this.add.graphics();

        // 根據時辰調整光線
        const hour = this.timeManager.currentTime.hour.index;
        let brightness = 1.0;

        if (hour >= 4 && hour < 8) {
            brightness = 0.8;  // 清晨較暗
        } else if (hour >= 17 && hour < 19) {
            brightness = 0.9;  // 傍晚微暗
        } else if (hour >= 19 || hour < 4) {
            brightness = 0.6;  // 夜晚很暗
        }

        // 繪製地板（石磚紋理）
        const tileSize = 50;
        for (let y = 0; y < height - 100; y += tileSize) {
            for (let x = 0; x < width; x += tileSize) {
                const isDark = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                const color = isDark ? 0x696969 : 0x808080;
                graphics.fillStyle(color, brightness);
                graphics.fillRect(x, y + 50, tileSize, tileSize);
            }
        }

        // 牆壁（磚紅色）
        graphics.fillStyle(0x8B4513, brightness);
        graphics.fillRect(0, 0, width, 50);

        this.backgroundGraphics = graphics;

        // 添加標題
        this.add.text(width / 2, 25, `🔥 ${this.gameState.inn.name} - 廚房`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * 創建場景物件（廚房設備）
     */
    createSceneObjects() {
        const { width, height } = this.cameras.main;

        // 灶台（主要工作區）
        const stove = this.createInteractiveObject(200, 200, 150, 100, '灶台🔥', 0xCD5C5C, () => {
            console.log('點擊灶台');
            this.showWorkStationMenu('kitchen');
        });

        // 工作台
        const workbench = this.createInteractiveObject(450, 200, 200, 80, '工作台', 0xD2691E);

        // 食材架
        const ingredientShelf = this.createInteractiveObject(750, 150, 120, 200, '食材架', 0x8B4513, () => {
            this.showMessage('食材管理開發中...');
        });

        // 菜架
        const dishRack = this.createInteractiveObject(100, 350, 100, 60, '菜架', 0x654321);

        // 水缸
        const waterBarrel = this.createInteractiveObject(750, 400, 80, 80, '水缸', 0x4682B4);

        // 返回大廳的門
        const exitDoor = this.createInteractiveObject(50, 100, 60, 80, '返回', 0x654321, () => {
            this.sceneManager.toLobby();
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
     * 創建角色精靈（只顯示在廚房工作的員工）
     */
    createCharacters() {
        this.gameState.employees.forEach(employee => {
            if (employee.unlocked && employee.workStatus.assignedStation === 'kitchen') {
                const sprite = new CharacterSprite(
                    this,
                    employee,
                    employee.workStatus.position.x || 250,
                    employee.workStatus.position.y || 250
                );

                sprite.setInteractive((clickedEmployee) => {
                    this.showEmployeeMenu(clickedEmployee);
                });

                this.characterSprites[employee.id] = sprite;

                if (employee.workStatus.currentState === 'WORKING') {
                    sprite.startWork();
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

        // 返回大廳按鈕
        const backBtn = this.createButton(100, 0, 180, 40, '返回大廳', () => {
            this.sceneManager.toLobby();
        }, 0x34495E);

        // 查看食譜按鈕
        const recipeBtn = this.createButton(300, 0, 180, 40, '查看食譜', () => {
            this.showMessage('食譜功能開發中...');
        }, 0x27AE60);

        // 烹飪按鈕
        const cookBtn = this.createButton(500, 0, 180, 40, '開始烹飪', () => {
            this.showMessage('烹飪功能開發中...');
        }, 0xE67E22);

        bar.add([bg, backBtn, recipeBtn, cookBtn]);
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

        const menu = this.add.container(width / 2, height / 2);
        menu.setDepth(2000);

        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive();

        const title = this.add.text(0, -120, `${employee.name} (${employee.realName})`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const info = this.add.text(0, -80, `等級: Lv.${employee.level}  烹飪技能: ${employee.skills.cooking || 1}`, {
            fontSize: '14px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // 按鈕
        const upgradeBtn = this.createButton(0, 0, 150, 40, '升級', () => {
            const result = this.gameState.upgradeEmployee(employee.id);
            this.showMessage(result.message);
            menu.destroy();
        }, 0x27AE60);

        const restBtn = this.createButton(0, 50, 150, 40, '休息', () => {
            this.gameState.unassignWork(employee.id);
            if (this.characterSprites[employee.id]) {
                this.characterSprites[employee.id].destroy();
                delete this.characterSprites[employee.id];
            }
            this.showMessage(`${employee.name}已休息`);
            menu.destroy();
        }, 0x95A5A6);

        const closeBtn = this.createButton(0, 100, 150, 40, '關閉', () => {
            menu.destroy();
        }, 0xE74C3C);

        menu.add([bg, title, info, upgradeBtn, restBtn, closeBtn]);
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

        const title = this.add.text(0, -180, '分配廚師到此崗位', {
            fontSize: '20px',
            color: '#FFD700'
        }).setOrigin(0.5);

        // 列出可用員工（優先烹飪技能高的）
        const availableEmployees = this.gameState.employees
            .filter(e => e.unlocked)
            .sort((a, b) => (b.skills.cooking || 0) - (a.skills.cooking || 0));

        let yOffset = -140;

        availableEmployees.slice(0, 6).forEach((employee, index) => {
            const cookingLevel = employee.skills.cooking || 1;
            const btn = this.createButton(0, yOffset + index * 50, 400, 40,
                `${employee.name} - 烹飪Lv.${cookingLevel}`,
                () => {
                    const result = this.gameState.assignWork(employee.id, stationId);
                    this.showMessage(result.message);
                    menu.destroy();
                    // 重新創建角色（刷新顯示）
                    this.refreshCharacters();
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
     * 刷新角色顯示
     */
    refreshCharacters() {
        // 清除現有角色
        Object.values(this.characterSprites).forEach(sprite => sprite.destroy());
        this.characterSprites = {};

        // 重新創建
        this.createCharacters();
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

module.exports = KitchenScene;
