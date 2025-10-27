/**
 * 儲藏室場景 - 展開模式（900x650）
 * 存放食材、物資和庫存管理
 */
const CharacterSprite = require('../sprites/CharacterSprite');
const SceneManager = require('../managers/SceneManager');

class StorageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StorageScene' });
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

        // 創建場景元素（貨架、箱子等）
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
     * 創建背景（儲藏室主題 - 昏暗、木質）
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 地板（木板）
        const graphics = this.add.graphics();

        // 根據時辰調整光線（儲藏室總是比較暗）
        const hour = this.timeManager.currentTime.hour.index;
        let brightness = 0.7;  // 基礎亮度較低

        if (hour >= 19 || hour < 6) {
            brightness = 0.4;  // 夜晚更暗
        }

        // 繪製地板（木板紋理）
        const tileSize = 50;
        for (let y = 0; y < height - 100; y += tileSize) {
            for (let x = 0; x < width; x += tileSize * 3) {
                // 長條木板
                const isDark = (y / tileSize) % 2 === 0;
                const color = isDark ? 0x654321 : 0x8B4513;
                graphics.fillStyle(color, brightness);
                graphics.fillRect(x, y + 50, tileSize * 3, tileSize);
                graphics.lineStyle(1, 0x000000, brightness);
                graphics.strokeRect(x, y + 50, tileSize * 3, tileSize);
            }
        }

        // 牆壁（深色石牆）
        graphics.fillStyle(0x3E2723, brightness);
        graphics.fillRect(0, 0, width, 50);

        this.backgroundGraphics = graphics;

        // 添加標題
        this.add.text(width / 2, 25, `📦 ${this.gameState.inn.name} - 儲藏室`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * 創建場景物件（貨架、箱子等）
     */
    createSceneObjects() {
        const { width, height } = this.cameras.main;

        // 左側貨架
        const leftShelf = this.createInteractiveObject(100, 180, 120, 200, '食材架', 0x8B4513, () => {
            this.showInventoryMenu('ingredients');
        });

        // 中間貨架
        const centerShelf = this.createInteractiveObject(350, 180, 200, 200, '物資架', 0x8B4513, () => {
            this.showInventoryMenu('supplies');
        });

        // 右側貨架
        const rightShelf = this.createInteractiveObject(700, 180, 120, 200, '雜物架', 0x8B4513, () => {
            this.showInventoryMenu('misc');
        });

        // 木箱（左下）
        const box1 = this.createInteractiveObject(100, 450, 80, 80, '木箱', 0x654321);

        // 木箱（右下）
        const box2 = this.createInteractiveObject(700, 450, 80, 80, '木箱', 0x654321);

        // 酒罈
        const wineJar = this.createInteractiveObject(450, 450, 60, 80, '酒罈', 0x8B0000, () => {
            this.showMessage('查看酒類庫存...');
        });

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
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        });
        text.setOrigin(0.5);

        container.add([rect, text]);
        container.setDepth(y);

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
     * 創建角色精靈（管理庫存的員工）
     */
    createCharacters() {
        // 這裡可能不會有太多員工，儲藏室主要是查看庫存
        // 但如果有員工被分配到 'storage' 工作站，也顯示
        this.gameState.employees.forEach(employee => {
            if (employee.unlocked && employee.workStatus.assignedStation === 'storage') {
                const sprite = new CharacterSprite(
                    this,
                    employee,
                    employee.workStatus.position.x || 450,
                    employee.workStatus.position.y || 350
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

        // 庫存數量
        this.inventoryText = this.add.text(-110, -15, '', {
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

        bar.add([bg, this.silverText, this.inventoryText, this.reputationText, this.timeText]);
        this.topBar = bar;

        this.updateTopBar();
    }

    /**
     * 更新頂部資訊欄
     */
    updateTopBar() {
        const inventoryCount = this.gameState.inventory.items.length;

        this.silverText.setText(`💰 ${Math.floor(this.gameState.silver).toLocaleString()}`);
        this.inventoryText.setText(`📦 庫存: ${inventoryCount} 項`);
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

        // 查看全部庫存按鈕
        const inventoryBtn = this.createButton(300, 0, 180, 40, '全部庫存', () => {
            this.showFullInventory();
        }, 0x27AE60);

        // 整理庫存按鈕
        const organizeBtn = this.createButton(500, 0, 180, 40, '整理庫存', () => {
            this.showMessage('庫存整理功能開發中...');
        }, 0x3498DB);

        bar.add([bg, backBtn, inventoryBtn, organizeBtn]);
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
     * 顯示庫存菜單（分類）
     */
    showInventoryMenu(category) {
        const categoryNames = {
            ingredients: '食材',
            supplies: '物資',
            misc: '雜物'
        };

        this.showMessage(`查看 ${categoryNames[category]} 庫存...`);
        // 未來這裡會顯示詳細的庫存列表
    }

    /**
     * 顯示完整庫存
     */
    showFullInventory() {
        const { width, height } = this.cameras.main;

        const menu = this.add.container(width / 2, height / 2);
        menu.setDepth(2000);

        const bg = this.add.rectangle(0, 0, 600, 500, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive();

        const title = this.add.text(0, -230, '📦 客棧庫存總覽', {
            fontSize: '24px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 顯示庫存統計
        const inventoryCount = this.gameState.inventory.items.length;
        const inventoryCapacity = this.gameState.inventory.maxSlots;

        const stats = this.add.text(0, -180,
            `物品數量: ${inventoryCount} / ${inventoryCapacity}\n` +
            `總價值: ${Math.floor(this.gameState.inventory.getTotalValue())} 銀兩`,
            {
                fontSize: '16px',
                color: '#FFFFFF',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 顯示前10個物品
        let yOffset = -120;
        const items = this.gameState.inventory.items.slice(0, 10);

        if (items.length === 0) {
            const emptyText = this.add.text(0, 0, '庫存空空如也...', {
                fontSize: '18px',
                color: '#888888'
            }).setOrigin(0.5);
            menu.add(emptyText);
        } else {
            items.forEach((item, index) => {
                const itemText = this.add.text(-250, yOffset + index * 30,
                    `${item.name} x${item.quantity || 1}`,
                    {
                        fontSize: '14px',
                        color: '#FFFFFF'
                    }
                );
                menu.add(itemText);
            });
        }

        const closeBtn = this.createButton(0, 200, 150, 40, '關閉', () => {
            menu.destroy();
        }, 0xE74C3C);

        menu.add([bg, title, stats, closeBtn]);
    }

    /**
     * 顯示員工菜單
     */
    showEmployeeMenu(employee) {
        const { width, height } = this.cameras.main;

        const menu = this.add.container(width / 2, height / 2);
        menu.setDepth(2000);

        const bg = this.add.rectangle(0, 0, 400, 250, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive();

        const title = this.add.text(0, -100, `${employee.name} (${employee.realName})`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const info = this.add.text(0, -60, `管理庫存中...`, {
            fontSize: '14px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        const restBtn = this.createButton(0, 0, 150, 40, '休息', () => {
            this.gameState.unassignWork(employee.id);
            if (this.characterSprites[employee.id]) {
                this.characterSprites[employee.id].destroy();
                delete this.characterSprites[employee.id];
            }
            this.showMessage(`${employee.name}已休息`);
            menu.destroy();
        }, 0x95A5A6);

        const closeBtn = this.createButton(0, 60, 150, 40, '關閉', () => {
            menu.destroy();
        }, 0xE74C3C);

        menu.add([bg, title, info, restBtn, closeBtn]);
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

module.exports = StorageScene;
