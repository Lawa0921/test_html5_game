/**
 * 角色派遣系統管理器
 * 管理角色執行客棧工作、技能成長、動畫播放
 */
class CharacterDispatchManager {
  constructor(gameState) {
    this.gameState = gameState;

    // 當前派遣狀態
    this.assignments = new Map(); // characterId => task

    // 任務定義
    this.taskDefinitions = this.initializeTaskDefinitions();

    // 角色技能等級（如果角色數據沒有，使用默認值）
    this.defaultSkills = this.initializeDefaultSkills();

    // 角色工作偏好
    this.jobPreferences = this.initializeJobPreferences();

    // 角色工作歷史記錄（用於追蹤連續工作）
    this.jobHistory = new Map(); // characterId => [{ taskType, completedAt }, ...]

    // 角色狀態持久化儲存（心相、疲勞、經驗值）
    this.characterStates = new Map(); // characterId => { id, name, experience, fatigue, mood }

    // 統計數據
    this.statistics = {
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      totalExperienceGained: 0
    };
  }

  /**
   * 初始化任務定義
   * 新增：requiredFacility 和 requiredFacilityLevel 欄位
   */
  initializeTaskDefinitions() {
    return {
      // ==================== 客棧大廳工作 ====================

      reception: {
        name: '接待',
        category: 'service',
        duration: 180,
        animation: 'greeting',
        animationFrames: 3,
        animationFPS: 6,
        animationLoop: false,
        requiredFacility: 'lobby',
        requiredFacilityLevel: 1
      },

      cleaning: {
        name: '清潔',
        category: 'service',
        duration: 300,
        animation: 'cleaning',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'lobby',
        requiredFacilityLevel: 1
      },

      // ==================== 廚房工作 ====================

      cooking: {
        name: '料理',
        category: 'kitchen',
        duration: 300,
        animation: 'cooking',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'kitchen',
        requiredFacilityLevel: 1
      },

      // ==================== 河川工作 ====================

      fishing: {
        name: '釣魚',
        category: 'production',
        duration: 600,
        animation: 'fishing',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'river',
        requiredFacilityLevel: 1
      },

      // ==================== 礦坑工作 ====================

      mining: {
        name: '挖礦',
        category: 'production',
        duration: 480,
        animation: 'mining',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'mine',
        requiredFacilityLevel: 1
      },

      // ==================== 農田工作 ====================

      farming: {
        name: '種植',
        category: 'production',
        duration: 400,
        animation: 'farming',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'farm',
        requiredFacilityLevel: 1
      },

      // ==================== 練武場工作 ====================

      training: {
        name: '練武',
        category: 'training',
        duration: 360,
        animation: 'training',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'trainingGround',
        requiredFacilityLevel: 1
      },

      // ==================== 馬廄工作 ====================

      traveling: {
        name: '旅行',
        category: 'exploration',
        duration: 1200,
        animation: 'traveling',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'stable',
        requiredFacilityLevel: 1
      },

      horsecare: {
        name: '照顧馬匹',
        category: 'utility',
        duration: 240,
        animation: 'horsecare',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'stable',
        requiredFacilityLevel: 1
      },

      // ==================== 醫館工作 ====================

      healing: {
        name: '看診',
        category: 'medical',
        duration: 300,
        animation: 'healing',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: false,
        requiredFacility: 'clinic',
        requiredFacilityLevel: 1
      },

      // ==================== 看板工作 ====================

      escort: {
        name: '走鏢',
        category: 'combat',
        duration: 900,
        animation: 'escort',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'noticeBoard',
        requiredFacilityLevel: 1
      },

      trading: {
        name: '貿易',
        category: 'commerce',
        duration: 800,
        animation: 'trading',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'noticeBoard',
        requiredFacilityLevel: 1
      },

      // ==================== 暗室工作 ====================

      investigation: {
        name: '探查',
        category: 'stealth',
        duration: 600,
        animation: 'investigation',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'secretRoom',
        requiredFacilityLevel: 1
      },

      assassination: {
        name: '暗殺',
        category: 'stealth',
        duration: 720,
        animation: 'assassination',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: false,
        requiredFacility: 'secretRoom',
        requiredFacilityLevel: 1
      },

      // ==================== 舊有任務（向後兼容，無設施需求）====================

      prep: {
        name: '備菜',
        category: 'kitchen',
        duration: 180,
        animation: 'prep',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'kitchen',
        requiredFacilityLevel: 1
      },

      serving: {
        name: '端菜',
        category: 'service',
        duration: 120,
        animation: 'serving',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'lobby',
        requiredFacilityLevel: 1
      },

      greeting: {
        name: '迎賓',
        category: 'service',
        duration: 30,
        animation: 'greeting',
        animationFrames: 3,
        animationFPS: 6,
        animationLoop: false,
        requiredFacility: 'lobby',
        requiredFacilityLevel: 1
      },

      tidying: {
        name: '整理房間',
        category: 'service',
        duration: 180,
        animation: 'tidying',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'lobby',
        requiredFacilityLevel: 1
      },

      performing: {
        name: '演奏',
        category: 'entertainment',
        duration: 600,
        animation: 'performing',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
        // 無設施需求（可在任何地方演奏）
      },

      security: {
        name: '保安',
        category: 'security',
        duration: 600,
        animation: 'security',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'lobby',
        requiredFacilityLevel: 1
      },

      accounting: {
        name: '記賬',
        category: 'management',
        duration: 300,
        animation: 'accounting',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true,
        requiredFacility: 'lobby',
        requiredFacilityLevel: 1
      }
    };
  }

  /**
   * 初始化角色默認技能等級
   */
  initializeDefaultSkills() {
    // 只保留有文檔的角色 (docs/characters/)
    return {
      '001': { // 林修然
        cooking: 3,
        serving: 3,
        greeting: 4,
        cleaning: 3,
        security: 3,
        accounting: 4
      },
      '002': { // 林語嫣
        cooking: 5,
        prep: 5,
        serving: 2
      },
      '011': { // 秦婉柔
        cooking: 2,
        serving: 2,
        performing: 5
      }
    };
  }

  /**
   * 初始化角色工作偏好
   */
  initializeJobPreferences() {
    return {
      '001': { // 林修然 - 喜歡管理類工作
        favorite: ['accounting', 'greeting', 'security'],
        disliked: ['cleaning', 'prep']
      },
      '002': { // 林語嫣 - 喜歡烹飪工作
        favorite: ['cooking', 'prep'],
        disliked: ['security', 'accounting']
      },
      '011': { // 秦婉柔 - 喜歡表演工作
        favorite: ['performing', 'serving', 'greeting'],
        disliked: ['mining', 'farming']
      }
    };
  }

  /**
   * 派遣角色執行任務
   * @param {string} characterId - 角色ID
   * @param {string} taskType - 任務類型
   * @param {object} options - 額外選項
   */
  dispatch(characterId, taskType, options = {}) {
    // 檢查任務是否存在
    const taskDef = this.taskDefinitions[taskType];
    if (!taskDef) {
      return {
        success: false,
        reason: '未知任務類型'
      };
    }

    // 檢查角色是否存在
    const character = this.getCharacter(characterId);
    if (!character) {
      return {
        success: false,
        reason: '角色不存在'
      };
    }

    // 檢查角色是否已被派遣
    if (this.assignments.has(characterId)) {
      return {
        success: false,
        reason: '角色已被派遣執行其他任務'
      };
    }

    // 檢查設施需求
    if (taskDef.requiredFacility) {
      const facilityCheck = this.checkFacilityRequirement(taskDef);
      if (!facilityCheck.satisfied) {
        return {
          success: false,
          reason: facilityCheck.reason,
          requiredFacility: taskDef.requiredFacility,
          requiredLevel: taskDef.requiredFacilityLevel
        };
      }
    }

    // 所有角色都可以執行所有任務，不做限制檢查
    // 效率差異會在 calculateEfficiency 中體現

    // 計算效率
    const efficiency = this.calculateEfficiency(character, taskType);

    // 創建任務實例
    const task = {
      id: `task_${Date.now()}`,
      type: taskType,
      characterId: characterId,
      definition: taskDef,
      efficiency: efficiency,
      startTime: this.gameState.timeManager?.currentTime?.dayCount || 0,
      duration: taskDef.duration,
      status: 'in_progress',
      progress: 0
    };

    // 記錄派遣
    this.assignments.set(characterId, task);

    // 播放動畫（如果有動畫管理器）
    if (this.gameState.animationManager) {
      this.playAnimation(character, taskType);
    }

    // 通知
    if (this.gameState.notificationManager) {
      this.gameState.notificationManager.info(
        '派遣成功',
        `${character.name} 開始執行 ${taskDef.name}`
      );
    }

    return {
      success: true,
      task: task
    };
  }

  /**
   * 檢查設施需求
   * @param {object} taskDef - 任務定義
   * @returns {object} { satisfied: boolean, reason: string }
   */
  checkFacilityRequirement(taskDef) {
    // 如果沒有設施管理器，無法檢查（向後兼容）
    if (!this.gameState.innManager) {
      return {
        satisfied: true,
        reason: ''
      };
    }

    const facilityId = taskDef.requiredFacility;
    const requiredLevel = taskDef.requiredFacilityLevel || 1;

    // 獲取設施資訊（使用 getFacilityInfo 而不是 getFacilityStatus）
    const facilityInfo = this.gameState.innManager.getFacilityInfo(facilityId);

    // 檢查設施是否存在
    if (!facilityInfo) {
      return {
        satisfied: false,
        reason: `設施 ${facilityId} 不存在`
      };
    }

    // 檢查設施是否已解鎖
    if (!facilityInfo.unlocked) {
      return {
        satisfied: false,
        reason: `設施「${facilityInfo.name}」尚未解鎖（需要客棧等級 ${facilityInfo.unlockAtInnLevel}）`
      };
    }

    // 檢查設施等級是否足夠
    if (facilityInfo.level < requiredLevel) {
      return {
        satisfied: false,
        reason: `設施「${facilityInfo.name}」等級不足（當前 ${facilityInfo.level}，需要 ${requiredLevel}）`
      };
    }

    // 所有檢查通過
    return {
      satisfied: true,
      reason: ''
    };
  }

  /**
   * 計算角色執行任務的效率
   */
  calculateEfficiency(character, taskType) {
    // 獲取角色技能等級（1-5星）
    const characterSkills = this.defaultSkills[character.id] || {};
    const baseSkill = characterSkills[taskType] || 1;

    // 獲取經驗值
    const experience = character.experience?.[taskType] || 0;
    const experienceBonus = Math.floor(experience / 100) * 0.1; // 每100經驗+10%

    // 獲取疲勞度
    const fatigue = character.fatigue || 0; // 0-1
    const fatiguePenalty = fatigue * 0.3; // 最多-30%

    // 計算速度（完成任務所需時間的倍率）
    const speed = baseSkill * (1 + experienceBonus) * (1 - fatiguePenalty);

    // 計算質量（1-5星）
    const quality = Math.min(5, baseSkill * (1 + experienceBonus * 0.5));

    // 計算成功率（0-1）
    const successRate = Math.min(0.95, 0.5 + baseSkill * 0.08 + experienceBonus);

    return {
      speed: Math.max(0.3, speed), // 最慢也是基準的30%
      quality: quality,
      successRate: successRate,
      baseSkill: baseSkill,
      experienceBonus: experienceBonus,
      fatiguePenalty: fatiguePenalty
    };
  }

  /**
   * 播放角色動畫
   */
  playAnimation(character, taskType) {
    const taskDef = this.taskDefinitions[taskType];
    if (!taskDef) return;

    const animPath = `assets/animations/${character.id}/${taskDef.animation}/`;

    // 如果動畫管理器存在，播放動畫
    if (this.gameState.animationManager) {
      this.gameState.animationManager.play({
        characterId: character.id,
        path: animPath,
        frames: taskDef.animationFrames,
        fps: taskDef.animationFPS,
        loop: taskDef.animationLoop
      });
    }
  }

  /**
   * 更新任務進度（每個遊戲時間單位調用）
   */
  update(deltaTime) {
    const completedTasks = [];

    for (const [characterId, task] of this.assignments) {
      if (task.status !== 'in_progress') continue;

      // 根據效率計算實際進度
      const progressDelta = (deltaTime / task.duration) * task.efficiency.speed;
      task.progress += progressDelta;

      if (task.progress >= 1.0) {
        // 任務完成
        task.status = 'completed';
        task.progress = 1.0;
        completedTasks.push(task);
      }
    }

    // 處理完成的任務
    for (const task of completedTasks) {
      this.completeTask(task);
    }
  }

  /**
   * 完成任務
   */
  completeTask(task) {
    const character = this.getCharacter(task.characterId);
    if (!character) return;

    // 判定成功或失敗
    const random = Math.random();
    const success = random < task.efficiency.successRate;

    // 計算獎勵
    const rewards = this.calculateRewards(task, success);

    // 應用獎勵（無論成功或失敗）
    this.applyRewards(character, rewards);

    if (success) {
      this.statistics.successfulTasks++;
    } else {
      this.statistics.failedTasks++;
    }

    // 獲得經驗
    this.gainExperience(character, task.type, success);

    // 根據工作偏好調整疲勞和心相
    const modifier = this.getJobPreferenceModifier(task.characterId, task.type);

    // 增加疲勞（根據偏好調整）
    this.addFatigue(character, task.definition.duration, modifier.fatigueRate);

    // 更新心相
    this.updateMood(character, modifier.moodChange);

    // 記錄工作歷史
    this.recordJobHistory(task.characterId, task.type);

    // 移除派遣
    this.assignments.delete(task.characterId);

    // 統計
    this.statistics.totalTasks++;

    // 通知
    if (this.gameState.notificationManager) {
      if (success) {
        this.gameState.notificationManager.success(
          '任務完成',
          `${character.name} 成功完成 ${task.definition.name}！質量：${'⭐'.repeat(Math.floor(task.efficiency.quality))}`
        );
      } else {
        this.gameState.notificationManager.warning(
          '任務失敗',
          `${character.name} 未能完成 ${task.definition.name}`
        );
      }
    }

    return {
      success: success,
      task: task,
      rewards: rewards
    };
  }

  /**
   * 計算任務獎勵
   */
  calculateRewards(task, success) {
    if (!success) {
      return { gold: 0, reputation: -5, satisfaction: -10 };
    }

    const qualityMultiplier = task.efficiency.quality / 3; // 3星為基準

    return {
      gold: Math.floor(50 * qualityMultiplier),
      reputation: Math.floor(10 * qualityMultiplier),
      satisfaction: Math.floor(20 * qualityMultiplier)
    };
  }

  /**
   * 應用獎勵
   */
  applyRewards(character, rewards) {
    if (this.gameState.inn) {
      this.gameState.inn.gold = (this.gameState.inn.gold || 0) + rewards.gold;
      this.gameState.inn.reputation = (this.gameState.inn.reputation || 0) + rewards.reputation;
    }
  }

  /**
   * 角色獲得經驗
   */
  gainExperience(character, taskType, success) {
    if (!character.experience) {
      character.experience = {};
    }

    // 基礎經驗值
    let exp = success ? 10 : 5;

    // 非專業工作獲得更多經驗（學習曲線）
    const characterSkills = this.defaultSkills[character.id] || {};
    const currentSkill = characterSkills[taskType] || 1;
    if (currentSkill < 3) {
      exp *= 1.5;
    }

    character.experience[taskType] = (character.experience[taskType] || 0) + exp;
    this.statistics.totalExperienceGained += exp;

    // 升級判定（每100經驗提升技能上限）
    const newLevel = Math.floor(character.experience[taskType] / 100);
    const oldLevel = Math.floor((character.experience[taskType] - exp) / 100);

    if (newLevel > oldLevel) {
      this.levelUpSkill(character, taskType);
    }
  }

  /**
   * 技能升級
   */
  levelUpSkill(character, taskType) {
    const characterSkills = this.defaultSkills[character.id];
    if (!characterSkills) return;

    const currentSkill = characterSkills[taskType] || 1;
    if (currentSkill < 5) {
      characterSkills[taskType] = currentSkill + 1;

      if (this.gameState.notificationManager) {
        this.gameState.notificationManager.success(
          '技能提升',
          `${character.name} 的 ${this.taskDefinitions[taskType]?.name} 技能提升至 ${characterSkills[taskType]} 星！`
        );
      }
    }
  }

  /**
   * 增加疲勞度
   * @param {object} character - 角色對象
   * @param {number} duration - 工作時長（秒）
   * @param {number} fatigueRate - 疲勞增加率（默認1.0）
   */
  addFatigue(character, duration, fatigueRate = 1.0) {
    const baseFatigue = duration / 3600; // 1小時 = 1點疲勞
    character.fatigue = (character.fatigue || 0) + baseFatigue * fatigueRate;
    character.fatigue = Math.min(1.0, character.fatigue); // 最多100%
  }

  /**
   * 休息恢復疲勞
   */
  rest(characterId, duration) {
    const character = this.getCharacter(characterId);
    if (!character) return { success: false, reason: '角色不存在' };

    const recovery = duration / 1800; // 30分鐘恢復1點
    character.fatigue = Math.max(0, (character.fatigue || 0) - recovery);

    return {
      success: true,
      newFatigue: character.fatigue
    };
  }

  /**
   * 取消派遣
   */
  cancel(characterId) {
    const task = this.assignments.get(characterId);
    if (!task) {
      return { success: false, reason: '角色未被派遣' };
    }

    this.assignments.delete(characterId);

    // 停止動畫
    if (this.gameState.animationManager) {
      this.gameState.animationManager.stop(characterId);
    }

    return { success: true, task: task };
  }

  /**
   * 獲取角色當前任務
   */
  getCurrentTask(characterId) {
    return this.assignments.get(characterId);
  }

  /**
   * 獲取所有派遣狀態
   */
  getAllAssignments() {
    return Array.from(this.assignments.values());
  }

  /**
   * 獲取角色（從持久化狀態中）
   * 如果角色狀態不存在，會初始化默認值
   */
  getCharacter(characterId) {
    // 如果角色狀態尚未初始化，創建默認狀態
    if (!this.characterStates.has(characterId)) {
      this.characterStates.set(characterId, {
        id: characterId,
        name: this.getCharacterName(characterId),
        experience: {},
        fatigue: 0,
        mood: 100 // 心相初始值為 100
      });
    }

    // 返回持久化的角色狀態
    return this.characterStates.get(characterId);
  }

  /**
   * 獲取角色名稱
   */
  getCharacterName(characterId) {
    // 只保留有文檔的角色 (docs/characters/)
    const names = {
      '001': '林修然',
      '002': '林語嫣',
      '011': '秦婉柔'
    };
    return names[characterId] || '未知';
  }

  /**
   * 獲取統計數據
   */
  getStatistics() {
    return { ...this.statistics };
  }

  // ==================== 角色狀態與工作偏好系統 ====================

  /**
   * 獲取角色喜歡的工作列表
   */
  getFavoriteJobs(characterId) {
    return this.jobPreferences[characterId]?.favorite || [];
  }

  /**
   * 獲取角色討厭的工作列表
   */
  getDislikedJobs(characterId) {
    return this.jobPreferences[characterId]?.disliked || [];
  }

  /**
   * 判斷工作是否被角色喜歡
   */
  isJobLiked(characterId, jobType) {
    return this.getFavoriteJobs(characterId).includes(jobType);
  }

  /**
   * 判斷工作是否被角色討厭
   */
  isJobDisliked(characterId, jobType) {
    return this.getDislikedJobs(characterId).includes(jobType);
  }

  /**
   * 獲取工作偏好修正係數
   */
  getJobPreferenceModifier(characterId, jobType) {
    if (this.isJobLiked(characterId, jobType)) {
      return {
        moodChange: -2,      // 心相降低較少
        fatigueRate: 0.7    // 疲勞增加較少
      };
    }

    if (this.isJobDisliked(characterId, jobType)) {
      return {
        moodChange: -10,     // 心相大幅降低
        fatigueRate: 1.5    // 疲勞大幅增加
      };
    }

    // 中立工作
    return {
      moodChange: -5,      // 正常心相降低
      fatigueRate: 1.0    // 正常疲勞增加
    };
  }

  /**
   * 更新角色心相
   */
  updateMood(character, change) {
    if (!character.mood) character.mood = 100;

    character.mood += change;
    character.mood = Math.max(0, Math.min(100, character.mood));

    return character.mood;
  }

  /**
   * 獲取心相狀態描述
   */
  getMoodStatus(characterId) {
    const character = this.getCharacter(characterId);
    const mood = character.mood || 100;

    if (mood >= 80) {
      return { level: 'excellent', description: '心情愉悅' };
    } else if (mood >= 60) {
      return { level: 'good', description: '心情不錯' };
    } else if (mood >= 40) {
      return { level: 'normal', description: '心情一般' };
    } else if (mood >= 20) {
      return { level: 'bad', description: '心情低落' };
    } else {
      return { level: 'terrible', description: '心情糟糕' };
    }
  }

  /**
   * 獲取角色最近的工作歷史
   */
  getRecentJobHistory(characterId, limit = 10) {
    const history = this.jobHistory.get(characterId) || [];
    return history.slice(-limit);
  }

  /**
   * 記錄工作歷史
   */
  recordJobHistory(characterId, taskType) {
    if (!this.jobHistory.has(characterId)) {
      this.jobHistory.set(characterId, []);
    }

    const history = this.jobHistory.get(characterId);
    history.push({
      taskType,
      completedAt: this.gameState.timeManager?.currentTime?.totalMinutes || 0
    });

    // 只保留最近 20 條記錄
    if (history.length > 20) {
      history.shift();
    }
  }

  /**
   * 獲取角色完整狀態
   */
  getCharacterStatus(characterId) {
    const character = this.getCharacter(characterId);

    return {
      id: characterId,
      name: character.name,
      mood: character.mood || 100,
      fatigue: character.fatigue || 0,
      moodStatus: this.getMoodStatus(characterId),
      fatigueStatus: this.getFatigueStatus(character.fatigue || 0),
      favoriteJobs: this.getFavoriteJobs(characterId),
      dislikedJobs: this.getDislikedJobs(characterId),
      currentTask: this.getCurrentTask(characterId),
      recentJobs: this.getRecentJobHistory(characterId, 5)
    };
  }

  /**
   * 獲取疲勞狀態描述
   */
  getFatigueStatus(fatigue) {
    if (fatigue < 0.2) {
      return { level: 'rested', description: '精力充沛' };
    } else if (fatigue < 0.4) {
      return { level: 'normal', description: '狀態正常' };
    } else if (fatigue < 0.6) {
      return { level: 'tired', description: '有些疲倦' };
    } else if (fatigue < 0.8) {
      return { level: 'exhausted', description: '十分疲憊' };
    } else {
      return { level: 'overworked', description: '過度勞累' };
    }
  }

  /**
   * 判斷角色是否適合執行某工作
   */
  isCharacterSuitableForJob(characterId, jobType) {
    const character = this.getCharacter(characterId);
    const suitable = character.fatigue < 0.9; // 疲勞不超過90%
    const reasons = [];
    const warnings = [];

    if (character.fatigue >= 0.9) {
      reasons.push('疲勞過高');
    }

    if (character.mood < 20) {
      warnings.push('心相極低，工作效率會大幅下降');
    } else if (character.mood < 40) {
      warnings.push('心相較低，可能影響工作表現');
    }

    if (this.isJobDisliked(characterId, jobType)) {
      warnings.push(`${character.name}不喜歡這項工作`);
    }

    return {
      suitable,
      reasons,
      warnings
    };
  }

  /**
   * 獲取存檔數據（SaveManager 接口）
   */
  getSaveData() {
    return {
      assignments: Object.fromEntries(this.assignments),
      jobHistory: Object.fromEntries(this.jobHistory),
      characterStates: Object.fromEntries(this.characterStates),
      statistics: { ...this.statistics }
    };
  }

  /**
   * 加載存檔數據（SaveManager 接口）
   */
  loadSaveData(data) {
    if (data.assignments) {
      this.assignments = new Map(Object.entries(data.assignments));
    }
    if (data.jobHistory) {
      this.jobHistory = new Map(Object.entries(data.jobHistory));
    }
    if (data.characterStates) {
      this.characterStates = new Map(Object.entries(data.characterStates));
    }
    if (data.statistics) {
      this.statistics = { ...this.statistics, ...data.statistics };
    }
  }
}

module.exports = CharacterDispatchManager;
