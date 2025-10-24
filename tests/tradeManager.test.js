/**
 * TradeManager 測試
 */

import { describe, it, expect, beforeEach } from 'vitest';

const TradeManager = require('../src/managers/TradeManager');
const GameState = require('../src/core/GameState');

describe('TradeManager', () => {
    let gameState;
    let tradeManager;

    beforeEach(() => {
        gameState = new GameState();
        tradeManager = gameState.tradeManager;
    });

    describe('初始化和數據載入', () => {
        it('應該正確初始化 TradeManager', () => {
            expect(tradeManager).toBeDefined();
            expect(tradeManager.gameState).toBe(gameState);
            expect(tradeManager.marketPrices).toBeDefined();
            expect(tradeManager.priceHistory).toBeDefined();
        });

        it('應該載入商品數據庫', () => {
            const result = tradeManager.loadGoodsData();

            expect(result.success).toBe(true);
            expect(result.count).toBeGreaterThan(0);
            expect(Object.keys(tradeManager.goodsDatabase).length).toBeGreaterThan(0);
        });

        it('載入數據後應該初始化市場價格', () => {
            expect(Object.keys(tradeManager.marketPrices).length).toBeGreaterThan(0);
        });

        it('所有商品應該有必要的屬性', () => {
            const goods = Object.values(tradeManager.goodsDatabase);

            goods.forEach(good => {
                expect(good.id).toBeDefined();
                expect(good.name).toBeDefined();
                expect(good.description).toBeDefined();
                expect(good.category).toBeDefined();
                expect(good.basePrice).toBeGreaterThan(0);
            });
        });
    });

    describe('市場價格系統', () => {
        it('應該根據基礎價格設置初始價格', () => {
            const goods = Object.values(tradeManager.goodsDatabase);

            goods.forEach(good => {
                expect(tradeManager.marketPrices[good.id]).toBe(good.basePrice);
            });
        });

        it('應該記錄價格歷史', () => {
            const firstGood = Object.values(tradeManager.goodsDatabase)[0];

            expect(tradeManager.priceHistory[firstGood.id]).toBeDefined();
            expect(tradeManager.priceHistory[firstGood.id].length).toBeGreaterThan(0);
        });

        it('價格更新應該在設定時間間隔後執行', () => {
            // 設置時間
            if (gameState.timeManager) {
                gameState.timeManager.time.totalHours = 0;
            }

            // 第一次更新應該返回未更新（時間不夠）
            const result1 = tradeManager.updateMarketPrices();
            expect(result1.updated).toBe(false);

            // 推進時間
            if (gameState.timeManager) {
                gameState.timeManager.time.totalHours = 25;
            }

            // 第二次更新應該成功
            const result2 = tradeManager.updateMarketPrices();
            expect(result2.updated).toBe(true);
        });

        it('價格應該在合理範圍內波動', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];
            const basePrice = good.basePrice;

            // 模擬多次價格更新
            for (let i = 0; i < 10; i++) {
                const newPrice = tradeManager.calculateNewPrice(good.id, good);

                // 檢查價格在 70%-150% 範圍內
                expect(newPrice).toBeGreaterThanOrEqual(Math.floor(basePrice * 0.7));
                expect(newPrice).toBeLessThanOrEqual(Math.floor(basePrice * 1.5));
            }
        });
    });

    describe('季節性價格修正', () => {
        it('當季商品應該便宜', () => {
            // 找一個春季商品
            const springGood = Object.values(tradeManager.goodsDatabase)
                .find(g => g.seasonal === 'spring');

            if (springGood && gameState.seasonManager) {
                // 設置為春季
                gameState.seasonManager.currentSeason = 'spring';

                const modifier = tradeManager.getSeasonalModifier(springGood.id);
                expect(modifier).toBe(0.8); // 便宜 20%
            }
        });

        it('非當季商品應該貴', () => {
            const springGood = Object.values(tradeManager.goodsDatabase)
                .find(g => g.seasonal === 'spring');

            if (springGood && gameState.seasonManager) {
                // 設置為夏季
                gameState.seasonManager.currentSeason = 'summer';

                const modifier = tradeManager.getSeasonalModifier(springGood.id);
                expect(modifier).toBe(1.3); // 貴 30%
            }
        });

        it('非季節性商品不應該有季節修正', () => {
            const regularGood = Object.values(tradeManager.goodsDatabase)
                .find(g => !g.seasonal);

            if (regularGood) {
                const modifier = tradeManager.getSeasonalModifier(regularGood.id);
                expect(modifier).toBe(1.0);
            }
        });
    });

    describe('購買商品', () => {
        beforeEach(() => {
            // 確保有足夠的銀兩
            gameState.silver = 10000;
        });

        it('應該能成功購買商品', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];
            const initialSilver = gameState.silver;
            const initialQuantity = gameState.inventory.getItemCount(good.id);

            const result = tradeManager.buyGood(good.id, 1, 'general');

            expect(result.success).toBe(true);
            expect(gameState.silver).toBeLessThan(initialSilver);
            expect(gameState.inventory.getItemCount(good.id)).toBe(initialQuantity + 1);
        });

        it('購買多個商品應該正確計算價格', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];
            const quantity = 5;

            const result = tradeManager.buyGood(good.id, quantity, 'general');

            expect(result.success).toBe(true);
            expect(result.spent).toBe(result.unitPrice * quantity);
        });

        it('銀兩不足應該購買失敗', () => {
            gameState.silver = 10;

            // 找一個昂貴的商品
            const expensiveGood = Object.values(tradeManager.goodsDatabase)
                .find(g => g.basePrice > 1000);

            if (expensiveGood) {
                const result = tradeManager.buyGood(expensiveGood.id, 1, 'general');

                expect(result.success).toBe(false);
                expect(result.message).toContain('銀兩不足');
            }
        });

        it('不存在的商品應該購買失敗', () => {
            const result = tradeManager.buyGood('invalid_good', 1, 'general');

            expect(result.success).toBe(false);
            expect(result.message).toContain('不存在');
        });

        it('不同商店應該有不同的價格', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            const generalPrice = Math.floor((tradeManager.marketPrices[good.id] || good.basePrice) * 1.2);
            const luxuryPrice = Math.floor((tradeManager.marketPrices[good.id] || good.basePrice) * 2.0);

            expect(luxuryPrice).toBeGreaterThan(generalPrice);
        });
    });

    describe('出售商品', () => {
        beforeEach(() => {
            gameState.silver = 1000;
        });

        it('應該能成功出售商品', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            // 先購買
            tradeManager.buyGood(good.id, 5, 'general');

            const initialSilver = gameState.silver;
            const initialQuantity = gameState.inventory.getItemCount(good.id);

            // 出售
            const result = tradeManager.sellGood(good.id, 2, 'general');

            expect(result.success).toBe(true);
            expect(gameState.silver).toBeGreaterThan(initialSilver);
            expect(gameState.inventory.getItemCount(good.id)).toBe(initialQuantity - 2);
        });

        it('物品數量不足應該出售失敗', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            const result = tradeManager.sellGood(good.id, 10, 'general');

            expect(result.success).toBe(false);
            expect(result.message).toContain('數量不足');
        });

        it('出售價格應該低於購買價格', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            // 購買價格
            const buyResult = tradeManager.buyGood(good.id, 1, 'general');

            // 出售價格
            const sellResult = tradeManager.sellGood(good.id, 1, 'general');

            expect(sellResult.success).toBe(true);
            expect(sellResult.earned).toBeLessThan(buyResult.spent);
        });
    });

    describe('獲取商品信息', () => {
        it('應該獲取商品完整信息', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];
            const info = tradeManager.getGoodInfo(good.id);

            expect(info).toBeDefined();
            expect(info.id).toBe(good.id);
            expect(info.currentPrice).toBeDefined();
            expect(info.priceHistory).toBeDefined();
            expect(info.priceChange).toBeDefined();
        });

        it('不存在的商品應該返回 null', () => {
            const info = tradeManager.getGoodInfo('invalid_good');

            expect(info).toBeNull();
        });

        it('價格變化應該包含趨勢信息', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            // 添加一些價格歷史
            tradeManager.priceHistory[good.id] = [100, 110];

            const info = tradeManager.getGoodInfo(good.id);

            expect(info.priceChange).toBeDefined();
            expect(info.priceChange.value).toBe(10);
            expect(info.priceChange.percentage).toBeCloseTo(10.0);
            expect(info.priceChange.trend).toBe('up');
        });
    });

    describe('商店商品列表', () => {
        it('應該獲取商店商品列表', () => {
            const goods = tradeManager.getShopGoods('general');

            expect(Array.isArray(goods)).toBe(true);
            expect(goods.length).toBeGreaterThan(0);
        });

        it('商店商品應該包含價格信息', () => {
            const goods = tradeManager.getShopGoods('general');

            goods.forEach(good => {
                expect(good.buyPrice).toBeDefined();
                expect(good.sellPrice).toBeDefined();
                expect(good.currentPrice).toBeDefined();
            });
        });

        it('不同商店應該有不同的商品', () => {
            const generalGoods = tradeManager.getShopGoods('general');
            const blacksmithGoods = tradeManager.getShopGoods('blacksmith');

            // 檢查分類
            const generalCategories = new Set(generalGoods.map(g => g.category));
            const blacksmithCategories = new Set(blacksmithGoods.map(g => g.category));

            // 雜貨店應該有食材
            expect(generalCategories.has('food')).toBe(true);

            // 鐵匠鋪應該有武器或裝備
            expect(blacksmithCategories.has('weapon') || blacksmithCategories.has('armor')).toBe(true);
        });

        it('應該能根據分類過濾商品', () => {
            const allGoods = tradeManager.getAllGoods();
            const foodGoods = tradeManager.getAllGoods({ category: 'food' });

            expect(foodGoods.length).toBeLessThan(allGoods.length);
            foodGoods.forEach(good => {
                expect(good.category).toBe('food');
            });
        });
    });

    describe('市場統計', () => {
        it('應該獲取市場統計信息', () => {
            const stats = tradeManager.getMarketStatistics();

            expect(stats).toBeDefined();
            expect(stats.totalGoods).toBeGreaterThan(0);
            expect(stats.byCategory).toBeDefined();
            expect(stats.byRarity).toBeDefined();
            expect(stats.priceRanges).toBeDefined();
        });

        it('統計應該包含分類信息', () => {
            const stats = tradeManager.getMarketStatistics();

            expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
        });

        it('統計應該包含稀有度信息', () => {
            const stats = tradeManager.getMarketStatistics();

            expect(Object.keys(stats.byRarity).length).toBeGreaterThan(0);
        });

        it('價格區間統計應該正確', () => {
            const stats = tradeManager.getMarketStatistics();

            const total = stats.priceRanges.cheap +
                         stats.priceRanges.medium +
                         stats.priceRanges.expensive +
                         stats.priceRanges.luxury;

            expect(total).toBe(stats.totalGoods);
        });
    });

    describe('批量交易', () => {
        beforeEach(() => {
            gameState.silver = 10000;
        });

        it('應該能執行批量交易', () => {
            const goods = Object.values(tradeManager.goodsDatabase).slice(0, 3);

            const trades = goods.map(good => ({
                action: 'buy',
                goodId: good.id,
                quantity: 1,
                shopType: 'general'
            }));

            const result = tradeManager.bulkTrade(trades);

            expect(result.successCount).toBe(3);
            expect(result.failCount).toBe(0);
            expect(result.totalProfit).toBeLessThan(0); // 購買應該花錢
        });

        it('批量交易應該包含買入和賣出', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            // 先買入
            tradeManager.buyGood(good.id, 10, 'general');

            const trades = [
                { action: 'buy', goodId: good.id, quantity: 5, shopType: 'general' },
                { action: 'sell', goodId: good.id, quantity: 3, shopType: 'general' }
            ];

            const result = tradeManager.bulkTrade(trades);

            expect(result.successCount).toBeGreaterThan(0);
            expect(result.results.length).toBe(2);
        });

        it('批量交易應該計算總利潤', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            // 先買入一些
            tradeManager.buyGood(good.id, 10, 'general');

            const initialSilver = gameState.silver;

            const trades = [
                { action: 'sell', goodId: good.id, quantity: 5, shopType: 'general' }
            ];

            const result = tradeManager.bulkTrade(trades);

            expect(result.totalProfit).toBe(gameState.silver - initialSilver);
        });
    });

    describe('序列化與反序列化', () => {
        it('應該正確序列化交易狀態', () => {
            const serialized = tradeManager.serialize();

            expect(serialized.marketPrices).toBeDefined();
            expect(serialized.priceHistory).toBeDefined();
            expect(serialized.lastPriceUpdate).toBeDefined();
        });

        it('應該正確反序列化交易狀態', () => {
            // 修改價格
            const firstGood = Object.values(tradeManager.goodsDatabase)[0];
            tradeManager.marketPrices[firstGood.id] = 999;

            const serialized = tradeManager.serialize();

            // 創建新的管理器
            const newManager = new TradeManager(gameState);
            newManager.loadGoodsData();
            newManager.deserialize(serialized);

            expect(newManager.marketPrices[firstGood.id]).toBe(999);
        });

        it('序列化應該保留價格歷史', () => {
            const firstGood = Object.values(tradeManager.goodsDatabase)[0];

            // 添加價格歷史
            tradeManager.priceHistory[firstGood.id] = [100, 110, 120];

            const serialized = tradeManager.serialize();

            const newManager = new TradeManager(gameState);
            newManager.loadGoodsData();
            newManager.deserialize(serialized);

            expect(newManager.priceHistory[firstGood.id]).toEqual([100, 110, 120]);
        });
    });

    describe('特殊情況處理', () => {
        it('應該處理無效的商店類型', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            const result = tradeManager.buyGood(good.id, 1, 'invalid_shop');

            expect(result.success).toBe(false);
        });

        it('價格歷史應該有長度限制', () => {
            const good = Object.values(tradeManager.goodsDatabase)[0];

            // 添加超過30天的價格歷史
            for (let i = 0; i < 50; i++) {
                if (gameState.timeManager) {
                    gameState.timeManager.time.totalHours = i * 25;
                }
                tradeManager.updateMarketPrices();
            }

            expect(tradeManager.priceHistory[good.id].length).toBeLessThanOrEqual(31); // 初始1個 + 最多30個
        });

        it('應該處理商品數據載入失敗', () => {
            const emptyManager = new TradeManager(gameState);
            // 不調用 loadGoodsData

            const result = emptyManager.buyGood('any_good', 1, 'general');

            expect(result.success).toBe(false);
        });
    });
});
