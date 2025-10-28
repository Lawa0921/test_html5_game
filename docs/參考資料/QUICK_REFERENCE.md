# 資源擴充快速參考

本文檔提供快速查閱的資源需求清單。完整規範請見 [ASSET_SCHEMA.md](./ASSET_SCHEMA.md)

---

## 📋 新增角色檢查清單

一個可雇用角色需要 **53-56 張圖片**：

```
✓ [ ] 3-6 個表情立繪 (800×1200px)
      └─ assets/characters/portraits/{id}_{name}_portrait_{emotion}.svg
      └─ 必需: normal, smile, sad
      └─ 可選: angry, happy, surprised, shy, serious, etc.

✓ [ ] 1 個頭像 (64×64px)
      └─ assets/characters/avatars/{id}_{name}_avatar.svg

✓ [ ] 48 個動畫幀 (64×64px)
      └─ assets/animations/{id}/{action}/{action}_{frame}.svg
      └─ 8 種動作: idle, work, rest, sleep, walk_up, walk_down, walk_left, walk_right
      └─ 每種動作 6 幀

✓ [ ] 1 個小圖標 (32×32px)
      └─ assets/sprites/sprite-{index}.svg

✓ [ ] 在 asset-manifest.json 中註冊角色數據
```

**驗證指令**: `npm run validate:character {characterId}`

---

## 📦 新增物品檢查清單

一個物品需要 **1 張圖片**：

```
✓ [ ] 1 個物品圖標 (128×128px)
      └─ 食材: assets/items/food/food_{itemId}.svg
      └─ 裝備: assets/items/equipment/equip_{itemId}.svg
      └─ 材料: assets/items/materials/mat_{itemId}.svg
      └─ 任務道具: assets/items/quest/quest_{itemId}.svg (支持稀有度邊框)
```

**稀有度顏色**（僅任務道具）:
- 普通: `#9E9E9E` | 優良: `#4CAF50` | 稀有: `#2196F3` | 史詩: `#9C27B0` | 傳說: `#FF9800`

---

## 🏠 新增場景檢查清單

一個場景需要 **12-17 張圖片**：

```
✓ [ ] 1-2 個大場景背景 (1920×1080px，視覺小說用)
      └─ assets/backgrounds/{category}/{sceneName}_{variant}.svg
      └─ 分類: inn, town, special
      └─ 變體（可選）: _day, _night

✓ [ ] 1 個遊戲場景背景 (900×650px，經營系統用)
      └─ assets/scenes/{sceneName}.svg

✓ [ ] 2 個切換按鈕 (120×40px)
      └─ assets/ui/buttons/btn-{sceneName}-normal.svg
      └─ assets/ui/buttons/btn-{sceneName}-hover.svg

✓ [ ] 8-12 個場景物件 (64×64px，可選)
      └─ assets/objects/{sceneType}/obj_{objectName}.svg
      └─ 場景類型: kitchen, storage, room
      └─ 可互動物件帶金色閃光邊框
```

---

## ⚔️ 新增敵人檢查清單

一個敵人需要 **1 張圖片**：

```
✓ [ ] 1 個敵人圖像 (256×256px)
      └─ assets/enemies/enemy_{enemyId}.svg
```

---

## 🎯 新增技能檢查清單

一個技能需要 **1 張圖片**：

```
✓ [ ] 1 個技能圖標 (64×64px)
      └─ assets/ui/combat/skills/skill_{skillId}.svg
```

---

## ✨ 新增狀態效果檢查清單

一個狀態效果需要 **1 張圖片**：

```
✓ [ ] 1 個狀態圖標 (32×32px)
      └─ assets/ui/combat/buffs/buff_{statusId}.svg (增益，綠色邊框)
      └─ assets/ui/combat/buffs/debuff_{statusId}.svg (減益，紅色邊框)
```

---

## 💫 新增特效檢查清單

一個動畫特效需要 **6 張圖片**：

```
✓ [ ] 6 個特效幀 (128×128px)
      └─ assets/effects/{category}/{effectName}/{effectName}_frame_{0-5}.svg
      └─ 分類: combat, status, items, particles
```

---

## 📐 尺寸速查表

| 資源類型 | 尺寸 | 用途 |
|---------|------|------|
| **角色立繪** | 800×1200px | 視覺小說對話 |
| **角色頭像** | 64×64px | UI顯示 |
| **角色動畫幀** | 64×64px | 場景動作 |
| **角色小圖標** | 32×32px | 工作站顯示 |
| **大場景背景** | 1920×1080px | 視覺小說背景 |
| **遊戲場景背景** | 900×650px | 經營系統背景 |
| **場景切換按鈕** | 120×40px | UI按鈕 |
| **場景物件** | 64×64px | 可互動物件 |
| **物品圖標** | 128×128px | 背包/商店 |
| **敵人圖像** | 256×256px | 戰鬥場景 |
| **技能圖標** | 64×64px | 戰鬥UI |
| **狀態圖標** | 32×32px | 角色狀態 |
| **特效幀** | 128×128px | 動畫效果 |

---

## 🛠️ 常用指令

```bash
# 驗證角色資源完整性
npm run validate:character {characterId}
npm run validate:character 001

# 生成所有資源
npm run assets:generate

# 生成特定資源
npm run assets:placeholders   # 角色立繪與背景
npm run assets:animations     # 角色動畫幀
npm run assets:combat         # 戰鬥系統UI
npm run assets:quest          # 任務物品
npm run assets:scenes         # 場景物件

# 運行測試
npm test
```

---

## 📌 命名規則提醒

1. **全部小寫** + **底線分隔**
2. **不要使用空格或特殊字符**
3. **角色 ID**: 3位數字（001, 002...）
4. **其他 ID**: 語義化字串（rice, sword, lobby）

**範例**:
- ✅ `001_林修然_portrait_smile.svg`
- ✅ `food_rice.svg`
- ✅ `enemy_robber.svg`
- ❌ `001 林修然 portrait smile.svg` (有空格)
- ❌ `Food-Rice.svg` (大寫+連字號)

---

**完整規範**: [docs/ASSET_SCHEMA.md](./ASSET_SCHEMA.md)
**最後更新**: 2025-10-26
