import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

const GameState = require('../src/core/GameState');

describe('TimeManager', () => {
    let gameState;
    let timeManager;

    beforeEach(() => {
        localStorage.clear();
        gameState = new GameState();
        timeManager = gameState.timeManager;
    });

    describe('初始化', () => {
        it('應該正確初始化時間狀態', () => {
            expect(timeManager.time.year).toBe(1);
            expect(timeManager.time.month).toBe(1);
            expect(timeManager.time.day).toBe(1);
            expect(timeManager.time.hour).toBe(8);
            expect(timeManager.time.minute).toBe(0);
        });

        it('應該正確初始化營業狀態', () => {
            expect(timeManager.business.isOpen).toBe(true);
            expect(timeManager.business.openHour).toBe(6);
            expect(timeManager.business.closeHour).toBe(22);
        });

        it('應該初始化為非暫停狀態', () => {
            expect(timeManager.isPaused).toBe(false);
        });
    });

    describe('時間推進', () => {
        it('advanceMinutes 應該正確推進分鐘', () => {
            timeManager.advanceMinutes(30);
            expect(timeManager.time.minute).toBe(30);
        });

        it('advanceMinutes 超過 60 分鐘應該進位到小時', () => {
            timeManager.advanceMinutes(65);
            expect(timeManager.time.hour).toBe(9);
            expect(timeManager.time.minute).toBe(5);
        });

        it('advanceHour 應該正確推進小時', () => {
            timeManager.advanceHour();
            expect(timeManager.time.hour).toBe(9);
        });

        it('advanceDay 應該正確推進天數', () => {
            timeManager.advanceDay();
            expect(timeManager.time.day).toBe(2);
            expect(timeManager.time.hour).toBe(0);
        });

        it('advanceMonth 應該正確推進月份', () => {
            timeManager.advanceMonth();
            expect(timeManager.time.month).toBe(2);
            expect(timeManager.time.day).toBe(1);
        });

        it('advanceYear 應該正確推進年份', () => {
            timeManager.advanceYear();
            expect(timeManager.time.year).toBe(2);
            expect(timeManager.time.month).toBe(1);
        });
    });

    describe('update 方法', () => {
        it('暫停時不應該更新時間', () => {
            timeManager.isPaused = true;
            const initialMinute = timeManager.time.minute;
            timeManager.update(1000);
            expect(timeManager.time.minute).toBe(initialMinute);
        });

        it('應該根據 deltaTime 累積時間', () => {
            const initialMinute = timeManager.time.minute;
            timeManager.update(1000);
            expect(timeManager.time.minute).toBeGreaterThanOrEqual(initialMinute);
        });
    });

    describe('營業時間', () => {
        it('checkBusinessHours 應該正確檢查營業狀態', () => {
            timeManager.time.hour = 10;
            timeManager.checkBusinessHours();
            expect(timeManager.business.isOpen).toBe(true);

            timeManager.time.hour = 23;
            timeManager.checkBusinessHours();
            expect(timeManager.business.isOpen).toBe(false);
        });
    });

    describe('事件監聽器', () => {
        it('應該能註冊 onNewDay 事件', () => {
            let triggered = false;
            timeManager.on('onNewDay', () => { triggered = true; });
            timeManager.advanceDay();
            expect(triggered).toBe(true);
        });

        it('應該能註冊 onHourChange 事件', () => {
            let triggered = false;
            timeManager.on('onHourChange', () => { triggered = true; });
            timeManager.advanceHour();
            expect(triggered).toBe(true);
        });

        it('應該能移除事件監聽器', () => {
            let count = 0;
            const listener = () => { count++; };
            timeManager.on('onNewDay', listener);
            timeManager.advanceDay();
            timeManager.off('onNewDay', listener);
            timeManager.advanceDay();
            expect(count).toBe(1);
        });
    });

    describe('時間控制', () => {
        it('pause/resume 應該正確工作', () => {
            timeManager.pause();
            expect(timeManager.isPaused).toBe(true);
            timeManager.resume();
            expect(timeManager.isPaused).toBe(false);
        });

        it('setTimeScale 應該設置時間流速', () => {
            const result = timeManager.setTimeScale(2.0);
            expect(timeManager.timeScale).toBe(2.0);
            expect(result.timeScale).toBe(2.0);
        });

        it('skipTime 應該快進指定小時', () => {
            timeManager.skipTime(5);
            expect(timeManager.time.hour).toBe(13);
        });

        it('skipDays 應該快進指定天數', () => {
            timeManager.skipDays(3);
            expect(timeManager.time.day).toBe(4);
        });
    });

    describe('時間描述', () => {
        it('getTimePeriod 應該返回正確的時段', () => {
            timeManager.time.hour = 6;
            expect(timeManager.getTimePeriod()).toBe('清晨');
        });

        it('getTimeDescription 應該返回時間描述', () => {
            const desc = timeManager.getTimeDescription();
            expect(desc).toContain('年');
            expect(desc).toContain('月');
            expect(desc).toContain('日');
        });

        it('isNightTime/isDayTime 應該正確判斷', () => {
            timeManager.time.hour = 10;
            timeManager.checkBusinessHours();
            expect(timeManager.isDayTime()).toBe(true);
            expect(timeManager.isNightTime()).toBe(false);
        });
    });

    describe('時間信息', () => {
        it('getTimeInfo 應該返回完整時間信息', () => {
            const info = timeManager.getTimeInfo();
            expect(info.time).toBeDefined();
            expect(info.business).toBeDefined();
            expect(info.isPaused).toBe(false);
        });
    });

    describe('序列化', () => {
        it('serialize 應該正確序列化', () => {
            const data = timeManager.serialize();
            expect(data.time).toBeDefined();
            expect(data.business).toBeDefined();
            expect(data.timeScale).toBe(1.0);
        });

        it('deserialize 應該正確反序列化', () => {
            const savedData = {
                time: { year: 2, month: 5, day: 15, hour: 14, minute: 30 },
                timeScale: 2.0
            };
            timeManager.deserialize(savedData);
            expect(timeManager.time.year).toBe(2);
            expect(timeManager.timeScale).toBe(2.0);
        });
    });

    describe('每日結算', () => {
        it('dailySettlement 應該返回結算結果', () => {
            const result = timeManager.dailySettlement();
            expect(result).toBeDefined();
        });
    });
});
