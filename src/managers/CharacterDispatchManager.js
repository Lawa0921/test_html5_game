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
   */
  initializeTaskDefinitions() {
    return {
      // 烹飪相關
      cooking: {
        name: '烹飪',
        category: 'kitchen',
        duration: 300, // 5分鐘（遊戲時間）
        animation: 'cooking',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
      },
      prep: {
        name: '備菜',
        category: 'kitchen',
        duration: 180,
        animation: 'prep',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
      },
      serving: {
        name: '端菜',
        category: 'service',
        duration: 120,
        animation: 'serving',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
      },

      // 服務相關
      greeting: {
        name: '迎賓',
        category: 'service',
        duration: 30,
        animation: 'greeting',
        animationFrames: 3,
        animationFPS: 6,
        animationLoop: false
      },
      cleaning: {
        name: '打掃',
        category: 'service',
        duration: 240,
        animation: 'cleaning',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
      },
      tidying: {
        name: '整理房間',
        category: 'service',
        duration: 180,
        animation: 'tidying',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
      },

      // 娛樂與特殊工作（所有角色可執行，但效率差異大）
      performing: {
        name: '演奏',
        category: 'entertainment',
        duration: 600,
        animation: 'performing',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
        // 不限制角色，蘇妙音、秦婉柔、方無忌效率最高
      },
      healing: {
        name: '治療',
        category: 'medical',
        duration: 300,
        animation: 'healing',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: false
        // 不限制角色，顧青鸞效率最高
      },
      security: {
        name: '保安',
        category: 'security',
        duration: 600,
        animation: 'security',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
      },
      accounting: {
        name: '記賬',
        category: 'management',
        duration: 300,
        animation: 'accounting',
        animationFrames: 6,
        animationFPS: 6,
        animationLoop: true
      }
    };
  }

  /**
   * 初始化角色默認技能等級
   */
  initializeDefaultSkills() {
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
      '003': { // 溫如玉
        cooking: 4,
        serving: 5,
        greeting: 5,
        cleaning: 4,
        tidying: 5
      },
      '004': { // 顧青鸞
        cooking: 3,
        healing: 5,
        security: 3
      },
      '005': { // 蘇妙音
        cooking: 2,
        serving: 2,
        performing: 5
      },
      '006': { // 翠兒
        cooking: 2,
        serving: 4,
        greeting: 4,
        security: 4
      },
      '007': { // 沈青山
        cooking: 4,
        greeting: 5,
        accounting: 4
      },
      '008': { // 蕭鐵峰
        cooking: 1,
        security: 5
      },
      '009': { // 方無忌
        cooking: 2,
        performing: 4,
        accounting: 3
      },
      '010': { // 李默然
        cooking: 2,
        accounting: 5
      },
      '011': { // 秦婉柔
        cooking: 2,
        serving: 2,
        performing: 5
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

    const animPath = `assets/characters/animations/${character.id}_${character.name}/${taskDef.animation}/`;

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

    // 增加疲勞
    this.addFatigue(character, task.definition.duration);

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
   */
  addFatigue(character, duration) {
    character.fatigue = (character.fatigue || 0) + duration / 3600; // 1小時 = 1點疲勞
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
   * 獲取角色（從遊戲狀態中）
   */
  getCharacter(characterId) {
    // 這裡應該從實際的角色管理器中獲取
    // 暫時返回一個模擬對象
    return {
      id: characterId,
      name: this.getCharacterName(characterId),
      experience: {},
      fatigue: 0
    };
  }

  /**
   * 獲取角色名稱
   */
  getCharacterName(characterId) {
    const names = {
      '001': '林修然',
      '002': '林語嫣',
      '003': '溫如玉',
      '004': '顧青鸞',
      '005': '蘇妙音',
      '006': '翠兒',
      '007': '沈青山',
      '008': '蕭鐵峰',
      '009': '方無忌',
      '010': '李默然',
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
}

module.exports = CharacterDispatchManager;
