/**
 * 主遊戲場景 - 桌面掛機養成遊戲
 */
const GameState = require('../core/GameState');

class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.gameState = null;
        this.characterSprites = {};
        this.stationSprites = {};
        this.resourceTexts = {};
        this.selectedCharacter = null;
        this.particles = []; // 桌面粒子效果
    }

    create() {
        const { width, height } = this.cameras.main;

        // 初始化遊戲狀態
        this.gameState = new GameState();

        // 嘗試讀檔
        const loadResult = this.gameState.load();
        if (loadResult.success) {
            console.log('讀取存檔成功');

            // 計算離線收益
            const offlineProgress = this.gameState.calculateOfflineProgress();
            if (offlineProgress) {
                this.showOfflineRewardPopup(offlineProgress);
            }
        } else {
            console.log('開始新遊戲');
        }

        // 創建背景（模擬桌面效果）
        this.createDesktopBackground();

        // 創建資源顯示 UI
        this.createResourceUI();

        // 創建互動點
        this.createStations();

        // 創建角色
        this.createCharacters();

        // 創建控制面板
        this.createControlPanel();

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

        // 添加桌面粒子效果
        this.createDesktopParticles();
    }

    createDesktopBackground() {
        const { width, height } = this.cameras.main;

        // 深色桌面風格背景
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
        bg.fillRect(0, 0, width, height);

        // 網格線（模擬桌面）
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x16213e, 0.3);

        for (let x = 0; x < width; x += 50) {
            grid.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 50) {
            grid.lineBetween(0, y, width, y);
        }

        // 標題
        this.add.text(width / 2, 30, '桌面冒險者', {
            fontSize: '32px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createResourceUI() {
        const { width } = this.cameras.main;
        const startX = 20;
        const startY = 70;
        const spacing = 120;

        const resourceTypes = ['gold', 'wood', 'stone', 'food', 'knowledge', 'magic'];
        const resourceIcons = {
            gold: '💰',
            wood: '🪵',
            stone: '🪨',
            food: '🍖',
            knowledge: '📚',
            magic: '✨'
        };

        resourceTypes.forEach((type, index) => {
            const x = startX + (index % 6) * spacing;
            const y = startY;

            // 圖標
            this.add.text(x, y, resourceIcons[type], { fontSize: '20px' });

            // 數值
            const valueText = this.add.text(x + 30, y, '0', {
                fontSize: '18px',
                color: '#ffffff'
            });

            this.resourceTexts[type] = valueText;
        });

        this.updateResourceDisplay();
    }

    updateResourceDisplay() {
        Object.keys(this.gameState.resources).forEach(type => {
            if (this.resourceTexts[type]) {
                this.resourceTexts[type].setText(Math.floor(this.gameState.resources[type]));
            }
        });
    }

    createStations() {
        const { width, height } = this.cameras.main;

        const stationPositions = [
            { x: width * 0.2, y: height * 0.4 },
            { x: width * 0.5, y: height * 0.4 },
            { x: width * 0.8, y: height * 0.4 },
            { x: width * 0.35, y: height * 0.7 },
        ];

        this.gameState.stations.forEach((station, index) => {
            const pos = stationPositions[index];
            this.createStation(station, pos.x, pos.y);
        });
    }

    createStation(station, x, y) {
        // 站點底座（像素風格）
        const base = this.add.rectangle(x, y, 100, 100, 0x4a90e2, 0.6);
        base.setStrokeStyle(3, 0x00d4ff);
        base.setInteractive({ useHandCursor: true });

        // 站點名稱
        const nameText = this.add.text(x, y - 60, station.name, {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // 站點資訊
        const outputStr = Object.entries(station.output)
            .map(([type, amount]) => `${type}+${amount}`)
            .join(' ');

        const infoText = this.add.text(x, y + 60, outputStr, {
            fontSize: '12px',
            color: '#00ff88',
            backgroundColor: '#000000aa',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5);

        // 工作中角色數量顯示
        const workerCountText = this.add.text(x, y, '0', {
            fontSize: '24px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 點擊事件
        base.on('pointerover', () => {
            base.setFillStyle(0x5da3f5, 0.8);
        });

        base.on('pointerout', () => {
            base.setFillStyle(0x4a90e2, 0.6);
        });

        base.on('pointerdown', () => {
            this.onStationClick(station);
        });

        this.stationSprites[station.id] = {
            base,
            nameText,
            infoText,
            workerCountText,
            x,
            y
        };
    }

    createCharacters() {
        const startX = 100;
        const startY = 200;
        const spacing = 150;

        this.gameState.characters.forEach((character, index) => {
            const x = startX + index * spacing;
            const y = startY;
            this.createCharacter(character, x, y);
        });
    }

    createCharacter(character, x, y) {
        // 如果角色正在工作，放到對應站點位置
        if (character.state === 'working' && character.assignedTo) {
            const station = this.stationSprites[character.assignedTo];
            if (station) {
                x = station.x + Phaser.Math.Between(-30, 30);
                y = station.y + Phaser.Math.Between(-30, 30);
            }
        }

        // 角色精靈（像素風格方塊）
        const colors = { warrior: 0xff4444, mage: 0x4444ff, craftsman: 0x44ff44 };
        const sprite = this.add.rectangle(x, y, 40, 40, colors[character.type] || 0xffffff);
        sprite.setStrokeStyle(2, 0xffffff);
        sprite.setInteractive({ useHandCursor: true, draggable: true });

        // 角色名稱
        const nameText = this.add.text(x, y - 30, character.name, {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);

        // 等級顯示
        const levelText = this.add.text(x, y, `Lv.${character.level}`, {
            fontSize: '12px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 狀態指示器
        const stateIndicator = this.add.circle(x + 25, y - 25, 5, character.state === 'working' ? 0x00ff00 : 0x888888);

        // 拖曳事件
        sprite.on('drag', (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;
            nameText.x = dragX;
            nameText.y = dragY - 30;
            levelText.x = dragX;
            levelText.y = dragY;
            stateIndicator.x = dragX + 25;
            stateIndicator.y = dragY - 25;

            // 桌面軌跡效果
            this.createTrailParticle(dragX, dragY, colors[character.type]);
        });

        sprite.on('dragend', (pointer) => {
            // 檢查是否拖曳到站點上
            const draggedToStation = this.checkStationOverlap(sprite.x, sprite.y);
            if (draggedToStation) {
                this.assignCharacterToStation(character, draggedToStation);
            }
        });

        sprite.on('pointerdown', () => {
            this.selectCharacter(character);
        });

        this.characterSprites[character.id] = {
            sprite,
            nameText,
            levelText,
            stateIndicator,
            character
        };

        // 閒置動畫
        this.tweens.add({
            targets: sprite,
            y: y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createControlPanel() {
        const { width, height } = this.cameras.main;
        const panelY = height - 100;

        // 控制面板背景
        this.add.rectangle(width / 2, panelY, width, 100, 0x000000, 0.8);

        // 存檔按鈕
        this.createButton(width / 2 - 200, panelY, '存檔', () => {
            const result = this.gameState.save();
            if (result.success) {
                this.showNotification('存檔成功！', 0x00ff00);
            }
        });

        // 重置按鈕
        this.createButton(width / 2 - 60, panelY, '重置', () => {
            if (confirm('確定要重置遊戲嗎？所有進度將消失！')) {
                this.gameState.reset();
                this.scene.restart();
            }
        });

        // 顯示遊戲時間
        this.playTimeText = this.add.text(width / 2 + 100, panelY, '', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, callback) {
        const bg = this.add.rectangle(x, y, 120, 40, 0x4a90e2)
            .setInteractive({ useHandCursor: true });

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

        return { bg, label };
    }

    selectCharacter(character) {
        this.selectedCharacter = character;
        console.log('選中角色:', character.name);

        // 視覺反饋
        Object.values(this.characterSprites).forEach(cs => {
            cs.sprite.setStrokeStyle(2, 0xffffff);
        });

        this.characterSprites[character.id].sprite.setStrokeStyle(4, 0xffff00);
    }

    onStationClick(station) {
        if (!this.selectedCharacter) {
            this.showNotification('請先選擇一個角色', 0xff0000);
            return;
        }

        if (this.selectedCharacter.state === 'working') {
            // 召回角色
            const result = this.gameState.recallCharacter(this.selectedCharacter.id);
            if (result.success) {
                this.showNotification(`${this.selectedCharacter.name} 已召回`, 0x00ff00);
                this.updateCharacterVisuals();
                this.updateStationVisuals();
            }
        } else {
            // 派遣角色
            this.assignCharacterToStation(this.selectedCharacter, station);
        }
    }

    assignCharacterToStation(character, station) {
        const result = this.gameState.assignCharacter(character.id, station.id);

        if (result.success) {
            this.showNotification(`${character.name} 開始 ${station.name}`, 0x00ff00);

            // 移動角色到站點
            this.moveCharacterToStation(character, station);

            this.updateCharacterVisuals();
            this.updateStationVisuals();
        } else {
            this.showNotification(result.error, 0xff0000);
        }
    }

    moveCharacterToStation(character, station) {
        const charSprite = this.characterSprites[character.id];
        const stationSprite = this.stationSprites[station.id];

        if (!charSprite || !stationSprite) return;

        const targetX = stationSprite.x + Phaser.Math.Between(-30, 30);
        const targetY = stationSprite.y + Phaser.Math.Between(-30, 30);

        // 移動動畫
        this.tweens.add({
            targets: [charSprite.sprite, charSprite.nameText, charSprite.levelText, charSprite.stateIndicator],
            x: targetX,
            y: (target) => {
                if (target === charSprite.nameText) return targetY - 30;
                if (target === charSprite.levelText) return targetY;
                if (target === charSprite.stateIndicator) return targetY - 25;
                return targetY;
            },
            duration: 500,
            ease: 'Power2'
        });
    }

    checkStationOverlap(x, y) {
        for (const stationId in this.stationSprites) {
            const station = this.stationSprites[stationId];
            const distance = Phaser.Math.Distance.Between(x, y, station.x, station.y);
            if (distance < 60) {
                return this.gameState.stations.find(s => s.id === parseInt(stationId));
            }
        }
        return null;
    }

    updateCharacterVisuals() {
        this.gameState.characters.forEach(character => {
            const charSprite = this.characterSprites[character.id];
            if (!charSprite) return;

            // 更新狀態指示器
            charSprite.stateIndicator.setFillStyle(
                character.state === 'working' ? 0x00ff00 : 0x888888
            );

            // 更新等級
            charSprite.levelText.setText(`Lv.${character.level}`);
        });
    }

    updateStationVisuals() {
        this.gameState.stations.forEach(station => {
            const stationSprite = this.stationSprites[station.id];
            if (!stationSprite) return;

            // 更新工作角色數量
            stationSprite.workerCountText.setText(station.workers.length.toString());
        });
    }

    startGameLoop() {
        // 每秒更新一次
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameState.tick(1000);
                this.updateResourceDisplay();
                this.updateCharacterVisuals();
                this.updatePlayTime();
            },
            loop: true
        });
    }

    updatePlayTime() {
        const minutes = Math.floor(this.gameState.totalPlayTime / 60000);
        const hours = Math.floor(minutes / 60);
        const displayMinutes = minutes % 60;

        this.playTimeText.setText(`遊戲時間: ${hours}h ${displayMinutes}m`);
    }

    createDesktopParticles() {
        // 創建飄浮的桌面粒子效果
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const x = Phaser.Math.Between(0, this.cameras.main.width);
                const y = Phaser.Math.Between(100, this.cameras.main.height - 100);

                const particle = this.add.circle(x, y, 2, 0x00d4ff, 0.6);

                this.tweens.add({
                    targets: particle,
                    y: y - 50,
                    alpha: 0,
                    duration: 3000,
                    onComplete: () => particle.destroy()
                });
            },
            loop: true
        });
    }

    createTrailParticle(x, y, color) {
        const particle = this.add.circle(x, y, 3, color, 0.8);

        this.tweens.add({
            targets: particle,
            alpha: 0,
            scale: 0,
            duration: 500,
            onComplete: () => particle.destroy()
        });
    }

    showNotification(message, color = 0xffffff) {
        const { width, height } = this.cameras.main;

        const bg = this.add.rectangle(width / 2, height / 2 - 100, 400, 60, 0x000000, 0.9);
        const text = this.add.text(width / 2, height / 2 - 100, message, {
            fontSize: '18px',
            color: `#${color.toString(16).padStart(6, '0')}`
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [bg, text],
            alpha: 0,
            y: height / 2 - 150,
            duration: 2000,
            delay: 1000,
            onComplete: () => {
                bg.destroy();
                text.destroy();
            }
        });
    }

    showOfflineRewardPopup(offlineProgress) {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

        const panel = this.add.rectangle(width / 2, height / 2, 500, 300, 0x1a1a2e);
        panel.setStrokeStyle(4, 0x00d4ff);

        const title = this.add.text(width / 2, height / 2 - 100, '離線收益', {
            fontSize: '32px',
            color: '#00d4ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const timeText = this.add.text(width / 2, height / 2 - 40,
            `離線時間: ${offlineProgress.durationInMinutes} 分鐘`, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const rewardText = this.add.text(width / 2, height / 2 + 10,
            '已自動收穫資源！', {
            fontSize: '18px',
            color: '#00ff88'
        }).setOrigin(0.5);

        const closeBtn = this.createButton(width / 2, height / 2 + 80, '領取', () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            timeText.destroy();
            rewardText.destroy();
            closeBtn.bg.destroy();
            closeBtn.label.destroy();
        });
    }
}

module.exports = MainGameScene;
