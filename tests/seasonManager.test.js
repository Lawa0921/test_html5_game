import { describe, it, expect, beforeEach } from 'vitest';

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

describe('SeasonManager', () => {
    let gameState;
    let seasonManager;

    beforeEach(() => {
        localStorage.clear();
        gameState = new GameState();
        seasonManager = gameState.seasonManager;
    });

    describe('初始化', () => {
        it('應該正確初始化季節定義', () => {
            expect(seasonManager.seasons.spring).toBeDefined();
            expect(seasonManager.seasons.summer).toBeDefined();
            expect(seasonManager.seasons.autumn).toBeDefined();
            expect(seasonManager.seasons.winter).toBeDefined();
        });

        it('應該初始化為春季', () => {
            expect(seasonManager.currentSeason).toBe('spring');
        });

        it('每個季節應該包含正確的月份', () => {
            expect(seasonManager.seasons.spring.months).toEqual([1, 2, 3]);
            expect(seasonManager.seasons.summer.months).toEqual([4, 5, 6]);
            expect(seasonManager.seasons.autumn.months).toEqual([7, 8, 9]);
            expect(seasonManager.seasons.winter.months).toEqual([10, 11, 12]);
        });
    });

    describe('季節更新', () => {
        it('updateSeason 應該根據月份更新季節', () => {
            const result = seasonManager.updateSeason(4);
            expect(result.changed).toBe(true);
            expect(seasonManager.currentSeason).toBe('summer');
        });

        it('updateSeason 在同季節內不應該改變', () => {
            seasonManager.currentSeason = 'spring';
            const result = seasonManager.updateSeason(2);
            expect(result.changed).toBe(false);
        });
    });

    describe('季節切換', () => {
        it('changeSeason 應該切換到新季節', () => {
            const result = seasonManager.changeSeason('summer');
            expect(result.changed).toBe(true);
            expect(seasonManager.currentSeason).toBe('summer');
        });

        it('changeSeason 應該返回季節資訊', () => {
            const result = seasonManager.changeSeason('autumn');
            expect(result.newSeason).toBe('autumn');
            expect(result.seasonInfo).toBeDefined();
            expect(result.seasonInfo.name).toBe('秋季');
        });
    });

    describe('季節效果', () => {
        it('getCurrentSeasonEffects 應該返回當前季節的效果', () => {
            seasonManager.currentSeason = 'spring';
            const effect = seasonManager.getCurrentSeasonEffects();
            expect(effect.incomeMultiplier).toBe(1.1);
        });

        it('applyIncomeMultiplier 應該正確應用收入倍率', () => {
            seasonManager.currentSeason = 'autumn';
            const result = seasonManager.applyIncomeMultiplier(100);
            expect(result).toBe(120);
        });

        it('applyCostMultiplier 應該正確應用成本倍率', () => {
            seasonManager.currentSeason = 'summer';
            const result = seasonManager.applyCostMultiplier(100);
            expect(result).toBe(110);
        });

        it('applyAttributeBonus 應該正確應用屬性加成', () => {
            seasonManager.currentSeason = 'spring';
            const result = seasonManager.applyAttributeBonus('charisma', 100);
            expect(result).toBe(110);
        });
    });

    describe('季節性商品', () => {
        it('getSeasonalGoods 應該返回當前季節的商品', () => {
            seasonManager.currentSeason = 'spring';
            const goods = seasonManager.getSeasonalGoods();
            expect(goods).toBeDefined();
            expect(goods.length).toBeGreaterThan(0);
        });

        it('isSeasonalGood 應該正確判斷商品是否為季節性', () => {
            seasonManager.currentSeason = 'spring';
            expect(seasonManager.isSeasonalGood('spring_tea')).toBe(true);
            expect(seasonManager.isSeasonalGood('hot_pot')).toBe(false);
        });
    });

    describe('季節性事件', () => {
        it('getSeasonalEvents 應該返回當前季節的事件列表', () => {
            seasonManager.currentSeason = 'spring';
            const events = seasonManager.getSeasonalEvents();
            expect(events).toBeDefined();
            expect(events).toContain('spring_festival');
        });

        it('isSeasonalEvent 應該正確判斷事件是否為季節性', () => {
            seasonManager.currentSeason = 'spring';
            expect(seasonManager.isSeasonalEvent('spring_festival')).toBe(true);
            expect(seasonManager.isSeasonalEvent('new_year')).toBe(false);
        });
    });

    describe('季節查詢', () => {
        it('getCurrentSeasonInfo 應該返回季節詳細資訊', () => {
            const info = seasonManager.getCurrentSeasonInfo();
            expect(info.id).toBe('spring');
            expect(info.name).toBe('春季');
            expect(info.icon).toBe('🌸');
        });

        it('getCurrentSeasonName 應該返回季節名稱', () => {
            expect(seasonManager.getCurrentSeasonName()).toBe('春季');
        });

        it('getCurrentSeasonIcon 應該返回季節圖標', () => {
            expect(seasonManager.getCurrentSeasonIcon()).toBe('🌸');
        });

        it('getSeasonSummary 應該返回季節摘要', () => {
            const summary = seasonManager.getSeasonSummary();
            expect(summary.season).toBe('春季');
            expect(summary.icon).toBe('🌸');
            expect(summary.incomeMultiplier).toBe(1.1);
        });

        it('getAllSeasons 應該返回所有季節信息', () => {
            const allSeasons = seasonManager.getAllSeasons();
            expect(allSeasons.length).toBe(4);
        });
    });

    describe('序列化', () => {
        it('serialize 應該正確序列化季節狀態', () => {
            seasonManager.currentSeason = 'autumn';
            const json = seasonManager.serialize();
            expect(json.currentSeason).toBe('autumn');
        });

        it('deserialize 應該正確反序列化季節狀態', () => {
            const savedData = { currentSeason: 'winter' };
            seasonManager.deserialize(savedData);
            expect(seasonManager.currentSeason).toBe('winter');
        });
    });
});
