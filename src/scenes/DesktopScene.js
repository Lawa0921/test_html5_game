/**
 * 桌面主場景 - 透明桌面寵物遊戲
 * 故事性 RPG 掛機養成系統
 */
const GameState = require('../core/GameState');
const UIManager = require('../ui/UIManager');
const { ipcRenderer } = require('electron');

class DesktopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DesktopScene' });
        this.gameState = null;
        this.uiManager = null;
        this.characterSprites = {};
        this.eventPopup = null;
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
            console.log('開始新遊戲');
        }

        // 完全透明背景(生產環境)
        // 開發時可以設置為 0.05 以便看到遊戲區域
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.0);  // 完全透明
        bg.fillRect(0, 0, width, height);

        // 創建角色
        this.createCharacters();

        // 創建 UI 管理器(右下角)
        this.uiManager = new UIManager(this, this.gameState);

        // 監聽輸入事件
        this.setupInputListeners();

        // 啟動遊戲循環
        this.startGameLoop();

        // 定期自動存檔(每30秒)
        this.time.addEvent({
            delay: 30000,
            callback: () => {
                this.gameState.save();
                console.log('自動存檔');
            },
            loop: true
        });

        // 隨機事件觸發器(3-5分鐘)
        this.setupRandomEvents();

        console.log('桌面冒險者已啟動 - V2');
        console.log('快捷鍵: Ctrl+Shift+D 顯示/隱藏, Ctrl+Shift+Q 退出');
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

        // 創建角色圓形(暫時,之後替換為 Sprite)
        const sprite = this.add.circle(character.x, character.y, 25, colors[character.type] || 0xffffff);
        sprite.setInteractive({ useHandCursor: true, draggable: true });
        sprite.setStrokeStyle(2, 0xffffff);
        sprite.setAlpha(0.9);

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
        sprite.on('pointerdown', (pointer) => {
            // 避免與拖曳衝突
            if (!pointer.wasMoved) {
                this.onCharacterClick(character);
            }
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
        this.showCharacterInfo(character);
    }

    /**
     * 顯示角色資訊
     */
    showCharacterInfo(character) {
        const { width, height } = this.cameras.main;

        // 關閉現有彈窗
        if (this.characterInfoPopup) {
            this.characterInfoPopup.destroy();
            this.characterInfoOverlay.destroy();
        }

        // 遮罩
        this.characterInfoOverlay = this.add.rectangle(
            width / 2, height / 2, width, height, 0x000000, 0.5
        );
        this.characterInfoOverlay.setDepth(2000);
        this.characterInfoOverlay.setInteractive();

        // 彈窗
        const popup = this.add.container(width / 2, height / 2);
        popup.setDepth(2001);

        // 背景
        const bg = this.add.rectangle(0, 0, 400, 450, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0xffd700);
        popup.add(bg);

        // 標題
        const title = this.add.text(0, -200, character.name, {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(title);

        // 職業
        const typeText = this.add.text(0, -160, `職業: ${character.type}`, {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        popup.add(typeText);

        // 角色資訊
        const info = [
            `等級: ${character.level} / 200`,
            `經驗: ${character.exp} / ${character.maxExp}`,
            ``,
            `攻擊: ${character.attack}`,
            `防禦: ${character.defense}`,
            `血量: ${character.hp} / ${character.maxHp}`,
            ``,
            `故事進度: ${character.storyProgress}/10`
        ];

        info.forEach((line, index) => {
            const text = this.add.text(0, -110 + index * 28, line, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);
            popup.add(text);
        });

        // 關閉按鈕
        const closeBtn = this.createSimpleButton(0, 180, '關閉', () => {
            this.characterInfoOverlay.destroy();
            popup.destroy();
            this.characterInfoPopup = null;
            this.characterInfoOverlay = null;
        });
        popup.add(closeBtn.container);

        this.characterInfoPopup = popup;
    }

    /**
     * 創建簡單按鈕
     */
    createSimpleButton(x, y, text, callback) {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 120, 35, 0x4a90e2);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, label]);

        bg.on('pointerover', () => bg.setFillStyle(0x5da3f5));
        bg.on('pointerout', () => bg.setFillStyle(0x4a90e2));
        bg.on('pointerdown', () => {
            bg.setFillStyle(0x3a7ac2);
            callback();
        });
        bg.on('pointerup', () => bg.setFillStyle(0x5da3f5));

        return { container, bg, text: label };
    }

    /**
     * 設置輸入監聽
     */
    setupInputListeners() {
        // 監聽遊戲視窗內的點擊
        this.input.on('pointerdown', (pointer) => {
            // 只有點擊空白區域才計數
            // 避開 UI 區域(右下角)
            const { width, height } = this.cameras.main;
            const uiLeft = width - 220;
            const uiTop = height - 170;

            if (pointer.x < uiLeft || pointer.y < uiTop) {
                this.onUserClick(pointer.x, pointer.y);
            }
        });

        // 監聽鍵盤
        this.input.keyboard.on('keydown', () => {
            this.onUserKeyPress();
        });

        // 監聽來自主進程的事件
        if (typeof ipcRenderer !== 'undefined') {
            ipcRenderer.on('silver-earned', (event, data) => {
                console.log('銀兩獲得:', data);
            });
        }
    }

    /**
     * 處理用戶點擊
     */
    onUserClick(x, y) {
        const amount = this.gameState.onUserClick();

        // 創建點擊特效
        this.createClickEffect(x, y, amount);
    }

    /**
     * 處理用戶按鍵
     */
    onUserKeyPress() {
        const amount = this.gameState.onUserKeyPress();
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
                this.updateCharacterLevels();
                this.checkNewCharacterUnlocks();
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
     * 檢查新角色解鎖
     */
    checkNewCharacterUnlocks() {
        this.gameState.characters.forEach(character => {
            if (character.unlocked && !this.characterSprites[character.id]) {
                // 新解鎖的角色,創建精靈
                this.createCharacterSprite(character);
                this.showNotification(`🎉 新角色解鎖: ${character.name}`, 0x00ff00);
            }
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
        overlay.setDepth(2500);
        overlay.setInteractive();

        const popup = this.add.container(width / 2, height / 2);
        popup.setDepth(2501);

        // 背景
        const bg = this.add.rectangle(0, 0, 500, 400, 0x000000, 0.95);
        bg.setStrokeStyle(4, 0xff6b6b);
        popup.add(bg);

        // 根據事件類型顯示不同內容
        const eventData = {
            dungeon: { title: '地下城探險', emoji: '🏰', reward: 200, story: '一座古老的地下城出現在你的視野中...' },
            treasure: { title: '發現寶藏', emoji: '💎', reward: 500, story: '你發現了一個閃閃發光的寶箱！' },
            bandit: { title: '山賊襲擊', emoji: '⚔️', reward: 100, story: '一群山賊正在靠近你的家園！' }
        };

        const data = eventData[event.type];

        // 標題
        const title = this.add.text(0, -150, `${data.emoji} ${data.title}`, {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        popup.add(title);

        // 故事描述
        const story = this.add.text(0, -80, data.story, {
            fontSize: '18px',
            color: '#aaaaaa',
            wordWrap: { width: 450 }
        }).setOrigin(0.5);
        popup.add(story);

        // 描述
        const desc = this.add.text(0, -30, `預計獎勵: ${data.reward} 銀兩`, {
            fontSize: '20px',
            color: '#ffd700'
        }).setOrigin(0.5);
        popup.add(desc);

        // 接受按鈕
        const acceptBtn = this.createSimpleButton(0, 80, '接受', () => {
            this.gameState.completeEvent(event.id, true);
            overlay.destroy();
            popup.destroy();
            this.showNotification(`完成！獲得 ${data.reward} 銀兩`, 0x00ff00);
        });
        popup.add(acceptBtn.container);

        // 拒絕按鈕
        const rejectBtn = this.createSimpleButton(0, 140, '拒絕', () => {
            this.gameState.completeEvent(event.id, false);
            overlay.destroy();
            popup.destroy();
        });
        popup.add(rejectBtn.container);
    }

    /**
     * 顯示通知
     */
    showNotification(message, color = 0xffffff) {
        const { width, height } = this.cameras.main;

        const bg = this.add.rectangle(width / 2, height - 100, 400, 60, 0x000000, 0.9);
        bg.setDepth(3000);
        bg.setStrokeStyle(2, color);

        const text = this.add.text(width / 2, height - 100, message, {
            fontSize: '18px',
            color: `#${color.toString(16).padStart(6, '0')}`
        }).setOrigin(0.5);
        text.setDepth(3001);

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
        overlay.setDepth(2500);
        overlay.setInteractive();

        const popup = this.add.container(width / 2, height / 2);
        popup.setDepth(2501);

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

        const closeBtn = this.createSimpleButton(0, 80, '領取', () => {
            overlay.destroy();
            popup.destroy();
        });
        popup.add(closeBtn.container);
    }

    /**
     * Update 循環
     */
    update(time, delta) {
        // 更新 UI 管理器
        if (this.uiManager) {
            this.uiManager.update();
        }
    }

    /**
     * 場景關閉時的清理
     */
    shutdown() {
        if (this.uiManager) {
            this.uiManager.destroy();
        }
    }
}

module.exports = DesktopScene;
