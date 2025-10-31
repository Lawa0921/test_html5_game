import { describe, it, expect, beforeEach } from 'vitest';

const GuestManager = require('../src/managers/GuestManager');
const GameState = require('../src/core/GameState');

describe('GuestManager - 客人系統', () => {
    let gameState;
    let guestManager;

    beforeEach(() => {
        gameState = new GameState();
        guestManager = new GuestManager(gameState);
        guestManager.loadGuestTemplates();
    });

    describe('初始化與數據載入', () => {
        it('應該正確初始化', () => {
            expect(guestManager.gameState).toBe(gameState);
            expect(guestManager.currentGuests).toEqual([]);
            expect(guestManager.guestHistory).toEqual([]);
        });

        it('應該成功載入客人模板', () => {
            const result = guestManager.loadGuestTemplates();
            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
            expect(Object.keys(guestManager.guestTemplates).length).toBeGreaterThan(0);
        });

        it('應該有正確的統計結構', () => {
            expect(guestManager.statistics).toHaveProperty('totalGuests');
            expect(guestManager.statistics).toHaveProperty('totalRevenue');
            expect(guestManager.statistics).toHaveProperty('averageSatisfaction');
            expect(guestManager.statistics).toHaveProperty('positiveReviews');
            expect(guestManager.statistics).toHaveProperty('negativeReviews');
        });
    });

    describe('客人生成', () => {
        it('應該能生成客人', () => {
            const guest = guestManager.generateGuest('traveling_merchant');
            expect(guest).toBeDefined();
            expect(guest.id).toBeDefined();
            expect(guest.name).toBeDefined();
            expect(guest.type).toBe('merchant');
        });

        it('生成的客人應該有完整的屬性', () => {
            const guest = guestManager.generateGuest('wealthy_merchant');
            expect(guest).toHaveProperty('name');
            expect(guest).toHaveProperty('type');
            expect(guest).toHaveProperty('wealth');
            expect(guest).toHaveProperty('needs');
            expect(guest).toHaveProperty('budget');
            expect(guest).toHaveProperty('stayDuration');
            expect(guest).toHaveProperty('satisfaction');
            expect(guest).toHaveProperty('status');
        });

        it('客人預算應該在範圍內', () => {
            const guest = guestManager.generateGuest('traveling_merchant');
            const template = guestManager.guestTemplates['traveling_merchant'];
            expect(guest.budget).toBeGreaterThanOrEqual(template.budgetRange[0]);
            expect(guest.budget).toBeLessThanOrEqual(template.budgetRange[1]);
        });

        it('應該能隨機選擇客人模板', () => {
            const templateId = guestManager.selectGuestTemplate();
            expect(templateId).toBeDefined();
            expect(guestManager.guestTemplates[templateId]).toBeDefined();
        });
    });

    describe('客人到達', () => {
        it('應該能接待客人', () => {
            const result = guestManager.guestArrives('traveling_merchant');
            expect(result.success).toBe(true);
            expect(result.guest).toBeDefined();
            expect(guestManager.currentGuests.length).toBe(1);
        });

        it('客人到達後統計數據應該更新', () => {
            const initialTotal = guestManager.statistics.totalGuests;
            guestManager.guestArrives('traveling_merchant');
            expect(guestManager.statistics.totalGuests).toBe(initialTotal + 1);
        });

        it('客棧滿時應該拒絕新客人', () => {
            // 填滿客棧
            const maxGuests = guestManager.getMaxGuestCapacity();
            for (let i = 0; i < maxGuests; i++) {
                guestManager.guestArrives('traveling_merchant');
            }

            // 再次嘗試添加
            const result = guestManager.guestArrives('traveling_merchant');
            expect(result.success).toBe(false);
            expect(result.reason).toContain('客棧已滿');
        });

        it('需要房間的客人應該被分配房間', () => {
            const result = guestManager.guestArrives('traveling_merchant');
            expect(result.success).toBe(true);
            expect(result.guest.assignedRoom).toBeDefined();
            expect(result.guest.assignedRoom).toBeGreaterThan(0);
        });
    });

    describe('房間分配', () => {
        it('應該能分配房間', () => {
            const guest = guestManager.generateGuest('traveling_merchant');
            const result = guestManager.assignRoom(guest);
            expect(result.success).toBe(true);
            expect(guest.assignedRoom).toBeDefined();
        });

        it('房間已滿時應該失敗', () => {
            const totalRooms = guestManager.maxGuests;

            // 填滿所有房間
            for (let i = 0; i < totalRooms; i++) {
                guestManager.guestArrives('traveling_merchant');
            }

            // 嘗試再分配一個房間
            const guest = guestManager.generateGuest('traveling_merchant');
            guest.needs.room = true;
            const result = guestManager.assignRoom(guest);
            expect(result.success).toBe(false);
        });
    });

    describe('點餐系統', () => {
        it('應該能點餐', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];

            const result = guestManager.orderMeal(guest.id, 50);
            expect(result.success).toBe(true);
            expect(guest.expenses.meals).toBe(50);
            expect(guest.expenses.total).toBe(50);
        });

        it('點餐應該增加滿意度', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            const initialSatisfaction = guest.satisfaction;

            guestManager.orderMeal(guest.id, 30);
            expect(guest.satisfaction).toBeGreaterThan(initialSatisfaction);
        });

        it('超出預算時應該拒絕點餐', () => {
            guestManager.guestArrives('poor_peddler');
            const guest = guestManager.currentGuests[0];

            const result = guestManager.orderMeal(guest.id, 10000);
            expect(result.success).toBe(false);
            expect(result.reason).toContain('預算');
        });

        it('客人不存在時應該失敗', () => {
            const result = guestManager.orderMeal('nonexistent', 50);
            expect(result.success).toBe(false);
        });
    });

    describe('服務提供', () => {
        it('應該能提供服務', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];

            const result = guestManager.provideService(guest.id, 'cleaning', 80);
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('satisfaction');
            expect(result).toHaveProperty('satisfactionChange');
        });

        it('高質量服務應該增加滿意度', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            const initialSatisfaction = guest.satisfaction;

            guestManager.provideService(guest.id, 'cleaning', 90);
            expect(guest.satisfaction).toBeGreaterThan(initialSatisfaction);
        });

        it('低質量服務應該降低滿意度', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            const initialSatisfaction = guest.satisfaction;

            guestManager.provideService(guest.id, 'cleaning', 20);
            expect(guest.satisfaction).toBeLessThan(initialSatisfaction);
        });

        it('滿意度不應超過 100', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.satisfaction = 95;

            guestManager.provideService(guest.id, 'cleaning', 100);
            expect(guest.satisfaction).toBeLessThanOrEqual(100);
        });

        it('滿意度不應低於 0', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.satisfaction = 5;

            guestManager.provideService(guest.id, 'cleaning', 0);
            expect(guest.satisfaction).toBeGreaterThanOrEqual(0);
        });
    });

    describe('客人離開', () => {
        it('應該能讓客人離開', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.expenses.total = 100;

            const result = guestManager.guestLeaves(guest.id);
            expect(result.success).toBe(true);
            expect(result.revenue).toBeGreaterThan(0);
            expect(guestManager.currentGuests.length).toBe(0);
        });

        it('高滿意度應該獲得小費', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.expenses.total = 100;
            guest.satisfaction = 90;

            const result = guestManager.guestLeaves(guest.id);
            expect(result.revenue).toBeGreaterThan(100); // 應該有小費
        });

        it('高滿意度應該增加聲望', () => {
            const initialReputation = gameState.inn.reputation;
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.satisfaction = 95;
            guest.expenses.total = 100;

            guestManager.guestLeaves(guest.id);
            expect(gameState.inn.reputation).toBeGreaterThan(initialReputation);
        });

        it('低滿意度應該降低聲望', () => {
            gameState.inn.reputation = 100;
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.satisfaction = 20;
            guest.expenses.total = 100;

            const initialReputation = gameState.inn.reputation;
            guestManager.guestLeaves(guest.id);
            expect(gameState.inn.reputation).toBeLessThan(initialReputation);
        });

        it('應該記錄到歷史', () => {
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.expenses.total = 100;

            const initialHistoryLength = guestManager.guestHistory.length;
            guestManager.guestLeaves(guest.id);
            expect(guestManager.guestHistory.length).toBe(initialHistoryLength + 1);
        });

        it('應該更新統計數據', () => {
            const initialRevenue = guestManager.statistics.totalRevenue;
            guestManager.guestArrives('traveling_merchant');
            const guest = guestManager.currentGuests[0];
            guest.expenses.total = 100;

            guestManager.guestLeaves(guest.id);
            expect(guestManager.statistics.totalRevenue).toBeGreaterThan(initialRevenue);
        });
    });

    describe('自動服務', () => {
        it('應該能自動服務客人', () => {
            const guest = guestManager.generateGuest('traveling_merchant');
            guestManager.currentGuests.push(guest);
            guest.status = 'staying';
            guest.timeArrived = gameState.timeManager?.currentTime?.dayCount || 0;

            const result = guestManager.autoServeGuest(guest);
            expect(result.success).toBe(true);
        });

        it('客人停留時間到了應該自動離開', () => {
            const guest = guestManager.generateGuest('traveling_merchant');
            guest.stayDuration = 1;
            guest.timeArrived = (gameState.timeManager?.currentTime?.dayCount || 0) - 2;
            guestManager.currentGuests.push(guest);
            guest.status = 'staying';

            const result = guestManager.autoServeGuest(guest);
            expect(result.success).toBe(true);
            expect(guestManager.currentGuests.length).toBe(0);
        });
    });

    describe('統計與查詢', () => {
        it('應該能獲取統計數據', () => {
            const stats = guestManager.getStatistics();
            expect(stats).toHaveProperty('totalGuests');
            expect(stats).toHaveProperty('totalRevenue');
            expect(stats).toHaveProperty('currentGuests');
            expect(stats).toHaveProperty('maxCapacity');
            expect(stats).toHaveProperty('occupancyRate');
        });

        it('應該能獲取當前客人列表', () => {
            guestManager.guestArrives('traveling_merchant');
            const guests = guestManager.getCurrentGuests();
            expect(guests.length).toBe(1);
            expect(guests[0]).toHaveProperty('name');
            expect(guests[0]).toHaveProperty('satisfaction');
        });

        it('應該正確計算入住率', () => {
            guestManager.guestArrives('traveling_merchant');
            const stats = guestManager.getStatistics();
            expect(stats.occupancyRate).toBeDefined();
            expect(typeof stats.occupancyRate).toBe('string');
            expect(stats.occupancyRate).toContain('%');
        });
    });

    describe('服務質量計算', () => {
        it('沒有員工時服務質量應該很低', () => {
            // 清空員工
            gameState.employees.forEach(e => e.unlocked = false);

            const quality = guestManager.calculateServiceQuality();
            expect(quality).toBeLessThan(50);
        });

        it('有工作中的員工時服務質量應該提升', () => {
            // 啟用一個員工並設置為工作狀態
            const employee = gameState.employees[0];
            employee.unlocked = true;
            employee.attributes = {
                charisma: 70,
                dexterity: 60
            };
            employee.status = { currentState: 'WORKING' };

            const quality = guestManager.calculateServiceQuality();
            expect(quality).toBeGreaterThan(30);
        });
    });

    describe('序列化與反序列化', () => {
        it('應該能序列化數據', () => {
            guestManager.guestArrives('traveling_merchant');
            const data = guestManager.serialize();

            expect(data).toHaveProperty('currentGuests');
            expect(data).toHaveProperty('guestHistory');
            expect(data).toHaveProperty('statistics');
            expect(data.currentGuests.length).toBe(1);
        });

        it('應該能反序列化數據', () => {
            guestManager.guestArrives('traveling_merchant');
            const data = guestManager.serialize();

            const newManager = new GuestManager(gameState);
            newManager.loadGuestTemplates();
            newManager.deserialize(data);

            expect(newManager.currentGuests.length).toBe(1);
            expect(newManager.statistics.totalGuests).toBe(data.statistics.totalGuests);
        });

        it('歷史記錄應該限制在 100 條', () => {
            // 添加超過 100 條歷史
            for (let i = 0; i < 150; i++) {
                guestManager.guestHistory.push({ id: i });
            }

            const data = guestManager.serialize();
            expect(data.guestHistory.length).toBe(100);
        });
    });

    describe('邊界條件', () => {
        it('無效的模板 ID 應該返回 null', () => {
            const guest = guestManager.generateGuest('nonexistent_template');
            expect(guest).toBeNull();
        });

        it('客人不存在時服務應該失敗', () => {
            const result = guestManager.provideService('nonexistent', 'cleaning', 50);
            expect(result.success).toBe(false);
        });

        it('客人不存在時離開應該失敗', () => {
            const result = guestManager.guestLeaves('nonexistent');
            expect(result.success).toBe(false);
        });

        it('最大容量應該返回合理的數值', () => {
            const capacity = guestManager.getMaxGuestCapacity();
            expect(capacity).toBeGreaterThan(0);
            expect(capacity).toBeLessThanOrEqual(100); // 合理的上限
        });
    });
});
