/**
 * 視覺小說場景
 * 顯示對話、選項、角色立繪
 * 支援 Auto 模式、快進模式、立繪高亮等完整視覺小說功能
 */

class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });
        this.storyManager = null;
        this.currentNode = null;

        // UI 元素
        this.background = null;
        this.characterPortraits = {}; // 多個角色立繪 { characterName: sprite }
        this.dialogueBox = null;
        this.speakerText = null;
        this.dialogueText = null;
        this.choiceButtons = [];
        this.nextButton = null;

        // 控制按鈕
        this.autoButton = null;
        this.controlHint = null;

        // 文字打字機效果
        this.isTyping = false;
        this.fullText = '';
        this.currentText = '';
        this.typingSpeed = 30; // 毫秒/字
        this.typingTimer = null;

        // 模式控制
        this.autoMode = false;
        this.autoDelay = 1500; // Auto 模式下文字打完後等待時間（毫秒）
        this.autoTimer = null;
        this.skipSpeed = 30; // 快進時每次跳過的字數(增加到30字)
        this.skipTypingSpeed = 0; // 快進時打字間隔(0ms瞬間顯示)
        this.skipAutoDelay = 50; // 快進模式自動前進延遲(0.05秒極速)

        // 輸入控制
        this.ctrlKey = null;

        // 選單狀態
        this.menuOpen = false;
        this.menuContainer = null;
        this.menuButtons = [];
        this.menuOverlay = null;

        // 確認對話框狀態
        this.confirmDialogOpen = false;
        this.confirmDialogContainer = null;
        this.confirmDialogOverlay = null;
        this.confirmDialogCallback = null;
    }

    init(data) {
        // 接收啟動場景時傳入的故事ID
        this.storyId = data.storyId || 'opening';
        this.gameState = data.gameState || window.gameState;

        // 獲取 BGMController
        this.bgmController = this.registry.get('bgmController');
    }

    create() {
        const { width, height } = this.cameras.main;

        // 創建 StoryManager
        if (!this.storyManager) {
            const StoryManager = require('../managers/StoryManager');
            this.storyManager = new StoryManager(this.gameState);
            this.storyManager.loadStoryData();
        }

        // 創建背景（暫時用純色矩形）
        this.background = this.add.rectangle(0, 0, width, height, 0x2a2a2a);
        this.background.setOrigin(0, 0);

        // 創建角色立繪容器（支援多個角色）
        this.createCharacterPortraits(width, height);

        // 創建對話框
        const dialogueBoxHeight = 200;
        const bottomMargin = 40; // 底部留出空間
        const dialogueBoxY = height - dialogueBoxHeight - bottomMargin;

        this.dialogueBox = this.add.rectangle(
            0,
            dialogueBoxY,
            width,
            dialogueBoxHeight,
            0x1a1a1a,
            0.92
        );
        this.dialogueBox.setOrigin(0, 0);
        this.dialogueBox.setStrokeStyle(2, 0x8b7355);

        // 創建說話者名稱框
        const speakerBoxWidth = 200;
        const speakerBoxHeight = 45;
        const speakerBox = this.add.rectangle(
            30,
            dialogueBoxY - 15,
            speakerBoxWidth,
            speakerBoxHeight,
            0x3a2a1a,
            0.95
        );
        speakerBox.setOrigin(0, 0);
        speakerBox.setStrokeStyle(2, 0x8b7355);

        // 創建說話者名稱
        this.speakerText = this.add.text(30 + speakerBoxWidth / 2, dialogueBoxY - 15 + speakerBoxHeight / 2, '', {
            fontSize: '24px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffd700',
            fontStyle: 'bold'
        });
        this.speakerText.setOrigin(0.5, 0.5);

        // 創建對話文字
        this.dialogueText = this.add.text(40, dialogueBoxY + 30, '', {
            fontSize: '22px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffffff',
            wordWrap: { width: width - 80 },
            lineSpacing: 8
        });

        // 創建"繼續"指示器（小箭頭）
        this.nextButton = this.add.text(width - 130, dialogueBoxY + dialogueBoxHeight - 30, '▼', {
            fontSize: '24px',
            color: '#ffd700'
        });
        this.nextButton.setOrigin(0.5, 0.5);
        this.nextButton.setVisible(false);

        // 添加閃爍動畫
        this.tweens.add({
            targets: this.nextButton,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 創建選項容器
        this.choiceContainer = this.add.container(width / 2, dialogueBoxY - 60);
        this.choiceContainer.setVisible(false);

        // 創建控制按鈕 UI
        this.createControlButtons(width, height);

        // 創建操作提示
        this.createControlHints(width, height);

        // 設置輸入控制
        this.setupInputControls();

        // 開始故事
        this.startStory();

        // 相機淡入
        this.cameras.main.fadeIn(500);
    }

    /**
     * 創建角色立繪
     */
    createCharacterPortraits(width, height) {
        const portraitY = height / 2 - 50;

        // 左側立繪位置
        const leftPortrait = this.add.rectangle(width * 0.25, portraitY, 220, 320, 0x6b4423);
        leftPortrait.setStrokeStyle(2, 0xffffff);
        leftPortrait.setAlpha(0.5); // 預設暗淡
        leftPortrait.setVisible(false);
        this.characterPortraits['left'] = leftPortrait;

        // 中間立繪位置
        const centerPortrait = this.add.rectangle(width * 0.5, portraitY, 220, 320, 0x6b4423);
        centerPortrait.setStrokeStyle(2, 0xffffff);
        centerPortrait.setAlpha(0.5);
        centerPortrait.setVisible(false);
        this.characterPortraits['center'] = centerPortrait;

        // 右側立繪位置
        const rightPortrait = this.add.rectangle(width * 0.75, portraitY, 220, 320, 0x6b4423);
        rightPortrait.setStrokeStyle(2, 0xffffff);
        rightPortrait.setAlpha(0.5);
        rightPortrait.setVisible(false);
        this.characterPortraits['right'] = rightPortrait;
    }

    /**
     * 創建控制按鈕
     */
    createControlButtons(width, height) {
        // Auto 按鈕 - 視覺小說標準設計：屏幕右下角（對話框外）
        const autoButtonX = width - 60; // 屏幕右下角
        const autoButtonY = height - 30; // 屏幕底部

        this.autoButton = this.add.text(autoButtonX, autoButtonY, '►', {
            fontSize: '28px',
            color: '#888888'
        });
        this.autoButton.setOrigin(0.5, 0.5);
        this.autoButton.setInteractive({ useHandCursor: true });
        this.autoButton.on('pointerdown', () => this.toggleAutoMode());

        // 添加懸停效果
        this.autoButton.on('pointerover', () => {
            this.autoButton.setStyle({ color: '#cccccc' });
            this.tweens.add({
                targets: this.autoButton,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 150
            });
        });
        this.autoButton.on('pointerout', () => {
            if (!this.autoMode) {
                this.autoButton.setStyle({ color: '#888888' });
            }
            this.tweens.add({
                targets: this.autoButton,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 150
            });
        });
    }

    /**
     * 創建操作提示
     */
    createControlHints(width, height) {
        const hints = [
            '空白鍵/點擊：繼續',
            'Ctrl：快進',
            'ESC：選單'
        ];

        // 將提示放在底部留出的空間中
        const dialogueBoxHeight = 200;
        const bottomMargin = 40; // 與 create() 中保持一致
        const dialogueBoxY = height - dialogueBoxHeight - bottomMargin;
        const hintY = dialogueBoxY + dialogueBoxHeight + 15; // 對話框底部下方 15px

        this.controlHint = this.add.text(20, hintY, hints.join('  |  '), {
            fontSize: '14px',
            fontFamily: 'LXGW WenKai TC',
            color: '#888888'
        });
    }

    /**
     * 設置輸入控制
     */
    setupInputControls() {
        // 空格鍵：繼續
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.nextButton.visible && !this.choiceContainer.visible) {
                this.onNextClick();
            }
        });

        // 回車鍵：繼續
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.nextButton.visible && !this.choiceContainer.visible) {
                this.onNextClick();
            }
        });

        // ESC：打開/關閉選單
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.menuOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        });

        // A 鍵：切換 Auto 模式
        this.input.keyboard.on('keydown-A', () => {
            this.toggleAutoMode();
        });

        // Ctrl 鍵：快進模式
        this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);

        // 當按下 Ctrl 時，立即觸發快進
        this.input.keyboard.on('keydown-CTRL', () => {
            // 如果 AUTO 模式正在運行，立即停止並切換到快進模式
            if (this.autoMode) {
                this.setAutoMode(false);
            }

            if (this.isTyping) {
                // 如果正在打字，取消當前的打字計時器
                if (this.typingTimer) {
                    this.typingTimer.remove();
                    this.typingTimer = null;
                }
                // 立即調用 typeText()
                this.typeText();
            } else if (this.nextButton.visible && !this.choiceContainer.visible) {
                // 如果文字已經顯示完畢，立即前進到下一句
                this.onNextClick();
            }
        });

        // 滑鼠點擊：繼續
        this.input.on('pointerdown', (pointer) => {
            // 左鍵點擊對話框區域
            // 對話框現在有 40px bottomMargin，所以位置是 height - 240
            const dialogueBoxHeight = 200;
            const bottomMargin = 40;
            const dialogueBoxTop = this.cameras.main.height - dialogueBoxHeight - bottomMargin;

            if (pointer.leftButtonDown() && pointer.y > dialogueBoxTop) {
                if (this.nextButton.visible && !this.choiceContainer.visible) {
                    this.onNextClick();
                }
            }
        });
    }

    /**
     * 開始故事
     */
    startStory() {
        const result = this.storyManager.startStory(this.storyId);

        if (!result.success) {
            console.error('故事啟動失敗:', result.message);
            this.scene.start('LobbyScene');
            return;
        }

        console.log('開始故事:', result.title);

        // 播放故事 BGM
        if (this.bgmController) {
            this.bgmController.playStoryBGM(this.storyId, this, { fadeIn: true });
        }

        this.currentNode = result.node;
        this.displayNode();
    }

    /**
     * 顯示當前節點
     */
    displayNode() {
        if (!this.currentNode) {
            this.endStory();
            return;
        }

        // BGM 切換邏輯
        // 原則：故事片段內保持同一 BGM，只在節點明確指定時才切換
        if (this.bgmController && this.currentNode.bgm !== undefined) {
            // 節點明確指定 BGM（用於特殊劇情：突然戰鬥、重大事件等）
            console.log(`🎵 [特殊事件] 節點 ${this.currentNode.id} 切換 BGM: ${this.currentNode.bgm || '靜音'}`);
            this.bgmController.playNodeBGM(this.currentNode.bgm, this, { fadeIn: true });
        }

        // 清除選項
        this.clearChoices();

        // 更新角色立繪高亮
        this.updateCharacterHighlight(this.currentNode.speaker);

        // 顯示說話者
        this.speakerText.setText(this.currentNode.speaker || '');

        // 顯示對話文字（帶打字機效果）
        this.fullText = this.currentNode.text || '';
        this.currentText = '';
        this.isTyping = true;
        this.nextButton.setVisible(false);

        // 停止之前的 Auto 計時器
        if (this.autoTimer) {
            this.autoTimer.remove();
            this.autoTimer = null;
        }

        this.typeText();
    }

    /**
     * 更新角色立繪高亮（說話者高亮，其他暗淡）
     */
    updateCharacterHighlight(speaker) {
        // 根據說話者決定哪個立繪高亮
        let highlightPosition = null;

        if (speaker === '旁白' || speaker === '') {
            // 旁白時所有立繪暗淡
            highlightPosition = null;
        } else if (speaker === '車夫' || speaker === '???' || speaker === '沈掌櫃') {
            // 主要角色在右側
            highlightPosition = 'right';
        } else {
            // 其他情況在中間
            highlightPosition = 'center';
        }

        // 更新所有立繪的亮度
        Object.keys(this.characterPortraits).forEach(position => {
            const portrait = this.characterPortraits[position];

            if (position === highlightPosition) {
                // 高亮說話者
                portrait.setAlpha(1.0);
                portrait.setVisible(true);
                // 添加淡入動畫
                this.tweens.add({
                    targets: portrait,
                    alpha: 1.0,
                    duration: 200
                });
            } else if (highlightPosition === null) {
                // 旁白時隱藏所有立繪
                this.tweens.add({
                    targets: portrait,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => portrait.setVisible(false)
                });
            } else {
                // 其他角色暗淡
                portrait.setAlpha(0.4);
                portrait.setVisible(true);
            }
        });
    }

    /**
     * 打字機效果
     */
    typeText() {
        if (!this.isTyping) return;

        // 檢查是否按住 Ctrl（快進模式）- 直接顯示完整文字
        if (this.ctrlKey && this.ctrlKey.isDown) {
            this.currentText = this.fullText;
            this.dialogueText.setText(this.currentText);
            this.isTyping = false;
            this.onTypingComplete();
            return;
        }

        if (this.currentText.length < this.fullText.length) {
            // 正常模式下一個字一個字顯示
            this.currentText = this.fullText.substring(0, this.currentText.length + 1);
            this.dialogueText.setText(this.currentText);

            // 繼續打字
            this.typingTimer = this.time.delayedCall(this.typingSpeed, () => this.typeText(), [], this);
        } else {
            // 打字結束
            this.isTyping = false;
            this.onTypingComplete();
        }
    }

    /**
     * 打字完成
     */
    onTypingComplete() {
        if (this.currentNode.choices && this.currentNode.choices.length > 0) {
            // 顯示選項
            this.displayChoices();
            // 選項出現時停止 Auto 模式
            this.setAutoMode(false);
        } else {
            // 顯示"繼續"按鈕
            this.nextButton.setVisible(true);

            // Auto 模式下自動前進
            if (this.autoMode) {
                this.autoTimer = this.time.delayedCall(this.autoDelay, () => {
                    this.onNextClick();
                }, [], this);
            }
            // Ctrl 快進模式下也自動前進（延遲更短）
            else if (this.ctrlKey && this.ctrlKey.isDown) {
                this.autoTimer = this.time.delayedCall(this.skipAutoDelay, () => {
                    // 再次檢查 Ctrl 是否還按著
                    if (this.ctrlKey && this.ctrlKey.isDown) {
                        this.onNextClick();
                    }
                }, [], this);
            }
        }
    }

    /**
     * 顯示選項
     */
    displayChoices() {
        this.clearChoices();

        const choices = this.currentNode.choices;
        const startY = -(choices.length - 1) * 40;

        choices.forEach((choice, index) => {
            const button = this.add.text(0, startY + index * 80, choice.text, {
                fontSize: '20px',
                fontFamily: 'LXGW WenKai TC',
                color: '#ffffff',
                backgroundColor: '#3a5a7a',
                padding: { x: 25, y: 15 },
                align: 'center',
                wordWrap: { width: 800 }
            });
            button.setOrigin(0.5, 0.5);
            button.setInteractive({ useHandCursor: true });

            // 添加懸停效果
            button.on('pointerover', () => {
                button.setStyle({ backgroundColor: '#5a7a9a' });
                this.tweens.add({
                    targets: button,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            });
            button.on('pointerout', () => {
                button.setStyle({ backgroundColor: '#3a5a7a' });
                this.tweens.add({
                    targets: button,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 100
                });
            });

            button.on('pointerdown', () => this.onChoiceClick(index));

            // 添加淡入動畫
            button.setAlpha(0);
            this.tweens.add({
                targets: button,
                alpha: 1,
                duration: 300,
                delay: index * 100
            });

            this.choiceContainer.add(button);
            this.choiceButtons.push(button);
        });

        this.choiceContainer.setVisible(true);
    }

    /**
     * 清除選項
     */
    clearChoices() {
        this.choiceButtons.forEach(button => button.destroy());
        this.choiceButtons = [];
        this.choiceContainer.setVisible(false);
    }

    /**
     * 點擊選項
     */
    onChoiceClick(choiceIndex) {
        console.log('選擇選項:', choiceIndex);

        // 前進到下一個節點
        const result = this.storyManager.nextNode(choiceIndex);

        if (result.ended) {
            this.endStory();
            return;
        }

        if (result.success && result.node) {
            this.currentNode = result.node;
            this.displayNode();
        } else {
            console.error('節點前進失敗:', result.message);
        }
    }

    /**
     * 點擊"繼續"
     */
    onNextClick() {
        if (this.isTyping) {
            // 如果正在打字，跳過打字機效果
            if (this.typingTimer) {
                this.typingTimer.remove();
            }
            this.isTyping = false;
            this.currentText = this.fullText;
            this.dialogueText.setText(this.currentText);
            this.onTypingComplete();
            return;
        }

        // 前進到下一個節點
        const result = this.storyManager.nextNode();

        if (result.ended) {
            this.endStory();
            return;
        }

        if (result.success && result.node) {
            this.currentNode = result.node;
            this.displayNode();
        } else {
            console.error('節點前進失敗:', result.message);
        }
    }

    /**
     * 切換 Auto 模式
     */
    toggleAutoMode() {
        this.setAutoMode(!this.autoMode);
    }

    /**
     * 設置 Auto 模式
     */
    setAutoMode(enabled) {
        this.autoMode = enabled;

        if (this.autoMode) {
            this.autoButton.setStyle({
                color: '#ffd700' // 金色，視覺小說標準
            });
            console.log('Auto 模式：開啟');
        } else {
            this.autoButton.setStyle({
                color: '#888888' // 灰色
            });
            console.log('Auto 模式：關閉');

            // 停止 Auto 計時器
            if (this.autoTimer) {
                this.autoTimer.remove();
                this.autoTimer = null;
            }
        }
    }

    /**
     * 打開選單
     */
    openMenu() {
        if (this.menuOpen) return;

        console.log('打開故事選單');
        this.menuOpen = true;

        // 暫停自動模式
        if (this.autoMode) {
            this.toggleAutoMode();
        }

        // 暫停打字效果
        if (this.typingTimer) {
            this.typingTimer.paused = true;
        }

        const { width, height } = this.cameras.main;

        // 半透明背景遮罩
        this.menuOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        this.menuOverlay.setInteractive();
        this.menuOverlay.setDepth(900);

        // 選單容器
        this.menuContainer = this.add.container(width / 2, height / 2);
        this.menuContainer.setDepth(1000);

        // 選單背景
        const menuBg = this.add.rectangle(0, 0, 500, 400, 0x2a2a2a);
        menuBg.setStrokeStyle(4, 0xffd700);
        this.menuContainer.add(menuBg);

        // 選單標題
        const menuTitle = this.add.text(0, -150, '選單', {
            fontSize: '40px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffd700'
        }).setOrigin(0.5);
        this.menuContainer.add(menuTitle);

        // 選單選項
        const menuOptions = [
            { text: '繼續遊戲', action: () => this.closeMenu() },
            { text: '設定', action: () => this.openSettings() },
            { text: '返回標題', action: () => this.returnToTitle() }
        ];

        const startY = -50;
        const spacing = 80;

        menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;

            // 按鈕背景
            const btnBg = this.add.rectangle(0, y, 400, 60, 0x444444);
            btnBg.setStrokeStyle(2, 0xffd700);

            // 按鈕文字
            const btnText = this.add.text(0, y, option.text, {
                fontSize: '28px',
                fontFamily: 'LXGW WenKai TC',
                color: '#ffffff'
            }).setOrigin(0.5);

            // 互動設定
            btnBg.setInteractive({ useHandCursor: true });

            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0x5a5a5a);
                btnText.setColor('#ffd700');
            });

            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x444444);
                btnText.setColor('#ffffff');
            });

            btnBg.on('pointerdown', () => {
                option.action();
            });

            this.menuContainer.add(btnBg);
            this.menuContainer.add(btnText);
            this.menuButtons.push({ bg: btnBg, text: btnText });
        });

        // 淡入動畫
        this.menuOverlay.setAlpha(0);
        this.menuContainer.setAlpha(0);

        this.tweens.add({
            targets: [this.menuOverlay, this.menuContainer],
            alpha: 1,
            duration: 200
        });
    }

    /**
     * 關閉選單
     */
    closeMenu() {
        if (!this.menuOpen) return;

        console.log('關閉故事選單');

        // 淡出動畫
        this.tweens.add({
            targets: [this.menuOverlay, this.menuContainer],
            alpha: 0,
            duration: 200,
            onComplete: () => {
                if (this.menuOverlay) {
                    this.menuOverlay.destroy();
                    this.menuOverlay = null;
                }
                if (this.menuContainer) {
                    this.menuContainer.destroy();
                    this.menuContainer = null;
                }
                this.menuButtons = [];
                this.menuOpen = false;

                // 恢復打字效果
                if (this.typingTimer && this.typingTimer.paused) {
                    this.typingTimer.paused = false;
                }
            }
        });
    }

    /**
     * 打開設定
     */
    openSettings() {
        console.log('打開設定');
        this.closeMenu();

        // 暫停當前場景
        this.scene.pause('StoryScene');

        // 啟動設定場景
        this.scene.launch('SettingsScene', { returnScene: 'StoryScene' });
    }

    /**
     * 返回標題
     */
    returnToTitle() {
        this.showConfirmDialog(
            '確定要返回標題嗎？',
            '未存檔的故事進度將會保留在記憶中',
            () => {
                // 確認回調
                this.closeMenu();

                // 淡出
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    // 停止所有計時器
                    if (this.typingTimer) this.typingTimer.remove();
                    if (this.autoTimer) this.autoTimer.remove();

                    // 返回主選單
                    this.scene.start('MainMenuScene');
                });
            }
        );
    }

    /**
     * 顯示確認對話框
     * @param {string} title - 標題
     * @param {string} message - 訊息內容
     * @param {function} onConfirm - 確認時的回調
     * @param {function} onCancel - 取消時的回調(可選)
     */
    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        if (this.confirmDialogOpen) return;

        this.confirmDialogOpen = true;
        const { width, height } = this.cameras.main;

        // 深色半透明遮罩
        this.confirmDialogOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        this.confirmDialogOverlay.setInteractive();
        this.confirmDialogOverlay.setDepth(1100);

        // 對話框容器
        this.confirmDialogContainer = this.add.container(width / 2, height / 2);
        this.confirmDialogContainer.setDepth(1200);

        // 對話框背景
        const dialogBg = this.add.rectangle(0, 0, 500, 300, 0x2a2a2a);
        dialogBg.setStrokeStyle(4, 0xff4444);
        this.confirmDialogContainer.add(dialogBg);

        // 標題
        const titleText = this.add.text(0, -100, title, {
            fontSize: '36px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ff4444',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.confirmDialogContainer.add(titleText);

        // 訊息
        const messageText = this.add.text(0, -30, message, {
            fontSize: '24px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 450 }
        }).setOrigin(0.5);
        this.confirmDialogContainer.add(messageText);

        // 按鈕容器
        const buttonY = 80;
        const buttonSpacing = 220;

        // 取消按鈕
        const cancelBtnBg = this.add.rectangle(-buttonSpacing / 2, buttonY, 180, 60, 0x555555);
        cancelBtnBg.setStrokeStyle(2, 0x888888);
        const cancelBtnText = this.add.text(-buttonSpacing / 2, buttonY, '取消', {
            fontSize: '28px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffffff'
        }).setOrigin(0.5);

        cancelBtnBg.setInteractive({ useHandCursor: true });
        cancelBtnBg.on('pointerover', () => {
            cancelBtnBg.setFillStyle(0x666666);
            cancelBtnText.setColor('#ffd700');
        });
        cancelBtnBg.on('pointerout', () => {
            cancelBtnBg.setFillStyle(0x555555);
            cancelBtnText.setColor('#ffffff');
        });
        cancelBtnBg.on('pointerdown', () => {
            this.closeConfirmDialog();
            if (onCancel) onCancel();
        });

        // 確認按鈕
        const confirmBtnBg = this.add.rectangle(buttonSpacing / 2, buttonY, 180, 60, 0x994444);
        confirmBtnBg.setStrokeStyle(2, 0xff4444);
        const confirmBtnText = this.add.text(buttonSpacing / 2, buttonY, '確認', {
            fontSize: '28px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffffff'
        }).setOrigin(0.5);

        confirmBtnBg.setInteractive({ useHandCursor: true });
        confirmBtnBg.on('pointerover', () => {
            confirmBtnBg.setFillStyle(0xcc5555);
            confirmBtnText.setColor('#ffd700');
        });
        confirmBtnBg.on('pointerout', () => {
            confirmBtnBg.setFillStyle(0x994444);
            confirmBtnText.setColor('#ffffff');
        });
        confirmBtnBg.on('pointerdown', () => {
            this.closeConfirmDialog();
            if (onConfirm) onConfirm();
        });

        // 添加所有元素
        this.confirmDialogContainer.add([
            cancelBtnBg, cancelBtnText,
            confirmBtnBg, confirmBtnText
        ]);

        // 淡入動畫
        this.confirmDialogOverlay.setAlpha(0);
        this.confirmDialogContainer.setAlpha(0);
        this.confirmDialogContainer.setScale(0.8);

        this.tweens.add({
            targets: [this.confirmDialogOverlay, this.confirmDialogContainer],
            alpha: 1,
            duration: 200
        });

        this.tweens.add({
            targets: this.confirmDialogContainer,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    /**
     * 關閉確認對話框
     */
    closeConfirmDialog() {
        if (!this.confirmDialogOpen) return;

        // 淡出動畫
        this.tweens.add({
            targets: [this.confirmDialogOverlay, this.confirmDialogContainer],
            alpha: 0,
            duration: 150,
            onComplete: () => {
                if (this.confirmDialogOverlay) {
                    this.confirmDialogOverlay.destroy();
                    this.confirmDialogOverlay = null;
                }
                if (this.confirmDialogContainer) {
                    this.confirmDialogContainer.destroy();
                    this.confirmDialogContainer = null;
                }
                this.confirmDialogOpen = false;
            }
        });
    }

    /**
     * 故事結束
     */
    endStory() {
        console.log('故事結束');

        // 停止所有計時器
        if (this.typingTimer) {
            this.typingTimer.remove();
        }
        if (this.autoTimer) {
            this.autoTimer.remove();
        }

        // 顯示結束提示
        this.dialogueText.setText('故事結束，即將進入客棧…');
        this.nextButton.setVisible(false);
        this.speakerText.setText('');

        // 隱藏所有立繪
        Object.values(this.characterPortraits).forEach(portrait => {
            this.tweens.add({
                targets: portrait,
                alpha: 0,
                duration: 500
            });
        });

        // 相機淡出
        this.cameras.main.fadeOut(1500);

        // 淡出完成後進入客棧大廳
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // 根據故事ID決定進入哪個場景
            if (this.storyId === 'opening') {
                // 開場劇情結束後進入客棧大廳
                this.scene.start('LobbyScene');
            } else {
                // 其他劇情結束後返回客棧大廳
                this.scene.start('LobbyScene');
            }
        });
    }

    update() {
        // 顯示快進指示器
        if (this.ctrlKey && this.ctrlKey.isDown) {
            // 快進模式激活
            this.controlHint.setColor('#ffff00');
            this.controlHint.setText('⏩ 快進播放中... (放開 Ctrl 停止)');
        } else {
            this.controlHint.setColor('#888888');
            this.controlHint.setText('空白鍵/點擊：繼續  |  Ctrl：快進播放  |  ESC：選單');
        }
    }

    /**
     * 場景關閉時清理
     * 重要：移除所有事件監聽器，避免多個場景實例的事件衝突
     */
    shutdown() {
        console.log('🧹 StoryScene shutdown - 清理事件監聽器');

        // 移除鍵盤事件監聽器
        this.input.keyboard.off('keydown-SPACE');
        this.input.keyboard.off('keydown-ENTER');
        this.input.keyboard.off('keydown-ESC');
        this.input.keyboard.off('keydown-A');
        this.input.keyboard.off('keydown-CTRL');

        // 移除滑鼠點擊事件
        this.input.off('pointerdown');

        // 清理計時器
        if (this.typingTimer) {
            this.typingTimer.remove();
            this.typingTimer = null;
        }

        if (this.autoTimer) {
            this.autoTimer.remove();
            this.autoTimer = null;
        }

        // 清理 BGM Controller
        if (this.bgmController) {
            // BGMController 由其他場景管理，這裡不需要清理
        }

        console.log('✅ StoryScene 事件清理完成');
    }
}

// Phaser 場景導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryScene;
}
