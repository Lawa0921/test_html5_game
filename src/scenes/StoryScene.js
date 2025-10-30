/**
 * 視覺小說場景
 * 顯示對話、選項、角色立繪
 */

class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });
        this.storyManager = null;
        this.currentNode = null;

        // UI 元素
        this.background = null;
        this.characterPortrait = null;
        this.dialogueBox = null;
        this.speakerText = null;
        this.dialogueText = null;
        this.choiceButtons = [];
        this.nextButton = null;

        // 文字打字機效果
        this.isTyping = false;
        this.fullText = '';
        this.currentText = '';
        this.typingSpeed = 30; // 毫秒/字
    }

    init(data) {
        // 接收啟動場景時傳入的故事ID
        this.storyId = data.storyId || 'opening';
        this.gameState = data.gameState || window.gameState;
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

        // 創建角色立繪區域（placeholder）
        this.characterPortrait = this.add.rectangle(width / 2, height / 2 - 50, 200, 300, 0x6b4423);
        this.characterPortrait.setStrokeStyle(2, 0xffffff);

        // 創建對話框
        const dialogueBoxHeight = 180;
        const dialogueBoxY = height - dialogueBoxHeight;

        this.dialogueBox = this.add.rectangle(
            0,
            dialogueBoxY,
            width,
            dialogueBoxHeight,
            0x1a1a1a,
            0.9
        );
        this.dialogueBox.setOrigin(0, 0);
        this.dialogueBox.setStrokeStyle(2, 0xffffff);

        // 創建說話者名稱
        this.speakerText = this.add.text(30, dialogueBoxY + 15, '', {
            fontSize: '24px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffd700',
            fontStyle: 'bold'
        });

        // 創建對話文字
        this.dialogueText = this.add.text(30, dialogueBoxY + 50, '', {
            fontSize: '20px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffffff',
            wordWrap: { width: width - 60 }
        });

        // 創建"繼續"按鈕
        this.nextButton = this.add.text(width - 120, height - 40, '[繼續]', {
            fontSize: '18px',
            fontFamily: 'LXGW WenKai TC',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 15, y: 8 }
        });
        this.nextButton.setInteractive({ useHandCursor: true });
        this.nextButton.on('pointerdown', () => this.onNextClick());
        this.nextButton.setVisible(false);

        // 創建選項容器（暫時隱藏）
        this.choiceContainer = this.add.container(width / 2, dialogueBoxY - 50);
        this.choiceContainer.setVisible(false);

        // 開始故事
        this.startStory();

        // 添加鍵盤事件（空格鍵繼續）
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.nextButton.visible) {
                this.onNextClick();
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
            this.scene.start('BattleScene'); // 返回主場景
            return;
        }

        console.log('開始故事:', result.title);
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

        // 清除選項
        this.clearChoices();

        // 顯示說話者
        this.speakerText.setText(this.currentNode.speaker || '');

        // 顯示對話文字（帶打字機效果）
        this.fullText = this.currentNode.text || '';
        this.currentText = '';
        this.isTyping = true;
        this.nextButton.setVisible(false);

        this.typeText();

        // 如果有選項，準備顯示選項
        if (this.currentNode.choices && this.currentNode.choices.length > 0) {
            // 等文字打完再顯示選項
        } else {
            // 沒有選項，顯示"繼續"按鈕
        }
    }

    /**
     * 打字機效果
     */
    typeText() {
        if (!this.isTyping) return;

        if (this.currentText.length < this.fullText.length) {
            this.currentText = this.fullText.substring(0, this.currentText.length + 1);
            this.dialogueText.setText(this.currentText);

            // 繼續打字
            this.time.delayedCall(this.typingSpeed, () => this.typeText(), [], this);
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
        } else {
            // 顯示"繼續"按鈕
            this.nextButton.setVisible(true);
        }
    }

    /**
     * 顯示選項
     */
    displayChoices() {
        this.clearChoices();

        const choices = this.currentNode.choices;
        const startY = -(choices.length - 1) * 35;

        choices.forEach((choice, index) => {
            const button = this.add.text(0, startY + index * 70, choice.text, {
                fontSize: '18px',
                fontFamily: 'LXGW WenKai TC',
                color: '#ffffff',
                backgroundColor: '#3a5a7a',
                padding: { x: 20, y: 12 },
                align: 'center',
                wordWrap: { width: 700 }
            });
            button.setOrigin(0.5, 0.5);
            button.setInteractive({ useHandCursor: true });

            // 添加懸停效果
            button.on('pointerover', () => {
                button.setStyle({ backgroundColor: '#4a6a8a' });
            });
            button.on('pointerout', () => {
                button.setStyle({ backgroundColor: '#3a5a7a' });
            });

            button.on('pointerdown', () => this.onChoiceClick(index));

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
     * 故事結束
     */
    endStory() {
        console.log('故事結束');

        // 顯示結束提示
        this.dialogueText.setText('故事結束，即將返回客棧…');
        this.nextButton.setVisible(false);

        // 2秒後返回主場景
        this.time.delayedCall(2000, () => {
            this.scene.start('BattleScene'); // 返回主場景（暫時用BattleScene代替）
        }, [], this);
    }

    update() {
        // 暫時不需要更新邏輯
    }
}

// Phaser 場景導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoryScene;
}
