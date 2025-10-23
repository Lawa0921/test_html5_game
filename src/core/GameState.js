/**
 * 客棧經營遊戲 - 遊戲狀態管理
 * 中式客棧掛機養成系統
 */
class GameState {
    constructor() {
        // 基礎數據
        this.silver = 500;  // 初始銀兩
        this.totalSilver = 500;  // 累計銀兩
        this.playTime = 0;  // 遊戲時間（秒）
        this.lastSaveTime = Date.now();
        this.lastUpdateTime = Date.now();

        // 客棧系統
        this.inn = {
            name: '悅來客棧',
            level: 1,
            reputation: 0,  // 名聲

            // 設施等級
            lobby: 1,      // 大堂等級
            rooms: 1,      // 客房數量
            kitchen: 1,    // 廚房等級
            decoration: 1  // 裝潢等級
        };

        // 員工系統 - 10個員工類型
        this.employees = this.initializeEmployees();

        // 掛機收益配置
        this.idleIncome = {
            basePerSecond: 10,  // 基礎每秒收入
            lastCalculated: Date.now()
        };

        // 事件系統
        this.eventHistory = [];
        this.activeEvents = [];

        // 統計數據
        this.stats = {
            merchantsServed: 0,      // 商隊服務次數
            robbersDefeated: 0,      // 擊退山賊次數
            knightsRecruited: 0,     // 招募俠客次數
            festivalsHeld: 0,        // 舉辦宴會次數
            inspectionsPassed: 0     // 通過巡查次數
        };

        // 遊戲設定
        this.settings = {
            volume: 1.0,
            musicEnabled: true,
            sfxEnabled: true,
            language: 'zh-TW'
        };
    }

    /**
     * 初始化10個員工
     */
    initializeEmployees() {
        const employeeTemplates = [
            {
                id: 0,
                name: '掌櫃',
                type: 'manager',
                unlocked: true,
                unlockCost: 0,
                description: '客棧的管理者，提升總體收入',
                incomeBonus: 0.1  // 每級增加10%收入
            },
            {
                id: 1,
                name: '廚師',
                type: 'chef',
                unlocked: false,
                unlockCost: 1000,
                description: '烹飪美食，提升餐飲收入',
                incomeBonus: 0.15
            },
            {
                id: 2,
                name: '服務員',
                type: 'waiter',
                unlocked: false,
                unlockCost: 800,
                description: '提升接待效率，增加客人滿意度',
                incomeBonus: 0.12
            },
            {
                id: 3,
                name: '保鏢',
                type: 'guard',
                unlocked: false,
                unlockCost: 1500,
                description: '保護客棧安全，防止被打劫',
                incomeBonus: 0.05
            },
            {
                id: 4,
                name: '跑堂',
                type: 'runner',
                unlocked: false,
                unlockCost: 600,
                description: '加快服務速度',
                incomeBonus: 0.08
            },
            {
                id: 5,
                name: '藥師',
                type: 'herbalist',
                unlocked: false,
                unlockCost: 2000,
                description: '製作藥材販售，增加額外收入',
                incomeBonus: 0.18
            },
            {
                id: 6,
                name: '說書人',
                type: 'storyteller',
                unlocked: false,
                unlockCost: 1200,
                description: '吸引客人，提升客棧人氣',
                incomeBonus: 0.14
            },
            {
                id: 7,
                name: '樂師',
                type: 'musician',
                unlocked: false,
                unlockCost: 1800,
                description: '演奏音樂，提升客棧名氣',
                incomeBonus: 0.16
            },
            {
                id: 8,
                name: '賬房',
                type: 'accountant',
                unlocked: false,
                unlockCost: 2500,
                description: '降低成本，提高利潤',
                incomeBonus: 0.20
            },
            {
                id: 9,
                name: '門童',
                type: 'doorman',
                unlocked: false,
                unlockCost: 900,
                description: '吸引VIP客人',
                incomeBonus: 0.11
            }
        ];

        return employeeTemplates.map(template => ({
            ...template,
            level: template.unlocked ? 1 : 0,
            exp: 0,
            maxExp: 100,

            // 升級成本（隨等級增加）
            upgradeCost: template.unlocked ? 100 : 0,

            // 狀態
            status: 'working',  // working, resting

            // 位置（桌面座標）
            x: 100 + (template.id % 5) * 50,
            y: 150 + Math.floor(template.id / 5) * 50
        }));
    }

    /**
     * 計算每秒收益
     */
    calculateIncomePerSecond() {
        let income = this.idleIncome.basePerSecond;

        // 員工加成
        let employeeBonus = 0;
        this.employees.forEach(employee => {
            if (employee.unlocked && employee.level > 0) {
                employeeBonus += employee.level * employee.incomeBonus;
            }
        });

        // 客棧設施加成
        const innBonus =
            (this.inn.lobby - 1) * 0.1 +
            (this.inn.rooms - 1) * 0.05 +
            (this.inn.kitchen - 1) * 0.08 +
            (this.inn.decoration - 1) * 0.06;

        // 名聲加成
        const reputationBonus = this.inn.reputation * 0.01;

        // 總收益 = 基礎 × (1 + 員工加成 + 設施加成 + 名聲加成)
        income = income * (1 + employeeBonus + innBonus + reputationBonus);

        return Math.floor(income);
    }

    /**
     * 更新掛機收益
     */
    updateIdleIncome() {
        const now = Date.now();
        const deltaTime = (now - this.idleIncome.lastCalculated) / 1000;  // 秒

        if (deltaTime > 0) {
            const income = this.calculateIncomePerSecond() * deltaTime;
            this.addSilver(Math.floor(income));
            this.idleIncome.lastCalculated = now;
        }
    }

    /**
     * 增加銀兩
     */
    addSilver(amount) {
        this.silver += amount;
        this.totalSilver += amount;
        return { success: true, silver: this.silver, earned: amount };
    }

    /**
     * 消耗銀兩
     */
    spendSilver(amount) {
        if (this.silver >= amount) {
            this.silver -= amount;
            return { success: true, silver: this.silver };
        }
        return { success: false, message: '銀兩不足', silver: this.silver };
    }

    /**
     * 解鎖員工
     */
    unlockEmployee(employeeId) {
        const employee = this.employees[employeeId];

        if (employee.unlocked) {
            return { success: false, message: '員工已解鎖' };
        }

        const result = this.spendSilver(employee.unlockCost);
        if (result.success) {
            employee.unlocked = true;
            employee.level = 1;
            employee.upgradeCost = 100;
            return {
                success: true,
                message: `成功招募 ${employee.name}`,
                employee: employee
            };
        }

        return { success: false, message: '銀兩不足' };
    }

    /**
     * 升級員工
     */
    upgradeEmployee(employeeId) {
        const employee = this.employees[employeeId];

        if (!employee.unlocked) {
            return { success: false, message: '員工尚未解鎖' };
        }

        if (employee.level >= 200) {
            return { success: false, message: '已達最高等級' };
        }

        const result = this.spendSilver(employee.upgradeCost);
        if (result.success) {
            employee.level++;
            employee.upgradeCost = Math.floor(employee.upgradeCost * 1.15);

            return {
                success: true,
                message: `${employee.name} 升級到 Lv.${employee.level}`,
                employee: employee
            };
        }

        return { success: false, message: '銀兩不足' };
    }

    /**
     * 升級客棧設施
     */
    upgradeInn(facility) {
        const costs = {
            lobby: Math.floor(1000 * Math.pow(1.5, this.inn.lobby - 1)),
            rooms: Math.floor(800 * Math.pow(1.5, this.inn.rooms - 1)),
            kitchen: Math.floor(1200 * Math.pow(1.5, this.inn.kitchen - 1)),
            decoration: Math.floor(1500 * Math.pow(1.5, this.inn.decoration - 1))
        };

        const cost = costs[facility];
        if (!cost) {
            return { success: false, message: '無效的設施' };
        }

        const result = this.spendSilver(cost);
        if (result.success) {
            this.inn[facility]++;

            const names = {
                lobby: '大堂',
                rooms: '客房',
                kitchen: '廚房',
                decoration: '裝潢'
            };

            return {
                success: true,
                message: `${names[facility]} 升級到 Lv.${this.inn[facility]}`,
                level: this.inn[facility]
            };
        }

        return { success: false, message: '銀兩不足' };
    }

    /**
     * 增加名聲
     */
    addReputation(amount) {
        this.inn.reputation += amount;
        return { success: true, reputation: this.inn.reputation };
    }

    /**
     * 記錄事件
     */
    addEvent(event) {
        this.eventHistory.push({
            ...event,
            timestamp: Date.now()
        });

        // 只保留最近100個事件
        if (this.eventHistory.length > 100) {
            this.eventHistory.shift();
        }
    }

    /**
     * 存檔
     */
    save() {
        try {
            const saveData = {
                version: '2.0.0',
                saveTime: Date.now(),
                silver: this.silver,
                totalSilver: this.totalSilver,
                playTime: this.playTime,
                inn: this.inn,
                employees: this.employees,
                idleIncome: this.idleIncome,
                eventHistory: this.eventHistory.slice(-50),  // 只保存最近50個事件
                stats: this.stats,
                settings: this.settings
            };

            localStorage.setItem('innKeeperSave', JSON.stringify(saveData));
            this.lastSaveTime = Date.now();

            return { success: true, message: '存檔成功' };
        } catch (error) {
            console.error('存檔失敗:', error);
            return { success: false, message: '存檔失敗' };
        }
    }

    /**
     * 讀檔
     */
    load() {
        try {
            const saveDataStr = localStorage.getItem('innKeeperSave');
            if (!saveDataStr) {
                return { success: false, message: '沒有存檔', isNew: true };
            }

            const saveData = JSON.parse(saveDataStr);

            // 計算離線收益
            const offlineTime = (Date.now() - saveData.saveTime) / 1000;  // 秒
            const offlineIncome = this.calculateOfflineIncome(saveData, offlineTime);

            // 恢復數據
            this.silver = saveData.silver;
            this.totalSilver = saveData.totalSilver;
            this.playTime = saveData.playTime || 0;
            this.inn = saveData.inn;
            this.employees = saveData.employees;
            this.idleIncome = saveData.idleIncome;
            this.eventHistory = saveData.eventHistory || [];
            this.stats = saveData.stats;
            this.settings = saveData.settings || this.settings;

            // 加上離線收益
            if (offlineIncome > 0) {
                this.addSilver(offlineIncome);
            }

            this.lastSaveTime = Date.now();
            this.idleIncome.lastCalculated = Date.now();

            return {
                success: true,
                message: '讀取存檔成功',
                offline: offlineTime > 60,
                offlineTime: offlineTime,
                offlineIncome: offlineIncome
            };
        } catch (error) {
            console.error('讀檔失敗:', error);
            return { success: false, message: '讀檔失敗', isNew: true };
        }
    }

    /**
     * 計算離線收益
     */
    calculateOfflineIncome(saveData, offlineTime) {
        // 離線收益 = 在線收益 × 50%（防止離線收益過高）
        let income = saveData.idleIncome?.basePerSecond || 10;

        // 計算員工加成
        let employeeBonus = 0;
        if (saveData.employees) {
            saveData.employees.forEach(employee => {
                if (employee.unlocked && employee.level > 0) {
                    employeeBonus += employee.level * employee.incomeBonus;
                }
            });
        }

        // 計算設施加成
        const inn = saveData.inn || { lobby: 1, rooms: 1, kitchen: 1, decoration: 1, reputation: 0 };
        const innBonus =
            (inn.lobby - 1) * 0.1 +
            (inn.rooms - 1) * 0.05 +
            (inn.kitchen - 1) * 0.08 +
            (inn.decoration - 1) * 0.06;

        const reputationBonus = inn.reputation * 0.01;

        income = income * (1 + employeeBonus + innBonus + reputationBonus);

        // 離線收益打5折，最多計算24小時
        const maxOfflineTime = 24 * 3600;  // 24小時
        const effectiveTime = Math.min(offlineTime, maxOfflineTime);

        return Math.floor(income * effectiveTime * 0.5);
    }

    /**
     * 重置遊戲
     */
    reset() {
        localStorage.removeItem('innKeeperSave');

        // 重新初始化
        this.silver = 500;
        this.totalSilver = 500;
        this.playTime = 0;
        this.inn = {
            name: '悅來客棧',
            level: 1,
            reputation: 0,
            lobby: 1,
            rooms: 1,
            kitchen: 1,
            decoration: 1
        };
        this.employees = this.initializeEmployees();
        this.eventHistory = [];
        this.stats = {
            merchantsServed: 0,
            robbersDefeated: 0,
            knightsRecruited: 0,
            festivalsHeld: 0,
            inspectionsPassed: 0
        };

        return { success: true, message: '遊戲已重置' };
    }

    /**
     * 獲取遊戲摘要
     */
    getSummary() {
        return {
            inn: this.inn,
            silver: this.silver,
            incomePerSecond: this.calculateIncomePerSecond(),
            employees: this.employees.filter(e => e.unlocked).length,
            totalEmployees: this.employees.length,
            playTime: this.playTime,
            reputation: this.inn.reputation
        };
    }
}

module.exports = GameState;
