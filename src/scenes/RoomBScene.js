/**
 * 客房B場景 - 展開模式（900x650）
 * 客人住宿、清潔服務
 */
const CharacterSprite = require('../sprites/CharacterSprite');
const SceneManager = require('../managers/SceneManager');

class RoomBScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RoomBScene' });
        this.gameState = null;
        this.timeManager = null;
        this.sceneManager = null;

        // 角色精靈
        this.characterSprites = {};

        // UI 元素
        this.topBar = null;
        this.bottomBar = null;

        // 房間狀態
        this.roomStatus = {
            occupied: false,
            cleanliness: 100,
            guestName: null
        };
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

        // 創建場景元素（床、桌子等）
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
     * 創建背景（客房主題 - 與客房A略有不同的色調）
     */
    createBackground() {
        const { width, height } = this.cameras.main;

        // 地板（木地板 - 稍深的顏色）
        const graphics = this.add.graphics();

        // 根據時辰調整光線
        const hour = this.timeManager.currentTime.hour.index;
        let brightness = 1.0;

        if (hour >= 4 && hour < 8) {
            brightness = 0.7;  // 清晨較暗
        } else if (hour >= 17 && hour < 19) {
            brightness = 0.85;  // 傍晚微暗
        } else if (hour >= 19 || hour < 4) {
            brightness = 0.5;  // 夜晚很暗
        }

        // 繪製地板（深色木地板紋理）
        const tileSize = 50;
        for (let y = 0; y < height - 100; y += tileSize) {
            for (let x = 0; x < width; x += tileSize * 4) {
                // 長條木板
                const isDark = (y / tileSize) % 2 === 0;
                const color = isDark ? 0xA0522D : 0xCD853F;
                graphics.fillStyle(color, brightness);
                graphics.fillRect(x, y + 50, tileSize * 4, tileSize);
                graphics.lineStyle(1, 0x654321, brightness * 0.5);
                graphics.strokeRect(x, y + 50, tileSize * 4, tileSize);
            }
        }

        // 牆壁（淺灰色）
        graphics.fillStyle(0xD3D3D3, brightness);
        graphics.fillRect(0, 0, width, 50);

        this.backgroundGraphics = graphics;

        // 添加標題
        this.add.text(width / 2, 25, `🛏️ ${this.gameState.inn.name} - 客房B`, {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    /**
     * 創建場景物件（床、桌子、窗戶等）
     */
    createSceneObjects() {
        const { width, height } = this.cameras.main;

        // 床鋪（主要物件 - 位置稍有不同）
        const bed = this.createInteractiveObject(200, 300, 200, 120, '床鋪🛏️', 0x8B4513, () => {
            this.showBedMenu();
        });

        // 桌子
        const table = this.createInteractiveObject(600, 250, 120, 80, '桌子', 0xD2691E);

        // 椅子
        const chair = this.createInteractiveObject(620, 320, 50, 50, '椅', 0x8B4513);

        // 衣櫃
        const wardrobe = this.createInteractiveObject(700, 150, 100, 180, '衣櫃', 0x654321, () => {
            this.showMessage('衣櫃是空的...');
        });

        // 窗戶
        const window = this.createInteractiveObject(400, 100, 150, 100, '窗戶🪟', 0x87CEEB, () => {
            this.showWindowView();
        });

        // 茶几
        const teaTable = this.createInteractiveObject(350, 400, 100, 60, '茶几', 0xD2691E);

        // 返回大廳的門
        const exitDoor = this.createInteractiveObject(50, 450, 60, 80, '返回', 0x654321, () => {
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
     * 創建角色精靈（清潔人員或住客）
     */
    createCharacters() {
        // 顯示在此房間工作的員工（如清潔人員）
        this.gameState.employees.forEach(employee => {
            if (employee.unlocked && employee.workStatus.assignedStation === 'room-b') {
                const sprite = new CharacterSprite(
                    this,
                    employee,
                    employee.workStatus.position.x || 500,
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
        const bg = this.add.rectangle(0, 0, 240, 120, 0x000000, 0.7);
        bg.setStrokeStyle(2, 0xFFD700);

        // 房間狀態
        this.roomStatusText = this.add.text(-110, -45, '', {
            fontSize: '14px',
            color: '#FFD700',
            fontStyle: 'bold'
        });

        // 清潔度
        this.cleanlinessText = this.add.text(-110, -25, '', {
            fontSize: '14px',
            color: '#51CF66'
        });

        // 住客
        this.guestText = this.add.text(-110, -5, '', {
            fontSize: '14px',
            color: '#FF6B6B'
        });

        // 時間
        this.timeText = this.add.text(-110, 15, '', {
            fontSize: '14px',
            color: '#FFFFFF'
        });

        bar.add([bg, this.roomStatusText, this.cleanlinessText, this.guestText, this.timeText]);
        this.topBar = bar;

        this.updateTopBar();
    }

    /**
     * 更新頂部資訊欄
     */
    updateTopBar() {
        const status = this.roomStatus.occupied ? '🔴 已入住' : '🟢 空房';
        const cleanliness = Math.floor(this.roomStatus.cleanliness);
        const guest = this.roomStatus.guestName || '無';

        this.roomStatusText.setText(`狀態: ${status}`);
        this.cleanlinessText.setText(`清潔度: ${cleanliness}%`);
        this.guestText.setText(`住客: ${guest}`);

        if (this.timeManager) {
            const timeStr = this.timeManager.getShortTimeString();
            const weatherIcon = this.timeManager.getWeatherIcon();
            this.timeText.setText(`⏰ ${timeStr} ${weatherIcon}`);
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

        // 清潔房間按鈕
        const cleanBtn = this.createButton(300, 0, 180, 40, '清潔房間', () => {
            this.cleanRoom();
        }, 0x27AE60);

        // 前往客房A按鈕
        const toRoomABtn = this.createButton(500, 0, 180, 40, '前往客房A', () => {
            this.sceneManager.toRoomA();
        }, 0x3498DB);

        bar.add([bg, backBtn, cleanBtn, toRoomABtn]);
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
     * 顯示床鋪菜單
     */
    showBedMenu() {
        const { width, height } = this.cameras.main;

        const menu = this.add.container(width / 2, height / 2);
        menu.setDepth(2000);

        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xFFD700);
        bg.setInteractive();

        const title = this.add.text(0, -120, '🛏️ 床鋪管理', {
            fontSize: '20px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const info = this.add.text(0, -80,
            `狀態: ${this.roomStatus.occupied ? '已入住' : '空房'}\n` +
            `清潔度: ${Math.floor(this.roomStatus.cleanliness)}%`,
            {
                fontSize: '16px',
                color: '#FFFFFF',
                align: 'center'
            }
        ).setOrigin(0.5);

        const closeBtn = this.createButton(0, 60, 150, 40, '關閉', () => {
            menu.destroy();
        }, 0xE74C3C);

        menu.add([bg, title, info, closeBtn]);
    }

    /**
     * 顯示窗外景色
     */
    showWindowView() {
        const hour = this.timeManager.currentTime.hour.index;
        const weather = this.timeManager.currentTime.weather;

        let view = '';
        if (hour >= 6 && hour < 18) {
            view = '窗外陽光灑落，能看到客棧後院的景色...';
        } else {
            view = '窗外夜幕低垂，遠處傳來蟲鳴聲...';
        }

        if (weather === '雨天') {
            view += '\n雨水沿著窗沿流淌，窗外一片朦朧。';
        }

        this.showMessage(view);
    }

    /**
     * 清潔房間
     */
    cleanRoom() {
        if (this.roomStatus.cleanliness >= 95) {
            this.showMessage('房間已經很乾淨了！');
            return;
        }

        this.roomStatus.cleanliness = Math.min(100, this.roomStatus.cleanliness + 30);
        this.updateTopBar();
        this.showMessage(`已清潔房間！清潔度: ${Math.floor(this.roomStatus.cleanliness)}%`);
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

        const info = this.add.text(0, -60, `正在整理客房...`, {
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
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 },
            align: 'center'
        });
        message.setOrigin(0.5);
        message.setDepth(3000);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 70,
            duration: 2500,
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
            // 房間自然變髒
            this.roomStatus.cleanliness = Math.max(0, this.roomStatus.cleanliness - 2);
            this.updateTopBar();
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

module.exports = RoomBScene;
