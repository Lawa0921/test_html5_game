/**
 * 客棧設施管理器 (MVP Version)
 * 管理客棧等級、設施解鎖、設施升級
 *
 * 設計原則：
 * - 數據結構優先（好的數據結構 > 複雜的代碼）
 * - 消除特殊情況（統一的設施處理）
 * - 簡單實用（第一版只用客棧等級控制）
 */
class InnManager {
  constructor(gameState) {
    this.gameState = gameState;

    // 客棧本體狀態
    this.inn = {
      level: 1,           // 客棧等級
      exp: 0,             // 客棧經驗值
      gold: 1000,         // 金錢
      reputation: 0       // 聲望
    };

    // 設施定義（靜態配置）
    this.facilityDefinitions = this.initializeFacilityDefinitions();

    // 設施當前狀態（動態數據）
    this.facilities = this.initializeFacilities();

    // 統計數據
    this.statistics = {
      totalUpgrades: 0,
      totalGoldSpent: 0,
      facilitiesUnlocked: 4  // 初始客棧、廚房、河川、儲藏室已解鎖
    };
  }

  /**
   * 初始化設施定義
   * 每個設施包含：ID、名稱、解鎖等級、最高等級、場景、升級成本、效果、支援的工作
   */
  initializeFacilityDefinitions() {
    return {
      // ==================== 初始可用設施（客棧等級1）====================

      lobby: {
        id: 'lobby',
        name: '客棧大廳',
        description: '接待客人的主要場所',
        category: 'service',
        unlockAtInnLevel: 1,
        maxLevel: 5,
        scene: 'LobbyScene',
        upgradeCosts: [0, 800, 1600, 3200, 6400],
        supportedJobs: ['reception', 'cleaning'],  // 接待、清潔
        effects: {
          1: { guestCapacity: 10, serviceSpeed: 1.0, reputation: 0 },
          2: { guestCapacity: 15, serviceSpeed: 1.2, reputation: 10 },
          3: { guestCapacity: 20, serviceSpeed: 1.4, reputation: 25 },
          4: { guestCapacity: 30, serviceSpeed: 1.6, reputation: 50 },
          5: { guestCapacity: 40, serviceSpeed: 2.0, reputation: 100 }
        }
      },

      kitchen: {
        id: 'kitchen',
        name: '廚房',
        description: '烹飪美食的地方',
        category: 'production',
        unlockAtInnLevel: 1,
        maxLevel: 5,
        scene: 'KitchenScene',
        upgradeCosts: [0, 500, 1000, 2000, 5000],
        supportedJobs: ['cooking'],  // 料理
        effects: {
          1: { cookingSpeed: 1.0, recipeSlots: 5, qualityBonus: 0 },
          2: { cookingSpeed: 1.2, recipeSlots: 8, qualityBonus: 0.05 },
          3: { cookingSpeed: 1.4, recipeSlots: 12, qualityBonus: 0.10 },
          4: { cookingSpeed: 1.6, recipeSlots: 16, qualityBonus: 0.15 },
          5: { cookingSpeed: 2.0, recipeSlots: 20, qualityBonus: 0.25 }
        }
      },

      river: {
        id: 'river',
        name: '河川',
        description: '客棧旁的清澈河流',
        category: 'production',
        unlockAtInnLevel: 1,
        maxLevel: 5,
        scene: 'RiverScene',
        upgradeCosts: [0, 400, 800, 1600, 3200],
        supportedJobs: ['fishing'],  // 釣魚
        effects: {
          1: { fishRate: 1.0, rareFishChance: 0.05, fishCapacity: 10 },
          2: { fishRate: 1.2, rareFishChance: 0.08, fishCapacity: 15 },
          3: { fishRate: 1.4, rareFishChance: 0.12, fishCapacity: 20 },
          4: { fishRate: 1.6, rareFishChance: 0.16, fishCapacity: 30 },
          5: { fishRate: 2.0, rareFishChance: 0.25, fishCapacity: 50 }
        }
      },

      storage: {
        id: 'storage',
        name: '儲藏室',
        description: '存放物資的倉庫',
        category: 'utility',
        unlockAtInnLevel: 1,
        maxLevel: 5,
        scene: 'StorageScene',
        upgradeCosts: [0, 300, 600, 1200, 3000],
        supportedJobs: [],  // 無工作，僅影響倉庫容量
        effects: {
          1: { capacity: 50, preservation: 0.9, categorySlots: 5 },
          2: { capacity: 100, preservation: 0.92, categorySlots: 8 },
          3: { capacity: 200, preservation: 0.95, categorySlots: 12 },
          4: { capacity: 400, preservation: 0.97, categorySlots: 16 },
          5: { capacity: 800, preservation: 1.0, categorySlots: 20 }
        }
      },

      // ==================== 客棧等級2解鎖 ====================

      mine: {
        id: 'mine',
        name: '礦坑',
        description: '開採礦石的地方',
        category: 'production',
        unlockAtInnLevel: 2,
        maxLevel: 5,
        scene: 'MineScene',
        upgradeCosts: [1200, 2400, 4800, 9600, 19200],
        supportedJobs: ['mining'],  // 挖礦
        effects: {
          1: { miners: 2, miningSpeed: 1.0, rareOreChance: 0.05 },
          2: { miners: 4, miningSpeed: 1.2, rareOreChance: 0.08 },
          3: { miners: 6, miningSpeed: 1.4, rareOreChance: 0.12 },
          4: { miners: 8, miningSpeed: 1.6, rareOreChance: 0.16 },
          5: { miners: 10, miningSpeed: 2.0, rareOreChance: 0.25 }
        }
      },

      // ==================== 客棧等級3解鎖 ====================

      farm: {
        id: 'farm',
        name: '農田',
        description: '種植作物的田地',
        category: 'production',
        unlockAtInnLevel: 3,
        maxLevel: 5,
        scene: 'FarmScene',
        upgradeCosts: [1000, 2000, 4000, 8000, 16000],
        supportedJobs: ['farming'],  // 種植
        effects: {
          1: { plots: 4, growthSpeed: 1.0, yield: 1.0, cropVariety: 3 },
          2: { plots: 8, growthSpeed: 1.1, yield: 1.2, cropVariety: 5 },
          3: { plots: 12, growthSpeed: 1.2, yield: 1.4, cropVariety: 7 },
          4: { plots: 16, growthSpeed: 1.3, yield: 1.6, cropVariety: 10 },
          5: { plots: 20, growthSpeed: 1.5, yield: 2.0, cropVariety: 15 }
        }
      },

      trainingGround: {
        id: 'trainingGround',
        name: '練武場',
        description: '鍛鍊武藝的場所',
        category: 'training',
        unlockAtInnLevel: 3,
        maxLevel: 5,
        scene: 'TrainingGroundScene',
        upgradeCosts: [1500, 3000, 6000, 12000, 24000],
        supportedJobs: ['training'],  // 練武
        effects: {
          1: { trainingSpeed: 1.0, maxStudents: 2, skillBonus: 0, stamina: 100 },
          2: { trainingSpeed: 1.2, maxStudents: 4, skillBonus: 0.05, stamina: 150 },
          3: { trainingSpeed: 1.4, maxStudents: 6, skillBonus: 0.10, stamina: 200 },
          4: { trainingSpeed: 1.6, maxStudents: 8, skillBonus: 0.15, stamina: 300 },
          5: { trainingSpeed: 2.0, maxStudents: 10, skillBonus: 0.25, stamina: 500 }
        }
      },

      // ==================== 客棧等級4解鎖 ====================

      stable: {
        id: 'stable',
        name: '馬廄',
        description: '飼養馬匹的地方',
        category: 'utility',
        unlockAtInnLevel: 4,
        maxLevel: 5,
        scene: 'StableScene',
        upgradeCosts: [1800, 3600, 7200, 14400, 28800],
        supportedJobs: ['traveling', 'horsecare'],  // 旅行、照顧
        effects: {
          1: { horses: 2, travelSpeed: 1.2, travelDistance: 50, carryCapacity: 50 },
          2: { horses: 4, travelSpeed: 1.4, travelDistance: 100, carryCapacity: 100 },
          3: { horses: 6, travelSpeed: 1.6, travelDistance: 150, carryCapacity: 150 },
          4: { horses: 8, travelSpeed: 1.8, travelDistance: 250, carryCapacity: 200 },
          5: { horses: 10, travelSpeed: 2.0, travelDistance: 400, carryCapacity: 300 }
        }
      },

      clinic: {
        id: 'clinic',
        name: '醫館',
        description: '診治傷病的地方',
        category: 'service',
        unlockAtInnLevel: 4,
        maxLevel: 5,
        scene: 'ClinicScene',
        upgradeCosts: [2000, 4000, 8000, 16000, 32000],
        supportedJobs: ['healing'],  // 看診
        effects: {
          1: { healingSpeed: 1.0, patientCapacity: 2, cureRate: 0.7, herbSlots: 5 },
          2: { healingSpeed: 1.2, patientCapacity: 4, cureRate: 0.8, herbSlots: 8 },
          3: { healingSpeed: 1.4, patientCapacity: 6, cureRate: 0.85, herbSlots: 12 },
          4: { healingSpeed: 1.6, patientCapacity: 8, cureRate: 0.9, herbSlots: 16 },
          5: { healingSpeed: 2.0, patientCapacity: 10, cureRate: 0.95, herbSlots: 20 }
        }
      },

      // ==================== 客棧等級5解鎖 ====================

      noticeBoard: {
        id: 'noticeBoard',
        name: '看板',
        description: '發布懸賞和貿易信息',
        category: 'service',
        unlockAtInnLevel: 5,
        maxLevel: 5,
        scene: 'NoticeBoardScene',
        upgradeCosts: [2500, 5000, 10000, 20000, 40000],
        supportedJobs: ['escort', 'trading'],  // 走鏢、貿易
        effects: {
          1: { questSlots: 3, rewardBonus: 0, tradeRoutes: 2, commission: 0.1 },
          2: { questSlots: 5, rewardBonus: 0.1, tradeRoutes: 4, commission: 0.08 },
          3: { questSlots: 8, rewardBonus: 0.15, tradeRoutes: 6, commission: 0.06 },
          4: { questSlots: 12, rewardBonus: 0.20, tradeRoutes: 8, commission: 0.04 },
          5: { questSlots: 20, rewardBonus: 0.30, tradeRoutes: 12, commission: 0.02 }
        }
      },

      secretRoom: {
        id: 'secretRoom',
        name: '暗室',
        description: '秘密進行情報工作的地方',
        category: 'special',
        unlockAtInnLevel: 5,
        maxLevel: 5,
        scene: 'SecretRoomScene',
        upgradeCosts: [3000, 6000, 12000, 24000, 48000],
        supportedJobs: ['investigation', 'assassination'],  // 探查、暗殺
        effects: {
          1: { agents: 1, stealthBonus: 0, successRate: 0.5, infoNetwork: 3 },
          2: { agents: 2, stealthBonus: 0.1, successRate: 0.6, infoNetwork: 5 },
          3: { agents: 3, stealthBonus: 0.15, successRate: 0.7, infoNetwork: 8 },
          4: { agents: 4, stealthBonus: 0.20, successRate: 0.8, infoNetwork: 12 },
          5: { agents: 5, stealthBonus: 0.30, successRate: 0.9, infoNetwork: 20 }
        }
      }
    };
  }

  /**
   * 初始化設施狀態
   * 初始時廚房和儲藏室已解鎖，其他未解鎖
   */
  initializeFacilities() {
    const facilities = {};

    for (const [id, definition] of Object.entries(this.facilityDefinitions)) {
      const isInitiallyUnlocked = definition.unlockAtInnLevel <= 1;
      facilities[id] = {
        level: isInitiallyUnlocked ? 1 : 0,
        unlocked: isInitiallyUnlocked
      };
    }

    return facilities;
  }

  /**
   * 檢查設施是否已解鎖
   */
  isFacilityUnlocked(facilityId) {
    const facility = this.facilities[facilityId];
    return facility && facility.unlocked;
  }

  /**
   * 檢查設施是否可訪問（已解鎖且等級>0）
   */
  canAccessFacility(facilityId) {
    const facility = this.facilities[facilityId];
    return facility && facility.unlocked && facility.level > 0;
  }

  /**
   * 檢查場景是否可訪問
   * @param {string} sceneKey - Phaser 場景 key
   */
  canAccessScene(sceneKey) {
    // 非設施場景（如 LobbyScene, ExteriorScene）始終可訪問
    const nonFacilityScenes = ['LobbyScene', 'ExteriorScene', 'StoryScene', 'BootScene'];
    if (nonFacilityScenes.includes(sceneKey)) {
      return true;
    }

    // 查找對應的設施
    for (const [facilityId, definition] of Object.entries(this.facilityDefinitions)) {
      // 支援單場景和多場景
      if (definition.scene === sceneKey || definition.scenes?.includes(sceneKey)) {
        return this.canAccessFacility(facilityId);
      }
    }

    // 如果找不到對應設施，預設允許訪問（未來可能的場景）
    return true;
  }

  /**
   * 檢查設施是否可以解鎖
   */
  canUnlockFacility(facilityId) {
    const facility = this.facilities[facilityId];
    const definition = this.facilityDefinitions[facilityId];

    if (!facility || !definition) {
      return { canUnlock: false, reason: '設施不存在' };
    }

    if (facility.unlocked) {
      return { canUnlock: false, reason: '設施已解鎖' };
    }

    if (this.inn.level < definition.unlockAtInnLevel) {
      return {
        canUnlock: false,
        reason: `需要客棧等級 ${definition.unlockAtInnLevel}`
      };
    }

    const unlockCost = definition.upgradeCosts[0];
    if (this.inn.gold < unlockCost) {
      return {
        canUnlock: false,
        reason: `需要 ${unlockCost} 金錢（當前: ${this.inn.gold}）`
      };
    }

    return { canUnlock: true };
  }

  /**
   * 解鎖設施
   */
  unlockFacility(facilityId) {
    const check = this.canUnlockFacility(facilityId);
    if (!check.canUnlock) {
      return { success: false, reason: check.reason };
    }

    const definition = this.facilityDefinitions[facilityId];
    const unlockCost = definition.upgradeCosts[0];

    // 執行解鎖
    this.inn.gold -= unlockCost;
    this.facilities[facilityId].unlocked = true;
    this.facilities[facilityId].level = 1;

    // 更新統計
    this.statistics.facilitiesUnlocked++;
    this.statistics.totalGoldSpent += unlockCost;

    // 通知
    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.success(
        '設施解鎖',
        `${definition.name} 已解鎖！`
      );
    }

    return {
      success: true,
      facilityId: facilityId,
      facilityName: definition.name,
      goldSpent: unlockCost,
      newLevel: 1
    };
  }

  /**
   * 檢查設施是否可以升級
   */
  canUpgradeFacility(facilityId) {
    const facility = this.facilities[facilityId];
    const definition = this.facilityDefinitions[facilityId];

    if (!facility || !definition) {
      return { canUpgrade: false, reason: '設施不存在' };
    }

    if (!facility.unlocked) {
      return { canUpgrade: false, reason: '設施未解鎖' };
    }

    if (facility.level >= definition.maxLevel) {
      return { canUpgrade: false, reason: '已達最高等級' };
    }

    const upgradeCost = definition.upgradeCosts[facility.level];
    if (this.inn.gold < upgradeCost) {
      return {
        canUpgrade: false,
        reason: `需要 ${upgradeCost} 金錢（當前: ${this.inn.gold}）`
      };
    }

    return { canUpgrade: true, cost: upgradeCost };
  }

  /**
   * 升級設施
   */
  upgradeFacility(facilityId) {
    const check = this.canUpgradeFacility(facilityId);
    if (!check.canUpgrade) {
      return { success: false, reason: check.reason };
    }

    const facility = this.facilities[facilityId];
    const definition = this.facilityDefinitions[facilityId];
    const upgradeCost = check.cost;

    // 執行升級
    this.inn.gold -= upgradeCost;
    facility.level++;

    // 更新統計
    this.statistics.totalUpgrades++;
    this.statistics.totalGoldSpent += upgradeCost;

    // 通知
    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.success(
        '設施升級',
        `${definition.name} 升級至 Lv.${facility.level}！`
      );
    }

    return {
      success: true,
      facilityId: facilityId,
      facilityName: definition.name,
      newLevel: facility.level,
      goldSpent: upgradeCost,
      newEffects: definition.effects[facility.level]
    };
  }

  /**
   * 獲取設施詳情
   */
  getFacilityInfo(facilityId) {
    const facility = this.facilities[facilityId];
    const definition = this.facilityDefinitions[facilityId];

    if (!facility || !definition) {
      return null;
    }

    return {
      ...definition,
      currentLevel: facility.level,
      unlocked: facility.unlocked,
      currentEffects: facility.level > 0 ? definition.effects[facility.level] : null,
      nextEffects: facility.level < definition.maxLevel ? definition.effects[facility.level + 1] : null,
      upgradeCost: facility.level < definition.maxLevel ? definition.upgradeCosts[facility.level] : null,
      canUnlock: this.canUnlockFacility(facilityId).canUnlock,
      canUpgrade: this.canUpgradeFacility(facilityId).canUpgrade
    };
  }

  /**
   * 獲取所有設施列表
   */
  getAllFacilities() {
    return Object.keys(this.facilityDefinitions).map(id => this.getFacilityInfo(id));
  }

  /**
   * 獲取已解鎖的設施列表
   */
  getUnlockedFacilities() {
    return this.getAllFacilities().filter(f => f.unlocked);
  }

  /**
   * 獲取可解鎖的設施列表（客棧等級已滿足但尚未解鎖）
   */
  getAvailableToUnlock() {
    return this.getAllFacilities().filter(f =>
      !f.unlocked && this.inn.level >= f.unlockAtInnLevel
    );
  }

  /**
   * 增加客棧經驗值
   */
  addInnExp(amount) {
    this.inn.exp += amount;

    // 檢查是否升級（簡單公式：level * 1000）
    const expNeeded = this.inn.level * 1000;
    if (this.inn.exp >= expNeeded) {
      this.inn.exp -= expNeeded;
      this.inn.level++;

      // 通知
      if (this.gameState.notificationManager) {
        this.gameState.notificationManager.success(
          '客棧升級',
          `客棧升級至 Lv.${this.inn.level}！`
        );
      }

      // 檢查是否有新設施可解鎖
      const newlyAvailable = this.getAvailableToUnlock();
      if (newlyAvailable.length > 0 && this.gameState.notificationManager) {
        this.gameState.notificationManager.info(
          '新設施可用',
          `${newlyAvailable.length} 個新設施可以解鎖！`
        );
      }

      return { leveledUp: true, newLevel: this.inn.level };
    }

    return { leveledUp: false };
  }

  /**
   * 增加金錢
   */
  addGold(amount) {
    this.inn.gold += amount;
  }

  /**
   * 獲取統計數據
   */
  getStatistics() {
    return {
      ...this.statistics,
      innLevel: this.inn.level,
      innExp: this.inn.exp,
      gold: this.inn.gold,
      totalFacilities: Object.keys(this.facilityDefinitions).length,
      facilitiesUnlocked: this.statistics.facilitiesUnlocked
    };
  }

  /**
   * 獲取存檔數據（SaveManager 接口）
   */
  getSaveData() {
    return {
      inn: { ...this.inn },
      facilities: { ...this.facilities },
      statistics: { ...this.statistics }
    };
  }

  /**
   * 加載存檔數據（SaveManager 接口）
   */
  loadSaveData(data) {
    if (data.inn) {
      this.inn = { ...this.inn, ...data.inn };
    }
    if (data.facilities) {
      this.facilities = { ...this.facilities, ...data.facilities };
    }
    if (data.statistics) {
      this.statistics = { ...this.statistics, ...data.statistics };
    }
  }
}

module.exports = InnManager;
