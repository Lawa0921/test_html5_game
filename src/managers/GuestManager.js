/**
 * 客人系統管理器
 * 管理客人到訪、入住、點餐、服務、評價等完整流程
 */
class GuestManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 客人模板數據庫
        this.guestTemplates = {};

        // 當前在客棧的客人
        this.currentGuests = [];

        // 客人歷史記錄
        this.guestHistory = [];

        // 統計數據
        this.statistics = {
            totalGuests: 0,           // 總服務客人數
            totalRevenue: 0,          // 總收入
            averageSatisfaction: 0,   // 平均滿意度
            positiveReviews: 0,       // 好評數
            negativeReviews: 0        // 差評數
        };

        // 客人生成配置
        this.spawnConfig = {
            baseChancePerHour: 0.3,   // 基礎每小時到達機率
            maxGuests: 5,             // 最大同時接待客人數
            reputationMultiplier: 0.001  // 聲望影響係數
        };
    }

    /**
     * 載入客人模板數據
     */
    loadGuestTemplates() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(__dirname, '../data/guests.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            this.guestTemplates = JSON.parse(data);

            return {
                success: true,
                count: Object.keys(this.guestTemplates).length
            };
        } catch (error) {
            console.error('Failed to load guest templates:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 生成新客人
     * @param {string} templateId - 客人模板 ID（可選，隨機生成）
     * @returns {object} 客人實例
     */
    generateGuest(templateId = null) {
        // 如果沒有指定模板，根據聲望隨機選擇
        if (!templateId) {
            templateId = this.selectGuestTemplate();
        }

        const template = this.guestTemplates[templateId];
        if (!template) {
            return null;
        }

        // 創建客人實例
        const guest = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            templateId: templateId,
            name: template.name,
            type: template.type,
            wealth: template.wealth,
            personality: { ...template.personality },

            // 需求
            needs: {
                room: template.needs.room,
                meal: template.needs.meal,
                healing: template.needs.healing || false,
                entertainment: template.needs.entertainment || false
            },

            // 預算和停留時間（基於模板範圍隨機）
            budget: this.randomInRange(template.budgetRange[0], template.budgetRange[1]),
            stayDuration: this.randomInRange(template.stayDurationRange[0], template.stayDurationRange[1]),

            // 狀態
            status: 'waiting',        // waiting/staying/dining/satisfied/leaving
            satisfaction: 50,         // 滿意度 (0-100)
            timeArrived: this.gameState.timeManager?.currentTime?.dayCount || 0,
            timeLeaving: null,

            // 已消費記錄
            expenses: {
                room: 0,
                meals: 0,
                other: 0,
                total: 0
            },

            // 分配的資源
            assignedRoom: null,       // 分配的房間 ID
            assignedWaiter: null      // 分配的服務員 ID
        };

        return guest;
    }

    /**
     * 根據聲望選擇客人模板
     */
    selectGuestTemplate() {
        const reputation = this.gameState.inn?.reputation || 0;
        const templates = Object.values(this.guestTemplates);

        // 根據聲望過濾可能的客人
        const availableTemplates = templates.filter(t => {
            if (!t.reputationRequirement) return true;
            return reputation >= t.reputationRequirement;
        });

        // 加權隨機選擇
        const totalWeight = availableTemplates.reduce((sum, t) => sum + (t.weight || 1), 0);
        let random = Math.random() * totalWeight;

        for (const template of availableTemplates) {
            random -= (template.weight || 1);
            if (random <= 0) {
                return template.id;
            }
        }

        return availableTemplates[0]?.id || Object.keys(this.guestTemplates)[0];
    }

    /**
     * 客人到達
     */
    guestArrives(guestOrTemplateId) {
        // 檢查是否已滿
        const maxGuests = this.getMaxGuestCapacity();
        if (this.currentGuests.length >= maxGuests) {
            return {
                success: false,
                reason: '客棧已滿，無法接待更多客人'
            };
        }

        // 生成或使用現有客人
        const guest = typeof guestOrTemplateId === 'string'
            ? this.generateGuest(guestOrTemplateId)
            : guestOrTemplateId;

        if (!guest) {
            return {
                success: false,
                reason: '無效的客人模板'
            };
        }

        // 嘗試分配房間（如果需要）
        if (guest.needs.room) {
            const roomResult = this.assignRoom(guest);
            if (!roomResult.success) {
                return {
                    success: false,
                    reason: '沒有空閒客房',
                    guest: guest
                };
            }
        }

        // 添加到當前客人列表
        this.currentGuests.push(guest);
        guest.status = 'staying';

        // 更新統計
        this.statistics.totalGuests++;

        // 通知
        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.info(
                '客人到訪',
                `${guest.name} 來到客棧（財力：${guest.wealth}）`
            );
        }

        return {
            success: true,
            guest: guest
        };
    }

    /**
     * 分配客房
     */
    assignRoom(guest) {
        // 檢查可用房間數
        const totalRooms = this.gameState.technologyManager?.getBuildingCapacity('guest_rooms') || 3;
        const occupiedRooms = this.currentGuests.filter(g => g.assignedRoom !== null).length;

        if (occupiedRooms >= totalRooms) {
            return { success: false, reason: '沒有空閒客房' };
        }

        // 分配房間 ID
        guest.assignedRoom = occupiedRooms + 1;

        return { success: true, roomId: guest.assignedRoom };
    }

    /**
     * 客人點餐
     */
    orderMeal(guestId, mealPrice) {
        const guest = this.currentGuests.find(g => g.id === guestId);
        if (!guest) {
            return { success: false, reason: '客人不存在' };
        }

        // 檢查預算
        if (guest.expenses.total + mealPrice > guest.budget) {
            return { success: false, reason: '超出客人預算' };
        }

        // 記錄消費
        guest.expenses.meals += mealPrice;
        guest.expenses.total += mealPrice;

        // 增加滿意度（吃飯是基本需求）
        guest.satisfaction = Math.min(100, guest.satisfaction + 10);

        return { success: true, totalExpenses: guest.expenses.total };
    }

    /**
     * 提供服務
     * @param {string} guestId - 客人 ID
     * @param {string} serviceType - 服務類型 (cleaning/entertainment/healing)
     * @param {number} quality - 服務質量 (0-100)
     */
    provideService(guestId, serviceType, quality) {
        const guest = this.currentGuests.find(g => g.id === guestId);
        if (!guest) {
            return { success: false, reason: '客人不存在' };
        }

        // 根據服務質量調整滿意度
        const satisfactionChange = Math.floor((quality - 50) / 5);
        guest.satisfaction = Math.max(0, Math.min(100, guest.satisfaction + satisfactionChange));

        return {
            success: true,
            satisfaction: guest.satisfaction,
            satisfactionChange: satisfactionChange
        };
    }

    /**
     * 客人離開（結帳）
     */
    guestLeaves(guestId) {
        const guestIndex = this.currentGuests.findIndex(g => g.id === guestId);
        if (guestIndex === -1) {
            return { success: false, reason: '客人不存在' };
        }

        const guest = this.currentGuests[guestIndex];

        // 計算最終收入（基於滿意度可能有小費）
        let finalRevenue = guest.expenses.total;
        if (guest.satisfaction >= 80) {
            const tip = Math.floor(finalRevenue * 0.1);
            finalRevenue += tip;
        }

        // 計算聲望變化
        let reputationChange = 0;
        if (guest.satisfaction >= 90) {
            reputationChange = 5;
            this.statistics.positiveReviews++;
        } else if (guest.satisfaction >= 70) {
            reputationChange = 2;
        } else if (guest.satisfaction < 40) {
            reputationChange = -3;
            this.statistics.negativeReviews++;
        }

        // 應用收入和聲望
        this.gameState.addSilver(finalRevenue);
        if (this.gameState.inn) {
            this.gameState.inn.reputation = Math.max(0, this.gameState.inn.reputation + reputationChange);
        }

        // 更新統計
        this.statistics.totalRevenue += finalRevenue;
        this.updateAverageSatisfaction(guest.satisfaction);

        // 記錄歷史
        guest.status = 'left';
        guest.timeLeaving = this.gameState.timeManager?.currentTime?.dayCount || 0;
        guest.finalRevenue = finalRevenue;
        guest.reputationChange = reputationChange;
        this.guestHistory.push({ ...guest });

        // 移除當前客人
        this.currentGuests.splice(guestIndex, 1);

        // 通知
        if (this.gameState.notificationManager) {
            const message = `${guest.name} 離開了客棧\n收入：${finalRevenue} 兩\n滿意度：${guest.satisfaction}/100`;
            if (guest.satisfaction >= 80) {
                this.gameState.notificationManager.success('客人滿意', message);
            } else if (guest.satisfaction < 40) {
                this.gameState.notificationManager.error('客人不滿', message);
            } else {
                this.gameState.notificationManager.info('客人離開', message);
            }
        }

        return {
            success: true,
            revenue: finalRevenue,
            reputationChange: reputationChange,
            satisfaction: guest.satisfaction
        };
    }

    /**
     * 自動處理客人（簡化版）
     * 用於掛機時自動服務客人
     */
    autoServeGuest(guest) {
        // 自動分配房間
        if (guest.needs.room && !guest.assignedRoom) {
            this.assignRoom(guest);
        }

        // 自動點餐（使用配方系統）
        if (guest.needs.meal) {
            let mealPrice;

            // 嘗試使用配方管理器推薦菜品
            if (this.gameState.recipeManager) {
                const recommendedDishes = this.gameState.recipeManager.getRecommendedDishes(guest.wealth, 1);

                if (recommendedDishes.length > 0) {
                    const dish = recommendedDishes[0];
                    mealPrice = dish.menuPrice;
                } else {
                    // 沒有推薦菜品，使用隨機價格
                    mealPrice = this.randomInRange(10, 50);
                }
            } else {
                // 配方管理器不存在，使用隨機價格（向後兼容）
                mealPrice = this.randomInRange(10, 50);
            }

            this.orderMeal(guest.id, mealPrice);
        }

        // 自動提供服務（基於員工屬性計算質量）
        const serviceQuality = this.calculateServiceQuality();
        this.provideService(guest.id, 'cleaning', serviceQuality);

        // 停留一段時間後自動離開
        const currentDay = this.gameState.timeManager?.currentTime?.dayCount || 0;
        if (currentDay - guest.timeArrived >= guest.stayDuration) {
            return this.guestLeaves(guest.id);
        }

        return { success: true, status: 'staying' };
    }

    /**
     * 計算服務質量（基於員工屬性）
     */
    calculateServiceQuality() {
        const employees = this.gameState.employees.filter(e => e.unlocked && e.status?.currentState === 'WORKING');

        if (employees.length === 0) {
            return 30; // 沒有員工，服務質量很差
        }

        // 計算平均魅力和靈巧屬性
        const avgCharisma = employees.reduce((sum, e) => sum + (e.attributes?.charisma || 50), 0) / employees.length;
        const avgDexterity = employees.reduce((sum, e) => sum + (e.attributes?.dexterity || 50), 0) / employees.length;

        // 服務質量 = (魅力 * 0.6 + 靈巧 * 0.4)
        return Math.floor(avgCharisma * 0.6 + avgDexterity * 0.4);
    }

    /**
     * 獲取最大客人容量
     */
    getMaxGuestCapacity() {
        const rooms = this.gameState.technologyManager?.getBuildingCapacity('guest_rooms') || 3;
        return Math.min(rooms, this.spawnConfig.maxGuests);
    }

    /**
     * 更新平均滿意度
     */
    updateAverageSatisfaction(newSatisfaction) {
        const total = this.statistics.totalGuests;
        const currentAvg = this.statistics.averageSatisfaction;
        this.statistics.averageSatisfaction = ((currentAvg * (total - 1)) + newSatisfaction) / total;
    }

    /**
     * 每小時更新（由 TimeManager 觸發）
     */
    onHourPassed() {
        // 自動服務當前客人
        this.currentGuests.forEach(guest => {
            if (guest.status === 'staying') {
                this.autoServeGuest(guest);
            }
        });

        // 隨機生成新客人
        this.trySpawnGuest();
    }

    /**
     * 嘗試生成新客人
     */
    trySpawnGuest() {
        if (this.currentGuests.length >= this.getMaxGuestCapacity()) {
            return; // 已滿
        }

        // 計算生成機率（基礎機率 + 聲望加成）
        const reputation = this.gameState.inn?.reputation || 0;
        const spawnChance = this.spawnConfig.baseChancePerHour + (reputation * this.spawnConfig.reputationMultiplier);

        if (Math.random() < spawnChance) {
            this.guestArrives(null);
        }
    }

    /**
     * 獲取統計數據
     */
    getStatistics() {
        return {
            ...this.statistics,
            currentGuests: this.currentGuests.length,
            maxCapacity: this.getMaxGuestCapacity(),
            occupancyRate: (this.currentGuests.length / this.getMaxGuestCapacity() * 100).toFixed(1) + '%'
        };
    }

    /**
     * 獲取當前客人列表
     */
    getCurrentGuests() {
        return this.currentGuests.map(g => ({
            id: g.id,
            name: g.name,
            type: g.type,
            wealth: g.wealth,
            satisfaction: g.satisfaction,
            status: g.status,
            assignedRoom: g.assignedRoom,
            expenses: g.expenses.total,
            budget: g.budget
        }));
    }

    /**
     * 工具方法：隨機數範圍
     */
    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            currentGuests: this.currentGuests,
            guestHistory: this.guestHistory.slice(-100), // 只保留最近 100 個歷史記錄
            statistics: { ...this.statistics }
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.currentGuests) {
            this.currentGuests = data.currentGuests;
        }

        if (data.guestHistory) {
            this.guestHistory = data.guestHistory;
        }

        if (data.statistics) {
            this.statistics = {
                ...this.statistics,
                ...data.statistics
            };
        }
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuestManager;
}
