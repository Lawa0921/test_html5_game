# 資源生成腳本說明

本目錄包含了自動生成遊戲佔位圖資源的腳本。

## 📦 快速使用

### 一鍵生成所有資源
```bash
npm run assets:generate
```
這將執行所有4個生成腳本，生成完整的 713+ 個資源文件。

---

## 🎯 分別生成

如果只想生成特定類型的資源，可以使用以下命令：

### 1. 角色立繪與背景
```bash
npm run assets:placeholders
```
**生成內容**:
- 角色立繪（49張，800×1200px）
- 角色頭像（11張，64×64px）
- 大場景背景（12張，1920×1080px）
- UI 窗口元素（4張）

**生成數量**: 76 個文件

---

### 2. 遊戲經營素材
```bash
npm run assets:game
```
**生成內容**:
- 角色小圖標（11張，32×32px）
- 場景切換按鈕（12張，120×40px）
- 通知UI（6張）
- 工作站圖標（6張，48×48px）
- 狀態圖標（6張，24×24px）
- 場景背景（6張，900×650px）

**生成數量**: 51 個文件

---

### 3. 角色動畫幀
```bash
npm run assets:animations
```
**生成內容**:
- 11個角色 × 8種動作 × 6幀 = 528幀

**動作類型**:
- idle（待機）
- work（工作）
- rest（休息）
- sleep（睡覺）
- walk_up（向上行走）
- walk_down（向下行走）
- walk_left（向左行走）
- walk_right（向右行走）

**生成數量**: 528 個文件

---

### 4. 物品與特效
```bash
npm run assets:items
```
**生成內容**:
- 食物圖標（10張，128×128px）
- 裝備圖標（8張，128×128px）
- 材料圖標（8張，128×128px）
- 戰鬥特效（6幀）
- 狀態特效（12幀）
- 物品特效（6幀）
- 粒子特效（12幀）

**生成數量**: 62 個文件

---

## 📂 生成的檔案結構

```
assets/
├── animations/           # 角色動畫幀（528個）
│   ├── 001/             # 林修然
│   │   ├── idle/        # 待機動畫（6幀）
│   │   ├── work/        # 工作動畫（6幀）
│   │   ├── rest/        # 休息動畫（6幀）
│   │   ├── sleep/       # 睡覺動畫（6幀）
│   │   ├── walk_up/     # 向上行走（6幀）
│   │   ├── walk_down/   # 向下行走（6幀）
│   │   ├── walk_left/   # 向左行走（6幀）
│   │   └── walk_right/  # 向右行走（6幀）
│   ├── 002/             # 林語嫣
│   └── ...              # 其他9個角色
│
├── backgrounds/         # 大場景背景（12張）
│   ├── inn/            # 客棧場景
│   ├── town/           # 城鎮場景
│   └── special/        # 特殊場景
│
├── characters/         # 角色資源（60張）
│   ├── portraits/      # 立繪（49張）
│   └── avatars/        # 頭像（11張）
│
├── effects/            # 特效動畫（36幀）
│   ├── combat/         # 戰鬥特效
│   ├── status/         # 狀態特效
│   ├── items/          # 物品特效
│   └── particles/      # 粒子特效
│
├── items/              # 物品圖標（26張）
│   ├── food/           # 食物
│   ├── equipment/      # 裝備
│   └── materials/      # 材料
│
├── scenes/             # 遊戲場景背景（6張）
│
├── sprites/            # 角色小圖標（11張）
│
└── ui/                 # UI 元素（40張）
    ├── buttons/        # 按鈕
    ├── icons/          # 圖標
    ├── notifications/  # 通知UI
    └── windows/        # 窗口元素
```

---

## 🛠️ 腳本詳細說明

### generate-placeholders.js
生成基礎的角色和場景佔位圖。

**特點**:
- 根據角色性別使用不同顏色
- 為每個角色生成多個表情狀態
- 生成多個場景的日夜版本

### generate-game-assets.js
生成經營系統的 UI 素材。

**特點**:
- 32bit 像素風格
- 按鈕有 normal 和 hover 兩種狀態
- 使用漸變和陰影增強視覺效果

### generate-character-animations.js
生成角色的所有動作動畫幀。

**特點**:
- 每個動作 6 幀動畫
- 根據動作類型調整表情
- 睡覺動作會顯示 "Z" 符號
- 工作動作有閃爍效果

### generate-items-and-effects.js
生成物品圖標和特效動畫。

**特點**:
- 物品使用表情符號（emoji）佔位
- 特效有動畫效果（透明度、位置變化）
- 粒子特效有逐幀變化

---

## 📊 資源統計

| 類別 | 數量 | 腳本 |
|------|------|------|
| 角色立繪 | 49 | generate-placeholders.js |
| 角色頭像 | 11 | generate-placeholders.js |
| 角色動畫幀 | 528 | generate-character-animations.js |
| 角色小圖標 | 11 | generate-game-assets.js |
| 場景背景 | 18 | generate-placeholders.js + generate-game-assets.js |
| UI 元素 | 40 | generate-placeholders.js + generate-game-assets.js |
| 物品圖標 | 26 | generate-items-and-effects.js |
| 特效幀 | 36 | generate-items-and-effects.js |
| **總計** | **713+** | **4個腳本** |

---

## 🔄 重新生成資源

如果需要重新生成資源（例如調整顏色或尺寸）：

1. **刪除舊資源**（可選）:
   ```bash
   rm -rf assets/animations assets/items/food assets/items/equipment
   ```

2. **重新生成**:
   ```bash
   npm run assets:generate
   ```

---

## 🎨 自定義資源

### 修改顏色
在腳本中找到 `COLORS` 或 `characters` 陣列，修改顏色值：

```javascript
// generate-character-animations.js
const characters = [
    { id: '001', name: '林修然', color: '#4169E1' },  // 修改這裡
    // ...
];
```

### 修改尺寸
在腳本中找到 `width` 和 `height` 參數：

```javascript
// generate-character-animations.js
const frameSize = { width: 64, height: 64 };  // 修改這裡
```

### 添加新動作
在 `generate-character-animations.js` 中添加新動作：

```javascript
const actions = [
    { name: 'idle', label: '待機' },
    { name: 'work', label: '工作' },
    { name: 'attack', label: '攻擊' },  // 新增動作
    // ...
];
```

---

## 📝 注意事項

1. **SVG 格式**: 所有生成的資源都是 SVG 格式，便於縮放和修改
2. **佔位圖**: 這些是開發用的佔位圖，正式發布前需替換為專業美術資源
3. **文件命名**: 保持文件命名一致，方便後續替換
4. **Git 提交**: 建議將生成的資源提交到 Git，確保團隊成員使用相同的佔位圖

---

## 🚀 下一步

生成資源後：

1. 查看詳細清單: `docs/ASSETS_SUMMARY.md`
2. 檢查資源清單: `assets/asset-manifest.json`
3. 開始開發: `npm start`
4. 運行測試: `npm test`

---

**最後更新**: 2025-10-26
**版本**: 1.0.0
