/**
 * 角色精靈管理 - 2.5D 場景中的角色顯示和移動
 */
class CharacterSprite {
    constructor(scene, employee, x, y) {
        this.scene = scene;
        this.employee = employee;  // 引用 GameState 中的員工數據

        // 創建精靈容器
        this.container = scene.add.container(x, y);
        this.container.setDepth(y);  // 根據 Y 軸決定層級（偽3D效果）

        // 創建角色精靈（目前用佔位圖）
        this.sprite = scene.add.circle(0, 0, 20, this.getColorByType(employee.type));
        this.sprite.setStrokeStyle(2, 0xffffff);
        this.container.add(this.sprite);

        // 顯示名字
        this.nameText = scene.add.text(0, -35, employee.name, {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        });
        this.nameText.setOrigin(0.5);
        this.container.add(this.nameText);

        // 狀態圖標
        this.statusIcon = scene.add.text(0, 25, this.getStateEmoji(), {
            fontSize: '16px'
        });
        this.statusIcon.setOrigin(0.5);
        this.container.add(this.statusIcon);

        // 移動相關
        this.moveTween = null;
        this.idleAnimation = null;

        // 開始待機動畫
        this.startIdleAnimation();
    }

    /**
     * 根據員工類型獲取顏色
     */
    getColorByType(type) {
        const colors = {
            manager: 0xFFD700,      // 金色 - 掌櫃
            chef: 0xFF6B6B,         // 紅色 - 廚師
            waiter: 0x4ECDC4,       // 青色 - 服務員
            guard: 0x95E1D3,        // 綠色 - 保鏢
            runner: 0xF3A683,       // 橙色 - 跑堂
            herbalist: 0xAA96DA,    // 紫色 - 藥師
            storyteller: 0xFCBF49,  // 黃色 - 說書人
            musician: 0xF38181,     // 粉色 - 樂師
            accountant: 0x786FA6,   // 深紫 - 賬房
            doorman: 0x63CDDA       // 藍色 - 門童
        };
        return colors[type] || 0xCCCCCC;
    }

    /**
     * 根據狀態獲取表情符號
     */
    getStateEmoji() {
        const emojis = {
            IDLE: '💤',
            WALKING: '🚶',
            WORKING: '💼',
            RESTING: '☕',
            SLEEPING: '😴',
            EVENT: '❗'
        };
        const currentState = this.employee.status?.currentState || this.employee.workStatus?.currentState || 'IDLE';
        return emojis[currentState] || '❓';
    }

    /**
     * 更新狀態圖標
     */
    updateStatus() {
        this.statusIcon.setText(this.getStateEmoji());
    }

    /**
     * 移動到目標位置
     */
    moveTo(targetX, targetY, callback) {
        // 停止當前移動
        if (this.moveTween) {
            this.moveTween.stop();
        }

        // 停止待機動畫
        this.stopIdleAnimation();

        // 確保員工有 status 屬性
        if (!this.employee.status) {
            this.employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        }

        // 更新狀態
        this.employee.status.currentState = 'WALKING';
        this.updateStatus();

        // 計算移動時間（根據距離）
        const distance = Phaser.Math.Distance.Between(
            this.container.x, this.container.y,
            targetX, targetY
        );
        const duration = (distance / 100) * 1000;  // 100像素/秒

        // 創建移動 Tween
        this.moveTween = this.scene.tweens.add({
            targets: this.container,
            x: targetX,
            y: targetY,
            duration: Math.max(duration, 500),  // 最少500ms
            ease: 'Linear',
            onUpdate: () => {
                // 更新深度（偽3D效果）
                this.container.setDepth(this.container.y);
            },
            onComplete: () => {
                if (!this.employee.position) {
                    this.employee.position = { scene: 'lobby', x: 0, y: 0 };
                }
                this.employee.position.x = targetX;
                this.employee.position.y = targetY;
                this.employee.status.currentState = 'IDLE';
                this.updateStatus();
                this.startIdleAnimation();

                if (callback) callback();
            }
        });
    }

    /**
     * 開始工作
     */
    startWork() {
        if (!this.employee.status) {
            this.employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        }
        this.employee.status.currentState = 'WORKING';
        this.updateStatus();

        // 工作動畫（簡單的跳動）
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 停止工作
     */
    stopWork() {
        if (!this.employee.status) {
            this.employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        }
        this.employee.status.currentState = 'IDLE';
        this.updateStatus();

        // 停止所有動畫
        this.scene.tweens.killTweensOf(this.sprite);
        this.sprite.setScale(1, 1);

        this.startIdleAnimation();
    }

    /**
     * 休息
     */
    rest() {
        if (!this.employee.status) {
            this.employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        }
        this.employee.status.currentState = 'RESTING';
        this.updateStatus();
        this.sprite.setAlpha(0.8);
    }

    /**
     * 睡覺
     */
    sleep() {
        if (!this.employee.status) {
            this.employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        }
        this.employee.status.currentState = 'SLEEPING';
        this.updateStatus();
        this.sprite.setAlpha(0.5);
    }

    /**
     * 喚醒
     */
    wakeUp() {
        this.sprite.setAlpha(1);
        if (!this.employee.status) {
            this.employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        }
        this.employee.status.currentState = 'IDLE';
        this.updateStatus();
    }

    /**
     * 開始待機動畫
     */
    startIdleAnimation() {
        this.idleAnimation = this.scene.tweens.add({
            targets: this.container,
            y: this.container.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 停止待機動畫
     */
    stopIdleAnimation() {
        if (this.idleAnimation) {
            this.idleAnimation.stop();
            this.idleAnimation = null;
        }
    }

    /**
     * 顯示對話泡泡
     */
    showSpeechBubble(text, duration = 2000) {
        const bubble = this.scene.add.container(this.container.x, this.container.y - 50);

        // 背景
        const bg = this.scene.add.rectangle(0, 0, text.length * 12 + 20, 30, 0xffffff, 0.9);
        bg.setStrokeStyle(2, 0x000000);
        bubble.add(bg);

        // 文字
        const bubbleText = this.scene.add.text(0, 0, text, {
            fontSize: '12px',
            color: '#000000'
        });
        bubbleText.setOrigin(0.5);
        bubble.add(bubbleText);

        bubble.setDepth(1000);

        // 自動消失
        this.scene.time.delayedCall(duration, () => {
            bubble.destroy();
        });
    }

    /**
     * 更新（每幀調用）
     */
    update(delta) {
        // 可以在這裡添加更新邏輯
    }

    /**
     * 銷毀
     */
    destroy() {
        if (this.moveTween) {
            this.moveTween.stop();
        }
        this.stopIdleAnimation();
        this.container.destroy();
    }

    /**
     * 設置可點擊
     */
    setInteractive(callback) {
        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', () => {
            if (callback) callback(this.employee);
        });

        // Hover 效果
        this.sprite.on('pointerover', () => {
            this.sprite.setScale(1.2);
        });

        this.sprite.on('pointerout', () => {
            this.sprite.setScale(1);
        });
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterSprite;
}
