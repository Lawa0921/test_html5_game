/**
 * GameFlowManager - 遊戲流程管理器
 *
 * 管理整個遊戲的核心循環：
 * intro → workAssignment → menuSetup → operating → settlement → night → sleep → (next day)
 */
class GameFlowManager {
  constructor(gameState) {
    this.gameState = gameState;

    // 遊戲流程狀態
    this.currentPhase = 'intro'; // intro, workAssignment, menuSetup, operating, settlement, night
    this.currentDay = 1;
    this.isInnOpen = false;

    // 首次遊戲標記（用於判斷是否播放開場劇情）
    this.introComplete = false;

    // 每日統計數據
    this.dailyStats = this.initializeDailyStats();

    // 註冊時間事件監聽器
    this.registerTimeEvents();
  }

  /**
   * 初始化每日統計數據
   */
  initializeDailyStats() {
    return {
      income: 0,
      expenses: 0,
      guestCount: 0,
      materials: {},
      incomeDetails: [],
      expenseDetails: [],
      dishSales: {},
      roomBookings: {}
    };
  }

  /**
   * 註冊時間事件監聽器
   */
  registerTimeEvents() {
    if (!this.gameState.timeManager) return;

    // 監聽時間更新
    this.gameState.timeManager.on('timeUpdate', (time) => {
      this.onTimeUpdate(time);
    });
  }

  /**
   * 時間更新事件處理
   * @param {object} time - 當前時間
   */
  onTimeUpdate(time) {
    const { hour, minute } = time;

    // 05:00 卯時 - 新的一天開始（如果在睡眠狀態）
    if (hour === 5 && minute === 0 && this.currentPhase === 'sleep') {
      this.startNewDay();
    }

    // 07:00 辰時 - 營業開始（如果準備完成）
    if (hour === 7 && minute === 0 && this.currentPhase === 'menuSetup') {
      this.startOperation();
    }

    // 19:00 酉時結束 - 結算
    if (hour === 19 && minute === 0 && this.currentPhase === 'operating') {
      this.closeOperation();
    }

    // 22:00 亥時 - 睡眠
    if (hour === 22 && minute === 0 && this.currentPhase === 'night') {
      this.sleep();
    }
  }

  /**
   * 開始新的一天
   */
  startNewDay() {
    // 只能從 intro 或 sleep 狀態進入
    if (this.currentPhase !== 'intro' && this.currentPhase !== 'sleep') {
      return {
        success: false,
        reason: '非法的狀態轉換'
      };
    }

    this.currentPhase = 'workAssignment';

    // 通知
    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.info(
        '新的一天',
        `第 ${this.currentDay} 天開始，請分配今日的工作`
      );
    }

    return { success: true };
  }

  /**
   * 完成工作分配
   */
  finishWorkAssignment() {
    if (this.currentPhase !== 'workAssignment') {
      return {
        success: false,
        reason: '非法的狀態轉換'
      };
    }

    this.currentPhase = 'menuSetup';

    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.info(
        '工作分配完成',
        '請設置今日的菜單和房間'
      );
    }

    return { success: true };
  }

  /**
   * 開始營業
   */
  startOperation() {
    if (this.currentPhase !== 'menuSetup') {
      return {
        success: false,
        reason: '非法的狀態轉換'
      };
    }

    this.currentPhase = 'operating';
    this.isInnOpen = true;

    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.success(
        '客棧營業',
        '辰時到了，客棧開始營業！'
      );
    }

    return { success: true };
  }

  /**
   * 結束營業
   */
  closeOperation() {
    if (this.currentPhase !== 'operating') {
      return {
        success: false,
        reason: '非法的狀態轉換'
      };
    }

    this.currentPhase = 'settlement';
    this.isInnOpen = false;

    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.info(
        '營業結束',
        '酉時到了，客棧停止營業'
      );
    }

    return { success: true };
  }

  /**
   * 進入夜晚
   */
  enterNight() {
    if (this.currentPhase !== 'settlement') {
      return {
        success: false,
        reason: '非法的狀態轉換'
      };
    }

    this.currentPhase = 'night';

    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.info(
        '夜晚時光',
        '可以與夥伴聊天或進行其他活動'
      );
    }

    return { success: true };
  }

  /**
   * 睡眠（進入下一天）
   */
  sleep() {
    if (this.currentPhase !== 'night') {
      return {
        success: false,
        reason: '非法的狀態轉換'
      };
    }

    // 重置每日統計
    this.dailyStats = this.initializeDailyStats();

    // 進入下一天
    this.currentDay++;
    this.currentPhase = 'workAssignment';

    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.success(
        '新的一天',
        `第 ${this.currentDay} 天開始`
      );
    }

    return { success: true };
  }

  // ==================== 每日統計 ====================

  /**
   * 記錄收入
   */
  addIncome(amount, source) {
    this.dailyStats.income += amount;
    this.dailyStats.incomeDetails.push({
      amount,
      source,
      time: this.gameState.timeManager?.currentTime?.totalMinutes || 0
    });
  }

  /**
   * 記錄支出
   */
  addExpense(amount, reason) {
    this.dailyStats.expenses += amount;
    this.dailyStats.expenseDetails.push({
      amount,
      reason,
      time: this.gameState.timeManager?.currentTime?.totalMinutes || 0
    });
  }

  /**
   * 記錄材料消耗
   */
  consumeMaterial(materialId, quantity) {
    if (!this.dailyStats.materials[materialId]) {
      this.dailyStats.materials[materialId] = 0;
    }
    this.dailyStats.materials[materialId] += quantity;
  }

  /**
   * 記錄訪客
   */
  addGuest() {
    this.dailyStats.guestCount++;
  }

  /**
   * 獲取每日統計摘要
   */
  getDailySummary() {
    return {
      day: this.currentDay,
      totalIncome: this.dailyStats.income,
      totalExpenses: this.dailyStats.expenses,
      netProfit: this.dailyStats.income - this.dailyStats.expenses,
      guestCount: this.dailyStats.guestCount,
      incomeDetails: this.dailyStats.incomeDetails,
      expenseDetails: this.dailyStats.expenseDetails,
      materials: this.dailyStats.materials,
      dishSales: this.dailyStats.dishSales,
      roomBookings: this.dailyStats.roomBookings
    };
  }

  // ==================== 遊戲進度 ====================

  /**
   * 判斷是否為首次遊戲
   */
  isFirstGame() {
    return !this.introComplete;
  }

  /**
   * 標記開場劇情已完成
   */
  markIntroComplete() {
    this.introComplete = true;
  }

  /**
   * 獲取保存數據
   */
  getSaveData() {
    return {
      currentPhase: this.currentPhase,
      currentDay: this.currentDay,
      isInnOpen: this.isInnOpen,
      introComplete: this.introComplete,
      dailyStats: this.dailyStats
    };
  }

  /**
   * 從保存數據恢復
   */
  loadSaveData(saveData) {
    if (!saveData) return;

    this.currentPhase = saveData.currentPhase || 'intro';
    this.currentDay = saveData.currentDay || 1;
    this.isInnOpen = saveData.isInnOpen || false;
    this.introComplete = saveData.introComplete || false;

    if (saveData.dailyStats) {
      this.dailyStats = {
        ...this.initializeDailyStats(),
        ...saveData.dailyStats
      };
    }
  }
}

module.exports = GameFlowManager;
