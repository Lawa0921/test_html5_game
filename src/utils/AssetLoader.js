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
   * 載入角色小圖標 (32x32 sprites)
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadCharacterSprites(scene) {
    const spriteCount = 11; // 11個角色
    for (let i = 0; i < spriteCount; i++) {
      const key = `sprite-${i}`;
      const path = `assets/sprites/sprite-${i}.svg`;
      scene.load.svg(key, path);
    }
  }

  /**
   * 載入場景切換按鈕
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadSceneButtons(scene) {
    const buttons = ['lobby', 'kitchen', 'storage', 'room-a', 'room-b', 'exterior'];
    const states = ['normal', 'hover'];

    buttons.forEach(btn => {
      states.forEach(state => {
        const key = `btn-${btn}-${state}`;
        const path = `assets/ui/buttons/${key}.svg`;
        scene.load.svg(key, path);
      });
    });
  }

  /**
   * 載入通知UI元素
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadNotificationUI(scene) {
    // 通知背景
    scene.load.svg('notification-bg', 'assets/ui/notifications/notification-bg.svg');

    // 通知圖標
    const icons = ['info', 'success', 'warning', 'error', 'event'];
    icons.forEach(icon => {
      const key = `icon-${icon}`;
      const path = `assets/ui/notifications/${key}.svg`;
      scene.load.svg(key, path);
    });
  }

  /**
   * 載入工作站圖標
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadWorkstationIcons(scene) {
    const stations = ['management', 'lobby', 'kitchen', 'security', 'entertainment', 'medicine'];
    stations.forEach(station => {
      const key = `station-${station}`;
      const path = `assets/ui/icons/${key}.svg`;
      scene.load.svg(key, path);
    });
  }

  /**
   * 載入狀態圖標
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadStatusIcons(scene) {
    const icons = ['fatigue', 'health', 'mood', 'silver', 'reputation', 'time'];
    icons.forEach(icon => {
      const key = `icon-${icon}`;
      const path = `assets/ui/icons/${key}.svg`;
      scene.load.svg(key, path);
    });
  }

  /**
   * 載入場景背景（900x650）
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadSceneBackgrounds(scene) {
    const scenes = ['lobby', 'kitchen', 'storage', 'room-a', 'room-b', 'exterior'];
    scenes.forEach(sceneName => {
      const key = `scene-${sceneName}`;
      const path = `assets/scenes/${sceneName}.svg`;
      scene.load.svg(key, path);
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
    this.loadCharacterSprites(scene);
    this.loadSceneButtons(scene);
    this.loadNotificationUI(scene);
    this.loadWorkstationIcons(scene);
    this.loadStatusIcons(scene);
    this.loadSceneBackgrounds(scene);
  }

  /**
   * 載入經營系統資源（只載入經營玩法需要的）
   * @param {Phaser.Scene} scene - Phaser 場景
   */
  static loadGameplayAssets(scene) {
    this.loadCharacterSprites(scene);
    this.loadSceneButtons(scene);
    this.loadNotificationUI(scene);
    this.loadWorkstationIcons(scene);
    this.loadStatusIcons(scene);
    this.loadSceneBackgrounds(scene);
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
