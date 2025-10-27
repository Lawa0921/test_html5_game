/**
 * NotificationUI - 通知系統 UI
 *
 * 顯示各種遊戲通知（資訊、成功、警告、錯誤、事件）
 */

class NotificationUI {
    constructor(scene) {
        this.scene = scene;
        this.notifications = [];  // 當前顯示的通知列表
        this.maxNotifications = 3;  // 最多同時顯示3個通知
        this.notificationHeight = 90;  // 每個通知的高度（含間距）
        this.startY = 120;  // 第一個通知的Y座標

        // 通知類型配置
        this.notificationTypes = {
            info: { icon: 'ℹ️', color: '#4169E1', bgColor: 0x87CEEB },
            success: { icon: '✓', color: '#32CD32', bgColor: 0x90EE90 },
            warning: { icon: '⚠', color: '#FFA500', bgColor: 0xFFD700 },
            error: { icon: '✗', color: '#DC143C', bgColor: 0xFF6B6B },
            event: { icon: '!', color: '#9370DB', bgColor: 0xDDA0DD }
        };
    }

    /**
     * 顯示通知
     * @param {string} message - 通知訊息
     * @param {string} type - 通知類型 (info/success/warning/error/event)
     * @param {number} duration - 顯示時長（毫秒），0 表示不自動消失
     */
    show(message, type = 'info', duration = 3000) {
        // 如果通知太多，移除最舊的
        if (this.notifications.length >= this.maxNotifications) {
            this.removeNotification(this.notifications[0]);
        }

        const config = this.notificationTypes[type] || this.notificationTypes.info;
        const notification = this.createNotification(message, type, config);

        this.notifications.push(notification);
        this.repositionNotifications();

        // 淡入動畫
        this.scene.tweens.add({
            targets: notification.container,
            alpha: { from: 0, to: 1 },
            x: { from: notification.container.x + 50, to: notification.container.x },
            duration: 300,
            ease: 'Power2'
        });

        // 自動消失
        if (duration > 0) {
            this.scene.time.delayedCall(duration, () => {
                this.removeNotification(notification);
            });
        }

        return notification;
    }

    /**
     * 創建通知容器
     */
    createNotification(message, type, config) {
        const { width } = this.scene.cameras.main;
        const x = width - 150;
        const y = this.startY;

        const container = this.scene.add.container(x, y);
        container.setDepth(5000);  // 最高層級

        // 背景（半透明）
        const bg = this.scene.add.rectangle(0, 0, 280, 80, config.bgColor, 0.95);
        bg.setStrokeStyle(2, Phaser.Display.Color.GetColor(
            ...Phaser.Display.Color.ValueToColor(config.color)
        ));

        // 圖標
        const icon = this.scene.add.text(-120, 0, config.icon, {
            fontSize: '28px',
            color: config.color
        }).setOrigin(0.5);

        // 訊息文本（自動換行）
        const messageText = this.scene.add.text(-80, 0, message, {
            fontSize: '14px',
            color: '#000000',
            wordWrap: { width: 180 },
            align: 'left'
        }).setOrigin(0, 0.5);

        // 關閉按鈕
        const closeBtn = this.scene.add.text(125, -30, '✕', {
            fontSize: '18px',
            color: '#666666'
        }).setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.removeNotification(notification);
        });
        closeBtn.on('pointerover', () => closeBtn.setColor('#000000'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#666666'));

        container.add([bg, icon, messageText, closeBtn]);

        const notification = {
            container,
            type,
            message,
            timestamp: Date.now()
        };

        return notification;
    }

    /**
     * 移除通知
     */
    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index === -1) return;

        // 淡出動畫
        this.scene.tweens.add({
            targets: notification.container,
            alpha: 0,
            x: notification.container.x + 50,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                notification.container.destroy();
                this.notifications.splice(index, 1);
                this.repositionNotifications();
            }
        });
    }

    /**
     * 重新定位所有通知（堆疊顯示）
     */
    repositionNotifications() {
        this.notifications.forEach((notification, index) => {
            const targetY = this.startY + (index * this.notificationHeight);

            this.scene.tweens.add({
                targets: notification.container,
                y: targetY,
                duration: 300,
                ease: 'Power2'
            });
        });
    }

    /**
     * 清除所有通知
     */
    clearAll() {
        this.notifications.forEach(notification => {
            notification.container.destroy();
        });
        this.notifications = [];
    }

    /**
     * 快捷方法：顯示資訊通知
     */
    showInfo(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * 快捷方法：顯示成功通知
     */
    showSuccess(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    /**
     * 快捷方法：顯示警告通知
     */
    showWarning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * 快捷方法：顯示錯誤通知
     */
    showError(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    /**
     * 快捷方法：顯示事件通知
     */
    showEvent(message, duration = 4000) {
        return this.show(message, 'event', duration);
    }

    /**
     * 銷毀通知系統
     */
    destroy() {
        this.clearAll();
    }
}

module.exports = NotificationUI;
