import { describe, it, expect, beforeEach, vi } from 'vitest';
import AssetLoader from '../src/utils/AssetLoader.js';

describe('AssetLoader', () => {
  let mockScene;

  beforeEach(() => {
    mockScene = {
      load: {
        svg: vi.fn(),
        image: vi.fn()
      }
    };
  });

  describe('getCharacterList', () => {
    it('應該返回所有角色列表', () => {
      const characters = AssetLoader.getCharacterList();

      expect(characters).toBeInstanceOf(Array);
      expect(characters.length).toBeGreaterThan(0);
      expect(characters[0]).toHaveProperty('id');
      expect(characters[0]).toHaveProperty('name');
    });

    it('應該包含11個角色', () => {
      const characters = AssetLoader.getCharacterList();
      expect(characters.length).toBe(11);
    });

    it('應該包含主角林修然', () => {
      const characters = AssetLoader.getCharacterList();
      const linXiuran = characters.find(c => c.id === '001');

      expect(linXiuran).toBeDefined();
      expect(linXiuran.name).toBe('林修然');
    });

    it('應該包含秦婉柔', () => {
      const characters = AssetLoader.getCharacterList();
      const qinWanrou = characters.find(c => c.id === '011');

      expect(qinWanrou).toBeDefined();
      expect(qinWanrou.name).toBe('秦婉柔');
    });
  });

  describe('getCharacterPortraits', () => {
    it('應該返回林修然的立繪列表', () => {
      const portraits = AssetLoader.getCharacterPortraits('001');

      expect(portraits).toBeInstanceOf(Array);
      expect(portraits.length).toBeGreaterThan(0);
      expect(portraits[0]).toContain('001_林修然');
    });

    it('應該返回秦婉柔的6個立繪', () => {
      const portraits = AssetLoader.getCharacterPortraits('011');

      expect(portraits.length).toBe(6);
      expect(portraits.some(p => p.includes('normal'))).toBe(true);
      expect(portraits.some(p => p.includes('playing'))).toBe(true);
      expect(portraits.some(p => p.includes('crying'))).toBe(true);
    });

    it('當角色不存在時應該返回空數組', () => {
      const portraits = AssetLoader.getCharacterPortraits('999');
      expect(portraits).toEqual([]);
    });
  });

  describe('loadCharacter', () => {
    it('應該載入指定角色的資源', () => {
      AssetLoader.loadCharacter(mockScene, '001');

      expect(mockScene.load.svg).toHaveBeenCalled();
      // 驗證至少載入了立繪和頭像
      expect(mockScene.load.svg.mock.calls.length).toBeGreaterThan(1);
    });

    it('當角色不存在時不應該拋出錯誤', () => {
      expect(() => {
        AssetLoader.loadCharacter(mockScene, '999');
      }).not.toThrow();
    });
  });

  describe('loadAllCharacters', () => {
    it('應該載入所有角色資源', () => {
      AssetLoader.loadAllCharacters(mockScene);

      expect(mockScene.load.svg).toHaveBeenCalled();
      // 11個角色，每個至少有1個頭像和多個立繪
      expect(mockScene.load.svg.mock.calls.length).toBeGreaterThan(50);
    });

    it('應該載入所有角色的立繪', () => {
      AssetLoader.loadAllCharacters(mockScene);

      const calls = mockScene.load.svg.mock.calls;
      const hasLinXiuran = calls.some(call => call[0].includes('林修然'));
      const hasQinWanrou = calls.some(call => call[0].includes('秦婉柔'));

      expect(hasLinXiuran).toBe(true);
      expect(hasQinWanrou).toBe(true);
    });
  });

  describe('loadBackgrounds', () => {
    it('應該載入背景資源', () => {
      AssetLoader.loadBackgrounds(mockScene);

      expect(mockScene.load.svg).toHaveBeenCalled();
      expect(mockScene.load.svg.mock.calls.length).toBeGreaterThan(0);
    });

    it('應該載入客棧大廳背景', () => {
      AssetLoader.loadBackgrounds(mockScene);

      const calls = mockScene.load.svg.mock.calls;
      const hasInnLobby = calls.some(call =>
        call[0].includes('lobby') || call[1].includes('lobby')
      );

      expect(hasInnLobby).toBe(true);
    });
  });

  describe('loadUI', () => {
    it('應該載入UI元素', () => {
      AssetLoader.loadUI(mockScene);

      expect(mockScene.load.svg).toHaveBeenCalled();
    });

    it('應該載入對話框', () => {
      AssetLoader.loadUI(mockScene);

      const calls = mockScene.load.svg.mock.calls;
      const hasDialogueBox = calls.some(call =>
        call[0].includes('dialogue_box')
      );

      expect(hasDialogueBox).toBe(true);
    });
  });

  describe('loadAll', () => {
    it('應該載入所有資源', () => {
      AssetLoader.loadAll(mockScene);

      expect(mockScene.load.svg).toHaveBeenCalled();
      // 應該載入角色 + 背景 + UI
      expect(mockScene.load.svg.mock.calls.length).toBeGreaterThan(60);
    });
  });

  describe('資源路徑驗證', () => {
    it('所有角色立繪路徑應該包含正確的目錄', () => {
      const characters = AssetLoader.getCharacterList();

      characters.forEach(character => {
        const portraits = AssetLoader.getCharacterPortraits(character.id);
        portraits.forEach(path => {
          expect(path).toContain('assets/characters/portraits');
          expect(path).toMatch(/\.svg$/);
        });
      });
    });

    it('所有立繪檔名應該遵循命名規範', () => {
      const characters = AssetLoader.getCharacterList();

      characters.forEach(character => {
        const portraits = AssetLoader.getCharacterPortraits(character.id);
        portraits.forEach(path => {
          const filename = path.split('/').pop();
          // 格式：{編號}_{角色名}_portrait_{表情}.svg
          expect(filename).toMatch(/^\d{3}_\S+_portrait_\w+\.svg$/);
        });
      });
    });
  });
});
