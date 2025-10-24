/**
 * NotificationManager 測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const NotificationManager = require('../src/managers/NotificationManager');

describe('通知管理器', () => {
    let notificationManager;

    beforeEach(() => {
        notificationManager = new NotificationManager();
    });

    describe('初始化', () => {
        it('應該有空的通知列表', () => {
            expect(notificationManager.notifications.length).toBe(0);
            expect(notificationManager.activeNotifications.length).toBe(0);
        });

        it('應該有正確的最大活動通知數', () => {
            expect(notificationManager.maxActiveNotifications).toBe(3);
        });
    });

    describe('添加通知', () => {
        it('應該能添加通知', () => {
            const id = notificationManager.addNotification({
                title: '測試通知',
                message: '這是一個測試'
            });

            expect(id).toBeGreaterThanOrEqual(0);
            expect(notificationManager.getActiveNotifications().length).toBe(1);
        });

        it('應該能設置通知類型', () => {
            notificationManager.addNotification({
                title: '測試',
                message: '測試',
                type: 'success'
            });

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].type).toBe('success');
        });

        it('應該能設置通知持續時間', () => {
            notificationManager.addNotification({
                title: '測試',
                message: '測試',
                duration: 10000
            });

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].duration).toBe(10000);
        });

        it('默認持續時間應該是5秒', () => {
            notificationManager.addNotification({
                title: '測試',
                message: '測試'
            });

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].duration).toBe(5000);
        });
    });

    describe('通知隊列', () => {
        it('應該能同時顯示最多3個通知', () => {
            for (let i = 0; i < 5; i++) {
                notificationManager.addNotification({
                    title: `通知 ${i}`,
                    message: '測試'
                });
            }

            expect(notificationManager.getActiveNotifications().length).toBe(3);
            expect(notificationManager.getQueueLength()).toBe(2);
        });

        it('關閉通知後應該顯示隊列中的下一個', () => {
            for (let i = 0; i < 5; i++) {
                notificationManager.addNotification({
                    title: `通知 ${i}`,
                    message: '測試'
                });
            }

            const active = notificationManager.getActiveNotifications();
            const firstId = active[0].id;

            notificationManager.dismissNotification(firstId);

            expect(notificationManager.getActiveNotifications().length).toBe(3);
            expect(notificationManager.getQueueLength()).toBe(1);
        });
    });

    describe('關閉通知', () => {
        it('應該能關閉通知', () => {
            const id = notificationManager.addNotification({
                title: '測試',
                message: '測試'
            });

            notificationManager.dismissNotification(id);

            expect(notificationManager.getActiveNotifications().length).toBe(0);
        });

        it('關閉不存在的通知應該成功', () => {
            const result = notificationManager.dismissNotification(999);
            expect(result.success).toBe(true);
        });
    });

    describe('清空所有通知', () => {
        it('應該能清空所有通知', () => {
            for (let i = 0; i < 5; i++) {
                notificationManager.addNotification({
                    title: `通知 ${i}`,
                    message: '測試'
                });
            }

            notificationManager.clearAll();

            expect(notificationManager.getActiveNotifications().length).toBe(0);
            expect(notificationManager.getQueueLength()).toBe(0);
        });
    });

    describe('快捷方法', () => {
        it('應該能使用info快捷方法', () => {
            notificationManager.info('信息', '這是一條信息');

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].type).toBe('info');
        });

        it('應該能使用success快捷方法', () => {
            notificationManager.success('成功', '操作成功');

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].type).toBe('success');
        });

        it('應該能使用warning快捷方法', () => {
            notificationManager.warning('警告', '這是一條警告');

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].type).toBe('warning');
        });

        it('應該能使用error快捷方法', () => {
            notificationManager.error('錯誤', '發生錯誤');

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].type).toBe('error');
        });

        it('應該能使用event快捷方法', () => {
            notificationManager.event('事件', '隨機事件發生');

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].type).toBe('event');
            expect(notifications[0].duration).toBe(0); // 事件默認不自動關閉
        });
    });

    describe('默認圖標', () => {
        it('應該為不同類型設置正確的圖標', () => {
            expect(notificationManager.getDefaultIcon('info')).toBe('ℹ️');
            expect(notificationManager.getDefaultIcon('success')).toBe('✅');
            expect(notificationManager.getDefaultIcon('warning')).toBe('⚠️');
            expect(notificationManager.getDefaultIcon('error')).toBe('❌');
            expect(notificationManager.getDefaultIcon('event')).toBe('📜');
        });

        it('未知類型應該使用info圖標', () => {
            expect(notificationManager.getDefaultIcon('unknown')).toBe('ℹ️');
        });
    });

    describe('事件圖標', () => {
        it('應該為事件類型設置正確的圖標', () => {
            expect(notificationManager.getEventIcon('opportunity')).toBe('💰');
            expect(notificationManager.getEventIcon('crisis')).toBe('⚠️');
            expect(notificationManager.getEventIcon('mystery')).toBe('❓');
            expect(notificationManager.getEventIcon('social')).toBe('👥');
        });

        it('未知事件類型應該使用默認圖標', () => {
            expect(notificationManager.getEventIcon('unknown')).toBe('📜');
        });
    });

    describe('事件通知', () => {
        it('應該能添加事件通知', () => {
            const eventData = {
                title: '商隊來訪',
                description: '一支商隊來到客棧',
                type: 'opportunity',
                choices: []
            };

            const id = notificationManager.addEventNotification(eventData);

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].id).toBe(id);
            expect(notifications[0].title).toBe('商隊來訪');
            expect(notifications[0].type).toBe('event');
        });

        it('有選項的事件不應該自動關閉', () => {
            const eventData = {
                title: '商隊來訪',
                description: '一支商隊來到客棧',
                type: 'opportunity',
                choices: [
                    { text: '選項1' },
                    { text: '選項2' }
                ]
            };

            notificationManager.addEventNotification(eventData);

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].duration).toBe(0);
        });

        it('無選項的事件應該在8秒後自動關閉', () => {
            const eventData = {
                title: '收益',
                description: '獲得了100兩銀子',
                type: 'opportunity',
                autoEffects: [{ type: 'add_silver', value: 100 }]
            };

            notificationManager.addEventNotification(eventData);

            const notifications = notificationManager.getActiveNotifications();
            expect(notifications[0].duration).toBe(8000);
        });
    });

    describe('序列化', () => {
        it('應該能序列化', () => {
            notificationManager.addNotification({
                title: '測試',
                message: '測試消息'
            });

            const data = notificationManager.serialize();

            expect(data.pendingNotifications).toBeDefined();
        });

        it('應該能反序列化', () => {
            const data = {
                pendingNotifications: [
                    { title: '通知1', message: '消息1', type: 'info' },
                    { title: '通知2', message: '消息2', type: 'success' }
                ]
            };

            notificationManager.deserialize(data);

            expect(notificationManager.getActiveNotifications().length).toBeGreaterThan(0);
        });
    });

    describe('更新處理', () => {
        it('應該能處理通知過期', () => {
            // 添加一個已經過期的通知（模擬）
            notificationManager.addNotification({
                title: '測試',
                message: '測試',
                duration: 0
            });

            // 手動設置timestamp為很久以前
            if (notificationManager.activeNotifications.length > 0) {
                notificationManager.activeNotifications[0].timestamp = Date.now() - 10000;
                notificationManager.activeNotifications[0].duration = 100;
            }

            notificationManager.update();

            // 過期的通知應該被移除
            const active = notificationManager.getActiveNotifications();
            expect(active.length).toBe(0);
        });
    });
});
