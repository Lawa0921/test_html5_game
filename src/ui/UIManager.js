/**
 * UI 管理器 - 統一管理遊戲介面
 * 所有介面整合在畫面右下角
 */
class UIManager {
    constructor(scene, gameState) {
        this.scene = scene;
        this.gameState = gameState;

        // UI 容器
        this.mainContainer = null;
        this.panelContainer = null;
        this.currentPanel = null;

        // UI 狀態
        this.isExpanded = false;
        this.currentTab = null;

        // UI 尺寸
        this.collapsedWidth = 200;
        this.collapsedHeight = 150;
        this.expandedWidth = 800;
        this.expandedHeight = 600;

        // 位置(右下角)
        this.anchorX = null;
        this.anchorY = null;

        // UI 元素引用
        this.elements = {
            silverText: null,
            resourceDisplay: null,
            mainButton: null,
            settingsButton: null,
            closeButton: null,
            tabButtons: {},
            panels: {}
        };

        this.initialize();
    }

    /**
     * 初始化 UI
     */
    initialize() {
        const { width, height } = this.scene.cameras.main;

        // 計算右下角位置
        this.anchorX = width - 20;
        this.anchorY = height - 20;

        // 創建主容器
        this.mainContainer = this.scene.add.container(this.anchorX, this.anchorY);
        this.mainContainer.setDepth(1000); // 確保在最上層

        // 創建收起狀態的 UI
        this.createCollapsedUI();
    }

    /**
     * 創建收起狀態的 UI
     */
    createCollapsedUI() {
        // 清空容器
        this.mainContainer.removeAll(true);

        // 半透明背景
        const bg = this.scene.add.rectangle(
            -this.collapsedWidth / 2,
            -this.collapsedHeight / 2,
            this.collapsedWidth,
            this.collapsedHeight,
            0x000000,
            0.8
        );
        bg.setStrokeStyle(2, 0xffd700);
        this.mainContainer.add(bg);

        // 資源顯示區
        const silverIcon = this.scene.add.text(
            -this.collapsedWidth / 2 + 10,
            -this.collapsedHeight / 2 + 15,
            '💰',
            { fontSize: '24px' }
        );
        this.mainContainer.add(silverIcon);

        this.elements.silverText = this.scene.add.text(
            -this.collapsedWidth / 2 + 45,
            -this.collapsedHeight / 2 + 20,
            '0',
            { fontSize: '18px', color: '#ffd700', fontStyle: 'bold' }
        );
        this.mainContainer.add(this.elements.silverText);

        // 其他資源顯示
        const homeIcon = this.scene.add.text(
            -this.collapsedWidth / 2 + 10,
            -this.collapsedHeight / 2 + 50,
            '🏠',
            { fontSize: '20px' }
        );
        this.mainContainer.add(homeIcon);

        const homeLevelText = this.scene.add.text(
            -this.collapsedWidth / 2 + 45,
            -this.collapsedHeight / 2 + 55,
            `Lv.${this.gameState.homeLevel}`,
            { fontSize: '16px', color: '#ffffff' }
        );
        this.mainContainer.add(homeLevelText);

        // 主介面按鈕
        const mainBtn = this.createButton(
            0,
            -this.collapsedHeight / 2 + 100,
            160,
            35,
            '開啟介面',
            () => this.expandUI(),
            0x4a90e2
        );
        this.mainContainer.add(mainBtn.container);
        this.elements.mainButton = mainBtn;
    }

    /**
     * 展開 UI
     */
    expandUI() {
        this.isExpanded = true;

        // 清空容器
        this.mainContainer.removeAll(true);

        // 創建展開後的背景
        const bg = this.scene.add.rectangle(
            -this.expandedWidth / 2,
            -this.expandedHeight / 2,
            this.expandedWidth,
            this.expandedHeight,
            0x000000,
            0.92
        );
        bg.setStrokeStyle(3, 0xffd700);
        this.mainContainer.add(bg);

        // 標題
        const title = this.scene.add.text(
            -this.expandedWidth / 2 + 20,
            -this.expandedHeight / 2 + 15,
            '桌面冒險者',
            { fontSize: '28px', color: '#ffd700', fontStyle: 'bold' }
        );
        this.mainContainer.add(title);

        // 創建標籤頁
        this.createTabs();

        // 創建底部按鈕
        this.createBottomButtons();

        // 顯示預設標籤頁(狀態)
        this.showTab('status');
    }

    /**
     * 收起 UI
     */
    collapseUI() {
        this.isExpanded = false;
        this.currentTab = null;
        this.createCollapsedUI();
    }

    /**
     * 創建標籤頁按鈕
     */
    createTabs() {
        const tabs = [
            { key: 'status', label: '狀態' },
            { key: 'class', label: '職業' },
            { key: 'equipment', label: '裝備' },
            { key: 'items', label: '道具' },
            { key: 'skills', label: '技能' },
            { key: 'craft', label: '製造' },
            { key: 'develop', label: '開發' }
        ];

        const tabY = -this.expandedHeight / 2 + 60;
        const tabStartX = -this.expandedWidth / 2 + 20;
        const tabWidth = 100;
        const tabSpacing = 10;

        tabs.forEach((tab, index) => {
            const x = tabStartX + index * (tabWidth + tabSpacing);
            const btn = this.createTabButton(x, tabY, tabWidth, 35, tab.label, tab.key);
            this.mainContainer.add(btn.container);
            this.elements.tabButtons[tab.key] = btn;
        });
    }

    /**
     * 創建標籤按鈕
     */
    createTabButton(x, y, width, height, label, key) {
        const container = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2c3e50);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0x34495e);

        const text = this.scene.add.text(0, 0, label, {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // 點擊事件
        bg.on('pointerover', () => {
            if (this.currentTab !== key) {
                bg.setFillStyle(0x34495e);
            }
        });

        bg.on('pointerout', () => {
            if (this.currentTab !== key) {
                bg.setFillStyle(0x2c3e50);
            }
        });

        bg.on('pointerdown', () => {
            this.showTab(key);
        });

        return { container, bg, text, key };
    }

    /**
     * 顯示指定標籤頁
     */
    showTab(tabKey) {
        // 更新按鈕狀態
        Object.values(this.elements.tabButtons).forEach(btn => {
            if (btn.key === tabKey) {
                btn.bg.setFillStyle(0x3498db); // 高亮
            } else {
                btn.bg.setFillStyle(0x2c3e50); // 正常
            }
        });

        // 移除當前面板
        if (this.panelContainer) {
            this.panelContainer.destroy();
        }

        this.currentTab = tabKey;

        // 創建面板容器
        const panelX = -this.expandedWidth / 2 + 20;
        const panelY = -this.expandedHeight / 2 + 110;
        const panelWidth = this.expandedWidth - 40;
        const panelHeight = this.expandedHeight - 180; // 留空間給底部按鈕

        this.panelContainer = this.scene.add.container(panelX, panelY);
        this.mainContainer.add(this.panelContainer);

        // 根據標籤頁類型創建內容
        switch (tabKey) {
            case 'status':
                this.createStatusPanel(panelWidth, panelHeight);
                break;
            case 'class':
                this.createClassPanel(panelWidth, panelHeight);
                break;
            case 'equipment':
                this.createEquipmentPanel(panelWidth, panelHeight);
                break;
            case 'items':
                this.createItemsPanel(panelWidth, panelHeight);
                break;
            case 'skills':
                this.createSkillsPanel(panelWidth, panelHeight);
                break;
            case 'craft':
                this.createCraftPanel(panelWidth, panelHeight);
                break;
            case 'develop':
                this.createDevelopPanel(panelWidth, panelHeight);
                break;
        }
    }

    /**
     * 創建狀態面板
     */
    createStatusPanel(width, height) {
        const stats = [
            `銀兩: ${Math.floor(this.gameState.silver).toLocaleString()}`,
            `家園等級: ${this.gameState.homeLevel}`,
            ``,
            `總點擊次數: ${this.gameState.totalClicks.toLocaleString()}`,
            `總按鍵次數: ${this.gameState.totalKeyPresses.toLocaleString()}`,
            ``,
            `已解鎖角色: ${this.gameState.characters.filter(c => c.unlocked).length} / 10`,
            `地下城完成: ${this.gameState.stats.dungeonsCompleted}`,
            `寶藏發現: ${this.gameState.stats.treasuresFound}`,
            `山賊擊敗: ${this.gameState.stats.banditsDefeated}`,
            ``,
            `遊戲時間: ${Math.floor(this.gameState.playTime / 60000)} 分鐘`
        ];

        stats.forEach((line, index) => {
            const text = this.scene.add.text(10, index * 30, line, {
                fontSize: '16px',
                color: '#ffffff'
            });
            this.panelContainer.add(text);
        });
    }

    /**
     * 創建職業面板
     */
    createClassPanel(width, height) {
        const title = this.scene.add.text(10, 0, '角色職業', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        this.gameState.characters.forEach((char, index) => {
            const y = 40 + index * 35;
            const status = char.unlocked ? `Lv.${char.level}` : '🔒 未解鎖';
            const color = char.unlocked ? '#00ff88' : '#888888';

            const text = this.scene.add.text(10, y, `${char.name} (${char.type}): ${status}`, {
                fontSize: '16px',
                color: color
            });
            this.panelContainer.add(text);

            // 如果已解鎖,顯示詳細資訊
            if (char.unlocked) {
                const details = this.scene.add.text(300, y,
                    `ATK:${char.attack} DEF:${char.defense} HP:${char.hp}/${char.maxHp}`,
                    { fontSize: '14px', color: '#aaaaaa' }
                );
                this.panelContainer.add(details);
            }
        });
    }

    /**
     * 創建裝備面板
     */
    createEquipmentPanel(width, height) {
        const title = this.scene.add.text(10, 0, '裝備系統', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        const info = this.scene.add.text(10, 40, '裝備系統開發中...', {
            fontSize: '16px',
            color: '#888888'
        });
        this.panelContainer.add(info);
    }

    /**
     * 創建道具面板
     */
    createItemsPanel(width, height) {
        const title = this.scene.add.text(10, 0, '道具背包', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        const info = this.scene.add.text(10, 40, '道具系統開發中...', {
            fontSize: '16px',
            color: '#888888'
        });
        this.panelContainer.add(info);
    }

    /**
     * 創建技能面板
     */
    createSkillsPanel(width, height) {
        const title = this.scene.add.text(10, 0, '技能樹', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        const info = this.scene.add.text(10, 40, '技能系統開發中...', {
            fontSize: '16px',
            color: '#888888'
        });
        this.panelContainer.add(info);
    }

    /**
     * 創建製造面板
     */
    createCraftPanel(width, height) {
        const title = this.scene.add.text(10, 0, '製造工坊', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        const info = this.scene.add.text(10, 40, '製造系統開發中...', {
            fontSize: '16px',
            color: '#888888'
        });
        this.panelContainer.add(info);
    }

    /**
     * 創建開發面板
     */
    createDevelopPanel(width, height) {
        const title = this.scene.add.text(10, 0, '建設開發', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        const homeInfo = this.scene.add.text(10, 40,
            `當前家園等級: ${this.gameState.homeLevel}`,
            { fontSize: '16px', color: '#ffffff' }
        );
        this.panelContainer.add(homeInfo);

        // 升級按鈕
        if (this.gameState.homeLevel < 6) {
            const costs = { 1: 500, 2: 2000, 3: 5000, 4: 10000, 5: 50000 };
            const cost = costs[this.gameState.homeLevel];

            const upgradeBtn = this.createButton(
                10, 80, 150, 35,
                `升級 (${cost} 銀兩)`,
                () => {
                    const result = this.gameState.upgradeHome();
                    if (result.success) {
                        this.showTab('develop'); // 刷新面板
                        this.updateResourceDisplay();
                    }
                },
                0x27ae60
            );
            this.panelContainer.add(upgradeBtn.container);
        } else {
            const maxText = this.scene.add.text(10, 80, '家園已達最高等級', {
                fontSize: '16px',
                color: '#00ff88'
            });
            this.panelContainer.add(maxText);
        }
    }

    /**
     * 創建底部按鈕
     */
    createBottomButtons() {
        const buttonY = this.expandedHeight / 2 - 40;

        // 系統設定按鈕
        const settingsBtn = this.createButton(
            -this.expandedWidth / 2 + 100,
            buttonY,
            160,
            35,
            '系統設定',
            () => this.showSettings(),
            0x95a5a6
        );
        this.mainContainer.add(settingsBtn.container);
        this.elements.settingsButton = settingsBtn;

        // 關閉遊戲按鈕
        const closeBtn = this.createButton(
            -this.expandedWidth / 2 + 280,
            buttonY,
            160,
            35,
            '關閉遊戲',
            () => this.closeGame(),
            0xe74c3c
        );
        this.mainContainer.add(closeBtn.container);
        this.elements.closeButton = closeBtn;

        // 收起介面按鈕
        const collapseBtn = this.createButton(
            this.expandedWidth / 2 - 100,
            buttonY,
            160,
            35,
            '收起介面',
            () => this.collapseUI(),
            0x34495e
        );
        this.mainContainer.add(collapseBtn.container);
    }

    /**
     * 創建按鈕
     */
    createButton(x, y, width, height, label, callback, color = 0x4a90e2) {
        const container = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, width, height, color);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0xffffff);

        const text = this.scene.add.text(0, 0, label, {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // Hover 效果
        const originalColor = color;
        const hoverColor = Phaser.Display.Color.IntegerToColor(color).lighten(20).color;
        const activeColor = Phaser.Display.Color.IntegerToColor(color).darken(20).color;

        bg.on('pointerover', () => bg.setFillStyle(hoverColor));
        bg.on('pointerout', () => bg.setFillStyle(originalColor));
        bg.on('pointerdown', () => {
            bg.setFillStyle(activeColor);
            callback();
        });
        bg.on('pointerup', () => bg.setFillStyle(hoverColor));

        return { container, bg, text };
    }

    /**
     * 顯示系統設定
     */
    showSettings() {
        // 創建遮罩
        const { width, height } = this.scene.cameras.main;
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(1500);
        overlay.setInteractive();

        // 設定面板
        const settingsPanel = this.scene.add.container(width / 2, height / 2);
        settingsPanel.setDepth(1501);

        const bg = this.scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0x3498db);
        settingsPanel.add(bg);

        const title = this.scene.add.text(0, -120, '系統設定', {
            fontSize: '24px',
            color: '#3498db',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        settingsPanel.add(title);

        // 音量控制
        const volumeLabel = this.scene.add.text(-150, -60, '音量:', {
            fontSize: '18px',
            color: '#ffffff'
        });
        settingsPanel.add(volumeLabel);

        // 音量滑桿背景
        const sliderBg = this.scene.add.rectangle(0, -60, 200, 10, 0x555555);
        settingsPanel.add(sliderBg);

        // 音量滑桿
        const volume = this.gameState.settings?.volume ?? 1.0;
        const sliderFill = this.scene.add.rectangle(
            -100 + (volume * 200),
            -60,
            volume * 200,
            10,
            0x3498db
        );
        sliderFill.setOrigin(0, 0.5);
        settingsPanel.add(sliderFill);

        // 音量值顯示
        const volumeText = this.scene.add.text(110, -60, `${Math.floor(volume * 100)}%`, {
            fontSize: '16px',
            color: '#ffffff'
        });
        settingsPanel.add(volumeText);

        // TODO: 實作可拖曳的音量滑桿

        // 版本資訊
        const versionText = this.scene.add.text(0, 20, '版本: 2.0.0', {
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
        settingsPanel.add(versionText);

        // 關閉按鈕
        const closeBtn = this.createButton(0, 100, 120, 35, '關閉', () => {
            overlay.destroy();
            settingsPanel.destroy();
        }, 0x95a5a6);
        settingsPanel.add(closeBtn.container);
    }

    /**
     * 關閉遊戲
     */
    closeGame() {
        // 先存檔
        this.gameState.save();

        // 發送關閉事件到主進程
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                ipcRenderer.send('quit-game');
            } catch (e) {
                console.log('無法通知主進程,直接關閉視窗');
                window.close();
            }
        } else {
            window.close();
        }
    }

    /**
     * 更新資源顯示
     */
    updateResourceDisplay() {
        if (this.elements.silverText) {
            this.elements.silverText.setText(
                Math.floor(this.gameState.silver).toLocaleString()
            );
        }
    }

    /**
     * 更新方法(每幀調用)
     */
    update() {
        // 即時更新資源顯示
        this.updateResourceDisplay();
    }

    /**
     * 銷毀
     */
    destroy() {
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
    }
}

module.exports = UIManager;
