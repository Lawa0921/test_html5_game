/**
 * UI 管理器 - 客棧經營遊戲介面
 * 桌寵模式：小視窗顯示基本資訊
 * 展開模式：完整客棧經營介面
 */
const { ipcRenderer } = require('electron');

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
        this.expandedWidth = 850;
        this.expandedHeight = 600;

        // 位置(右下角)
        this.anchorX = null;
        this.anchorY = null;

        // UI 元素引用
        this.elements = {
            silverText: null,
            incomeText: null,
            innNameText: null,
            mainButton: null,
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
     * 創建收起狀態的 UI（桌寵模式）
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
        bg.setStrokeStyle(2, 0xff6b6b);
        this.mainContainer.add(bg);

        // 客棧名稱
        this.elements.innNameText = this.scene.add.text(
            -this.collapsedWidth / 2 + 10,
            -this.collapsedHeight / 2 + 10,
            this.gameState.inn.name,
            { fontSize: '16px', color: '#ff6b6b', fontStyle: 'bold' }
        );
        this.mainContainer.add(this.elements.innNameText);

        // 銀兩顯示
        const silverIcon = this.scene.add.text(
            -this.collapsedWidth / 2 + 10,
            -this.collapsedHeight / 2 + 40,
            '💰',
            { fontSize: '20px' }
        );
        this.mainContainer.add(silverIcon);

        this.elements.silverText = this.scene.add.text(
            -this.collapsedWidth / 2 + 40,
            -this.collapsedHeight / 2 + 42,
            '0',
            { fontSize: '16px', color: '#ffd43b', fontStyle: 'bold' }
        );
        this.mainContainer.add(this.elements.silverText);

        // 收入/秒顯示
        const incomeIcon = this.scene.add.text(
            -this.collapsedWidth / 2 + 10,
            -this.collapsedHeight / 2 + 70,
            '📈',
            { fontSize: '18px' }
        );
        this.mainContainer.add(incomeIcon);

        this.elements.incomeText = this.scene.add.text(
            -this.collapsedWidth / 2 + 40,
            -this.collapsedHeight / 2 + 72,
            '0/秒',
            { fontSize: '14px', color: '#51cf66' }
        );
        this.mainContainer.add(this.elements.incomeText);

        // 開啟介面按鈕
        const mainBtn = this.createButton(
            0,
            -this.collapsedHeight / 2 + 110,
            160,
            30,
            '開啟客棧',
            () => this.expandUI(),
            0xff6b6b
        );
        this.mainContainer.add(mainBtn.container);
        this.elements.mainButton = mainBtn;

        // 更新顯示
        this.updateResourceDisplay();
    }

    /**
     * 展開 UI（完整客棧經營介面）
     */
    expandUI() {
        this.isExpanded = true;

        // 通知 Electron 放大視窗
        ipcRenderer.send('toggle-window-size', 'large');

        // 清空容器
        this.mainContainer.removeAll(true);

        // 創建展開後的背景
        const bg = this.scene.add.rectangle(
            -this.expandedWidth / 2,
            -this.expandedHeight / 2,
            this.expandedWidth,
            this.expandedHeight,
            0x000000,
            0.93
        );
        bg.setStrokeStyle(3, 0xff6b6b);
        this.mainContainer.add(bg);

        // 標題
        const title = this.scene.add.text(
            -this.expandedWidth / 2 + 20,
            -this.expandedHeight / 2 + 15,
            `🏮 ${this.gameState.inn.name}`,
            { fontSize: '26px', color: '#ff6b6b', fontStyle: 'bold' }
        );
        this.mainContainer.add(title);

        // 頂部資訊欄
        const infoBar = this.createInfoBar();
        this.mainContainer.add(infoBar);

        // 創建標籤頁
        this.createTabs();

        // 創建底部按鈕
        this.createBottomButtons();

        // 顯示預設標籤頁(員工)
        this.showTab('employees');
    }

    /**
     * 創建頂部資訊欄
     */
    createInfoBar() {
        const container = this.scene.add.container(
            -this.expandedWidth / 2 + 250,
            -this.expandedHeight / 2 + 25
        );

        // 銀兩
        const silverText = this.scene.add.text(0, 0, '', {
            fontSize: '18px',
            color: '#ffd43b',
            fontStyle: 'bold'
        });
        container.add(silverText);
        this.elements.topSilverText = silverText;

        // 收入/秒
        const incomeText = this.scene.add.text(180, 0, '', {
            fontSize: '16px',
            color: '#51cf66'
        });
        container.add(incomeText);
        this.elements.topIncomeText = incomeText;

        // 名聲
        const reputationText = this.scene.add.text(360, 0, '', {
            fontSize: '16px',
            color: '#ff6b6b'
        });
        container.add(reputationText);
        this.elements.topReputationText = reputationText;

        return container;
    }

    /**
     * 收起 UI
     */
    collapseUI() {
        this.isExpanded = false;
        this.currentTab = null;

        // 通知 Electron 縮小視窗
        ipcRenderer.send('toggle-window-size', 'small');

        this.createCollapsedUI();
    }

    /**
     * 視窗大小變化回調
     */
    onWindowResize(width, height, mode) {
        console.log(`UI 調整: ${mode} 模式 (${width}x${height})`);

        // 更新錨點位置（右下角）
        this.anchorX = width - 20;
        this.anchorY = height - 20;

        // 更新容器位置
        if (this.mainContainer) {
            this.mainContainer.setPosition(this.anchorX, this.anchorY);
        }
    }

    /**
     * 創建標籤頁按鈕
     */
    createTabs() {
        const tabs = [
            { key: 'employees', label: '👥 員工' },
            { key: 'upgrade', label: '🏗️ 客棧升級' },
            { key: 'stats', label: '📊 統計' },
            { key: 'settings', label: '⚙️ 設定' }
        ];

        const tabY = -this.expandedHeight / 2 + 65;
        const tabStartX = -this.expandedWidth / 2 + 20;
        const tabWidth = 140;
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
            fontSize: '15px',
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
                btn.bg.setFillStyle(0xff6b6b); // 高亮
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
        const panelY = -this.expandedHeight / 2 + 115;
        const panelWidth = this.expandedWidth - 40;
        const panelHeight = this.expandedHeight - 185; // 留空間給底部按鈕

        this.panelContainer = this.scene.add.container(panelX, panelY);
        this.mainContainer.add(this.panelContainer);

        // 根據標籤頁類型創建內容
        switch (tabKey) {
            case 'employees':
                this.createEmployeesPanel(panelWidth, panelHeight);
                break;
            case 'upgrade':
                this.createUpgradePanel(panelWidth, panelHeight);
                break;
            case 'stats':
                this.createStatsPanel(panelWidth, panelHeight);
                break;
            case 'settings':
                this.createSettingsPanel(panelWidth, panelHeight);
                break;
        }
    }

    /**
     * 創建員工面板
     */
    createEmployeesPanel(width, height) {
        const title = this.scene.add.text(10, 0, '📋 員工管理', {
            fontSize: '20px',
            color: '#ffd43b',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        // 滾動容器（簡化版，10個員工不需要滾動）
        const startY = 40;
        const itemHeight = 40;

        this.gameState.employees.forEach((employee, index) => {
            const y = startY + index * itemHeight;

            // 員工背景
            const itemBg = this.scene.add.rectangle(
                width / 2 - 20,
                y + 15,
                width - 40,
                35,
                employee.unlocked ? 0x1a1a1a : 0x0a0a0a,
                0.5
            );
            itemBg.setStrokeStyle(1, employee.unlocked ? 0x51cf66 : 0x555555);
            this.panelContainer.add(itemBg);

            // 員工圖示和名稱
            const emoji = this.getEmployeeEmoji(employee.type);
            const nameText = this.scene.add.text(
                10,
                y,
                `${emoji} ${employee.name}`,
                {
                    fontSize: '16px',
                    color: employee.unlocked ? '#ffffff' : '#666666',
                    fontStyle: employee.unlocked ? 'bold' : 'normal'
                }
            );
            this.panelContainer.add(nameText);

            // 等級
            if (employee.unlocked) {
                const levelText = this.scene.add.text(
                    200,
                    y,
                    `Lv.${employee.level}`,
                    { fontSize: '15px', color: '#51cf66' }
                );
                this.panelContainer.add(levelText);

                // 收益加成
                const bonusText = this.scene.add.text(
                    280,
                    y,
                    `+${(employee.incomeBonus * 100).toFixed(0)}%/級`,
                    { fontSize: '14px', color: '#ffd43b' }
                );
                this.panelContainer.add(bonusText);

                // 升級按鈕
                if (employee.level < 200) {
                    const upgradeBtn = this.createButton(
                        width - 190,
                        y + 15,
                        160,
                        28,
                        `升級 (💰${employee.upgradeCost})`,
                        () => {
                            const result = this.gameState.upgradeEmployee(employee.id);
                            if (result.success) {
                                this.showTab('employees'); // 刷新面板
                            } else {
                                this.showMessage(result.message);
                            }
                        },
                        0x27ae60,
                        '12px'
                    );
                    this.panelContainer.add(upgradeBtn.container);
                } else {
                    const maxText = this.scene.add.text(
                        width - 150,
                        y,
                        '✨ 已滿級',
                        { fontSize: '14px', color: '#ffd43b' }
                    );
                    this.panelContainer.add(maxText);
                }
            } else {
                // 未解鎖顯示
                const lockText = this.scene.add.text(
                    200,
                    y,
                    `🔒 ${employee.description}`,
                    { fontSize: '14px', color: '#888888' }
                );
                this.panelContainer.add(lockText);

                // 招募按鈕
                const unlockBtn = this.createButton(
                    width - 190,
                    y + 15,
                    160,
                    28,
                    `招募 (💰${employee.unlockCost})`,
                    () => {
                        const result = this.gameState.unlockEmployee(employee.id);
                        if (result.success) {
                            this.showTab('employees'); // 刷新面板
                        } else {
                            this.showMessage(result.message);
                        }
                    },
                    0x3498db,
                    '12px'
                );
                this.panelContainer.add(unlockBtn.container);
            }
        });
    }

    /**
     * 創建客棧升級面板
     */
    createUpgradePanel(width, height) {
        const title = this.scene.add.text(10, 0, '🏗️ 客棧設施升級', {
            fontSize: '20px',
            color: '#ffd43b',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        const facilities = [
            {
                key: 'lobby',
                name: '大堂',
                emoji: '🏛️',
                description: '提升客棧容量，增加收入',
                bonus: '+10%',
                baseCost: 1000
            },
            {
                key: 'rooms',
                name: '客房',
                emoji: '🛏️',
                description: '增加客房數量，提升收入',
                bonus: '+5%',
                baseCost: 800
            },
            {
                key: 'kitchen',
                name: '廚房',
                emoji: '🍜',
                description: '提升餐飲品質，增加收入',
                bonus: '+8%',
                baseCost: 1200
            },
            {
                key: 'decoration',
                name: '裝潢',
                emoji: '🎨',
                description: '美化環境，提升客人滿意度',
                bonus: '+6%',
                baseCost: 1500
            }
        ];

        facilities.forEach((facility, index) => {
            const y = 50 + index * 90;
            const currentLevel = this.gameState.inn[facility.key];
            const cost = Math.floor(facility.baseCost * Math.pow(1.5, currentLevel - 1));

            // 設施卡片背景
            const cardBg = this.scene.add.rectangle(
                width / 2 - 20,
                y + 30,
                width - 40,
                75,
                0x1a1a1a,
                0.5
            );
            cardBg.setStrokeStyle(2, 0xff6b6b);
            this.panelContainer.add(cardBg);

            // 設施圖示
            const emojiText = this.scene.add.text(15, y, facility.emoji, {
                fontSize: '32px'
            });
            this.panelContainer.add(emojiText);

            // 設施名稱和等級
            const nameText = this.scene.add.text(70, y, `${facility.name} Lv.${currentLevel}`, {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            this.panelContainer.add(nameText);

            // 設施描述
            const descText = this.scene.add.text(70, y + 25, facility.description, {
                fontSize: '14px',
                color: '#aaaaaa'
            });
            this.panelContainer.add(descText);

            // 收益加成
            const bonusText = this.scene.add.text(70, y + 45, `每級加成: ${facility.bonus}`, {
                fontSize: '13px',
                color: '#51cf66'
            });
            this.panelContainer.add(bonusText);

            // 升級按鈕
            if (currentLevel < 100) {
                const upgradeBtn = this.createButton(
                    width - 190,
                    y + 30,
                    160,
                    35,
                    `升級 (💰${cost.toLocaleString()})`,
                    () => {
                        const result = this.gameState.upgradeInn(facility.key);
                        if (result.success) {
                            this.showTab('upgrade'); // 刷新面板
                        } else {
                            this.showMessage(result.message);
                        }
                    },
                    0xff6b6b,
                    '13px'
                );
                this.panelContainer.add(upgradeBtn.container);
            } else {
                const maxText = this.scene.add.text(width - 150, y + 30, '✨ 已滿級', {
                    fontSize: '14px',
                    color: '#ffd43b'
                });
                this.panelContainer.add(maxText);
            }
        });
    }

    /**
     * 創建統計面板
     */
    createStatsPanel(width, height) {
        const title = this.scene.add.text(10, 0, '📊 客棧統計', {
            fontSize: '20px',
            color: '#ffd43b',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        // 統計數據
        const stats = [
            `💰 總銀兩: ${this.gameState.totalSilver.toLocaleString()}`,
            `📈 每秒收入: ${this.gameState.calculateIncomePerSecond()}`,
            `⭐ 客棧名聲: ${this.gameState.inn.reputation}`,
            ``,
            `👥 已招募員工: ${this.gameState.employees.filter(e => e.unlocked).length} / 10`,
            `🏛️ 大堂等級: ${this.gameState.inn.lobby}`,
            `🛏️ 客房數量: ${this.gameState.inn.rooms}`,
            `🍜 廚房等級: ${this.gameState.inn.kitchen}`,
            `🎨 裝潢等級: ${this.gameState.inn.decoration}`,
            ``,
            `📅 遊戲時間: ${Math.floor(this.gameState.playTime / 60)} 分鐘`,
            ``,
            `🎭 商隊服務: ${this.gameState.stats.merchantsServed} 次`,
            `⚔️ 擊退山賊: ${this.gameState.stats.robbersDefeated} 次`,
            `🗡️ 招募俠客: ${this.gameState.stats.knightsRecruited} 次`,
            `🎉 舉辦宴會: ${this.gameState.stats.festivalsHeld} 次`,
            `🏮 通過巡查: ${this.gameState.stats.inspectionsPassed} 次`
        ];

        stats.forEach((line, index) => {
            const text = this.scene.add.text(10, 40 + index * 24, line, {
                fontSize: '15px',
                color: line === '' ? '#000000' : '#ffffff'
            });
            this.panelContainer.add(text);
        });
    }

    /**
     * 創建設定面板
     */
    createSettingsPanel(width, height) {
        const title = this.scene.add.text(10, 0, '⚙️ 遊戲設定', {
            fontSize: '20px',
            color: '#ffd43b',
            fontStyle: 'bold'
        });
        this.panelContainer.add(title);

        // 音量控制
        const volumeLabel = this.scene.add.text(10, 50, '🔊 音量:', {
            fontSize: '18px',
            color: '#ffffff'
        });
        this.panelContainer.add(volumeLabel);

        const volume = this.gameState.settings?.volume ?? 1.0;
        const volumeText = this.scene.add.text(100, 50, `${Math.floor(volume * 100)}%`, {
            fontSize: '16px',
            color: '#51cf66'
        });
        this.panelContainer.add(volumeText);

        // 音樂開關
        const musicLabel = this.scene.add.text(10, 90, '🎵 音樂:', {
            fontSize: '18px',
            color: '#ffffff'
        });
        this.panelContainer.add(musicLabel);

        const musicStatus = this.gameState.settings?.musicEnabled ? '開啟' : '關閉';
        const musicText = this.scene.add.text(100, 90, musicStatus, {
            fontSize: '16px',
            color: this.gameState.settings?.musicEnabled ? '#51cf66' : '#e74c3c'
        });
        this.panelContainer.add(musicText);

        // 音效開關
        const sfxLabel = this.scene.add.text(10, 130, '🔔 音效:', {
            fontSize: '18px',
            color: '#ffffff'
        });
        this.panelContainer.add(sfxLabel);

        const sfxStatus = this.gameState.settings?.sfxEnabled ? '開啟' : '關閉';
        const sfxText = this.scene.add.text(100, 130, sfxStatus, {
            fontSize: '16px',
            color: this.gameState.settings?.sfxEnabled ? '#51cf66' : '#e74c3c'
        });
        this.panelContainer.add(sfxText);

        // 版本資訊
        const versionText = this.scene.add.text(10, 190, '版本: 2.0.0 - 客棧經營掛機遊戲', {
            fontSize: '14px',
            color: '#888888'
        });
        this.panelContainer.add(versionText);

        // 存檔按鈕
        const saveBtn = this.createButton(
            150,
            260,
            180,
            40,
            '💾 手動存檔',
            () => {
                const result = this.gameState.save();
                this.showMessage(result.message);
            },
            0x27ae60
        );
        this.panelContainer.add(saveBtn.container);

        // 重置遊戲按鈕
        const resetBtn = this.createButton(
            360,
            260,
            180,
            40,
            '⚠️ 重置遊戲',
            () => {
                this.showResetConfirmation();
            },
            0xe74c3c
        );
        this.panelContainer.add(resetBtn.container);
    }

    /**
     * 創建底部按鈕
     */
    createBottomButtons() {
        const buttonY = this.expandedHeight / 2 - 35;

        // 關閉遊戲按鈕
        const closeBtn = this.createButton(
            -this.expandedWidth / 2 + 100,
            buttonY,
            160,
            30,
            '關閉遊戲',
            () => this.closeGame(),
            0xe74c3c
        );
        this.mainContainer.add(closeBtn.container);

        // 收起介面按鈕
        const collapseBtn = this.createButton(
            this.expandedWidth / 2 - 100,
            buttonY,
            160,
            30,
            '收起介面',
            () => this.collapseUI(),
            0x34495e
        );
        this.mainContainer.add(collapseBtn.container);
    }

    /**
     * 創建按鈕
     */
    createButton(x, y, width, height, label, callback, color = 0x4a90e2, fontSize = '14px') {
        const container = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, width, height, color);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0xffffff);

        const text = this.scene.add.text(0, 0, label, {
            fontSize: fontSize,
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
     * 顯示重置確認對話框
     */
    showResetConfirmation() {
        const { width, height } = this.scene.cameras.main;
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setDepth(2000);
        overlay.setInteractive();

        const confirmPanel = this.scene.add.container(width / 2, height / 2);
        confirmPanel.setDepth(2001);

        const bg = this.scene.add.rectangle(0, 0, 400, 200, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xe74c3c);
        confirmPanel.add(bg);

        const title = this.scene.add.text(0, -60, '⚠️ 警告', {
            fontSize: '24px',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        confirmPanel.add(title);

        const message = this.scene.add.text(0, -20, '確定要重置遊戲嗎？\n所有進度將會遺失！', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        confirmPanel.add(message);

        // 確認按鈕
        const confirmBtn = this.createButton(
            -80, 50, 120, 35, '確認重置',
            () => {
                this.gameState.reset();
                overlay.destroy();
                confirmPanel.destroy();
                this.collapseUI();
                this.showMessage('遊戲已重置');
            },
            0xe74c3c
        );
        confirmPanel.add(confirmBtn.container);

        // 取消按鈕
        const cancelBtn = this.createButton(
            80, 50, 120, 35, '取消',
            () => {
                overlay.destroy();
                confirmPanel.destroy();
            },
            0x95a5a6
        );
        confirmPanel.add(cancelBtn.container);
    }

    /**
     * 顯示訊息提示
     */
    showMessage(message) {
        const msgText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            100,
            message,
            {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        );
        msgText.setOrigin(0.5);
        msgText.setDepth(3000);

        // 2秒後消失
        this.scene.time.delayedCall(2000, () => {
            msgText.destroy();
        });
    }

    /**
     * 獲取員工表情符號
     */
    getEmployeeEmoji(type) {
        const emojis = {
            manager: '👔',
            chef: '👨‍🍳',
            waiter: '👨‍💼',
            guard: '💂',
            runner: '🏃',
            herbalist: '⚗️',
            storyteller: '📖',
            musician: '🎵',
            accountant: '📊',
            doorman: '🚪'
        };
        return emojis[type] || '👤';
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
        const income = this.gameState.calculateIncomePerSecond();

        // 收起狀態的更新
        if (this.elements.silverText) {
            this.elements.silverText.setText(
                Math.floor(this.gameState.silver).toLocaleString()
            );
        }
        if (this.elements.incomeText) {
            this.elements.incomeText.setText(`${income}/秒`);
        }

        // 展開狀態的頂部資訊欄更新
        if (this.elements.topSilverText) {
            this.elements.topSilverText.setText(
                `💰 ${Math.floor(this.gameState.silver).toLocaleString()}`
            );
        }
        if (this.elements.topIncomeText) {
            this.elements.topIncomeText.setText(`📈 ${income}/秒`);
        }
        if (this.elements.topReputationText) {
            this.elements.topReputationText.setText(
                `⭐ 名聲: ${this.gameState.inn.reputation}`
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
