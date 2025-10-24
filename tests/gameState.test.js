import { describe, it, expect, beforeEach } from 'vitest';

// 在測試環境中模擬 localStorage
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

describe('客棧經營遊戲 - 遊戲狀態管理', () => {
    let gameState;

    beforeEach(() => {
        localStorage.clear();
        gameState = new GameState();
    });

    describe('初始化', () => {
        it('應該有正確的初始銀兩', () => {
            expect(gameState.silver).toBe(500);
            expect(gameState.totalSilver).toBe(500);
        });

        it('應該有10個員工（1個已解鎖）', () => {
            expect(gameState.employees.length).toBe(10);
            const unlockedEmployees = gameState.employees.filter(e => e.hired && e.hired.unlocked);
            expect(unlockedEmployees.length).toBe(1);
            expect(unlockedEmployees[0].name).toBe('掌櫃');
        });

        it('應該有玩家實例', () => {
            expect(gameState.player).toBeDefined();
            expect(gameState.player.name).toBeDefined();
            expect(gameState.player.attributes).toBeDefined();
            expect(gameState.player.personality).toBeDefined();
        });

        it('應該有背包實例', () => {
            expect(gameState.inventory).toBeDefined();
            expect(gameState.inventory.items).toBeDefined();
            expect(gameState.inventory.maxSlots).toBe(100);
        });

        it('應該有裝備管理器實例', () => {
            expect(gameState.equipmentManager).toBeDefined();
            expect(gameState.equipmentManager.equipmentDatabase).toBeDefined();
        });

        it('應該有正確的客棧初始狀態', () => {
            expect(gameState.inn.name).toBe('悅來客棧');
            expect(gameState.inn.level).toBe(1);
            expect(gameState.inn.reputation).toBe(0);
            expect(gameState.inn.lobby).toBe(1);
            expect(gameState.inn.rooms).toBe(1);
            expect(gameState.inn.kitchen).toBe(1);
            expect(gameState.inn.decoration).toBe(1);
        });

        it('應該有掛機收益配置', () => {
            expect(gameState.idleIncome.basePerSecond).toBe(10);
            expect(gameState.idleIncome.lastCalculated).toBeDefined();
        });

        it('應該有正確的統計數據', () => {
            expect(gameState.stats.merchantsServed).toBe(0);
            expect(gameState.stats.robbersDefeated).toBe(0);
            expect(gameState.stats.knightsRecruited).toBe(0);
            expect(gameState.stats.festivalsHeld).toBe(0);
            expect(gameState.stats.inspectionsPassed).toBe(0);
        });

        it('應該有預設的遊戲設定', () => {
            expect(gameState.settings.volume).toBe(1.0);
            expect(gameState.settings.musicEnabled).toBe(true);
            expect(gameState.settings.sfxEnabled).toBe(true);
            expect(gameState.settings.language).toBe('zh-TW');
        });
    });

    describe('員工系統', () => {
        it('應該能獲取掌櫃資訊', () => {
            const manager = gameState.employees[0];
            expect(manager.name).toBe('掌櫃');
            expect(manager.type).toBe('manager');
            expect(manager.hired.unlocked).toBe(true);
        });

        it('員工應該有新的屬性系統', () => {
            const manager = gameState.employees[0];
            expect(manager.attributes).toBeDefined();
            expect(manager.attributes.physique).toBeGreaterThan(0);
            expect(manager.attributes.strength).toBeGreaterThan(0);
            expect(manager.attributes.intelligence).toBeGreaterThan(0);
            expect(manager.attributes.charisma).toBeGreaterThan(0);
            expect(manager.attributes.dexterity).toBeGreaterThan(0);
        });

        it('員工應該有成長率', () => {
            const manager = gameState.employees[0];
            expect(manager.growthRate).toBeDefined();
            expect(typeof manager.growthRate.intelligence).toBe('number');
        });

        it('員工應該有天賦系統', () => {
            const manager = gameState.employees[0];
            expect(Array.isArray(manager.talents)).toBe(true);
            expect(manager.talents.length).toBeGreaterThan(0);
            expect(manager.talents[0].id).toBeDefined();
        });

        it('員工應該有技能系統', () => {
            const manager = gameState.employees[0];
            expect(Array.isArray(manager.skills)).toBe(true);
        });

        it('員工應該有雇用信息', () => {
            const manager = gameState.employees[0];
            expect(manager.hired).toBeDefined();
            expect(manager.hired.unlocked).toBe(true);
            expect(manager.hired.cost).toBe(0);
            expect(manager.hired.salary).toBeGreaterThan(0);
        });

        it('員工應該有狀態信息', () => {
            const manager = gameState.employees[0];
            expect(manager.status).toBeDefined();
            expect(manager.status.fatigue).toBe(0);
            expect(manager.status.health).toBe(100);
            expect(manager.status.mood).toBeGreaterThan(0); // 可能是 80 或其他初始值
        });

        it('員工應該有裝備欄位', () => {
            const manager = gameState.employees[0];
            expect(manager.equipment).toBeDefined();
            expect(manager.equipment.weapon).toBeNull();
            expect(manager.equipment.armor).toBeNull();
            expect(manager.equipment.accessory).toBeNull();
        });

        it('員工應該有好感度系統', () => {
            const manager = gameState.employees[0];
            expect(manager.affection).toBeDefined();
            expect(manager.affection.level).toBe(0);
            expect(manager.affection.relationship).toBe('stranger');
        });

        it('應該能解鎖員工（向後兼容）', () => {
            if (gameState.unlockEmployee) {
                gameState.silver = 10000;
                const result = gameState.unlockEmployee(1);
                // 如果方法存在，應該能正常執行
                expect(result).toBeDefined();
            }
        });

        it('未雇用的員工應該標記為未解鎖', () => {
            const chef = gameState.employees[1];
            expect(chef.hired.unlocked).toBe(false);
            expect(chef.hired.cost).toBeGreaterThan(0);
        });
    });

    describe('薪資系統', () => {
        it('應該能計算每日薪資支出', () => {
            const result = gameState.dailySalaryPayment();
            expect(result).toBeDefined();
            expect(result.success).toBeDefined();
        });

        it('銀兩足夠時應該成功支付薪資', () => {
            gameState.silver = 10000;
            const shopkeeper = gameState.employees[0];
            const salary = shopkeeper.hired.salary;

            const result = gameState.dailySalaryPayment();

            expect(result.success).toBe(true);
            expect(result.amount).toBe(salary);
            expect(gameState.silver).toBe(10000 - salary);
        });

        it('銀兩不足時應該降低員工心情', () => {
            gameState.silver = 0;
            const shopkeeper = gameState.employees[0];
            const initialMood = shopkeeper.status.mood;

            const result = gameState.dailySalaryPayment();

            expect(result.success).toBe(false);
            expect(result.shortage).toBeGreaterThan(0);
            expect(shopkeeper.status.mood).toBeLessThan(initialMood);
        });

        it('只應該計算已雇用員工的薪資', () => {
            gameState.silver = 10000;
            const shopkeeper = gameState.employees[0];

            const result = gameState.dailySalaryPayment();

            // 只有掌櫃被雇用
            expect(result.amount).toBe(shopkeeper.hired.salary);
        });
    });

    describe('疲勞系統', () => {
        it('應該能增加員工疲勞', () => {
            const shopkeeper = gameState.employees[0];
            gameState.addEmployeeFatigue(0, 30);

            expect(shopkeeper.status.fatigue).toBe(30);
        });

        it('疲勞不應超過100', () => {
            gameState.addEmployeeFatigue(0, 150);
            expect(gameState.employees[0].status.fatigue).toBe(100);
        });

        it('疲勞應該影響工作效率', () => {
            const shopkeeper = gameState.employees[0];
            shopkeeper.work = { efficiency: 1.0 };

            gameState.addEmployeeFatigue(0, 50);

            expect(shopkeeper.work.efficiency).toBeLessThan(1.0);
            expect(shopkeeper.work.efficiency).toBeGreaterThanOrEqual(0.3);
        });

        it('應該能讓員工休息恢復疲勞', () => {
            gameState.addEmployeeFatigue(0, 50);
            gameState.restEmployee(0, 5);

            expect(gameState.employees[0].status.fatigue).toBeLessThan(50);
        });

        it('休息恢復量應該與體質相關', () => {
            const emp1 = gameState.employees[0];
            const emp2 = gameState.employees[1];

            gameState.addEmployeeFatigue(0, 50);
            gameState.addEmployeeFatigue(1, 50);

            const physique1 = emp1.attributes.physique;
            const physique2 = emp2.attributes.physique;

            gameState.restEmployee(0, 10);
            gameState.restEmployee(1, 10);

            if (physique1 > physique2) {
                expect(emp1.status.fatigue).toBeLessThanOrEqual(emp2.status.fatigue);
            }
        });
    });

    describe('掛機收益系統', () => {
        it('應該能計算基礎每秒收入', () => {
            const income = gameState.calculateIncomePerSecond();
            expect(income).toBeGreaterThan(0);
        });

        it('員工等級應該增加收入', () => {
            // 確保第一個員工已解鎖
            const employee = gameState.employees[0];
            employee.unlocked = true;
            employee.level = 1;

            const baseIncome = gameState.calculateIncomePerSecond();

            // 升級員工
            gameState.silver = 10000;
            const result = gameState.upgradeEmployee(0);
            expect(result.success).toBe(true);
            expect(employee.level).toBe(2);

            const newIncome = gameState.calculateIncomePerSecond();
            expect(newIncome).toBeGreaterThan(baseIncome);
        });

        it('客棧設施應該增加收入', () => {
            const baseIncome = gameState.calculateIncomePerSecond();

            // 升級大堂
            gameState.silver = 10000;
            gameState.upgradeInn('lobby');

            const newIncome = gameState.calculateIncomePerSecond();
            expect(newIncome).toBeGreaterThan(baseIncome);
        });

        it('名聲應該增加收入', () => {
            const baseIncome = gameState.calculateIncomePerSecond();

            gameState.addReputation(100);

            const newIncome = gameState.calculateIncomePerSecond();
            expect(newIncome).toBeGreaterThan(baseIncome);
        });

        it('應該能更新掛機收益', () => {
            const initialSilver = gameState.silver;

            // 等待一段時間後更新
            gameState.idleIncome.lastCalculated = Date.now() - 5000; // 5秒前
            gameState.updateIdleIncome();

            expect(gameState.silver).toBeGreaterThan(initialSilver);
        });
    });

    describe('客棧升級系統', () => {
        it('應該能升級大堂', () => {
            gameState.silver = 10000;
            const initialLevel = gameState.inn.lobby;

            const result = gameState.upgradeInn('lobby');

            expect(result.success).toBe(true);
            expect(gameState.inn.lobby).toBe(initialLevel + 1);
        });

        it('應該能升級客房', () => {
            gameState.silver = 10000;
            const result = gameState.upgradeInn('rooms');

            expect(result.success).toBe(true);
            expect(gameState.inn.rooms).toBe(2);
        });

        it('應該能升級廚房', () => {
            gameState.silver = 10000;
            const result = gameState.upgradeInn('kitchen');

            expect(result.success).toBe(true);
            expect(gameState.inn.kitchen).toBe(2);
        });

        it('應該能升級裝潢', () => {
            gameState.silver = 10000;
            const result = gameState.upgradeInn('decoration');

            expect(result.success).toBe(true);
            expect(gameState.inn.decoration).toBe(2);
        });

        it('升級成本應該隨等級增加', () => {
            gameState.silver = 100000;

            gameState.upgradeInn('lobby'); // 第一次升級
            const silver1 = gameState.silver;

            gameState.upgradeInn('lobby'); // 第二次升級
            const silver2 = gameState.silver;

            // 第二次升級應該花費更多
            const firstCost = 100000 - silver1;
            const secondCost = silver1 - silver2;
            expect(secondCost).toBeGreaterThan(firstCost);
        });

        it('銀兩不足時無法升級', () => {
            gameState.silver = 100;
            const result = gameState.upgradeInn('lobby');

            expect(result.success).toBe(false);
        });

        it('無效的設施無法升級', () => {
            gameState.silver = 10000;
            const result = gameState.upgradeInn('invalid');

            expect(result.success).toBe(false);
        });
    });

    describe('名聲系統', () => {
        it('應該能增加名聲', () => {
            const initialReputation = gameState.inn.reputation;
            const result = gameState.addReputation(50);

            expect(result.success).toBe(true);
            expect(gameState.inn.reputation).toBe(initialReputation + 50);
        });
    });

    describe('事件系統', () => {
        it('應該能記錄事件', () => {
            const event = {
                type: 'merchant',
                title: '商隊來訪',
                silver: 500
            };

            gameState.addEvent(event);

            expect(gameState.eventHistory.length).toBe(1);
            expect(gameState.eventHistory[0].type).toBe('merchant');
        });

        it('事件歷史應該限制在100個', () => {
            // 添加101個事件
            for (let i = 0; i < 101; i++) {
                gameState.addEvent({ type: 'test', id: i });
            }

            expect(gameState.eventHistory.length).toBe(100);
            // 應該保留最新的100個，第一個應該被移除
            expect(gameState.eventHistory[0].id).toBe(1);
        });
    });

    describe('銀兩系統', () => {
        it('應該能增加銀兩', () => {
            const initialSilver = gameState.silver;
            const result = gameState.addSilver(100);

            expect(result.success).toBe(true);
            expect(gameState.silver).toBe(initialSilver + 100);
            expect(gameState.totalSilver).toBe(initialSilver + 100);
        });

        it('應該能消耗銀兩', () => {
            gameState.silver = 500;
            const result = gameState.spendSilver(200);

            expect(result.success).toBe(true);
            expect(gameState.silver).toBe(300);
        });

        it('銀兩不足時應該無法消耗', () => {
            gameState.silver = 100;
            const result = gameState.spendSilver(200);

            expect(result.success).toBe(false);
            expect(gameState.silver).toBe(100);
        });
    });

    describe('存檔系統', () => {
        it('應該能成功存檔', () => {
            const result = gameState.save();
            expect(result.success).toBe(true);
        });

        it('應該能讀取存檔並恢復狀態', () => {
            // 修改狀態
            gameState.silver = 999;
            gameState.inn.reputation = 100;
            gameState.player.name = '測試玩家';
            gameState.player.addAttribute('strength', 20);
            gameState.inventory.addItem('test_item', 5);

            gameState.save();

            // 創建新實例並讀檔
            const newGameState = new GameState();
            const result = newGameState.load();

            expect(result.success).toBe(true);
            expect(newGameState.silver).toBe(999);
            expect(newGameState.inn.reputation).toBe(100);
            expect(newGameState.player.name).toBe('測試玩家');
            expect(newGameState.player.attributes.strength).toBe(30);
            expect(newGameState.inventory.getItemCount('test_item')).toBe(5);
        });

        it('應該能保存並恢復玩家裝備', () => {
            gameState.inventory.addItem('weapon_002', 1);
            gameState.equipmentManager.equip('player', 'player', 'weapon', 'weapon_002');
            gameState.save();

            const newGameState = new GameState();
            newGameState.load();

            expect(newGameState.player.equipment.weapon).toBe('weapon_002');
        });

        it('應該能保存並恢復員工狀態', () => {
            const shopkeeper = gameState.employees[0];
            gameState.addEmployeeFatigue(0, 50);
            shopkeeper.status.mood = 30;
            gameState.save();

            const newGameState = new GameState();
            newGameState.load();

            expect(newGameState.employees[0].status.fatigue).toBe(50);
            expect(newGameState.employees[0].status.mood).toBe(30);
        });

        it('應該能保存並恢復員工裝備', () => {
            gameState.inventory.addItem('weapon_002', 1);
            gameState.equipmentManager.equip('employee', 0, 'weapon', 'weapon_002');
            gameState.save();

            const newGameState = new GameState();
            newGameState.load();

            expect(newGameState.employees[0].equipment.weapon).toBe('weapon_002');
        });

        it('沒有存檔時讀檔應該失敗', () => {
            localStorage.clear();
            const result = gameState.load();
            expect(result.success).toBe(false);
            expect(result.isNew).toBe(true);
        });

        it('應該計算離線收益', () => {
            gameState.silver = 1000;
            gameState.save();

            // 模擬離線5秒
            const saveData = JSON.parse(localStorage.getItem('innKeeperSave'));
            saveData.saveTime = Date.now() - 5000;
            localStorage.setItem('innKeeperSave', JSON.stringify(saveData));

            const newGameState = new GameState();
            const result = newGameState.load();

            expect(result.success).toBe(true);
            expect(result.offlineIncome).toBeGreaterThan(0);
            expect(newGameState.silver).toBeGreaterThan(1000);
        });

        it('離線收益應該有上限（24小時）', () => {
            gameState.save();

            // 模擬離線48小時
            const saveData = JSON.parse(localStorage.getItem('innKeeperSave'));
            saveData.saveTime = Date.now() - (48 * 3600 * 1000);
            localStorage.setItem('innKeeperSave', JSON.stringify(saveData));

            const newGameState = new GameState();
            const result = newGameState.load();

            // 應該只計算24小時的收益
            const maxOfflineTime = 24 * 3600; // 秒
            const expectedMaxIncome = newGameState.calculateIncomePerSecond() * maxOfflineTime * 0.5;

            expect(result.offlineIncome).toBeLessThanOrEqual(expectedMaxIncome);
        });

        it('應該能向後兼容舊版本存檔', () => {
            // 模擬舊版本存檔（沒有 player 和 inventory）
            const oldSaveData = {
                version: '2.0.0',
                silver: 1500,
                inn: gameState.inn,
                employees: gameState.employees.map(e => ({
                    id: e.id,
                    unlocked: e.hired.unlocked,
                    level: 1
                }))
            };

            localStorage.setItem('innKeeperSave', JSON.stringify(oldSaveData));

            const newGameState = new GameState();
            const result = newGameState.load();

            expect(result.success).toBe(true);
            expect(newGameState.silver).toBe(1500);
            expect(newGameState.player).toBeDefined(); // 應該有默認玩家
            expect(newGameState.inventory).toBeDefined(); // 應該有默認背包
        });
    });

    describe('遊戲重置', () => {
        it('應該能重置所有遊戲數據', () => {
            gameState.silver = 999;
            gameState.inn.reputation = 100;
            gameState.save();

            gameState.reset();

            expect(gameState.silver).toBe(500);
            expect(gameState.inn.reputation).toBe(0);
            expect(gameState.inn.lobby).toBe(1);
            expect(gameState.employees.filter(e => e.hired && e.hired.unlocked).length).toBe(1);
        });

        it('重置後應該清除存檔', () => {
            gameState.save();
            gameState.reset();

            const saveData = localStorage.getItem('innKeeperSave');
            expect(saveData).toBeNull();
        });
    });

    describe('遊戲摘要', () => {
        it('應該能獲取遊戲摘要', () => {
            const summary = gameState.getSummary();

            expect(summary).toHaveProperty('inn');
            expect(summary).toHaveProperty('silver');
            expect(summary).toHaveProperty('incomePerSecond');
            expect(summary).toHaveProperty('employees');
            expect(summary).toHaveProperty('totalEmployees');
            expect(summary).toHaveProperty('reputation');
        });

        it('摘要應該顯示正確的員工數量', () => {
            const summary = gameState.getSummary();

            expect(summary.employees).toBe(1); // 只有掌櫃
            expect(summary.totalEmployees).toBe(10);
        });
    });
});
