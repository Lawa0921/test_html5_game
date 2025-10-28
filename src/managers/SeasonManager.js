/**
 * 季節管理器
 * 管理四季輪替、季節性事件、季節商品
 */

class SeasonManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 季節定義
        this.seasons = {
            spring: {
                id: 'spring',
                name: '春季',
                months: [1, 2, 3],
                icon: '🌸',
                description: '春暖花開，萬物復甦'
            },
            summer: {
                id: 'summer',
                name: '夏季',
                months: [4, 5, 6],
                icon: '☀️',
                description: '烈日炎炎，酷暑難耐'
            },
            autumn: {
                id: 'autumn',
                name: '秋季',
                months: [7, 8, 9],
                icon: '🍂',
                description: '秋高氣爽，豐收時節'
            },
            winter: {
                id: 'winter',
                name: '冬季',
                months: [10, 11, 12],
                icon: '❄️',
                description: '寒風刺骨，白雪皚皚'
            }
        };

        // 當前季節
        this.currentSeason = 'spring';

        // 季節效果
        this.seasonEffects = {
            spring: {
                incomeMultiplier: 1.1,    // 客流量增加 10%
                costMultiplier: 1.0,       // 成本正常
                eventWeights: {
                    // 事件權重調整
                    'festival': 1.5,
                    'merchant_caravan': 1.2,
                    'knight_recruit': 1.3
                },
                attributeBonus: {
                    // 屬性加成（工作效率）
                    'charisma': 1.1  // 春天客人心情好，口才效果提升
                }
            },
            summer: {
                incomeMultiplier: 1.0,
                costMultiplier: 1.1,       // 食材保存成本增加
                eventWeights: {
                    'sick_traveler': 1.5,  // 中暑事件增加
                    'heat_wave': 2.0
                },
                attributeBonus: {
                    'physique': 0.9  // 體力消耗加快
                }
            },
            autumn: {
                incomeMultiplier: 1.2,    // 豐收季節，客流量大增
                costMultiplier: 0.9,       // 食材豐富，成本降低
                eventWeights: {
                    'harvest_festival': 2.0,
                    'trade_fair': 1.5,
                    'merchant_caravan': 1.5
                },
                attributeBonus: {
                    'intelligence': 1.1  // 秋高氣爽，頭腦清晰
                }
            },
            winter: {
                incomeMultiplier: 0.8,    // 寒冬客流減少
                costMultiplier: 1.2,       // 取暖成本增加
                eventWeights: {
                    'snowstorm': 1.5,
                    'new_year': 2.0,
                    'bandit_attack': 0.5  // 冬天山賊較少出沒
                },
                attributeBonus: {
                    'physique': 0.85  // 寒冬消耗體力
                }
            }
        };

        // 季節性商品（將來給貿易系統使用）
        this.seasonalGoods = {
            spring: [
                { id: 'spring_tea', name: '春茶', priceMultiplier: 0.8 },
                { id: 'bamboo_shoots', name: '春筍', priceMultiplier: 0.7 },
                { id: 'fresh_fish', name: '鮮魚', priceMultiplier: 0.9 }
            ],
            summer: [
                { id: 'cold_noodles', name: '涼麵', priceMultiplier: 0.8 },
                { id: 'watermelon', name: '西瓜', priceMultiplier: 0.6 },
                { id: 'ice', name: '冰塊', priceMultiplier: 0.7 }
            ],
            autumn: [
                { id: 'moon_cake', name: '月餅', priceMultiplier: 0.9 },
                { id: 'crab', name: '大閘蟹', priceMultiplier: 0.8 },
                { id: 'wine', name: '桂花酒', priceMultiplier: 0.85 }
            ],
            winter: [
                { id: 'hot_pot', name: '火鍋料', priceMultiplier: 0.8 },
                { id: 'mutton', name: '羊肉', priceMultiplier: 0.75 },
                { id: 'coal', name: '木炭', priceMultiplier: 0.9 }
            ]
        };

        // 季節性事件（特殊事件ID）
        this.seasonalEvents = {
            spring: ['spring_festival', 'flower_viewing', 'spring_rain'],
            summer: ['dragon_boat', 'heat_wave', 'summer_storm'],
            autumn: ['harvest_festival', 'mid_autumn', 'trade_fair'],
            winter: ['new_year', 'snowstorm', 'winter_solstice']
        };
    }

    /**
     * 更新季節（由 TimeManager 觸發）
     */
    updateSeason(month) {
        let newSeason = null;

        // 根據月份判斷季節
        for (const [key, season] of Object.entries(this.seasons)) {
            if (season.months.includes(month)) {
                newSeason = key;
                break;
            }
        }

        if (newSeason && newSeason !== this.currentSeason) {
            return this.changeSeason(newSeason);
        }

        return { changed: false };
    }

    /**
     * 切換季節
     */
    changeSeason(newSeason) {
        const oldSeason = this.currentSeason;
        this.currentSeason = newSeason;

        const seasonInfo = this.seasons[newSeason];

        // 通知事件管理器更新事件權重
        this.updateEventWeights();

        // 通知貿易管理器更新商品
        this.updateSeasonalGoods();

        // 通知用戶季節變化
        if (this.gameState.notificationManager) {
            this.gameState.notificationManager.info(
                `${seasonInfo.icon} 季節變化`,
                `${seasonInfo.name}到了！${seasonInfo.description}`
            );
        }

        return {
            changed: true,
            oldSeason: oldSeason,
            newSeason: newSeason,
            seasonInfo: seasonInfo,
            effects: this.seasonEffects[newSeason]
        };
    }

    /**
     * 更新事件權重（通知 EventManager）
     */
    updateEventWeights() {
        if (!this.gameState.eventManager) return;

        const weights = this.seasonEffects[this.currentSeason].eventWeights;

        // 設置當前季節的事件權重
        for (const [eventId, multiplier] of Object.entries(weights)) {
            // EventManager 需要實作 setEventWeight 方法
            if (this.gameState.eventManager.setEventWeight) {
                this.gameState.eventManager.setEventWeight(eventId, multiplier);
            }
        }
    }

    /**
     * 更新季節性商品（通知 TradeManager）
     */
    updateSeasonalGoods() {
        if (!this.gameState.tradeManager) return;

        const goods = this.seasonalGoods[this.currentSeason];

        // TradeManager 需要實作 setSeasonalGoods 方法
        if (this.gameState.tradeManager.setSeasonalGoods) {
            this.gameState.tradeManager.setSeasonalGoods(goods);
        }
    }

    /**
     * 獲取當前季節效果
     */
    getCurrentSeasonEffects() {
        return this.seasonEffects[this.currentSeason];
    }

    /**
     * 獲取當前季節信息
     */
    getCurrentSeasonInfo() {
        return this.seasons[this.currentSeason];
    }

    /**
     * 獲取當前季節名稱
     */
    getCurrentSeasonName() {
        return this.seasons[this.currentSeason].name;
    }

    /**
     * 獲取當前季節圖標
     */
    getCurrentSeasonIcon() {
        return this.seasons[this.currentSeason].icon;
    }

    /**
     * 應用季節收入倍率
     */
    applyIncomeMultiplier(baseIncome) {
        const multiplier = this.seasonEffects[this.currentSeason].incomeMultiplier;
        return Math.floor(baseIncome * multiplier);
    }

    /**
     * 應用季節成本倍率
     */
    applyCostMultiplier(baseCost) {
        const multiplier = this.seasonEffects[this.currentSeason].costMultiplier;
        return Math.floor(baseCost * multiplier);
    }

    /**
     * 應用季節屬性加成
     */
    applyAttributeBonus(attribute, baseValue) {
        const bonuses = this.seasonEffects[this.currentSeason].attributeBonus;
        const multiplier = bonuses[attribute] || 1.0;
        return Math.floor(baseValue * multiplier);
    }

    /**
     * 獲取當前季節的特殊事件
     */
    getSeasonalEvents() {
        return this.seasonalEvents[this.currentSeason] || [];
    }

    /**
     * 獲取當前季節的商品
     */
    getSeasonalGoods() {
        return this.seasonalGoods[this.currentSeason] || [];
    }

    /**
     * 檢查事件是否為當前季節特有
     */
    isSeasonalEvent(eventId) {
        const events = this.seasonalEvents[this.currentSeason] || [];
        return events.includes(eventId);
    }

    /**
     * 檢查商品是否為當前季節特有
     */
    isSeasonalGood(goodId) {
        const goods = this.seasonalGoods[this.currentSeason] || [];
        return goods.some(g => g.id === goodId);
    }

    /**
     * 獲取季節摘要（用於UI顯示）
     */
    getSeasonSummary() {
        const season = this.seasons[this.currentSeason];
        const effects = this.seasonEffects[this.currentSeason];

        return {
            season: season.name,
            icon: season.icon,
            description: season.description,
            incomeMultiplier: effects.incomeMultiplier,
            costMultiplier: effects.costMultiplier,
            specialEvents: this.seasonalEvents[this.currentSeason].length,
            specialGoods: this.seasonalGoods[this.currentSeason].length
        };
    }

    /**
     * 獲取所有季節信息（用於查詢）
     */
    getAllSeasons() {
        return Object.values(this.seasons);
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            currentSeason: this.currentSeason
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.currentSeason) {
            this.currentSeason = data.currentSeason;
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
    module.exports = SeasonManager;
}
