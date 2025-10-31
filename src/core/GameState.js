/**
 * 客棧經營遊戲 - 遊戲狀態管理
 * 2.5D 場景式經營系統
 */

// 引入核心模組
const Player = require('./Player');
const Inventory = require('./Inventory');
const EquipmentManager = require('../managers/EquipmentManager');
const StoryManager = require('../managers/StoryManager');
const EventManager = require('../managers/EventManager');
const NotificationManager = require('../managers/NotificationManager');
const AffectionManager = require('../managers/AffectionManager');
const TimeManager = require('../managers/TimeManager');
const SeasonManager = require('../managers/SeasonManager');
const MissionManager = require('../managers/MissionManager');
const TradeManager = require('../managers/TradeManager');
const GuestManager = require('../managers/GuestManager');
const RecipeManager = require('../managers/RecipeManager');
const CombatManager = require('../managers/CombatManager');
const CharacterDispatchManager = require('../managers/CharacterDispatchManager');
const InnManager = require('../managers/InnManager');
const SettingsManager = require('../managers/SettingsManager');
const EMPLOYEE_TEMPLATES = require('../data/employeeTemplates');

class GameState {
    constructor() {
        // 主角系統
        this.player = new Player("未命名"); // 遊戲開始時會讓玩家設定名字

        // 背包系統
        this.inventory = new Inventory();

        // 裝備管理器
        this.equipmentManager = new EquipmentManager(this);
        this.equipmentManager.loadEquipmentData();

        // 故事管理器
        this.storyManager = new StoryManager(this);
        this.storyManager.loadStoryData();

        // 事件管理器
        this.eventManager = new EventManager(this);
        this.eventManager.loadEventData();

        // 通知管理器
        this.notificationManager = new NotificationManager();

        // 好感度管理器
        this.affectionManager = new AffectionManager(this);
        this.affectionManager.loadAffectionEventData();

        // 時間管理器
        this.timeManager = new TimeManager(this);

        // 季節管理器
        this.seasonManager = new SeasonManager(this);

        // 派遣/任務管理器
        this.missionManager = new MissionManager(this);
        this.missionManager.loadMissionData();

        // 貿易管理器
        this.tradeManager = new TradeManager(this);
        this.tradeManager.loadGoodsData();

        // 客人管理器
        this.guestManager = new GuestManager(this);
        this.guestManager.loadGuestTemplates();

        // 配方管理器
        this.recipeManager = new RecipeManager(this);
        this.recipeManager.loadRecipes();

        // 戰鬥管理器
        this.combatManager = new CombatManager(this);

        // 角色派遣管理器
        this.characterDispatchManager = new CharacterDispatchManager(this);

        // 客棧設施管理器（新版）
        this.innManager = new InnManager(this);

        // 同步初始金錢到 innManager
        this.innManager.inn.gold = 500;

        // 設定管理器
        this.settingsManager = new SettingsManager();

        // 基礎數據
        this.silver = 500;  // 當前銀兩（與 innManager.inn.gold 同步）
        this.totalSilver = 500;  // 累計銀兩
        this.playTime = 0;  // 遊戲時間（秒）
        this.lastSaveTime = Date.now();
        this.lastUpdateTime = Date.now();

        // 客棧系統（舊版，保留向後兼容）
        // 注意：新功能請使用 innManager
        this.inn = {
            name: '悅來客棧',
            level: 1,
            reputation: 0,  // 名聲

            // 設施等級（舊版，逐步遷移到 innManager）
            lobby: 1,      // 大堂等級
            rooms: 1,      // 客房數量
            kitchen: 1,    // 廚房等級
            decoration: 1  // 裝潢等級
        };

        // 員工系統 - 10個員工
        this.employees = this.initializeEmployees();

        // 工作調度系統
        this.workSchedule = {
            management: [],    // 管理崗位（櫃台）
            lobby: [],         // 大廳服務
            kitchen: [],       // 廚房
            security: [],      // 安保
            entertainment: [], // 娛樂
            medicine: []       // 藥房
        };

        // 場景系統
        this.currentScene = 'LobbyScene';  // 當前場景
        this.sceneData = {
            exteriorLevel: 1,   // 外觀等級（影響背景圖）
            lobbyLevel: 1,      // 大廳等級
            kitchenLevel: 1,    // 廚房等級
            unlockedScenes: ['LobbyScene']  // 已解鎖場景
        };

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
            inspectionsPassed: 0,    // 通過巡查次數
            daysOperated: 0          // 經營天數
        };

        // 貿易系統（未來擴展）
        this.trade = {
            routes: [],            // 貿易路線
            goods: [],             // 商品庫存
            caravans: []           // 商隊
        };

        // 時間事件監聽器
        this.setupTimeEventListeners();
    }

    /**
     * 設置時間系統的事件監聽器
     */
    setupTimeEventListeners() {
        // 監聽每小時變化
        this.timeManager.on('onHourChange', () => {
            // 觸發客人系統更新
            if (this.guestManager) {
                this.guestManager.onHourPassed();
            }
        });

        // 監聽每日變化
        this.timeManager.on('onNewDay', () => {
            // 可以在這裡添加每日事件
        });
    }

    /**
     * 初始化10個員工（使用新的屬性系統）
     */
    initializeEmployees() {
        // 使用外部模板數據，進行深拷貝避免引用問題
        return EMPLOYEE_TEMPLATES.map(template => {
            return JSON.parse(JSON.stringify(template));
        });

        /*
         * 舊的員工模板已移至 src/data/employeeTemplates.js
         * 使用新的屬性系統，包含：
         * - attributes: 5項核心屬性（physique, strength, intelligence, charisma, dexterity）
         * - growthRate: 成長率
         * - talents: 才能
         * - skills: 技能系統
         * - hired: 雇用信息（含薪資）
         * - status: 疲勞、健康、心情
         * - equipment: 裝備系統
         * - affection: 好感度系統
         */
    }

    /* 舊代碼保留（已註釋）
    initializeEmployeesOLD() {
        const employeeTemplatesOLD = [
            {
                id: 0,
                name: '掌櫃',
                realName: '沈青山',
                type: 'manager',
                unlocked: true,
                level: 1,

                // 專長評級（S > A > B > C > D）
                skills: {
                    cooking: 'B',
                    service: 'A',
                    combat: 'A',
                    medicine: 'C',
                    entertainment: 'B',
                    management: 'S',
                    crafting: 'C'
                },

                // 工作狀態
                workStatus: {
                    currentState: 'IDLE',        // IDLE/WALKING/WORKING/RESTING/SLEEPING/EVENT
                    assignedStation: null,       // 分配的工作崗位
                    position: { x: 220, y: 130 },  // 當前位置（像素）
                    targetPosition: null,        // 移動目標
                    lastWorkTime: 0
                },

                // 工作偏好
                preferredWork: ['management', 'lobby'],

                // 基礎屬性
                description: '客棧的管理者，提升總體收入',
                incomeBonus: 0.1,
                unlockCost: 0,
                upgradeCost: 100
            },
            {
                id: 1,
                name: '廚師',
                realName: '孟四娘',
                type: 'chef',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'S',
                    service: 'C',
                    combat: 'B',
                    medicine: 'A',
                    entertainment: 'D',
                    management: 'C',
                    crafting: 'B'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 100, y: 200 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['kitchen', 'medicine'],

                description: '烹飪美食，提升餐飲收入',
                incomeBonus: 0.15,
                unlockCost: 1000,
                upgradeCost: 100
            },
            {
                id: 2,
                name: '服務員',
                realName: '溫如玉',
                type: 'waiter',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'C',
                    service: 'S',
                    combat: 'D',
                    medicine: 'D',
                    entertainment: 'A',
                    management: 'B',
                    crafting: 'D'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 300, y: 200 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['lobby', 'entertainment'],

                description: '提升接待效率，增加客人滿意度',
                incomeBonus: 0.12,
                unlockCost: 800,
                upgradeCost: 100
            },
            {
                id: 3,
                name: '保鏢',
                realName: '蕭鐵峰',
                type: 'guard',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'D',
                    service: 'D',
                    combat: 'S',
                    medicine: 'C',
                    entertainment: 'C',
                    management: 'B',
                    crafting: 'C'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 400, y: 150 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['security'],

                description: '保護客棧安全，防止被打劫',
                incomeBonus: 0.05,
                unlockCost: 1500,
                upgradeCost: 120
            },
            {
                id: 4,
                name: '跑堂',
                realName: '林小風',
                type: 'runner',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'D',
                    service: 'A',
                    combat: 'B',
                    medicine: 'D',
                    entertainment: 'C',
                    management: 'C',
                    crafting: 'D'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 250, y: 220 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['lobby', 'kitchen'],

                description: '跑腿雜務，提升整體效率',
                incomeBonus: 0.08,
                unlockCost: 600,
                upgradeCost: 80
            },
            {
                id: 5,
                name: '藥師',
                realName: '顧青崖',
                type: 'herbalist',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'B',
                    service: 'D',
                    combat: 'C',
                    medicine: 'S',
                    entertainment: 'D',
                    management: 'C',
                    crafting: 'A'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 50, y: 100 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['medicine', 'crafting'],

                description: '醫療煉藥，提升客人健康',
                incomeBonus: 0.1,
                unlockCost: 2000,
                upgradeCost: 150
            },
            {
                id: 6,
                name: '說書人',
                realName: '方無忌',
                type: 'storyteller',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'D',
                    service: 'B',
                    combat: 'C',
                    medicine: 'D',
                    entertainment: 'S',
                    management: 'A',
                    crafting: 'D'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 350, y: 180 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['entertainment', 'management'],

                description: '說書講古，吸引客人',
                incomeBonus: 0.13,
                unlockCost: 1200,
                upgradeCost: 110
            },
            {
                id: 7,
                name: '樂師',
                realName: '蘇妙音',
                type: 'musician',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'D',
                    service: 'C',
                    combat: 'B',
                    medicine: 'D',
                    entertainment: 'S',
                    management: 'C',
                    crafting: 'D'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 280, y: 160 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['entertainment'],

                description: '琴音繞梁，提升客棧雅致',
                incomeBonus: 0.12,
                unlockCost: 1300,
                upgradeCost: 115
            },
            {
                id: 8,
                name: '賬房',
                realName: '李默然',
                type: 'accountant',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'C',
                    service: 'C',
                    combat: 'D',
                    medicine: 'D',
                    entertainment: 'D',
                    management: 'S',
                    crafting: 'C'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 180, y: 120 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['management'],

                description: '精打細算，降低成本提升利潤',
                incomeBonus: 0.14,
                unlockCost: 1800,
                upgradeCost: 130
            },
            {
                id: 9,
                name: '門童',
                realName: '翠兒',
                type: 'doorman',
                unlocked: false,
                level: 1,

                skills: {
                    cooking: 'D',
                    service: 'A',
                    combat: 'C',
                    medicine: 'D',
                    entertainment: 'B',
                    management: 'C',
                    crafting: 'D'
                },

                workStatus: {
                    currentState: 'IDLE',
                    assignedStation: null,
                    position: { x: 450, y: 180 },
                    targetPosition: null,
                    lastWorkTime: 0
                },

                preferredWork: ['lobby'],

                description: '迎賓送客，提升客棧印象',
                incomeBonus: 0.09,
                unlockCost: 500,
                upgradeCost: 75
            }
        ];

        return employeeTemplatesOLD;
    }
    */ // 舊代碼結束

    /**
     * 計算每秒收入
     */
    calculateIncomePerSecond() {
        let income = this.idleIncome.basePerSecond;

        // 員工加成（只計算工作中的員工）
        let employeeBonus = 0;
        this.employees.forEach(employee => {
            if (employee.unlocked && employee.level > 0) {
                // 如果員工正在工作，加成翻倍
                const currentState = employee.status?.currentState || employee.workStatus?.currentState || 'IDLE';
                const workMultiplier = currentState === 'WORKING' ? 2.0 : 1.0;
                employeeBonus += employee.level * employee.incomeBonus * workMultiplier;
            }
        });

        // 設施加成
        const innBonus =
            (this.inn.lobby - 1) * 0.1 +
            (this.inn.rooms - 1) * 0.05 +
            (this.inn.kitchen - 1) * 0.08 +
            (this.inn.decoration - 1) * 0.06;

        // 名聲加成
        const reputationBonus = this.inn.reputation * 0.01;

        // 總收入
        income = income * (1 + employeeBonus + innBonus + reputationBonus);

        return Math.floor(income);
    }

    /**
     * 每日薪資結算
     */
    dailySalaryPayment() {
        let totalSalary = 0;

        this.employees.forEach(emp => {
            if (emp.hired && emp.hired.unlocked) {
                totalSalary += emp.hired.salary || 0;
            }
        });

        if (this.silver >= totalSalary) {
            this.silver -= totalSalary;
            return {
                success: true,
                amount: totalSalary,
                message: `支付薪資 ${totalSalary} 銀兩`
            };
        } else {
            // 銀兩不足，員工心情下降
            this.employees.forEach(emp => {
                if (emp.hired && emp.hired.unlocked && emp.status) {
                    emp.status.mood = Math.max(0, emp.status.mood - 10);
                }
            });

            return {
                success: false,
                shortage: totalSalary - this.silver,
                message: `銀兩不足，員工心情下降`
            };
        }
    }

    /**
     * 增加員工疲勞
     */
    addEmployeeFatigue(employeeId, amount) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee || !employee.status) {
            return { success: false };
        }

        employee.status.fatigue = Math.min(100, employee.status.fatigue + amount);

        // 疲勞影響工作效率
        if (employee.work) {
            employee.work.efficiency = Math.max(0.3, 1 - employee.status.fatigue / 100);
        }

        // 疲勞過高影響心情
        if (employee.status.fatigue > 80) {
            employee.status.mood = Math.max(0, employee.status.mood - 1);
        }

        return {
            success: true,
            fatigue: employee.status.fatigue,
            efficiency: employee.work?.efficiency
        };
    }

    /**
     * 員工休息恢復疲勞
     */
    restEmployee(employeeId, hours) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee || !employee.status || !employee.attributes) {
            return { success: false };
        }

        const recovery = hours * (employee.attributes.physique / 10);
        employee.status.fatigue = Math.max(0, employee.status.fatigue - recovery);

        // 充分休息改善心情
        if (employee.status.fatigue < 30) {
            employee.status.mood = Math.min(100, employee.status.mood + 2);
        }

        // 恢復工作效率
        if (employee.work) {
            employee.work.efficiency = Math.max(0.3, 1 - employee.status.fatigue / 100);
        }

        return {
            success: true,
            fatigue: employee.status.fatigue,
            mood: employee.status.mood
        };
    }

    /**
     * 計算員工總屬性（基礎 + 裝備加成）
     */
    calculateEmployeeTotalAttributes(employeeId, equipmentBonus = {}) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee || !employee.attributes) {
            return null;
        }

        const total = {};
        for (const [attr, value] of Object.entries(employee.attributes)) {
            total[attr] = value + (equipmentBonus[attr] || 0);
        }

        return total;
    }

    /**
     * 更新掛機收益
     */
    updateIdleIncome() {
        const now = Date.now();
        const deltaTime = (now - this.idleIncome.lastCalculated) / 1000;

        if (deltaTime > 0) {
            const income = this.calculateIncomePerSecond() * deltaTime;
            this.addSilver(Math.floor(income));
            this.idleIncome.lastCalculated = now;
        }
    }

    /**
     * 分配員工到工作崗位
     */
    assignWork(employeeId, stationId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) {
            return { success: false, message: '員工不存在' };
        }

        if (!employee.unlocked) {
            return { success: false, message: '員工尚未招募' };
        }

        // 工作崗位配置
        const stations = {
            management: { maxWorkers: 1, requiredSkill: 'management', name: '管理' },
            lobby: { maxWorkers: 2, requiredSkill: 'service', name: '大廳服務' },
            kitchen: { maxWorkers: 2, requiredSkill: 'cooking', name: '廚房' },
            security: { maxWorkers: 1, requiredSkill: 'combat', name: '安保' },
            entertainment: { maxWorkers: 2, requiredSkill: 'entertainment', name: '娛樂' },
            medicine: { maxWorkers: 1, requiredSkill: 'medicine', name: '藥房' }
        };

        const station = stations[stationId];
        if (!station) {
            return { success: false, message: '工作崗位不存在' };
        }

        // 檢查技能
        const skillLevel = employee.skills[station.requiredSkill];
        if (skillLevel === 'D' || !skillLevel) {
            return { success: false, message: `${employee.name}不適合此工作` };
        }

        // 檢查崗位是否已滿
        if (this.workSchedule[stationId].length >= station.maxWorkers) {
            return { success: false, message: '工作崗位已滿' };
        }

        // 確保員工有 status 和 work 屬性
        if (!employee.status) employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        if (!employee.work) employee.work = { assignedStation: null };

        // 從舊崗位移除
        const assignedStation = employee.work.assignedStation || employee.workStatus?.assignedStation;
        if (assignedStation) {
            const index = this.workSchedule[assignedStation].indexOf(employeeId);
            if (index > -1) {
                this.workSchedule[assignedStation].splice(index, 1);
            }
        }

        // 分配新工作
        employee.work.assignedStation = stationId;
        employee.status.currentState = 'WORKING';
        this.workSchedule[stationId].push(employeeId);

        return {
            success: true,
            message: `${employee.name}已分配到${station.name}`
        };
    }

    /**
     * 移除員工的工作分配
     */
    unassignWork(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) return { success: false, message: '員工不存在' };

        // 確保員工有 status 和 work 屬性
        if (!employee.status) employee.status = { currentState: 'IDLE', fatigue: 0, health: 100, mood: 70 };
        if (!employee.work) employee.work = { assignedStation: null };

        const station = employee.work.assignedStation || employee.workStatus?.assignedStation;
        if (station) {
            const index = this.workSchedule[station].indexOf(employeeId);
            if (index > -1) {
                this.workSchedule[station].splice(index, 1);
            }
        }

        employee.work.assignedStation = null;
        employee.status.currentState = 'IDLE';

        return { success: true, message: `${employee.name}已休息` };
    }

    /**
     * 添加銀兩
     * 同步更新 innManager 的金錢
     */
    addSilver(amount) {
        this.silver += amount;
        this.totalSilver += amount;

        // 同步到 innManager
        if (this.innManager) {
            this.innManager.inn.gold = this.silver;
        }

        return { success: true, amount };
    }

    /**
     * 消費銀兩
     * 同步更新 innManager 的金錢
     */
    spendSilver(amount) {
        if (this.silver < amount) {
            return { success: false, message: '銀兩不足' };
        }
        this.silver -= amount;

        // 同步到 innManager
        if (this.innManager) {
            this.innManager.inn.gold = this.silver;
        }

        return { success: true };
    }

    /**
     * 解鎖員工
     */
    unlockEmployee(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) {
            return { success: false, message: '員工不存在' };
        }

        if (employee.unlocked) {
            return { success: false, message: '員工已招募' };
        }

        const result = this.spendSilver(employee.unlockCost);
        if (!result.success) {
            return result;
        }

        employee.unlocked = true;
        employee.level = 1;

        return { success: true, message: `成功招募 ${employee.name}` };
    }

    /**
     * 升級員工
     */
    upgradeEmployee(employeeId) {
        const employee = this.employees.find(e => e.id === employeeId);
        if (!employee) {
            return { success: false, message: '員工不存在' };
        }

        if (!employee.unlocked) {
            return { success: false, message: '員工尚未招募' };
        }

        if (employee.level >= 200) {
            return { success: false, message: '已達最高等級' };
        }

        const result = this.spendSilver(employee.upgradeCost);
        if (!result.success) {
            return result;
        }

        employee.level++;
        employee.upgradeCost = Math.floor(employee.upgradeCost * 1.15);

        return { success: true, message: `${employee.name} 升級到 Lv.${employee.level}` };
    }

    /**
     * 升級客棧設施
     */
    upgradeInn(facilityKey) {
        const facilities = {
            lobby: { name: '大堂', baseCost: 1000, maxLevel: 100 },
            rooms: { name: '客房', baseCost: 800, maxLevel: 100 },
            kitchen: { name: '廚房', baseCost: 1200, maxLevel: 100 },
            decoration: { name: '裝潢', baseCost: 1500, maxLevel: 100 }
        };

        const facility = facilities[facilityKey];
        if (!facility) {
            return { success: false, message: '無效的設施' };
        }

        const currentLevel = this.inn[facilityKey];
        if (currentLevel >= facility.maxLevel) {
            return { success: false, message: `${facility.name}已達最高等級` };
        }

        const cost = Math.floor(facility.baseCost * Math.pow(1.5, currentLevel - 1));
        const result = this.spendSilver(cost);
        if (!result.success) {
            return result;
        }

        this.inn[facilityKey]++;

        // 更新場景等級
        if (facilityKey === 'lobby') {
            this.sceneData.lobbyLevel = this.inn.lobby;
        }

        return { success: true, message: `${facility.name}升級到 Lv.${this.inn[facilityKey]}` };
    }

    /**
     * 添加名聲
     */
    addReputation(amount) {
        this.inn.reputation += amount;
        return { success: true, reputation: this.inn.reputation };
    }

    /**
     * 添加事件
     */
    addEvent(event) {
        event.timestamp = Date.now();
        this.eventHistory.push(event);

        // 限制歷史記錄在100個以內，保留最新的100個
        if (this.eventHistory.length > 100) {
            this.eventHistory = this.eventHistory.slice(-100);
        }

        return { success: true };
    }

    /**
     * 計算離線收益
     */
    calculateOfflineIncome(saveData, offlineTime) {
        const incomePerSecond = this.calculateIncomePerSecond();

        // 離線收益 = 在線收益 × 50%
        // 最多計算24小時
        const maxOfflineTime = 24 * 3600;
        const effectiveTime = Math.min(offlineTime, maxOfflineTime);

        return Math.floor(incomePerSecond * effectiveTime * 0.5);
    }

    /**
     * 存檔
     */
    save() {
        try {
            const saveData = {
                version: '2.1.0',  // 版本號更新
                saveTime: Date.now(),

                // 主角數據
                player: this.player.serialize(),

                // 背包數據
                inventory: this.inventory.serialize(),

                // 基礎數據
                silver: this.silver,
                totalSilver: this.totalSilver,
                playTime: this.playTime,

                // 客棧
                inn: this.inn,

                // 員工（完整數據）
                employees: this.employees.map(e => ({
                    id: e.id,
                    // 雇用狀態
                    hired: e.hired,
                    // 屬性
                    attributes: e.attributes,
                    // 狀態
                    status: e.status,
                    // 工作
                    work: e.work,
                    // 裝備
                    equipment: e.equipment,
                    // 好感度
                    affection: e.affection,
                    // 技能
                    skills: e.skills,
                    // 位置
                    position: e.position,
                    // 舊數據（兼容）
                    level: e.level,
                    upgradeCost: e.upgradeCost
                })),

                // 工作調度
                workSchedule: this.workSchedule,

                // 場景
                sceneData: this.sceneData,

                // 統計
                stats: this.stats,

                // 設定
                settings: this.settings,

                // 故事系統
                story: this.storyManager ? this.storyManager.serialize() : null,

                // 事件系統
                events: this.eventManager ? this.eventManager.serialize() : null,

                // 好感度系統（數據主要存在 employees 中，這裡保留擴展性）
                affection: this.affectionManager ? this.affectionManager.serialize() : null,

                // 時間系統
                time: this.timeManager ? this.timeManager.serialize() : null,

                // 季節系統
                season: this.seasonManager ? this.seasonManager.serialize() : null,

                // 派遣/任務系統
                missions: this.missionManager ? this.missionManager.serialize() : null,

                // 貿易系統
                trade: this.tradeManager ? this.tradeManager.serialize() : null,

                // 客人系統
                guests: this.guestManager ? this.guestManager.serialize() : null,

                // 配方系統
                recipes: this.recipeManager ? this.recipeManager.serialize() : null,

                // 戰鬥系統
                combat: this.combatManager ? this.combatManager.serialize() : null
            };

            localStorage.setItem('innKeeperSave', JSON.stringify(saveData));
            this.lastSaveTime = Date.now();

            return { success: true, message: '遊戲已存檔' };
        } catch (e) {
            console.error('存檔失敗:', e);
            return { success: false, message: '存檔失敗' };
        }
    }

    /**
     * 讀檔
     */
    load() {
        try {
            const savedData = localStorage.getItem('innKeeperSave');

            if (!savedData) {
                return { success: false, isNew: true, message: '無存檔' };
            }

            const data = JSON.parse(savedData);

            // 計算離線時間
            const now = Date.now();
            const offlineTime = Math.floor((now - data.saveTime) / 1000);

            // 恢復主角數據
            if (data.player) {
                this.player.deserialize(data.player);
            }

            // 恢復背包數據
            if (data.inventory) {
                this.inventory.deserialize(data.inventory);
            }

            // 恢復基礎數據
            this.silver = data.silver || 500;
            this.totalSilver = data.totalSilver || 500;
            this.playTime = data.playTime || 0;
            this.inn = data.inn || this.inn;
            this.stats = data.stats || this.stats;

            // 恢復設定（使用 settingsManager）
            if (data.settings) {
                // 如果存檔中有舊格式的設定，轉換為新格式
                if (data.settings.volume !== undefined) {
                    // 舊格式：{ volume, musicEnabled, sfxEnabled, language, timeScale }
                    this.settingsManager.settings.audio.masterVolume = data.settings.volume;
                    this.settingsManager.settings.audio.musicEnabled = data.settings.musicEnabled;
                    this.settingsManager.settings.audio.sfxEnabled = data.settings.sfxEnabled;
                    this.settingsManager.settings.gameplay.language = data.settings.language;
                } else {
                    // 新格式：直接使用 settingsManager 的結構
                    Object.assign(this.settingsManager.settings, data.settings);
                }
            }

            this.workSchedule = data.workSchedule || this.workSchedule;
            this.sceneData = data.sceneData || this.sceneData;

            // 恢復員工數據
            if (data.employees) {
                data.employees.forEach(savedEmp => {
                    const emp = this.employees.find(e => e.id === savedEmp.id);
                    if (emp) {
                        // 新版數據
                        if (savedEmp.hired) emp.hired = savedEmp.hired;
                        if (savedEmp.attributes) emp.attributes = savedEmp.attributes;
                        if (savedEmp.status) emp.status = savedEmp.status;
                        if (savedEmp.work) emp.work = savedEmp.work;
                        if (savedEmp.equipment) emp.equipment = savedEmp.equipment;
                        if (savedEmp.affection) emp.affection = savedEmp.affection;
                        if (savedEmp.skills) emp.skills = savedEmp.skills;
                        if (savedEmp.position) emp.position = savedEmp.position;

                        // 舊版數據兼容
                        if (savedEmp.unlocked !== undefined) {
                            emp.hired = emp.hired || {};
                            emp.hired.unlocked = savedEmp.unlocked;
                        }
                        if (savedEmp.level) emp.level = savedEmp.level;
                        if (savedEmp.upgradeCost) emp.upgradeCost = savedEmp.upgradeCost;
                        if (savedEmp.workStatus) {
                            emp.status = emp.status || {};
                            emp.status.currentState = savedEmp.workStatus.currentState;
                            emp.position = savedEmp.workStatus.position;
                        }
                    }
                });
            }

            // 恢復故事系統
            if (data.story && this.storyManager) {
                this.storyManager.deserialize(data.story);
            }

            // 恢復事件系統
            if (data.events && this.eventManager) {
                this.eventManager.deserialize(data.events);
            }

            // 恢復好感度系統（數據主要在 employees 中）
            if (data.affection && this.affectionManager) {
                this.affectionManager.deserialize(data.affection);
            }

            // 恢復時間系統
            if (data.time && this.timeManager) {
                this.timeManager.deserialize(data.time);
            }

            // 恢復季節系統
            if (data.season && this.seasonManager) {
                this.seasonManager.deserialize(data.season);
            }

            // 恢復派遣/任務系統
            if (data.missions && this.missionManager) {
                this.missionManager.deserialize(data.missions);
            }

            // 恢復貿易系統
            if (data.trade && this.tradeManager) {
                this.tradeManager.deserialize(data.trade);
            }

            // 恢復客人系統
            if (data.guests && this.guestManager) {
                this.guestManager.deserialize(data.guests);
            }

            // 恢復配方系統
            if (data.recipes && this.recipeManager) {
                this.recipeManager.deserialize(data.recipes);
            }

            // 恢復戰鬥系統
            if (data.combat && this.combatManager) {
                this.combatManager.deserialize(data.combat);
            }

            // 計算離線收益
            const offlineIncome = this.calculateOfflineIncome(data, offlineTime);
            if (offlineIncome > 0) {
                this.addSilver(offlineIncome);
            }

            this.lastSaveTime = now;
            this.idleIncome.lastCalculated = now;

            return {
                success: true,
                message: '讀檔成功',
                offlineTime: offlineTime,
                offlineIncome: offlineIncome
            };
        } catch (e) {
            console.error('讀檔失敗:', e);
            return { success: false, message: '讀檔失敗' };
        }
    }

    /**
     * 重置遊戲
     */
    reset() {
        localStorage.removeItem('innKeeperSave');

        // 重置為初始狀態
        const newState = new GameState();
        Object.assign(this, newState);

        return { success: true, message: '遊戲已重置' };
    }

    /**
     * 獲取設定（向後兼容）
     * 提供舊格式的 API 訪問，同時也支援新格式
     */
    get settings() {
        const newSettings = this.settingsManager.settings;

        // 創建一個代理對象，提供向後兼容的屬性訪問
        return new Proxy(newSettings, {
            get(target, prop) {
                // 向後兼容：舊格式到新格式的映射
                if (prop === 'volume') {
                    return target.audio.masterVolume;
                }
                if (prop === 'musicEnabled') {
                    return target.audio.musicEnabled;
                }
                if (prop === 'sfxEnabled') {
                    return target.audio.sfxEnabled;
                }
                if (prop === 'language') {
                    return target.gameplay.language;
                }
                if (prop === 'timeScale') {
                    // 時間縮放不在 SettingsManager 中，可能需要從其他地方獲取
                    return 1.0;
                }

                // 新格式：直接訪問
                return target[prop];
            },
            set(target, prop, value) {
                // 向後兼容：舊格式到新格式的映射
                if (prop === 'volume') {
                    target.audio.masterVolume = value;
                    return true;
                }
                if (prop === 'musicEnabled') {
                    target.audio.musicEnabled = value;
                    return true;
                }
                if (prop === 'sfxEnabled') {
                    target.audio.sfxEnabled = value;
                    return true;
                }
                if (prop === 'language') {
                    target.gameplay.language = value;
                    return true;
                }
                if (prop === 'timeScale') {
                    // 時間縮放不在 SettingsManager 中，忽略設置
                    return true;
                }

                // 新格式：直接設置
                target[prop] = value;
                return true;
            }
        });
    }

    /**
     * 更新設定
     */
    updateSettings(newSettings) {
        // 使用 settingsManager 來更新設定
        Object.assign(this.settingsManager.settings, newSettings);
        this.settingsManager.saveSettings();
        this.save();
        return { success: true };
    }

    /**
     * 獲取遊戲摘要
     */
    getSummary() {
        return {
            inn: this.inn.name,
            silver: Math.floor(this.silver),
            incomePerSecond: this.calculateIncomePerSecond(),
            employees: this.employees.filter(e => e.hired && e.hired.unlocked).length,
            totalEmployees: this.employees.length,
            reputation: this.inn.reputation,
            workingEmployees: this.employees.filter(e => e.status && e.status.currentState === 'WORKING').length
        };
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
