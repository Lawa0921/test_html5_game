/**
 * 劇情管理器 (PlotManager)
 * 管理遊戲中的故事線和劇情觸發
 *
 * 注意：此文件與 src/managers/StoryManager.js 功能不同
 * - PlotManager: 管理遊戲劇情觸發和故事線進度（本文件）
 * - StoryManager: 管理視覺小說系統的對話節點和分支選擇
 */
class PlotManager {
    constructor(gameState) {
        this.gameState = gameState;

        // 故事數據庫
        this.stories = this.initializeStories();

        // 當前解鎖的故事
        this.unlockedStories = [];
    }

    /**
     * 初始化故事數據
     */
    initializeStories() {
        return {
            // 主線故事
            main: [
                {
                    id: 'main_1',
                    title: '覺醒',
                    content: '你在桌面上醒來，發現自己變成了一個小小的冒險者。周圍的世界變得無比巨大，鍵盤像是連綿的山脈，滑鼠像是神秘的神殿...',
                    unlockCondition: { type: 'start' },
                    rewards: { silver: 50 }
                },
                {
                    id: 'main_2',
                    title: '第一個夥伴',
                    content: '在探索的過程中，你遇到了一位神秘的法師。他告訴你，這個桌面世界還有許多像你一樣的冒險者...',
                    unlockCondition: { type: 'silver', value: 1000 },
                    rewards: { silver: 100, unlockCharacter: 1 }
                },
                {
                    id: 'main_3',
                    title: '建立家園',
                    content: '你們決定在這個桌面世界建立一個家園，一個屬於冒險者的避風港。',
                    unlockCondition: { type: 'homeLevel', value: 2 },
                    rewards: { silver: 200 }
                },
                {
                    id: 'main_4',
                    title: '第一次冒險',
                    content: '附近出現了一座神秘的地下城。是時候組隊進行第一次真正的冒險了！',
                    unlockCondition: { type: 'dungeon', value: 1 },
                    rewards: { silver: 300 }
                },
                {
                    id: 'main_5',
                    title: '寶藏獵人',
                    content: '你發現了一張古老的藏寶圖，上面標記著桌面世界中隱藏的寶藏位置...',
                    unlockCondition: { type: 'treasure', value: 1 },
                    rewards: { silver: 500 }
                }
            ],

            // 角色個人故事
            characters: {
                hero: [
                    {
                        id: 'hero_1',
                        title: '初心',
                        content: '你回憶起成為冒險者的初衷。是為了探索未知？還是為了保護重要的事物？',
                        unlockCondition: { type: 'level', value: 10 },
                        rewards: { exp: 500 }
                    },
                    {
                        id: 'hero_2',
                        title: '領袖之路',
                        content: '隨著實力的增長，越來越多的夥伴開始跟隨你的腳步。你意識到自己正在成為一位真正的領袖。',
                        unlockCondition: { type: 'level', value: 50 },
                        rewards: { exp: 2000 }
                    }
                ],
                mage: [
                    {
                        id: 'mage_1',
                        title: '魔法的起源',
                        content: '法師向你講述了桌面世界魔法的起源。原來每一次鍵盤敲擊都蘊含著魔力...',
                        unlockCondition: { type: 'unlock' },
                        rewards: { exp: 300 }
                    }
                ],
                archer: [
                    {
                        id: 'archer_1',
                        title: '百步穿楊',
                        content: '弓箭手分享了她在地下城中一箭射穿三個敵人的精彩故事。',
                        unlockCondition: { type: 'unlock' },
                        rewards: { exp: 300 }
                    }
                ]
            },

            // 事件故事
            events: {
                dungeon: [
                    {
                        id: 'dungeon_story_1',
                        title: '古老的遺跡',
                        content: '地下城深處發現了古老文明的遺跡，牆上的壁畫描繪著這個桌面世界曾經的輝煌...',
                        rewards: { silver: 100 }
                    },
                    {
                        id: 'dungeon_story_2',
                        title: '失落的寶物',
                        content: '在地下城的最深處，你找到了一件被遺忘已久的寶物。',
                        rewards: { silver: 200 }
                    }
                ],
                treasure: [
                    {
                        id: 'treasure_story_1',
                        title: '海盜的傳說',
                        content: '寶箱中除了金銀財寶，還有一封海盜船長的信件，講述了一個動人的故事...',
                        rewards: { silver: 150 }
                    }
                ],
                bandit: [
                    {
                        id: 'bandit_story_1',
                        title: '山賊的苦衷',
                        content: '擊敗山賊後，你發現他們並非本性兇惡，而是被生活所迫...',
                        rewards: { silver: 50 }
                    }
                ]
            }
        };
    }

    /**
     * 檢查並觸發故事
     */
    checkStories() {
        const newStories = [];

        // 檢查主線故事
        this.stories.main.forEach(story => {
            if (!this.isStoryUnlocked(story.id)) {
                if (this.checkUnlockCondition(story.unlockCondition)) {
                    this.unlockStory(story);
                    newStories.push(story);
                }
            }
        });

        // 檢查角色故事
        this.gameState.characters.forEach(char => {
            if (char.unlocked && this.stories.characters[char.type]) {
                this.stories.characters[char.type].forEach(story => {
                    if (!this.isStoryUnlocked(story.id)) {
                        const condition = story.unlockCondition;
                        if (condition.type === 'unlock' ||
                            (condition.type === 'level' && char.level >= condition.value)) {
                            this.unlockStory(story);
                            newStories.push(story);
                            char.storyProgress++;
                        }
                    }
                });
            }
        });

        return newStories;
    }

    /**
     * 檢查解鎖條件
     */
    checkUnlockCondition(condition) {
        switch (condition.type) {
            case 'start':
                return true;
            case 'silver':
                return this.gameState.silver >= condition.value;
            case 'homeLevel':
                return this.gameState.homeLevel >= condition.value;
            case 'dungeon':
                return this.gameState.stats.dungeonsCompleted >= condition.value;
            case 'treasure':
                return this.gameState.stats.treasuresFound >= condition.value;
            case 'bandits':
                return this.gameState.stats.banditsDefeated >= condition.value;
            default:
                return false;
        }
    }

    /**
     * 解鎖故事
     */
    unlockStory(story) {
        if (!this.isStoryUnlocked(story.id)) {
            this.unlockedStories.push(story.id);

            // 給予獎勵
            if (story.rewards) {
                if (story.rewards.silver) {
                    this.gameState.addSilver(story.rewards.silver);
                }
                if (story.rewards.exp) {
                    const hero = this.gameState.characters[0];
                    this.gameState.gainExp(hero.id, story.rewards.exp);
                }
                if (story.rewards.unlockCharacter !== undefined) {
                    const charIndex = story.rewards.unlockCharacter;
                    if (this.gameState.characters[charIndex]) {
                        this.gameState.characters[charIndex].unlocked = true;
                    }
                }
            }

            // 更新統計
            this.gameState.stats.storiesUnlocked++;

            console.log(`📖 故事解鎖: ${story.title}`);
            return true;
        }
        return false;
    }

    /**
     * 檢查故事是否已解鎖
     */
    isStoryUnlocked(storyId) {
        return this.unlockedStories.includes(storyId);
    }

    /**
     * 獲取隨機事件故事
     */
    getRandomEventStory(eventType) {
        const stories = this.stories.events[eventType];
        if (stories && stories.length > 0) {
            const randomIndex = Math.floor(Math.random() * stories.length);
            return stories[randomIndex];
        }
        return null;
    }

    /**
     * 獲取所有已解鎖的故事
     */
    getUnlockedStories() {
        const allStories = [];

        // 主線
        allStories.push(...this.stories.main.filter(s => this.isStoryUnlocked(s.id)));

        // 角色故事
        Object.values(this.stories.characters).forEach(charStories => {
            allStories.push(...charStories.filter(s => this.isStoryUnlocked(s.id)));
        });

        return allStories;
    }

    /**
     * 保存故事進度
     */
    getSaveData() {
        return {
            unlockedStories: this.unlockedStories
        };
    }

    /**
     * 載入故事進度
     */
    loadSaveData(data) {
        if (data && data.unlockedStories) {
            this.unlockedStories = data.unlockedStories;
        }
    }
}

module.exports = PlotManager;
