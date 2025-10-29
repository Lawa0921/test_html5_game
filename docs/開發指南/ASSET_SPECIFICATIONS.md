# 悅來客棧 - 資源規格規範

## 概述

本文檔定義遊戲資源的標準尺寸和比例，確保視覺一致性和效能最佳化。

## 核心原則

> "簡單勝過複雜。實用勝過完美。"

- **基準解析度**：1280x720 (16:9)
- **最高支援**：1920x1080 (16:9)
- **縮放模式**：Phaser.Scale.FIT（保持比例）

## 背景圖片規範

### 比例要求

✅ **強制**：所有背景圖必須是 **16:9 比例**

```
支援的解析度：
- 1920x1080 (高畫質)
- 1600x900  (推薦)
- 1280x720  (標準)
- 1024x576  (低畫質)
```

### 場景分級策略

#### Tier 1：高畫質場景（1920x1080）

使用時機：
- 主選單背景
- CG 事件圖
- 重要劇情場景
- 結局畫面

#### Tier 2：標準場景（1280x720 或 1600x900）

使用時機：
- 遊戲內場景（大廳、廚房、客房）
- 重複出現的場景
- 日常互動場景

#### Tier 3：輕量場景（1280x720）

使用時機：
- 臨時場景
- 迷你遊戲背景
- 過渡畫面

### 檔案大小建議

```
1920x1080 背景：< 500KB (PNG) 或 < 150KB (WebP)
1280x720 背景： < 300KB (PNG) 或 < 100KB (WebP)
```

## Sprite 規格

### 角色 Sprite

#### 主角
```
推薦尺寸：192x192 px (含透明邊距)
實際繪製：160x180 px
格式：PNG (透明背景)
幀率：4-8 幀（閒置）/ 8-12 幀（行走）
```

#### NPC
```
推薦尺寸：128x128 px (含透明邊距)
實際繪製：96x112 px
格式：PNG (透明背景)
幀率：4 幀（閒置）/ 8 幀（行走）
```

#### 次要角色
```
推薦尺寸：64x64 px
實際繪製：48x56 px
格式：PNG (透明背景)
```

### 物件 Sprite

#### 互動物件（桌子、櫃台等）
```
小型：64x64 px
中型：128x128 px
大型：256x256 px
超大：512x512 px（少用）
```

#### 道具圖示
```
標準：64x64 px
小圖示：32x32 px
```

### UI 元素

#### 按鈕
```
小按鈕：120x40 px
中按鈕：200x60 px
大按鈕：300x80 px
```

#### 視窗背景
```
小視窗：400x300 px (九宮格縮放)
中視窗：600x400 px (九宮格縮放)
大視窗：800x600 px (九宮格縮放)
```

#### 頭像
```
標準頭像：128x128 px
大頭像：256x256 px
縮圖：64x64 px
```

## 尺寸計算公式

### 角色 Sprite 尺寸計算

```javascript
// 計算角色在場景中的合理大小
const screenHeight = 720;
const characterRatio = 1/5;  // 角色佔螢幕高度的 1/5
const baseSize = screenHeight * characterRatio;  // 144px

// 考慮 2x 縮放空間
const spriteSize = baseSize * 1.5;  // 216px

// 取最接近的 2 的冪次
const finalSize = 256;  // 向上取整到 256
```

### 物件尺寸估算

```javascript
// 根據場景尺寸估算物件大小
const sceneWidth = 1280;
const objectWidthRatio = 0.08;  // 物件佔螢幕寬度 8%
const objectSize = sceneWidth * objectWidthRatio;  // 102px

// 取接近的標準尺寸
const standardSize = 128;  // 使用 128x128
```

## 為什麼這些尺寸？

### 1. 2 的冪次優化

```
GPU 優化：
- 紋理快取以 2 的冪次運作
- 32, 64, 128, 256, 512 是最優尺寸
- 非 2 的冪次會增加記憶體佔用
```

### 2. 視覺比例

```
人類視覺經驗：
- 角色不應該太小（< 32px 難以辨識）
- 角色不應該太大（> 512px 佔用過多空間）
- 128-256px 是最舒適的範圍
```

### 3. 效能考量

```
記憶體使用：
- 32x32 = 4KB (未壓縮)
- 128x128 = 64KB
- 256x256 = 256KB
- 512x512 = 1MB

100 個角色的記憶體：
- 64x64 sprite: 1.6MB
- 256x256 sprite: 25MB
```

## 命名規範

### 背景圖命名

```
格式：[場景名稱]-background-[解析度].png

範例：
lobby-background-1920x1080.png
kitchen-background-1280x720.png
menu-background-1920x1080.png
```

### Sprite 命名

```
格式：[類型]-[名稱]-[尺寸]-[狀態].png

範例：
character-hero-192x192-idle.png
character-npc-waiter-128x128-walk.png
object-table-128x128.png
ui-button-200x60-normal.png
```

### Spritesheet 命名

```
格式：[類型]-[名稱]-[尺寸]-[動畫].png

範例：
character-hero-192x192-animations.png
├── 幀配置：frameWidth: 192, frameHeight: 192
└── 包含：idle, walk, run 動畫
```

## 實作檢查清單

### 新增背景圖時

- [ ] 確認比例為 16:9
- [ ] 根據場景重要性選擇解析度
- [ ] 檔案大小符合建議範圍
- [ ] 檔名符合命名規範
- [ ] 放置在 `assets/scenes/` 目錄

### 新增 Sprite 時

- [ ] 尺寸符合標準（2 的冪次優先）
- [ ] 包含透明邊距（至少 10%）
- [ ] 實際繪製區域置中
- [ ] 檔名符合命名規範
- [ ] 放置在對應目錄（characters/objects/ui）

### 測試資源

- [ ] 在 1280x720 下測試
- [ ] 在 1920x1080 下測試
- [ ] 確認沒有失真或拉伸
- [ ] 檢查記憶體使用量

## 常見問題

### Q: 背景圖一定要 1920x1080 嗎？

**A**: 不，但必須是 16:9 比例。根據場景重要性選擇：
- 重要場景：1920x1080
- 一般場景：1280x720 或 1600x900

### Q: Sprite 可以不是正方形嗎？

**A**: 可以，但寬高都應該接近 2 的冪次：
- 64x96 ✅（64 和 96 都接近 2 的冪次）
- 100x150 ⚠️（建議改為 128x128）

### Q: 如何決定 Sprite 大小？

**A**: 用公式：
```javascript
spriteSize = (screenHeight / desiredCharactersOnScreen) * 1.5
```
例如：螢幕想同時顯示 5 個角色
```javascript
720 / 5 * 1.5 = 216px → 向上取整到 256px
```

### Q: 效能和畫質如何平衡？

**A**: 分級策略：
- 主角用高解析度（256x256）
- NPC 用中解析度（128x128）
- 背景角色用低解析度（64x64）

### Q: 現有資源不符合規範怎麼辦？

**A**: 逐步重構，優先處理：
1. 主要場景背景
2. 主角 sprite
3. 常用 UI 元素
4. 次要資源

## 工具推薦

### 圖片縮放
- **ImageMagick**: 批次處理
- **Aseprite**: 像素風格 sprite
- **Photoshop**: 專業處理

### 批次重命名
```bash
# 批次重命名範例
for file in *.png; do
  mv "$file" "character-$(echo $file | tr '[:upper:]' '[:lower:]')"
done
```

### 尺寸檢查腳本
```bash
# 檢查所有背景圖比例
find assets/scenes -name "*.png" -exec identify -format "%f: %wx%h\n" {} \; | \
awk '{split($2,a,"x"); if(a[1]/a[2] != 16/9) print $0 " ⚠️ 非 16:9"}'
```

## 參考資源

- Phaser 3 Scale Manager: https://photonstorm.github.io/phaser3-docs/Phaser.Scale.html
- 遊戲資源最佳化指南: `docs/技術文檔/ASSET_OPTIMIZATION.md`
- 2.5D 場景實作: `docs/技術文檔/2.5D_SCENE_IMPLEMENTATION.md`

---

**最後更新**: 2025-10-29
**維護者**: 開發團隊
