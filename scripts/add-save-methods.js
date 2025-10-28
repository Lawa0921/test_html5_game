/**
 * 批量為所有管理器添加 getSaveData 和 loadSaveData 方法
 */

const fs = require('fs');
const path = require('path');

const MANAGERS_DIR = path.join(__dirname, '../src/managers');

// 需要處理的管理器列表（已有 serialize 方法的）
const MANAGERS_WITH_SERIALIZE = [
  'AchievementManager',
  'AffectionManager',
  'CombatManager',
  'EndingManager',
  'EquipmentManager',
  'EventManager',
  'GuestManager',
  'LearningManager',
  'MissionManager',
  'NotificationManager',
  'RecipeManager',
  'SeasonManager',
  'StoryManager',
  'TechnologyManager',
  'TradeManager'
];

// getSaveData 方法模板
const GET_SAVE_DATA_METHOD = `
    /**
     * 獲取存檔數據（SaveManager 接口）
     */
    getSaveData() {
        return this.serialize();
    }`;

// loadSaveData 方法模板
const LOAD_SAVE_DATA_METHOD = `
    /**
     * 加載存檔數據（SaveManager 接口）
     */
    loadSaveData(data) {
        this.deserialize(data);
    }`;

/**
 * 為單個管理器添加方法
 */
function addSaveMethodsToManager(managerName) {
  const filePath = path.join(MANAGERS_DIR, `${managerName}.js`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${managerName}: 文件不存在`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // 檢查是否已經有 getSaveData 方法
  if (content.includes('getSaveData()')) {
    console.log(`⏭️  ${managerName}: 已經有 getSaveData 方法`);
    return false;
  }

  // 找到類的結尾（最後一個 } 之前）
  // 查找 class 定義結束的位置
  const classEndRegex = /}\s*(?:\/\/.*)?[\r\n]*(?:\/\/.*)?[\r\n]*if\s*\(\s*typeof\s+module/;
  const match = content.match(classEndRegex);

  if (!match) {
    console.log(`❌ ${managerName}: 無法找到類結束位置`);
    return false;
  }

  // 在類結尾之前插入方法
  const insertPosition = match.index;

  const newContent =
    content.slice(0, insertPosition) +
    GET_SAVE_DATA_METHOD + '\n' +
    LOAD_SAVE_DATA_METHOD + '\n' +
    content.slice(insertPosition);

  // 寫回文件
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`✅ ${managerName}: 已添加 getSaveData 和 loadSaveData 方法`);
  return true;
}

// 主函數
function main() {
  console.log('='.repeat(60));
  console.log('為管理器批量添加 getSaveData 和 loadSaveData 方法');
  console.log('='.repeat(60));
  console.log('');

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const managerName of MANAGERS_WITH_SERIALIZE) {
    const result = addSaveMethodsToManager(managerName);
    if (result === true) {
      successCount++;
    } else if (result === false && fs.existsSync(path.join(MANAGERS_DIR, `${managerName}.js`))) {
      skippedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`完成！成功: ${successCount}, 跳過: ${skippedCount}, 失敗: ${failedCount}`);
  console.log('='.repeat(60));
}

// 執行
if (require.main === module) {
  main();
}

module.exports = { addSaveMethodsToManager };
