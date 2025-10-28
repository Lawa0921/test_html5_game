/**
 * 貿易管理器
 * 管理商品交易、市場價格、貿易路線
 */

class TradeManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 商品數據庫
        this.goodsDatabase = {};

        // 當前市場價格（商品ID -> 當前價格）
        this.marketPrices = {};

        // 價格歷史（用於圖表顯示）
        this.priceHistory = {};

        // 商隊系統
        this.caravans = [];

        // 貿易路線
        this.tradeRoutes = [];

        // 季節性商品加成
        this.seasonalModifiers = {};

        // 市場更新計時器
        this.lastPriceUpdate = 0;
        this.priceUpdateInterval = 24; // 每遊戲日更新一次價格

        // 價格波動範圍
        this.priceFluctuation = {
            min: 0.7,  // 最低價格為基礎價格的 70%
            max: 1.5,  // 最高價格為基礎價格的 150%
            volatility: 0.15  // 每日波動幅度 ±15%
        };

        // 商店類型
        this.shopTypes = {
            general: {
                id: 'general',
                name: '雜貨店',
                icon: '🏪',
                description: '販售日常用品和食材',
                markup: 1.2,  // 買入價格是基礎價格的 1.2 倍
                buyback: 0.6   // 賣出價格是基礎價格的 0.6 倍
            },
            blacksmith: {
                id: 'blacksmith',
                name: '鐵匠鋪',
                icon: '⚒️',
                description: '販售武器和裝備',
                markup: 1.5,
                buyback: 0.7
            },
            apothecary: {
                id: 'apothecary',
                name: '藥鋪',
                icon: '⚗️',
                description: '販售藥材和丹藥',
                markup: 1.8,
                buyback: 0.8
            },
            luxury: {
                id: 'luxury',
                name: '奢侈品店',
                icon: '💎',
                description: '販售珍稀物品',
                markup: 2.0,
                buyback: 0.9
            }
        };
    }

    /**
     * 載入商品數據
     */
    loadGoodsData() {
        try {
            this.goodsDatabase = require('../data/goods.json');

            // 初始化市場價格
            for (const [goodId, good] of Object.entries(this.goodsDatabase)) {
                this.marketPrices[goodId] = good.basePrice;
                this.priceHistory[goodId] = [good.basePrice];
            }

            return { success: true, count: Object.keys(this.goodsDatabase).length };
        } catch (e) {
            console.warn('商品數據載入失敗:', e.message);
            this.goodsDatabase = {};
            return { success: false, error: e.message };
        }
    }

    /**
     * 更新市場價格（每日調用）
     */
    updateMarketPrices() {
        const now = this.gameState.timeManager ?
            this.gameState.timeManager.time.totalHours : 0;

        // 檢查是否需要更新
        if (now - this.lastPriceUpdate < this.priceUpdateInterval) {
            return { updated: false };
        }

        this.lastPriceUpdate = now;
        const updatedPrices = [];

        for (const [goodId, good] of Object.entries(this.goodsDatabase)) {
            const oldPrice = this.marketPrices[goodId];
            const newPrice = this.calculateNewPrice(goodId, good);

            this.marketPrices[goodId] = newPrice;

            // 記錄價格歷史（最多保留 30 天）
            if (!this.priceHistory[goodId]) {
                this.priceHistory[goodId] = [];
            }
            this.priceHistory[goodId].push(newPrice);
            if (this.priceHistory[goodId].length > 30) {
                this.priceHistory[goodId].shift();
            }

            if (Math.abs(newPrice - oldPrice) / oldPrice > 0.2) {
                updatedPrices.push({
                    goodId: goodId,
                    name: good.name,
                    oldPrice: oldPrice,
                    newPrice: newPrice,
                    change: ((newPrice - oldPrice) / oldPrice * 100).toFixed(1)
                });
            }
        }

        // 通知價格變動
        if (updatedPrices.length > 0 && this.gameState.notificationManager) {
            const significant = updatedPrices.filter(p => Math.abs(parseFloat(p.change)) > 30);
            if (significant.length > 0) {
                const item = significant[0];
                const trend = parseFloat(item.change) > 0 ? '上漲' : '下跌';
                this.gameState.notificationManager.info(
                    '市場動態',
                    `${item.name}價格${trend} ${Math.abs(item.change)}%！`
                );
            }
        }

        return {
            updated: true,
            priceChanges: updatedPrices.length
        };
    }

    /**
     * 計算新價格
     */
    calculateNewPrice(goodId, good) {
        let price = good.basePrice;

        // 1. 隨機波動
        const randomChange = (Math.random() - 0.5) * 2 * this.priceFluctuation.volatility;
        price *= (1 + randomChange);

        // 2. 季節影響
        const seasonalModifier = this.getSeasonalModifier(goodId);
        price *= seasonalModifier;

        // 3. 供需影響（基於玩家購買歷史）
        const demandModifier = this.getDemandModifier(goodId);
        price *= demandModifier;

        // 4. 稀有度影響
        if (good.rarity === 'rare') {
            price *= 1.2;
        } else if (good.rarity === 'epic') {
            price *= 1.5;
        } else if (good.rarity === 'legendary') {
            price *= 2.0;
        }

        // 5. 限制價格範圍
        const minPrice = Math.floor(good.basePrice * this.priceFluctuation.min);
        const maxPrice = Math.floor(good.basePrice * this.priceFluctuation.max);
        price = Math.max(minPrice, Math.min(maxPrice, price));

        return Math.floor(price);
    }

    /**
     * 獲取季節性價格修正
     */
    getSeasonalModifier(goodId) {
        if (!this.gameState.seasonManager) return 1.0;

        const currentSeason = this.gameState.seasonManager.currentSeason;
        const good = this.goodsDatabase[goodId];

        // 檢查是否為季節性商品
        if (good.seasonal) {
            if (good.seasonal === currentSeason) {
                return 0.8;  // 當季商品便宜 20%
            } else {
                return 1.3;  // 非當季商品貴 30%
            }
        }

        // 檢查季節性修正器（由 SeasonManager 設置）
        if (this.seasonalModifiers[goodId]) {
            return this.seasonalModifiers[goodId];
        }

        return 1.0;
    }

    /**
     * 獲取需求修正（基於購買歷史）
     */
    getDemandModifier(goodId) {
        // 簡單的需求模型：如果最近購買多，價格上漲
        // 這裡暫時返回固定值，之後可以擴展
        return 1.0;
    }

    /**
     * 設置季節性商品（由 SeasonManager 調用）
     */
    setSeasonalGoods(goods) {
        // 清除舊的季節性修正
        this.seasonalModifiers = {};

        // 設置新的季節性修正
        for (const good of goods) {
            this.seasonalModifiers[good.id] = good.priceMultiplier || 1.0;
        }
    }

    /**
     * 購買商品
     */
    buyGood(goodId, quantity = 1, shopType = 'general') {
        const good = this.goodsDatabase[goodId];

        if (!good) {
            return { success: false, message: '商品不存在' };
        }

        const shop = this.shopTypes[shopType];
        if (!shop) {
            return { success: false, message: '商店類型無效' };
        }

        // 計算購買價格（市場價格 × 商店加成）
        const basePrice = this.marketPrices[goodId] || good.basePrice;
        const unitPrice = Math.floor(basePrice * shop.markup);
        const totalPrice = unitPrice * quantity;

        // 檢查銀兩
        if (this.gameState.silver < totalPrice) {
            return {
                success: false,
                message: '銀兩不足',
                required: totalPrice,
                current: this.gameState.silver
            };
        }

        // 扣除銀兩
        this.gameState.spendSilver(totalPrice);

        // 添加到背包
        this.gameState.inventory.addItem(goodId, quantity);

        // 記錄交易
        this.recordTransaction('buy', goodId, quantity, unitPrice, shopType);

        return {
            success: true,
            message: `購買 ${good.name} x${quantity}`,
            spent: totalPrice,
            unitPrice: unitPrice
        };
    }

    /**
     * 出售商品
     */
    sellGood(goodId, quantity = 1, shopType = 'general') {
        const good = this.goodsDatabase[goodId];

        if (!good) {
            return { success: false, message: '商品不存在' };
        }

        const shop = this.shopTypes[shopType];
        if (!shop) {
            return { success: false, message: '商店類型無效' };
        }

        // 檢查背包數量
        const currentQuantity = this.gameState.inventory.getItemCount(goodId);
        if (currentQuantity < quantity) {
            return {
                success: false,
                message: '物品數量不足',
                required: quantity,
                current: currentQuantity
            };
        }

        // 計算出售價格（市場價格 × 商店回購率）
        const basePrice = this.marketPrices[goodId] || good.basePrice;
        const unitPrice = Math.floor(basePrice * shop.buyback);
        const totalPrice = unitPrice * quantity;

        // 移除物品
        this.gameState.inventory.removeItem(goodId, quantity);

        // 增加銀兩
        this.gameState.addSilver(totalPrice);

        // 記錄交易
        this.recordTransaction('sell', goodId, quantity, unitPrice, shopType);

        return {
            success: true,
            message: `出售 ${good.name} x${quantity}`,
            earned: totalPrice,
            unitPrice: unitPrice
        };
    }

    /**
     * 記錄交易
     */
    recordTransaction(type, goodId, quantity, unitPrice, shopType) {
        // 這裡可以添加交易歷史記錄，用於統計和分析
        // 暫時不實作，將來可以用於顯示交易記錄
    }

    /**
     * 獲取商品信息
     */
    getGoodInfo(goodId) {
        const good = this.goodsDatabase[goodId];
        if (!good) return null;

        return {
            ...good,
            currentPrice: this.marketPrices[goodId] || good.basePrice,
            priceHistory: this.priceHistory[goodId] || [],
            priceChange: this.getPriceChange(goodId),
            seasonalStatus: this.getSeasonalStatus(goodId)
        };
    }

    /**
     * 獲取價格變化
     */
    getPriceChange(goodId) {
        const history = this.priceHistory[goodId];
        if (!history || history.length < 2) {
            return { value: 0, percentage: 0 };
        }

        const current = history[history.length - 1];
        const previous = history[history.length - 2];
        const change = current - previous;
        const percentage = (change / previous * 100).toFixed(1);

        return {
            value: change,
            percentage: parseFloat(percentage),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
    }

    /**
     * 獲取季節性狀態
     */
    getSeasonalStatus(goodId) {
        const good = this.goodsDatabase[goodId];
        if (!good || !good.seasonal) return null;

        const currentSeason = this.gameState.seasonManager ?
            this.gameState.seasonManager.currentSeason : null;

        if (!currentSeason) return null;

        return {
            season: good.seasonal,
            isSeason: good.seasonal === currentSeason,
            modifier: good.seasonal === currentSeason ? 0.8 : 1.3
        };
    }

    /**
     * 獲取商店商品列表
     */
    getShopGoods(shopType, category = null) {
        const shop = this.shopTypes[shopType];
        if (!shop) return [];

        // 過濾符合商店類型的商品
        let goods = Object.values(this.goodsDatabase).filter(good => {
            // 根據商店類型過濾
            if (shopType === 'general') {
                return good.category === 'food' || good.category === 'material';
            } else if (shopType === 'blacksmith') {
                return good.category === 'weapon' || good.category === 'armor';
            } else if (shopType === 'apothecary') {
                return good.category === 'medicine' || good.category === 'herb';
            } else if (shopType === 'luxury') {
                return good.rarity === 'rare' || good.rarity === 'epic' || good.rarity === 'legendary';
            }
            return true;
        });

        // 如果指定了分類，進一步過濾
        if (category) {
            goods = goods.filter(good => good.category === category);
        }

        // 添加當前價格信息
        return goods.map(good => ({
            ...good,
            buyPrice: Math.floor((this.marketPrices[good.id] || good.basePrice) * shop.markup),
            sellPrice: Math.floor((this.marketPrices[good.id] || good.basePrice) * shop.buyback),
            currentPrice: this.marketPrices[good.id] || good.basePrice,
            priceChange: this.getPriceChange(good.id)
        }));
    }

    /**
     * 獲取所有商品列表（用於市場總覽）
     */
    getAllGoods(filters = {}) {
        let goods = Object.values(this.goodsDatabase);

        // 應用過濾器
        if (filters.category) {
            goods = goods.filter(g => g.category === filters.category);
        }

        if (filters.rarity) {
            goods = goods.filter(g => g.rarity === filters.rarity);
        }

        if (filters.seasonal) {
            const currentSeason = this.gameState.seasonManager ?
                this.gameState.seasonManager.currentSeason : null;
            goods = goods.filter(g => g.seasonal === currentSeason);
        }

        if (filters.priceRange) {
            const [min, max] = filters.priceRange;
            goods = goods.filter(g => {
                const price = this.marketPrices[g.id] || g.basePrice;
                return price >= min && price <= max;
            });
        }

        // 添加價格信息
        return goods.map(good => ({
            ...good,
            currentPrice: this.marketPrices[good.id] || good.basePrice,
            priceChange: this.getPriceChange(good.id),
            seasonalStatus: this.getSeasonalStatus(good.id)
        }));
    }

    /**
     * 獲取市場統計
     */
    getMarketStatistics() {
        const goods = Object.values(this.goodsDatabase);

        const stats = {
            totalGoods: goods.length,
            byCategory: {},
            byRarity: {},
            priceRanges: {
                cheap: 0,    // < 100
                medium: 0,   // 100-500
                expensive: 0, // 500-2000
                luxury: 0     // > 2000
            },
            trending: {
                rising: [],   // 價格上漲前5
                falling: []   // 價格下跌前5
            }
        };

        // 統計分類
        goods.forEach(good => {
            // 分類統計
            if (!stats.byCategory[good.category]) {
                stats.byCategory[good.category] = 0;
            }
            stats.byCategory[good.category]++;

            // 稀有度統計
            if (!stats.byRarity[good.rarity || 'common']) {
                stats.byRarity[good.rarity || 'common'] = 0;
            }
            stats.byRarity[good.rarity || 'common']++;

            // 價格區間統計
            const price = this.marketPrices[good.id] || good.basePrice;
            if (price < 100) {
                stats.priceRanges.cheap++;
            } else if (price < 500) {
                stats.priceRanges.medium++;
            } else if (price < 2000) {
                stats.priceRanges.expensive++;
            } else {
                stats.priceRanges.luxury++;
            }
        });

        // 計算趨勢商品
        const goodsWithChange = goods.map(good => ({
            id: good.id,
            name: good.name,
            priceChange: this.getPriceChange(good.id)
        })).filter(g => g.priceChange.percentage !== 0);

        stats.trending.rising = goodsWithChange
            .filter(g => g.priceChange.percentage > 0)
            .sort((a, b) => b.priceChange.percentage - a.priceChange.percentage)
            .slice(0, 5);

        stats.trending.falling = goodsWithChange
            .filter(g => g.priceChange.percentage < 0)
            .sort((a, b) => a.priceChange.percentage - b.priceChange.percentage)
            .slice(0, 5);

        return stats;
    }

    /**
     * 批量交易（用於貿易任務）
     */
    bulkTrade(trades) {
        const results = [];
        let totalProfit = 0;

        for (const trade of trades) {
            if (trade.action === 'buy') {
                const result = this.buyGood(trade.goodId, trade.quantity, trade.shopType);
                results.push(result);
                if (result.success) {
                    totalProfit -= result.spent;
                }
            } else if (trade.action === 'sell') {
                const result = this.sellGood(trade.goodId, trade.quantity, trade.shopType);
                results.push(result);
                if (result.success) {
                    totalProfit += result.earned;
                }
            }
        }

        return {
            results: results,
            totalProfit: totalProfit,
            successCount: results.filter(r => r.success).length,
            failCount: results.filter(r => !r.success).length
        };
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            marketPrices: { ...this.marketPrices },
            priceHistory: { ...this.priceHistory },
            lastPriceUpdate: this.lastPriceUpdate,
            seasonalModifiers: { ...this.seasonalModifiers },
            caravans: [...this.caravans]
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.marketPrices) {
            this.marketPrices = data.marketPrices;
        }

        if (data.priceHistory) {
            this.priceHistory = data.priceHistory;
        }

        if (data.lastPriceUpdate !== undefined) {
            this.lastPriceUpdate = data.lastPriceUpdate;
        }

        if (data.seasonalModifiers) {
            this.seasonalModifiers = data.seasonalModifiers;
        }

        if (data.caravans) {
            this.caravans = data.caravans;
        }
    }

    /**
     * 獲取存檔數據（SaveManager 接口）
     */
    getSaveData() {
        return this.serialize();
    }

    /**
     * 加載存檔數據（SaveManager 接口）
     */
    loadSaveData(data) {
        this.deserialize(data);
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TradeManager;
}
