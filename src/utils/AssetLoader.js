/**
 * AssetLoader - 遊戲資源載入器
 *
 * 負責載入所有遊戲資源，包括角色立繪、背景、UI元素等
 * 使用 assets/asset-manifest.json 作為資源清單
 */

class AssetLoader {
  /**
   * 載入角色資源
   * @param {Phaser.Scene} scene - Phaser 場景
   * @param {string} characterId - 角色ID（如 '001'）
   */
  static loadCharacter(scene, characterId) {
    const manifest = require('../../assets/asset-manifest.json');
    const character = manifest.characters.find(c => c.id === characterId);

    if (!character) {
      console.warn(`Character ${characterId} not found in manifest`);
      return;
    }

    // 載入立繪
    character.portraits.forEach((path, index) => {
      const key = `${character.name}_portrait_${index}`;
      scene.load.svg(key, path);
    });

    // 載入頭像
    scene.load.svg(`${character.name}_avatar`, character.avatar);
  }

  /**
   * 載入所有角色資源
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadAllCharacters(scene) {
    const manifest = require('../../assets/asset-manifest.json');

    manifest.characters.forEach(character => {
      // 載入立繪
      character.portraits.forEach((path) => {
        const filename = path.split('/').pop().replace('.svg', '');
        scene.load.svg(filename, path);
      });

      // 載入頭像
      const avatarFilename = character.avatar.split('/').pop().replace('.svg', '');
      scene.load.svg(avatarFilename, character.avatar);
    });
  }

  /**
   * 載入背景資源
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadBackgrounds(scene) {
    const manifest = require('../../assets/asset-manifest.json');

    manifest.backgrounds.forEach(bg => {
      const key = `${bg.category}_${bg.name}`;
      scene.load.svg(key, bg.path);
    });
  }

  /**
   * 載入UI元素
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadUI(scene) {
    const manifest = require('../../assets/asset-manifest.json');

    manifest.ui.forEach(element => {
      scene.load.svg(element.name, element.path);
    });
  }

  /**
   * 載入所有資源
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadAll(scene) {
    this.loadAllCharacters(scene);
    this.loadBackgrounds(scene);
    this.loadUI(scene);
  }

  /**
   * 獲取角色列表
   * @returns {Array} 角色列表
   */
  static getCharacterList() {
    const manifest = require('../../assets/asset-manifest.json');
    return manifest.characters.map(c => ({
      id: c.id,
      name: c.name
    }));
  }

  /**
   * 獲取特定角色的立繪列表
   * @param {string} characterId - 角色ID
   * @returns {Array} 立繪路徑列表
   */
  static getCharacterPortraits(characterId) {
    const manifest = require('../../assets/asset-manifest.json');
    const character = manifest.characters.find(c => c.id === characterId);
    return character ? character.portraits : [];
  }
}

module.exports = AssetLoader;
