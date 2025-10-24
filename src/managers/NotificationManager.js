/**
 * 通知管理器
 * 管理遊戲內的通知消息（小視窗通知）
 */

class NotificationManager {
    constructor() {
        this.notifications = [];  // 通知隊列
        this.activeNotifications = []; // 當前顯示的通知
        this.maxActiveNotifications = 3; // 最多同時顯示3個通知
        this.notificationId = 0; // 通知ID計數器
    }

    /**
     * 添加通知
     * @param {object} options - 通知選項
     * {
     *   title: string,
     *   message: string,
     *   type: 'info' | 'success' | 'warning' | 'error' | 'event',
     *   duration: number (毫秒，0表示不自動關閉),
     *   icon: string (可選),
     *   onClick: function (可選)
     * }
     */
    addNotification(options) {
        const notification = {
            id: this.notificationId++,
            title: options.title || '通知',
            message: options.message || '',
            type: options.type || 'info',
            duration: options.duration !== undefined ? options.duration : 5000,
            icon: options.icon || this.getDefaultIcon(options.type),
            onClick: options.onClick || null,
            timestamp: Date.now(),
            status: 'pending' // pending, active, dismissed
        };

        this.notifications.push(notification);

        // 嘗試顯示通知
        this.processQueue();

        return notification.id;
    }

    /**
     * 獲取默認圖標
     */
    getDefaultIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            event: '📜'
        };

        return icons[type] || icons.info;
    }

    /**
     * 處理通知隊列
     */
    processQueue() {
        // 移除已經顯示且超時的通知
        this.activeNotifications = this.activeNotifications.filter(n => {
            if (n.status === 'dismissed') {
                return false;
            }

            // 檢查是否超時
            if (n.duration > 0 && Date.now() - n.timestamp > n.duration) {
                n.status = 'dismissed';
                return false;
            }

            return true;
        });

        // 如果有空位，顯示新通知
        while (this.activeNotifications.length < this.maxActiveNotifications && this.notifications.length > 0) {
            const notification = this.notifications.shift();
            notification.status = 'active';
            this.activeNotifications.push(notification);
        }
    }

    /**
     * 關閉通知
     */
    dismissNotification(notificationId) {
        // 從活動通知中移除
        const index = this.activeNotifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            this.activeNotifications[index].status = 'dismissed';
        }

        // 從隊列中移除
        const queueIndex = this.notifications.findIndex(n => n.id === notificationId);
        if (queueIndex !== -1) {
            this.notifications.splice(queueIndex, 1);
        }

        // 處理隊列，顯示下一個通知
        this.processQueue();

        return { success: true };
    }

    /**
     * 清空所有通知
     */
    clearAll() {
        this.notifications = [];
        this.activeNotifications.forEach(n => n.status = 'dismissed');
        this.activeNotifications = [];

        return { success: true };
    }

    /**
     * 獲取當前活動的通知
     */
    getActiveNotifications() {
        this.processQueue(); // 先處理隊列
        return [...this.activeNotifications];
    }

    /**
     * 獲取隊列中的通知數量
     */
    getQueueLength() {
        return this.notifications.length;
    }

    /**
     * 快捷方法：添加信息通知
     */
    info(title, message, duration = 5000) {
        return this.addNotification({
            title,
            message,
            type: 'info',
            duration
        });
    }

    /**
     * 快捷方法：添加成功通知
     */
    success(title, message, duration = 3000) {
        return this.addNotification({
            title,
            message,
            type: 'success',
            duration
        });
    }

    /**
     * 快捷方法：添加警告通知
     */
    warning(title, message, duration = 7000) {
        return this.addNotification({
            title,
            message,
            type: 'warning',
            duration
        });
    }

    /**
     * 快捷方法：添加錯誤通知
     */
    error(title, message, duration = 10000) {
        return this.addNotification({
            title,
            message,
            type: 'error',
            duration
        });
    }

    /**
     * 快捷方法：添加事件通知
     */
    event(title, message, duration = 0) {
        return this.addNotification({
            title,
            message,
            type: 'event',
            duration, // 事件通知默認不自動關閉
            icon: '📜'
        });
    }

    /**
     * 添加事件通知（帶選項）
     */
    addEventNotification(eventData, onChoiceCallback) {
        const hasChoices = eventData.choices && eventData.choices.length > 0;

        return this.addNotification({
            title: eventData.title,
            message: eventData.description,
            type: 'event',
            duration: hasChoices ? 0 : 8000, // 有選項的不自動關閉
            icon: this.getEventIcon(eventData.type),
            onClick: hasChoices ? onChoiceCallback : null,
            eventData: eventData // 保存完整事件數據
        });
    }

    /**
     * 獲取事件圖標
     */
    getEventIcon(eventType) {
        const icons = {
            opportunity: '💰',
            crisis: '⚠️',
            mystery: '❓',
            social: '👥'
        };

        return icons[eventType] || '📜';
    }

    /**
     * 更新（由遊戲主循環調用）
     */
    update() {
        this.processQueue();
    }

    /**
     * 序列化（存檔用）
     */
    serialize() {
        // 通知系統通常不需要序列化，因為都是臨時消息
        // 但可以保存未讀通知
        return {
            pendingNotifications: this.notifications.map(n => ({
                title: n.title,
                message: n.message,
                type: n.type
            }))
        };
    }

    /**
     * 反序列化（讀檔用）
     */
    deserialize(data) {
        if (data.pendingNotifications && Array.isArray(data.pendingNotifications)) {
            data.pendingNotifications.forEach(n => {
                this.addNotification(n);
            });
        }
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
