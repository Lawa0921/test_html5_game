/**
 * SceneSwitchUI - 場景切換按鈕 UI
 *
 * 顯示快速場景切換按鈕，方便在不同場景間切換
 */

class SceneSwitchUI {
    constructor(scene, sceneManager) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.container = null;
        this.buttons = {};
        this.currentSceneKey = scene.scene.key;

        // 場景按鈕配置
        this.sceneButtons = [
            { key: 'ExteriorScene', label: '門口', icon: '🏠', color: 0x228B22, method: 'toExterior' },
            { key: 'LobbyScene', label: '大廳', icon: '🏮', color: 0xDAA520, method: 'toLobby' },
            { key: 'KitchenScene', label: '廚房', icon: '🔥', color: 0xFF6347, method: 'toKitchen' },
            { key: 'StorageScene', label: '倉庫', icon: '📦', color: 0x8B4513, method: 'toStorage' },
            { key: 'RoomAScene', label: '客房A', icon: '🛏️', color: 0x6495ED, method: 'toRoomA' },
            { key: 'RoomBScene', label: '客房B', icon: '🛏️', color: 0x4682B4, method: 'toRoomB' }
        ];
    }

    /**
     * 創建場景切換UI
     * @param {string} position - 位置 ('top', 'bottom', 'left', 'right')
     */
    create(position = 'left') {
        if (this.container) {
            this.destroy();
        }

        const { width, height } = this.scene.cameras.main;

        if (position === 'left') {
            this.createVerticalLayout(10, height / 2);
        } else if (position === 'right') {
            this.createVerticalLayout(width - 70, height / 2);
        } else if (position === 'top') {
            this.createHorizontalLayout(width / 2, 60);
        } else if (position === 'bottom') {
            this.createHorizontalLayout(width / 2, height - 30);
        }

        return this.container;
    }

    /**
     * 創建垂直佈局（左側或右側）
     */
    createVerticalLayout(x, y) {
        this.container = this.scene.add.container(x, y);
        this.container.setDepth(4000);

        const buttonHeight = 60;
        const spacing = 10;
        const totalHeight = (this.sceneButtons.length * (buttonHeight + spacing)) - spacing;
        let offsetY = -totalHeight / 2;

        this.sceneButtons.forEach(config => {
            const button = this.createButton(0, offsetY, 60, buttonHeight, config);
            this.container.add(button);
            this.buttons[config.key] = button;
            offsetY += buttonHeight + spacing;
        });

        // 淡入動畫
        this.container.setAlpha(0.8);
    }

    /**
     * 創建水平佈局（頂部或底部）
     */
    createHorizontalLayout(x, y) {
        this.container = this.scene.add.container(x, y);
        this.container.setDepth(4000);

        const buttonWidth = 100;
        const spacing = 10;
        const totalWidth = (this.sceneButtons.length * (buttonWidth + spacing)) - spacing;
        let offsetX = -totalWidth / 2;

        this.sceneButtons.forEach(config => {
            const button = this.createButton(offsetX, 0, buttonWidth, 40, config);
            this.container.add(button);
            this.buttons[config.key] = button;
            offsetX += buttonWidth + spacing;
        });

        // 淡入動畫
        this.container.setAlpha(0.9);
    }

    /**
     * 創建單個場景切換按鈕
     */
    createButton(x, y, width, height, config) {
        const buttonContainer = this.scene.add.container(x, y);

        // 判斷是否為當前場景
        const isCurrentScene = this.currentSceneKey === config.key;

        // 背景
        const bg = this.scene.add.rectangle(0, 0, width, height, config.color);
        bg.setStrokeStyle(2, isCurrentScene ? 0xFFD700 : 0xFFFFFF);
        bg.setAlpha(isCurrentScene ? 1.0 : 0.85);

        // 圖標
        const icon = this.scene.add.text(0, -8, config.icon, {
            fontSize: '20px'
        }).setOrigin(0.5);

        // 標籤
        const label = this.scene.add.text(0, 12, config.label, {
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: isCurrentScene ? 'bold' : 'normal'
        }).setOrigin(0.5);

        buttonContainer.add([bg, icon, label]);

        // 如果不是當前場景，設置交互
        if (!isCurrentScene) {
            bg.setInteractive({ useHandCursor: true });

            bg.on('pointerover', () => {
                bg.setAlpha(1.0);
                bg.setStrokeStyle(3, 0xFFD700);
                this.scene.tweens.add({
                    targets: buttonContainer,
                    scale: 1.1,
                    duration: 150,
                    ease: 'Power2'
                });
            });

            bg.on('pointerout', () => {
                bg.setAlpha(0.85);
                bg.setStrokeStyle(2, 0xFFFFFF);
                this.scene.tweens.add({
                    targets: buttonContainer,
                    scale: 1.0,
                    duration: 150,
                    ease: 'Power2'
                });
            });

            bg.on('pointerdown', () => {
                // 使用 SceneManager 切換場景
                if (this.sceneManager && this.sceneManager[config.method]) {
                    this.sceneManager[config.method]();
                }
            });
        } else {
            // 當前場景標記（金色光暈）
            bg.setFillStyle(config.color, 0.95);
        }

        buttonContainer.userData = config;
        return buttonContainer;
    }

    /**
     * 更新當前場景高亮
     */
    updateCurrentScene(sceneKey) {
        this.currentSceneKey = sceneKey;

        // 重新創建按鈕（簡單方式）
        if (this.container) {
            const position = this.getContainerPosition();
            this.destroy();
            this.create(position);
        }
    }

    /**
     * 獲取當前容器位置
     */
    getContainerPosition() {
        const { width, height } = this.scene.cameras.main;

        if (!this.container) return 'left';

        const x = this.container.x;
        const y = this.container.y;

        if (x < width / 4) return 'left';
        if (x > width * 3 / 4) return 'right';
        if (y < height / 4) return 'top';
        return 'bottom';
    }

    /**
     * 顯示/隱藏 UI
     */
    setVisible(visible) {
        if (this.container) {
            this.container.setVisible(visible);
        }
    }

    /**
     * 切換顯示狀態
     */
    toggle() {
        if (this.container) {
            this.setVisible(!this.container.visible);
        }
    }

    /**
     * 設置透明度
     */
    setAlpha(alpha) {
        if (this.container) {
            this.container.setAlpha(alpha);
        }
    }

    /**
     * 銷毀 UI
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
            this.buttons = {};
        }
    }
}

module.exports = SceneSwitchUI;
