/**
 * DailyOperationManager - 每日營運管理器
 *
 * 負責客棧的日常營運：
 * - NPC 客人生成
 * - 客人消費處理（點餐、住宿）
 * - 客人離店結帳
 * - 營運統計
 */
class DailyOperationManager {
  constructor(gameState) {
    this.gameState = gameState;

    // 營業狀態
    this.isOperating = false;

    // 當前在店客人
    this.currentGuests = [];

    // 每日統計
    this.dailyStats = {
      totalRevenue: 0,
      totalGuestCount: 0,
      guestsByType: { dining: 0, lodging: 0 },
      checkouts: []
    };

    // 客人生成配置
    this.spawnConfig = {
      baseSpawnRate: 120, // 基礎生成間隔（秒）
      reputationMultiplier: 0.01, // 聲譽加成
      facilityMultiplier: 0.1, // 設施加成
      lastSpawnTime: 0
    };

    // 客人 ID 計數器
    this.guestIdCounter = 1;
  }

  /**
   * 開始營業
   */
  startOperation() {
    if (this.isOperating) {
      return {
        success: false,
        reason: '客棧已經在營業中'
      };
    }

    this.isOperating = true;
    this.spawnConfig.lastSpawnTime = this.gameState.timeManager?.currentTime?.totalMinutes || 0;

    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.success(
        '開始營業',
        '客棧開門迎客！'
      );
    }

    return { success: true };
  }

  /**
   * 結束營業
   */
  stopOperation() {
    if (!this.isOperating) {
      return {
        success: false,
        reason: '客棧尚未營業'
      };
    }

    this.isOperating = false;

    // 結算所有剩餘客人
    const remainingGuests = [...this.currentGuests];
    for (const guest of remainingGuests) {
      this.checkoutGuest(guest.id);
    }

    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.info(
        '停止營業',
        '客棧關門休息'
      );
    }

    return { success: true };
  }

  /**
   * 更新（每幀調用）
   * @param {number} deltaTime - 經過的遊戲時間（秒）
   */
  update(deltaTime) {
    if (!this.isOperating) return;

    // 使用內部累積時間，或從 timeManager 獲取
    const currentTime = this.gameState.timeManager?.currentTime?.totalMinutes || 0;

    // 自動生成客人
    this.trySpawnGuests(deltaTime, currentTime);

    // 檢查並移除超時客人
    this.checkExpiredGuests(currentTime);
  }

  /**
   * 嘗試生成客人
   * @param {number} deltaTime - 經過的時間（秒）
   * @param {number} currentTime - 當前時間（分鐘）
   */
  trySpawnGuests(deltaTime, currentTime) {
    const spawnInterval = this.calculateSpawnInterval();

    // 累積時間（秒）
    if (!this.spawnConfig.accumulatedTime) {
      this.spawnConfig.accumulatedTime = 0;
    }
    this.spawnConfig.accumulatedTime += deltaTime;

    // 循環生成所有應該生成的客人
    while (this.spawnConfig.accumulatedTime >= spawnInterval) {
      // 決定生成類型（90% 用餐，10% 住宿）
      const type = Math.random() < 0.9 ? 'dining' : 'lodging';
      this.spawnGuest(type);

      // 扣除生成間隔，保留超出部分
      this.spawnConfig.accumulatedTime -= spawnInterval;
      this.spawnConfig.lastSpawnTime = currentTime;
    }
  }

  /**
   * 計算生成間隔（基於聲譽和設施）
   */
  calculateSpawnInterval() {
    const baseRate = this.spawnConfig.baseSpawnRate;
    const reputation = this.gameState.inn?.reputation || 100;
    const facilityCount = this.gameState.innManager?.getAllFacilities?.().length || 1;

    // 聲譽越高，間隔越短（客人越多）
    const reputationBonus = reputation * this.spawnConfig.reputationMultiplier;
    // 設施越多，間隔越短
    const facilityBonus = facilityCount * this.spawnConfig.facilityMultiplier * 10;

    const interval = baseRate - reputationBonus - facilityBonus;
    return Math.max(30, interval); // 最短 30 秒
  }

  /**
   * 生成一位客人
   */
  spawnGuest(type = 'dining') {
    const currentTime = this.gameState.timeManager?.currentTime?.totalMinutes || 0;
    const reputation = this.gameState.inn?.reputation || 100;

    const guest = {
      id: `guest_${this.guestIdCounter++}`,
      type: type,
      arrivalTime: currentTime,
      expectedStayDuration: this.calculateStayDuration(type),
      spendingTier: this.determineSpendingTier(reputation),
      totalSpent: 0,
      orders: [],
      roomBooking: null
    };

    this.currentGuests.push(guest);
    this.dailyStats.totalGuestCount++;
    this.dailyStats.guestsByType[type]++;

    return guest;
  }

  /**
   * 計算客人停留時間
   */
  calculateStayDuration(type) {
    if (type === 'lodging') {
      // 住宿客人停留到隔天早上（特殊處理）
      return 999999; // 標記為特殊值，實際由 calculateLodgerCheckoutTime 決定
    }

    // 一般客人停留 60-120 分鐘
    return 60 + Math.random() * 60;
  }

  /**
   * 計算住宿客人的退房時間
   */
  calculateLodgerCheckoutTime(lodger) {
    const arrivalTime = lodger.arrivalTime;
    const arrivalDay = Math.floor(arrivalTime / 1440);

    // 隔天 07:00-11:00 之間（420-660 分鐘）
    const nextDayStart = (arrivalDay + 1) * 1440;
    const checkoutOffset = 420 + Math.random() * 240; // 7:00 + 0-4小時

    return nextDayStart + checkoutOffset;
  }

  /**
   * 決定客人消費等級
   */
  determineSpendingTier(reputation) {
    const rand = Math.random() * 100;
    const reputationBonus = reputation / 1000; // 聲譽加成（0-1）

    // 聲譽越高，高級客人比例越高
    if (rand < 5 + reputationBonus * 20) return 'vip';
    if (rand < 20 + reputationBonus * 30) return 'high';
    if (rand < 60) return 'medium';
    return 'low';
  }

  /**
   * 處理客人點餐
   */
  processOrder(guestId, order) {
    const guest = this.currentGuests.find(g => g.id === guestId);
    if (!guest) {
      return {
        success: false,
        reason: '客人不存在'
      };
    }

    if (!guest.orders) {
      guest.orders = [];
    }

    guest.orders.push(order);
    guest.totalSpent += order.price;

    return { success: true };
  }

  /**
   * 處理客人住宿預訂
   */
  processRoomBooking(guestId, booking) {
    const guest = this.currentGuests.find(g => g.id === guestId);
    if (!guest) {
      return {
        success: false,
        reason: '客人不存在'
      };
    }

    guest.roomBooking = booking;
    guest.totalSpent += booking.price;

    return { success: true };
  }

  /**
   * 為客人生成訂單（AI 行為）
   */
  generateOrdersForGuest(guest) {
    const orders = [];
    const tierOrderCounts = {
      low: 1,
      medium: 2,
      high: 3,
      vip: 4
    };

    const orderCount = tierOrderCounts[guest.spendingTier] || 1;

    // 簡化版：生成固定價格的訂單
    for (let i = 0; i < orderCount; i++) {
      orders.push({
        dishId: `dish_${i + 1}`,
        dishName: `菜品${i + 1}`,
        price: 50 * (i + 1)
      });
    }

    return orders;
  }

  /**
   * 客人結帳離開
   */
  checkoutGuest(guestId) {
    const guestIndex = this.currentGuests.findIndex(g => g.id === guestId);
    if (guestIndex === -1) {
      return {
        success: false,
        reason: '客人不存在'
      };
    }

    const guest = this.currentGuests[guestIndex];
    const payment = guest.totalSpent;

    // 記錄收入
    this.dailyStats.totalRevenue += payment;
    this.dailyStats.checkouts.push({
      guestId: guest.id,
      type: guest.type,
      payment: payment,
      checkoutTime: this.gameState.timeManager?.currentTime?.totalMinutes || 0
    });

    // 移除客人
    this.currentGuests.splice(guestIndex, 1);

    return {
      success: true,
      payment: payment
    };
  }

  /**
   * 檢查並移除超時客人
   */
  checkExpiredGuests(currentTime) {
    const expiredGuests = [];

    for (const guest of this.currentGuests) {
      let shouldCheckout = false;

      if (guest.type === 'lodging') {
        // 住宿客人特殊處理
        const checkoutTime = this.calculateLodgerCheckoutTime(guest);
        shouldCheckout = currentTime >= checkoutTime;
      } else {
        // 一般客人
        const stayDuration = currentTime - guest.arrivalTime;
        shouldCheckout = stayDuration >= guest.expectedStayDuration;
      }

      if (shouldCheckout) {
        expiredGuests.push(guest.id);
      }
    }

    // 結帳離開
    for (const guestId of expiredGuests) {
      this.checkoutGuest(guestId);
    }
  }

  /**
   * 獲取客人生成配置
   */
  getGuestSpawnConfig() {
    return {
      baseSpawnRate: this.spawnConfig.baseSpawnRate,
      reputationMultiplier: this.spawnConfig.reputationMultiplier,
      facilityMultiplier: this.spawnConfig.facilityMultiplier
    };
  }

  /**
   * 獲取今日收入
   */
  getTodayRevenue() {
    return this.dailyStats.totalRevenue;
  }

  /**
   * 獲取今日客人總數
   */
  getTodayGuestCount() {
    return this.dailyStats.totalGuestCount;
  }

  /**
   * 獲取當前在店客人數
   */
  getCurrentGuestCount() {
    return this.currentGuests.length;
  }

  /**
   * 重置每日統計
   */
  resetDailyStats() {
    this.dailyStats = {
      totalRevenue: 0,
      totalGuestCount: 0,
      guestsByType: { dining: 0, lodging: 0 },
      checkouts: []
    };
  }

  /**
   * 獲取保存數據
   */
  getSaveData() {
    return {
      isOperating: this.isOperating,
      currentGuests: this.currentGuests,
      dailyStats: this.dailyStats,
      spawnConfig: this.spawnConfig,
      guestIdCounter: this.guestIdCounter
    };
  }

  /**
   * 從保存數據恢復
   */
  loadSaveData(saveData) {
    if (!saveData) return;

    this.isOperating = saveData.isOperating || false;
    this.currentGuests = saveData.currentGuests || [];
    this.dailyStats = saveData.dailyStats || this.dailyStats;
    this.spawnConfig = { ...this.spawnConfig, ...saveData.spawnConfig };
    this.guestIdCounter = saveData.guestIdCounter || 1;
  }
}

module.exports = DailyOperationManager;
