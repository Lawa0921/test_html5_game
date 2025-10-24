/**
 * 背包系統
 * 管理物品庫存
 */

class Inventory {
    constructor() {
        // 物品列表 { itemId: quantity }
        this.items = {};

        // 背包容量限制（未來可擴展）
        this.maxSlots = 100;
    }

    /**
     * 添加物品
     */
    addItem(itemId, quantity = 1) {
        if (!this.items[itemId]) {
            this.items[itemId] = 0;
        }

        this.items[itemId] += quantity;

        return {
            success: true,
            itemId: itemId,
            quantity: this.items[itemId]
        };
    }

    /**
     * 移除物品
     */
    removeItem(itemId, quantity = 1) {
        if (!this.items[itemId] || this.items[itemId] < quantity) {
            return {
                success: false,
                message: "物品數量不足"
            };
        }

        this.items[itemId] -= quantity;

        // 如果數量為0，移除該項
        if (this.items[itemId] === 0) {
            delete this.items[itemId];
        }

        return {
            success: true,
            itemId: itemId,
            remaining: this.items[itemId] || 0
        };
    }

    /**
     * 檢查是否擁有物品
     */
    hasItem(itemId, quantity = 1) {
        return (this.items[itemId] || 0) >= quantity;
    }

    /**
     * 獲取物品數量
     */
    getItemCount(itemId) {
        return this.items[itemId] || 0;
    }

    /**
     * 獲取所有物品
     */
    getAllItems() {
        return { ...this.items };
    }

    /**
     * 獲取物品總數
     */
    getTotalItemCount() {
        return Object.values(this.items).reduce((sum, count) => sum + count, 0);
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            items: { ...this.items },
            maxSlots: this.maxSlots
        };
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        if (data.items) {
            this.items = { ...data.items };
        }
        if (data.maxSlots) {
            this.maxSlots = data.maxSlots;
        }
    }
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Inventory;
}
