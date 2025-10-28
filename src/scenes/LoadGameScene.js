/**
 * LoadGameScene - 讀取遊戲場景
 *
 * 功能：
 * - 顯示所有可用的存檔槽位（1-10）
 * - 每個存檔顯示遊戲進度信息
 * - 點擊存檔卡片加載遊戲
 * - 返回主菜單
 */

class LoadGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadGameScene' });

    // 場景配置
    this.saveSlotCards = [];
    this.selectedSlot = null;
  }

  create() {
    // 獲取遊戲狀態和 SaveManager
    this.gameState = window.gameState;
    this.saveManager = this.gameState.saveManager;

    // 創建背景
    this.createBackground();

    // 創建標題
    this.createTitle();

    // 創建存檔槽位卡片
    this.createSaveSlots();

    // 創建返回按鈕
    this.createBackButton();

    // 初始加載存檔列表
    this.refreshSaveSlots();
  }

  /**
   * 創建背景
   */
  createBackground() {
    const { width, height } = this.cameras.main;

    // 背景圖片
    const bg = this.add.image(width / 2, height / 2, 'load-game-background');
    bg.setDisplaySize(width, height);

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);
  }

  /**
   * 創建標題
   */
  createTitle() {
    const { width } = this.cameras.main;

    const title = this.add.text(width / 2, 60, '讀取遊戲', {
      fontFamily: 'Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // 標題下劃線
    const underline = this.add.rectangle(width / 2, 95, 280, 4, 0xffd700);
  }

  /**
   * 創建存檔槽位卡片
   */
  createSaveSlots() {
    const { width, height } = this.cameras.main;

    // 佈局配置：2列5行
    const cols = 2;
    const rows = 5;
    const cardWidth = 460;
    const cardHeight = 110;  // 增加高度以容納更多信息
    const paddingX = 40;
    const paddingY = 18;
    const startX = (width - (cardWidth * cols + paddingX)) / 2 + cardWidth / 2;
    const startY = 140;

    // 創建10個存檔槽位卡片
    for (let i = 0; i < 10; i++) {
      const slotId = i + 1;
      const row = Math.floor(i / cols);
      const col = i % cols;

      const x = startX + col * (cardWidth + paddingX);
      const y = startY + row * (cardHeight + paddingY);

      const card = this.createSaveSlotCard(slotId, x, y, cardWidth, cardHeight);
      this.saveSlotCards.push(card);
    }
  }

  /**
   * 創建單個存檔槽位卡片
   */
  createSaveSlotCard(slotId, x, y, width, height) {
    const container = this.add.container(x, y);

    // 卡片背景（使用占位符圖片或創建矩形）
    const cardBg = this.add.image(0, 0, 'save-slot-card');
    cardBg.setDisplaySize(width, height);

    // 存檔槽位號
    const slotText = this.add.text(-width / 2 + 20, 0, `存檔 ${slotId}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    slotText.setOrigin(0, 0.5);

    // 存檔信息文字（稍後更新）
    const infoText = this.add.text(width / 2 - 20, 0, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#cccccc',
      align: 'right',
      lineSpacing: 2
    });
    infoText.setOrigin(1, 0.5);

    container.add([cardBg, slotText, infoText]);

    // 存儲卡片數據
    container.setData('slotId', slotId);
    container.setData('infoText', infoText);
    container.setData('cardBg', cardBg);
    container.setData('isEmpty', true);

    // 設置互動
    this.setupCardInteraction(container);

    return container;
  }

  /**
   * 設置卡片互動
   */
  setupCardInteraction(container) {
    const cardBg = container.getData('cardBg');

    cardBg.setInteractive({ useHandCursor: true });

    // 懸停效果
    cardBg.on('pointerover', () => {
      cardBg.setTint(0xdddddd);
    });

    cardBg.on('pointerout', () => {
      cardBg.clearTint();
    });

    // 點擊事件
    cardBg.on('pointerdown', () => {
      const isEmpty = container.getData('isEmpty');

      if (!isEmpty) {
        const slotId = container.getData('slotId');
        this.onLoadSave(slotId);
      } else {
        // 空存檔槽，顯示提示
        this.showMessage('此存檔槽位為空', 0xff6666);
      }
    });
  }

  /**
   * 刷新存檔槽位顯示
   */
  refreshSaveSlots() {
    if (!this.saveManager) {
      console.error('SaveManager 未初始化');
      return;
    }

    // 獲取所有存檔
    const saves = this.saveManager.listSaves();

    // 創建存檔映射
    const saveMap = new Map();
    saves.forEach(save => {
      saveMap.set(save.slotId, save);
    });

    // 更新每個卡片
    this.saveSlotCards.forEach(card => {
      const slotId = card.getData('slotId');
      const infoText = card.getData('infoText');
      const save = saveMap.get(slotId);

      if (save) {
        // 有存檔數據
        card.setData('isEmpty', false);

        // 格式化顯示信息
        const dayCount = save.dayCount || 1;
        const innLevel = save.innLevel || 1;
        const gold = save.gold || 0;
        const playerLevel = save.playerLevel || 1;
        const employeeCount = save.employeeCount || 0;
        const savedAt = save.savedAt ? this.formatDate(save.savedAt) : '未知時間';

        // 格式化金錢顯示（超過1000用 K 表示）
        const goldDisplay = gold >= 1000
          ? `${(gold / 1000).toFixed(1)}K`
          : gold.toString();

        infoText.setText(
          `第 ${dayCount} 天 | 客棧 Lv.${innLevel} | 主角 Lv.${playerLevel}\n` +
          `${goldDisplay} 銀兩 | ${employeeCount} 名員工\n` +
          `${savedAt}`
        );
        infoText.setColor('#ffffff');
      } else {
        // 空存檔槽
        card.setData('isEmpty', true);
        infoText.setText('[ 空存檔 ]');
        infoText.setColor('#888888');
      }
    });
  }

  /**
   * 格式化日期
   */
  formatDate(isoString) {
    try {
      // 檢查輸入是否有效
      if (!isoString) {
        return '時間格式錯誤';
      }

      const date = new Date(isoString);

      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        return '時間格式錯誤';
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      return '時間格式錯誤';
    }
  }

  /**
   * 加載存檔
   */
  onLoadSave(slotId) {
    // 顯示加載提示
    this.showMessage('正在讀取存檔...', 0x66ccff);

    // 延遲執行加載（給用戶視覺反饋）
    this.time.delayedCall(300, () => {
      const result = this.saveManager.loadGame(slotId);

      if (result.success) {
        // 加載成功
        this.showMessage('讀取成功！', 0x66ff66);

        // 將數據恢復到遊戲狀態
        this.restoreGameState(result.data);

        // 延遲後進入遊戲主場景
        this.time.delayedCall(500, () => {
          // TODO: 根據實際情況決定進入哪個場景
          // 目前先跳轉到主菜單（之後應該是遊戲主場景）
          this.showMessage('遊戲主場景尚未實現，返回主菜單', 0xffaa00);
          this.time.delayedCall(1500, () => {
            this.scene.start('MainMenuScene');
          });
        });
      } else {
        // 加載失敗
        this.showMessage(`讀取失敗：${result.error}`, 0xff6666);
      }
    });
  }

  /**
   * 恢復遊戲狀態
   */
  restoreGameState(saveData) {
    const { metadata, gameState: savedState } = saveData;

    // 恢復玩家數據（使用 deserialize）
    if (savedState.player && this.gameState.player) {
      if (typeof this.gameState.player.deserialize === 'function') {
        this.gameState.player.deserialize(savedState.player);
      } else {
        this.gameState.player = { ...this.gameState.player, ...savedState.player };
      }
    }

    // 恢復背包數據（使用 deserialize）
    if (savedState.inventory && this.gameState.inventory) {
      if (typeof this.gameState.inventory.deserialize === 'function') {
        this.gameState.inventory.deserialize(savedState.inventory);
      }
    }

    // 恢復員工數據
    if (savedState.employees && this.gameState.employees) {
      savedState.employees.forEach(savedEmp => {
        const emp = this.gameState.employees.find(e => e.id === savedEmp.id);
        if (emp) {
          if (savedEmp.hired) emp.hired = savedEmp.hired;
          if (savedEmp.attributes) emp.attributes = savedEmp.attributes;
          if (savedEmp.status) emp.status = savedEmp.status;
          if (savedEmp.work) emp.work = savedEmp.work;
          if (savedEmp.equipment) emp.equipment = savedEmp.equipment;
          if (savedEmp.affection) emp.affection = savedEmp.affection;
          if (savedEmp.skills) emp.skills = savedEmp.skills;
          if (savedEmp.position) emp.position = savedEmp.position;
          if (savedEmp.level !== undefined) emp.level = savedEmp.level;
          if (savedEmp.upgradeCost !== undefined) emp.upgradeCost = savedEmp.upgradeCost;
        }
      });
    }

    // 恢復資源數據
    if (savedState.silver !== undefined) {
      this.gameState.silver = savedState.silver;
      // 同步到 innManager
      if (this.gameState.innManager) {
        this.gameState.innManager.inn.gold = savedState.silver;
      }
    }

    if (savedState.totalSilver !== undefined) {
      this.gameState.totalSilver = savedState.totalSilver;
    }

    // 恢復客棧數據
    if (savedState.inn) {
      this.gameState.inn = { ...this.gameState.inn, ...savedState.inn };
    }

    // 恢復工作調度
    if (savedState.workSchedule) {
      this.gameState.workSchedule = { ...this.gameState.workSchedule, ...savedState.workSchedule };
    }

    // 恢復場景數據
    if (savedState.sceneData) {
      this.gameState.sceneData = { ...this.gameState.sceneData, ...savedState.sceneData };
    }

    // 恢復統計數據
    if (savedState.stats) {
      this.gameState.stats = { ...this.gameState.stats, ...savedState.stats };
    }

    // 恢復遊戲時間
    if (savedState.playTime !== undefined) {
      this.gameState.playTime = savedState.playTime;
    }

    // 恢復設置
    if (savedState.settings) {
      this.gameState.settings = { ...this.gameState.settings, ...savedState.settings };
    }

    // 恢復所有管理器的狀態
    const managers = [
      'timeManager',
      'gameFlowManager',
      'characterDispatchManager',
      'dailyOperationManager',
      'innManager',
      'inventoryManager',
      'affectionManager',
      'achievementManager',
      'equipmentManager',
      'combatManager',
      'tradeManager',
      'learningManager',
      'guestManager',
      'technologyManager',
      'recipeManager',
      'endingManager',
      'missionManager',
      'seasonManager',
      'eventManager',
      'storyManager',
      'notificationManager'
    ];

    managers.forEach(managerName => {
      const manager = this.gameState[managerName];
      const managerData = savedState[managerName];

      if (manager && managerData && typeof manager.loadSaveData === 'function') {
        try {
          manager.loadSaveData(managerData);
          console.log(`✓ 已恢復 ${managerName}`);
        } catch (error) {
          console.warn(`無法恢復 ${managerName}:`, error.message);
        }
      }
    });

    console.log('遊戲狀態已恢復完成');
  }

  /**
   * 創建返回按鈕
   */
  createBackButton() {
    const { width, height } = this.cameras.main;

    const button = this.add.image(width / 2, height - 60, 'button-back');
    button.setDisplaySize(200, 60);
    button.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(width / 2, height - 60, '返回', {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    // 懸停效果
    button.on('pointerover', () => {
      button.setTint(0xcccccc);
      buttonText.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.clearTint();
      buttonText.setScale(1.0);
    });

    // 點擊返回主菜單
    button.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  /**
   * 顯示消息提示
   */
  showMessage(text, color = 0xffffff) {
    const { width, height } = this.cameras.main;

    // 移除舊消息（如果存在）
    if (this.currentMessage) {
      this.currentMessage.destroy();
    }

    // 創建新消息
    const message = this.add.text(width / 2, height - 150, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 2
    });
    message.setOrigin(0.5);

    // 根據類型設置顏色
    if (color === 0xff6666) {
      message.setBackgroundColor('#cc0000');
    } else if (color === 0x66ff66) {
      message.setBackgroundColor('#00cc00');
    } else if (color === 0x66ccff) {
      message.setBackgroundColor('#0066cc');
    } else if (color === 0xffaa00) {
      message.setBackgroundColor('#cc8800');
    }

    this.currentMessage = message;

    // 3秒後自動消失
    this.time.delayedCall(3000, () => {
      if (this.currentMessage === message) {
        message.destroy();
        this.currentMessage = null;
      }
    });
  }
}

// 導出場景類
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadGameScene;
}
