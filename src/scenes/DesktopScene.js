/**
 * 桌面主場景 - 透明桌面遊戲
 */
const GameStateV2 = require('../core/GameStateV2');
const { ipcRenderer } = require('electron');

class DesktopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DesktopScene' });
        this.gameState = null;
        this.characterSprites = {};
        this.silverText = null;
        this.clickParticles = [];
        this.menuPanel = null;
        this.eventPopup = null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 初始化遊戲狀態
        this.gameState = new GameStateV2();

        // 嘗試讀檔
        const loadResult = this.gameState.load();
        if (loadResult.success) {
            console.log('讀取存檔成功');

            if (loadResult.offline) {
                this.showOfflineRewardPopup(loadResult);
            }
        } else {
            console.log('開始新遊戲');
        }

        // 創建半透明背景（可選，用於開發時可見性）
        // 生產時可以移除或設為完全透明
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.1);  // 10% 不透明度，方便開發
        bg.fillRect(0, 0, width, height);

        // 創建銀兩顯示
        this.createSilverDisplay();

        // 創建角色
        this.createCharacters();

        // 創建快捷按鈕
        this.createQuickButtons();

        // 監聽點擊事件
        this.setupInputListeners();

        // 啟動遊戲循環
        this.startGameLoop();

        // 定期自動存檔（每30秒）
        this.time.addEvent({
            delay: 30000,
            callback: () => {
                this.gameState.save();
                console.log('自動存檔');
            },
            loop: true
        });

        // 隨機事件觸發器
        this.setupRandomEvents();

        console.log('桌面冒險者已啟動');
        console.log('快捷鍵: Ctrl+Shift+D 顯示/隱藏, Ctrl+Shift+Q 退出');
    }

    /**
     * 創建銀兩顯示
     */
    createSilverDisplay() {
        const { width } = this.cameras.main;

        // 半透明背景
        const bg = this.add.rectangle(width / 2, 30, 300, 60, 0x000000, 0.7);
        bg.setStrokeStyle(2, 0xffd700);

        // 銀兩圖標（暫時用文字代替）
        this.add.text(width / 2 - 120, 30, '💰', {
            fontSize: '32px'
        }).setOrigin(0.5);

        // 銀兩數值
        this.silverText = this.add.text(width / 2 + 20, 30, '0', {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.updateSilverDisplay();
    }

    /**
     * 更新銀兩顯示
     */
    updateSilverDisplay() {
        if (this.silverText) {
            this.silverText.setText(Math.floor(this.gameState.silver).toLocaleString());
        }
    }

    /**
     * 創建角色
     */
    createCharacters() {
        this.gameState.characters.forEach(character => {
            if (character.unlocked) {
                this.createCharacterSprite(character);
            }
        });
    }

    /**
     * 創建單個角色精靈
     */
    createCharacterSprite(character) {
        // 角色顏色映射
        const colors = {
            hero: 0xff6b6b,
            mage: 0x4a69ff,
            archer: 0x51cf66,
            rogue: 0x9c36b5,
            priest: 0xffd43b,
            warrior: 0xff6b00,
            assassin: 0x2f2f2f,
            druid: 0x37b24d,
            monk: 0xfa5252,
            knight: 0x5f3dc4
        };

        // 創建角色圓形（暫時，之後替換為 Sprite）
        const sprite = this.add.circle(character.x, character.y, 25, colors[character.type] || 0xffffff);
        sprite.setInteractive({ useHandCursor: true, draggable: true });
        sprite.setStrokeStyle(2, 0xffffff);

        // 角色名稱
        const nameText = this.add.text(character.x, character.y - 40, character.name, {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5);

        // 等級顯示
        const levelText = this.add.text(character.x, character.y, `${character.level}`, {
            fontSize: '12px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 拖曳事件
        sprite.on('drag', (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;
            nameText.x = dragX;
            nameText.y = dragY - 40;
            levelText.x = dragX;
            levelText.y = dragY;

            // 更新角色位置
            character.x = dragX;
            character.y = dragY;

            // 拖曳軌跡特效
            this.createTrailParticle(dragX, dragY, colors[character.type]);
        });

        // 點擊事件
        sprite.on('pointerdown', () => {
            this.onCharacterClick(character);
        });

        // 閒置動畫
        this.tweens.add({
            targets: sprite,
            y: character.y - 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 同步動畫文字
        this.tweens.add({
            targets: [nameText, levelText],
            y: { from: nameText.y, to: nameText.y - 5 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.characterSprites[character.id] = {
            sprite,
            nameText,
            levelText,
            character
        };
    }

    /**
     * 角色點擊事件
     */
    onCharacterClick(character) {
        console.log('點擊角色:', character.name);
        this.showCharacterPanel(character);
    }

    /**
     * 顯示角色面板
     */
    showCharacterPanel(character) {
        const { width, height } = this.cameras.main;

        // 關閉現有面板
        if (this.activePanel) {
            this.activePanel.destroy();
        }

        // 創建面板
        const panel = this.add.container(width / 2, height / 2);

        // 背景
        const bg = this.add.rectangle(0, 0, 400, 500, 0x000000, 0.9);
        bg.setStrokeStyle(3, 0xffd700);
        panel.add(bg);

        // 標題
        const title = this.add.text(0, -220, character.name, {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panel.add(title);

        // 角色資訊
        const info = [
            `等級: ${character.level} / 200`,
            `經驗: ${character.exp} / ${character.maxExp}`,
            ``,
            `攻擊: ${character.attack}`,
            `防禦: ${character.defense}`,
            `血量: ${character.hp} / ${character.maxHp}`,
            ``,
            `背景故事進度: ${character.storyProgress}`,
        ];

        info.forEach((line, index) => {
            const text = this.add.text(0, -150 + index * 30, line, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);
            panel.add(text);
        });

        // 關閉按鈕
        const closeBtn = this.createButton(0, 200, '關閉', () => {
            panel.destroy();
            this.activePanel = null;
        });
        panel.add([closeBtn.bg, closeBtn.text]);

        this.activePanel = panel;
    }

    /**
     * 創建快捷按鈕
     */
    createQuickButtons() {
        const { width, height } = this.cameras.main;

        // 選單按鈕（右上角）
        const menuBtn = this.createButton(width - 60, 30, '☰', () => {
            this.toggleMenu();
        });

        // 調整按鈕樣式
        menuBtn.bg.setFillStyle(0x000000, 0.7);
        menuBtn.bg.setStrokeStyle(2, 0xffd700);
    }

    /**
     * 切換選單
     */
    toggleMenu() {
        if (this.menuPanel) {
            this.menuPanel.destroy();
            this.menuPanel = null;
            return;
        }

        const { width, height } = this.cameras.main;
        const panel = this.add.container(width - 200, 100);

        // 背景
        const bg = this.add.rectangle(0, 0, 300, 400, 0x000000, 0.9);
        bg.setStrokeStyle(3, 0xffd700);
        panel.add(bg);

        // 選單項目
        const menuItems = [
            { text: '家園升級', callback: () => this.upgradeHome() },
            { text: '裝備商店', callback: () => this.showEquipmentShop() },
            { text: '寵物商店', callback: () => this.showPetShop() },
            { text: '角色列表', callback: () => this.showCharacterList() },
            { text: '統計資料', callback: () => this.showStats() },
            { text: '存檔', callback: () => this.saveGame() },
            { text: '重置遊戲', callback: () => this.resetGame() },
        ];

        menuItems.forEach((item, index) => {
            const btn = this.createButton(0, -150 + index * 60, item.text, () => {
                item.callback();
                this.menuPanel.destroy();
                this.menuPanel = null;
            });
            panel.add([btn.bg, btn.text]);
        });

        this.menuPanel = panel;
    }

    /**
     * 創建按鈕
     */
    createButton(x, y, text, callback) {
        const bg = this.add.rectangle(x, y, 160, 40, 0x4a90e2);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0xffffff);

        const label = this.add.text(x, y, text, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(0x5da3f5));
        bg.on('pointerout', () => bg.setFillStyle(0x4a90e2));
        bg.on('pointerdown', () => {
            bg.setFillStyle(0x3a7ac2);
            callback();
        });
        bg.on('pointerup', () => bg.setFillStyle(0x5da3f5));

        return { bg, text: label };
    }

    /**
     * 設置輸入監聽
     */
    setupInputListeners() {
        // 監聽遊戲視窗內的點擊
        this.input.on('pointerdown', (pointer) => {
            // 不在 UI 上的點擊才計數
            if (pointer.y > 80) {  // 避開頂部 UI
                this.onUserClick(pointer.x, pointer.y);
            }
        });

        // 監聽鍵盤
        this.input.keyboard.on('keydown', () => {
            this.onUserKeyPress();
        });

        // 監聽來自主進程的銀兩獲得事件（如果實現全局監聽）
        if (typeof ipcRenderer !== 'undefined') {
            ipcRenderer.on('silver-earned', (event, data) => {
                console.log('銀兩獲得:', data);
                this.updateSilverDisplay();
            });
        }
    }

    /**
     * 處理用戶點擊
     */
    onUserClick(x, y) {
        const amount = this.gameState.onUserClick();
        this.updateSilverDisplay();

        // 創建點擊特效
        this.createClickEffect(x, y, amount);

        // 通知主進程
        if (typeof ipcRenderer !== 'undefined') {
            ipcRenderer.send('user-click');
        }
    }

    /**
     * 處理用戶按鍵
     */
    onUserKeyPress() {
        const amount = this.gameState.onUserKeyPress();
        this.updateSilverDisplay();
    }

    /**
     * 創建點擊特效
     */
    createClickEffect(x, y, amount) {
        // 金幣飛出效果
        const coinText = this.add.text(x, y, `+${amount}`, {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 動畫
        this.tweens.add({
            targets: coinText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => coinText.destroy()
        });

        // 粒子效果
        for (let i = 0; i < 5; i++) {
            const particle = this.add.circle(x, y, 3, 0xffd700);
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 50;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * 創建拖曳軌跡粒子
     */
    createTrailParticle(x, y, color) {
        const particle = this.add.circle(x, y, 3, color, 0.6);

        this.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0,
            duration: 500,
            onComplete: () => particle.destroy()
        });
    }

    /**
     * 啟動遊戲循環
     */
    startGameLoop() {
        this.time.addEvent({
            delay: 1000,  // 每秒
            callback: () => {
                this.gameState.tick(1000);
                this.gameState.updatePets(1000);
                this.updateSilverDisplay();
                this.updateCharacterLevels();
            },
            loop: true
        });
    }

    /**
     * 更新角色等級顯示
     */
    updateCharacterLevels() {
        Object.values(this.characterSprites).forEach(charSprite => {
            charSprite.levelText.setText(charSprite.character.level.toString());
        });
    }

    /**
     * 設置隨機事件
     */
    setupRandomEvents() {
        // 每 3-5 分鐘觸發一次隨機事件
        this.time.addEvent({
            delay: Phaser.Math.Between(180000, 300000),
            callback: () => {
                const event = this.gameState.triggerRandomEvent();
                this.showEventPopup(event);
            },
            loop: true
        });
    }

    /**
     * 顯示事件彈窗
     */
    showEventPopup(event) {
        const { width, height } = this.cameras.main;

        // 遮罩
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setInteractive();

        const popup = this.add.container(width / 2, height / 2);

        // 背景
        const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.95);
        bg.setStrokeStyle(4, 0xff6b6b);
        popup.add(bg);

        // 根據事件類型顯示不同內容
        const eventData = {
            dungeon: { title: '地下城探險', emoji: '🏰', reward: 200 },
            treasure: { title: '發現寶藏', emoji: '💎', reward: 500 },
            bandit: { title: '山賊襲擊', emoji: '⚔️', reward: 100 }
        };

        const data = eventData[event.type];

        // 標題
        const title = this.add.text(0, -150, `${data.emoji} ${data.title}`, {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(title);

        // 描述
        const desc = this.add.text(0, -50, `預計獎勵: ${data.reward} 銀兩`, {
            fontSize: '20px',
            color: '#ffd700'
        }).setOrigin(0.5);
        popup.add(desc);

        // 接受按鈕
        const acceptBtn = this.createButton(0, 100, '接受', () => {
            this.gameState.completeEvent(event.id, true);
            this.updateSilverDisplay();
            overlay.destroy();
            popup.destroy();
            this.showNotification(`完成！獲得 ${data.reward} 銀兩`, 0x00ff00);
        });
        popup.add([acceptBtn.bg, acceptBtn.text]);

        // 拒絕按鈕
        const rejectBtn = this.createButton(0, 160, '拒絕', () => {
            this.gameState.completeEvent(event.id, false);
            overlay.destroy();
            popup.destroy();
        });
        popup.add([rejectBtn.bg, rejectBtn.text]);
    }

    /**
     * 顯示通知
     */
    showNotification(message, color = 0xffffff) {
        const { width, height } = this.cameras.main;

        const bg = this.add.rectangle(width / 2, height - 100, 400, 60, 0x000000, 0.9);
        bg.setStrokeStyle(2, color);

        const text = this.add.text(width / 2, height - 100, message, {
            fontSize: '18px',
            color: `#${color.toString(16).padStart(6, '0')}`
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [bg, text],
            alpha: 0,
            y: height - 150,
            duration: 2000,
            delay: 1500,
            onComplete: () => {
                bg.destroy();
                text.destroy();
            }
        });
    }

    /**
     * 離線獎勵彈窗
     */
    showOfflineRewardPopup(data) {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setInteractive();

        const popup = this.add.container(width / 2, height / 2);

        const bg = this.add.rectangle(0, 0, 500, 300, 0x000000, 0.95);
        bg.setStrokeStyle(4, 0x00d4ff);
        popup.add(bg);

        const title = this.add.text(0, -100, '離線收益', {
            fontSize: '32px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(title);

        const timeText = this.add.text(0, -40, `離線時間: ${data.offlineMinutes} 分鐘`, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        popup.add(timeText);

        const rewardText = this.add.text(0, 10, '已自動收穫銀兩和經驗！', {
            fontSize: '18px',
            color: '#00ff88'
        }).setOrigin(0.5);
        popup.add(rewardText);

        const closeBtn = this.createButton(0, 80, '領取', () => {
            overlay.destroy();
            popup.destroy();
        });
        popup.add([closeBtn.bg, closeBtn.text]);
    }

    /**
     * 家園升級
     */
    upgradeHome() {
        const result = this.gameState.upgradeHome();
        if (result.success) {
            this.showNotification(`家園升級到 Lv.${result.level}！`, 0x00ff00);
            this.updateSilverDisplay();
        } else {
            this.showNotification(result.error, 0xff0000);
        }
    }

    /**
     * 顯示裝備商店
     */
    showEquipmentShop() {
        this.showNotification('裝備商店開發中...', 0xffaa00);
    }

    /**
     * 顯示寵物商店
     */
    showPetShop() {
        this.showNotification('寵物商店開發中...', 0xffaa00);
    }

    /**
     * 顯示角色列表
     */
    showCharacterList() {
        const { width, height } = this.cameras.main;

        if (this.activePanel) {
            this.activePanel.destroy();
        }

        const panel = this.add.container(width / 2, height / 2);

        const bg = this.add.rectangle(0, 0, 600, 500, 0x000000, 0.9);
        bg.setStrokeStyle(3, 0xffd700);
        panel.add(bg);

        const title = this.add.text(0, -220, '角色列表', {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panel.add(title);

        // 顯示所有角色
        this.gameState.characters.forEach((char, index) => {
            const y = -180 + index * 40;
            const status = char.unlocked ? `Lv.${char.level}` : '🔒 未解鎖';
            const color = char.unlocked ? '#00ff00' : '#888888';

            const text = this.add.text(-250, y, `${char.name}: ${status}`, {
                fontSize: '16px',
                color: color
            });
            panel.add(text);
        });

        const closeBtn = this.createButton(0, 200, '關閉', () => {
            panel.destroy();
            this.activePanel = null;
        });
        panel.add([closeBtn.bg, closeBtn.text]);

        this.activePanel = panel;
    }

    /**
     * 顯示統計資料
     */
    showStats() {
        const { width, height } = this.cameras.main;

        if (this.activePanel) {
            this.activePanel.destroy();
        }

        const panel = this.add.container(width / 2, height / 2);

        const bg = this.add.rectangle(0, 0, 500, 500, 0x000000, 0.9);
        bg.setStrokeStyle(3, 0xffd700);
        panel.add(bg);

        const title = this.add.text(0, -220, '遊戲統計', {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        panel.add(title);

        const stats = [
            `銀兩: ${Math.floor(this.gameState.silver).toLocaleString()}`,
            `總點擊次數: ${this.gameState.totalClicks.toLocaleString()}`,
            `總按鍵次數: ${this.gameState.totalKeyPresses.toLocaleString()}`,
            `家園等級: ${this.gameState.homeLevel}`,
            ``,
            `已解鎖角色: ${this.gameState.characters.filter(c => c.unlocked).length} / 10`,
            `地下城完成: ${this.gameState.stats.dungeonsCompleted}`,
            `寶藏發現: ${this.gameState.stats.treasuresFound}`,
            `山賊擊敗: ${this.gameState.stats.banditsDefeated}`,
            `遊戲時間: ${Math.floor(this.gameState.playTime / 60000)} 分鐘`
        ];

        stats.forEach((line, index) => {
            const text = this.add.text(0, -150 + index * 30, line, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);
            panel.add(text);
        });

        const closeBtn = this.createButton(0, 200, '關閉', () => {
            panel.destroy();
            this.activePanel = null;
        });
        panel.add([closeBtn.bg, closeBtn.text]);

        this.activePanel = panel;
    }

    /**
     * 存檔
     */
    saveGame() {
        const result = this.gameState.save();
        if (result.success) {
            this.showNotification('存檔成功！', 0x00ff00);
        } else {
            this.showNotification('存檔失敗', 0xff0000);
        }
    }

    /**
     * 重置遊戲
     */
    resetGame() {
        if (confirm('確定要重置遊戲嗎？所有進度將消失！')) {
            this.gameState.reset();
            this.scene.restart();
        }
    }
}

module.exports = DesktopScene;
