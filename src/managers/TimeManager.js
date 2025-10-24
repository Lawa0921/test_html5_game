/**
 * 時間管理器
 * 管理遊戲時間、日夜循環、營業時間、時間事件
 */

class TimeManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 時間狀態
        this.time = {
            year: 1,           // 年份
            month: 1,          // 月份 (1-12)
            day: 1,            // 日期 (1-30)
            hour: 8,           // 時刻 (0-23)
            minute: 0,         // 分鐘 (0-59)
            totalDays: 1,      // 總天數
            totalHours: 8      // 總小時數
        };

        // 營業狀態
        this.business = {
            isOpen: true,      // 是否營業中
            openHour: 6,       // 開門時間
            closeHour: 22,     // 關門時間
            lastDayChange: 0   // 上次換日時間戳
        };

        // 時間流速（可調整）1.0 = 正常速度，2.0 = 兩倍速
        this.timeScale = 1.0;

        // 遊戲內1分鐘 = 現實世界多少秒（默認：遊戲1分鐘 = 現實1秒）
        this.minutePerRealSecond = 1.0;

        // 累計時間（用於平滑更新）
        this.accumulatedTime = 0;

        // 時間事件監聽器
        this.listeners = {
            onNewDay: [],      // 新的一天
            onNewMonth: [],    // 新的一月
            onNewYear: [],     // 新的一年
            onOpen: [],        // 開門
            onClose: [],       // 關門
            onHourChange: [],  // 每小時
            onMinuteChange: [] // 每分鐘
        };

        // 是否暫停
        this.isPaused = false;
    }

    /**
     * 更新時間（每幀調用）
     * @param {number} deltaTime - 距離上次更新的毫秒數
     */
    update(deltaTime) {
        if (this.isPaused) return;

        // 轉換為秒
        const deltaSeconds = deltaTime / 1000;

        // 應用時間流速
        const scaledDelta = deltaSeconds * this.timeScale;

        // 累計時間
        this.accumulatedTime += scaledDelta;

        // 每累計到1秒，推進遊戲時間
        while (this.accumulatedTime >= 1.0) {
            this.advanceMinutes(this.minutePerRealSecond);
            this.accumulatedTime -= 1.0;
        }
    }

    /**
     * 推進指定分鐘數
     */
    advanceMinutes(minutes) {
        this.time.minute += minutes;

        this.trigger('onMinuteChange', this.time);

        // 處理時間進位
        while (this.time.minute >= 60) {
            this.advanceHour();
            this.time.minute -= 60;
        }
    }

    /**
     * 推進一小時
     */
    advanceHour() {
        this.time.hour++;
        this.time.totalHours++;

        this.trigger('onHourChange', {
            hour: this.time.hour,
            totalHours: this.time.totalHours
        });

        // 檢查營業狀態
        this.checkBusinessHours();

        // 更新任務進度
        if (this.gameState.missionManager) {
            this.gameState.missionManager.updateMissions();
        }

        // 換日
        if (this.time.hour >= 24) {
            this.advanceDay();
        }
    }

    /**
     * 推進一天
     */
    advanceDay() {
        this.time.day++;
        this.time.hour = 0;
        this.time.totalDays++;

        // 換月
        if (this.time.day > 30) {
            this.advanceMonth();
        }

        this.trigger('onNewDay', {
            year: this.time.year,
            month: this.time.month,
            day: this.time.day,
            totalDays: this.time.totalDays
        });

        // 每日結算
        this.dailySettlement();
    }

    /**
     * 推進一月
     */
    advanceMonth() {
        this.time.month++;
        this.time.day = 1;

        // 換年
        if (this.time.month > 12) {
            this.advanceYear();
        }

        this.trigger('onNewMonth', {
            year: this.time.year,
            month: this.time.month
        });

        // 通知季節管理器
        if (this.gameState.seasonManager) {
            this.gameState.seasonManager.updateSeason(this.time.month);
        }
    }

    /**
     * 推進一年
     */
    advanceYear() {
        this.time.year++;
        this.time.month = 1;

        this.trigger('onNewYear', {
            year: this.time.year
        });
    }

    /**
     * 檢查營業時間
     */
    checkBusinessHours() {
        const wasOpen = this.business.isOpen;

        if (this.time.hour >= this.business.openHour &&
            this.time.hour < this.business.closeHour) {
            this.business.isOpen = true;

            if (!wasOpen) {
                this.trigger('onOpen', this.time);

                // 通知：客棧開門營業
                if (this.gameState.notificationManager) {
                    this.gameState.notificationManager.info(
                        '客棧開門',
                        `${this.getTimeDescription()}，客棧開始營業！`
                    );
                }
            }
        } else {
            this.business.isOpen = false;

            if (wasOpen) {
                this.trigger('onClose', this.time);

                // 通知：客棧打烊
                if (this.gameState.notificationManager) {
                    this.gameState.notificationManager.info(
                        '客棧打烊',
                        `${this.getTimeDescription()}，客棧結束營業，員工可以休息了。`
                    );
                }
            }
        }
    }

    /**
     * 每日結算
     */
    dailySettlement() {
        const results = {
            salary: null,
            affectionDecay: null,
            fatigueRecovery: null,
            dailyEvents: []
        };

        // 1. 支付薪資
        if (this.gameState.dailySalaryPayment) {
            results.salary = this.gameState.dailySalaryPayment();
        }

        // 2. 好感度衰減
        if (this.gameState.affectionManager) {
            results.affectionDecay = this.gameState.affectionManager.dailyAffectionDecay();
        }

        // 3. 員工疲勞恢復
        results.fatigueRecovery = this.recoverEmployeeFatigue();

        // 4. 主角疲勞恢復
        this.recoverPlayerFatigue();

        // 5. 觸發每日事件
        results.dailyEvents = this.triggerDailyEvents();

        // 6. 更新市場價格（如果有貿易系統）
        if (this.gameState.tradeManager) {
            results.priceUpdate = this.gameState.tradeManager.updateMarketPrices();
        }

        // 通知每日結算
        if (this.gameState.notificationManager) {
            let message = `新的一天開始了！\n`;

            if (results.salary && !results.salary.success) {
                message += `⚠️ 銀兩不足，無法支付薪資\n`;
            } else if (results.salary) {
                message += `✓ 已支付薪資 ${results.salary.amount} 銀兩\n`;
            }

            this.gameState.notificationManager.info(
                '每日結算',
                message
            );
        }

        return results;
    }

    /**
     * 員工疲勞恢復
     */
    recoverEmployeeFatigue() {
        let totalRecovered = 0;

        this.gameState.employees.forEach(employee => {
            if (employee.hired && employee.hired.unlocked && employee.status) {
                // 基於體質恢復疲勞
                const recovery = Math.floor((employee.attributes?.physique || 50) / 5);
                const oldFatigue = employee.status.fatigue;

                employee.status.fatigue = Math.max(0, employee.status.fatigue - recovery);

                totalRecovered += (oldFatigue - employee.status.fatigue);

                // 更新工作效率
                if (employee.work) {
                    employee.work.efficiency = Math.max(0.3, 1 - employee.status.fatigue / 100);
                }
            }
        });

        return { totalRecovered };
    }

    /**
     * 主角疲勞恢復
     */
    recoverPlayerFatigue() {
        if (!this.gameState.player || !this.gameState.player.status) return;

        const recovery = Math.floor(this.gameState.player.attributes.physique / 5);
        this.gameState.player.status.fatigue = Math.max(0, this.gameState.player.status.fatigue - recovery);

        return { recovery };
    }

    /**
     * 觸發每日事件
     */
    triggerDailyEvents() {
        const events = [];

        // 隨機觸發事件（30%概率）
        if (Math.random() < 0.3 && this.gameState.eventManager) {
            const result = this.gameState.eventManager.tryTriggerRandomEvent();
            if (result.success) {
                events.push(result.event);
            }
        }

        return events;
    }

    /**
     * 設置時間流速
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(10, scale));
        return { timeScale: this.timeScale };
    }

    /**
     * 設置遊戲內時間速度（遊戲1分鐘 = 現實多少秒）
     */
    setMinutePerRealSecond(value) {
        this.minutePerRealSecond = Math.max(0.1, Math.min(60, value));
        return { minutePerRealSecond: this.minutePerRealSecond };
    }

    /**
     * 暫停/恢復時間
     */
    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return { isPaused: this.isPaused };
    }

    /**
     * 手動推進時間（用於測試和快進）
     */
    skipTime(hours) {
        for (let i = 0; i < hours; i++) {
            this.advanceHour();
        }
    }

    skipDays(days) {
        for (let i = 0; i < days; i++) {
            this.advanceDay();
        }
    }

    /**
     * 獲取當前時間描述
     */
    getTimeDescription() {
        const period = this.getTimePeriod();
        return `${this.time.year}年 ${this.time.month}月 ${this.time.day}日 ${period}`;
    }

    /**
     * 獲取完整時間描述
     */
    getFullTimeDescription() {
        const period = this.getTimePeriod();
        const season = this.gameState.seasonManager ?
            this.gameState.seasonManager.getCurrentSeasonName() : '';

        return `${season} ${this.time.year}年 ${this.time.month}月 ${this.time.day}日 ${period} ${this.time.hour}:${this.time.minute.toString().padStart(2, '0')}`;
    }

    /**
     * 獲取時段
     */
    getTimePeriod() {
        if (this.time.hour < 6) return '凌晨';
        if (this.time.hour < 9) return '清晨';
        if (this.time.hour < 12) return '上午';
        if (this.time.hour < 14) return '中午';
        if (this.time.hour < 18) return '下午';
        if (this.time.hour < 22) return '晚上';
        return '深夜';
    }

    /**
     * 是否是夜晚（休息時間）
     */
    isNightTime() {
        return !this.business.isOpen;
    }

    /**
     * 是否是白天（營業時間）
     */
    isDayTime() {
        return this.business.isOpen;
    }

    /**
     * 添加事件監聽器
     */
    on(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].push(callback);
        }
    }

    /**
     * 移除事件監聽器
     */
    off(eventName, callback) {
        if (this.listeners[eventName]) {
            const index = this.listeners[eventName].indexOf(callback);
            if (index > -1) {
                this.listeners[eventName].splice(index, 1);
            }
        }
    }

    /**
     * 觸發事件
     */
    trigger(eventName, data) {
        if (this.listeners[eventName]) {
            for (const callback of this.listeners[eventName]) {
                callback(data);
            }
        }
    }

    /**
     * 獲取時間信息
     */
    getTimeInfo() {
        return {
            time: { ...this.time },
            business: { ...this.business },
            timeScale: this.timeScale,
            isPaused: this.isPaused,
            period: this.getTimePeriod(),
            isNightTime: this.isNightTime(),
            description: this.getTimeDescription()
        };
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            time: { ...this.time },
            business: { ...this.business },
            timeScale: this.timeScale,
            minutePerRealSecond: this.minutePerRealSecond
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.time) {
            this.time = { ...this.time, ...data.time };
        }

        if (data.business) {
            this.business = { ...this.business, ...data.business };
        }

        if (data.timeScale !== undefined) {
            this.timeScale = data.timeScale;
        }

        if (data.minutePerRealSecond !== undefined) {
            this.minutePerRealSecond = data.minutePerRealSecond;
        }

        // 檢查營業狀態
        this.checkBusinessHours();
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeManager;
}
