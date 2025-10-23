/**
 * 戰鬥場景 - 2D 回合制戰鬥
 */
class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
        this.hero = null;
        this.enemy = null;
        this.battleUI = null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // 設定背景
        this.createBackground();

        // 創建戰鬥角色
        this.createCharacters();

        // 創建 UI
        this.createUI();

        // 測試動畫
        this.startBattleIntro();
    }

    createBackground() {
        const { width, height } = this.cameras.main;

        // 漸層背景
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, width, height);

        // 地面線
        const ground = this.add.graphics();
        ground.lineStyle(2, 0x0f3460, 1);
        ground.lineBetween(0, height * 0.7, width, height * 0.7);

        // 標題
        this.add.text(width / 2, 50, '戰鬥場景', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createCharacters() {
        const { width, height } = this.cameras.main;

        // 英雄（左側）
        this.hero = this.createCharacter({
            x: width * 0.25,
            y: height * 0.5,
            color: 0x00ff00,
            name: '勇者',
            hp: 100,
            maxHp: 100,
            isHero: true
        });

        // 敵人（右側）
        this.enemy = this.createCharacter({
            x: width * 0.75,
            y: height * 0.5,
            color: 0xff0000,
            name: '哥布林',
            hp: 50,
            maxHp: 50,
            isHero: false
        });
    }

    createCharacter(config) {
        // 創建角色精靈（暫時用簡單圖形代替）
        const sprite = this.add.circle(config.x, config.y, 50, config.color);

        // 角色名稱
        const nameText = this.add.text(config.x, config.y - 80, config.name, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 血條背景
        const hpBarBg = this.add.rectangle(config.x, config.y + 70, 100, 10, 0x333333);

        // 血條
        const hpBar = this.add.rectangle(config.x - 50, config.y + 70, 100, 10, 0xff0000)
            .setOrigin(0, 0.5);

        // HP 文字
        const hpText = this.add.text(config.x, config.y + 90, `${config.hp}/${config.maxHp}`, {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 返回角色對象
        return {
            sprite,
            nameText,
            hpBar,
            hpBarBg,
            hpText,
            hp: config.hp,
            maxHp: config.maxHp,
            name: config.name,
            isHero: config.isHero,

            // 更新 HP 顯示
            updateHP(newHp) {
                this.hp = Math.max(0, Math.min(newHp, this.maxHp));
                const hpPercent = this.hp / this.maxHp;
                this.hpBar.width = 100 * hpPercent;
                this.hpText.setText(`${this.hp}/${this.maxHp}`);

                // 血條顏色變化
                if (hpPercent > 0.5) {
                    this.hpBar.setFillStyle(0x00ff00);
                } else if (hpPercent > 0.25) {
                    this.hpBar.setFillStyle(0xffff00);
                } else {
                    this.hpBar.setFillStyle(0xff0000);
                }
            },

            // 播放受傷動畫
            playHurtAnimation(scene) {
                scene.tweens.add({
                    targets: this.sprite,
                    x: this.sprite.x + (this.isHero ? 20 : -20),
                    duration: 100,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        this.sprite.setAlpha(1);
                    }
                });

                // 閃爍效果
                scene.tweens.add({
                    targets: this.sprite,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true,
                    repeat: 3
                });
            },

            // 播放攻擊動畫
            playAttackAnimation(scene, target) {
                const startX = this.sprite.x;
                const targetX = target.sprite.x + (this.isHero ? 100 : -100);

                scene.tweens.add({
                    targets: this.sprite,
                    x: targetX,
                    duration: 300,
                    ease: 'Power2',
                    yoyo: true,
                    onYoyo: () => {
                        target.playHurtAnimation(scene);
                    }
                });
            }
        };
    }

    createUI() {
        const { width, height } = this.cameras.main;

        // UI 容器
        const uiContainer = this.add.container(0, height - 150);

        // UI 背景
        const uiBg = this.add.rectangle(0, 0, width, 150, 0x000000, 0.7)
            .setOrigin(0, 0);

        // 技能按鈕
        const attackBtn = this.createButton(width / 2 - 100, 75, '攻擊', () => {
            this.onAttack();
        });

        const skillBtn = this.createButton(width / 2 + 100, 75, '技能', () => {
            this.onSkill();
        });

        uiContainer.add([uiBg, attackBtn.bg, attackBtn.text, skillBtn.bg, skillBtn.text]);

        this.battleUI = uiContainer;
    }

    createButton(x, y, text, callback) {
        const bg = this.add.rectangle(x, y, 150, 50, 0x4a90e2)
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(x, y, text, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 按鈕互動
        bg.on('pointerover', () => bg.setFillStyle(0x5da3f5));
        bg.on('pointerout', () => bg.setFillStyle(0x4a90e2));
        bg.on('pointerdown', () => {
            bg.setFillStyle(0x3a7ac2);
            callback();
        });
        bg.on('pointerup', () => bg.setFillStyle(0x5da3f5));

        return { bg, text: label };
    }

    onAttack() {
        console.log('英雄攻擊！');
        this.disableUI();

        // 播放攻擊動畫
        this.hero.playAttackAnimation(this, this.enemy);

        // 計算傷害
        const damage = Phaser.Math.Between(10, 20);

        // 延遲顯示傷害（等待動畫）
        this.time.delayedCall(300, () => {
            this.showDamageNumber(this.enemy.sprite.x, this.enemy.sprite.y, damage);
            this.enemy.updateHP(this.enemy.hp - damage);

            // 檢查敵人是否死亡
            if (this.enemy.hp <= 0) {
                this.onVictory();
            } else {
                // 敵人反擊
                this.time.delayedCall(1000, () => {
                    this.enemyTurn();
                });
            }
        });
    }

    onSkill() {
        console.log('使用技能！');
        this.disableUI();

        // 火球特效
        this.createFireballEffect(this.hero.sprite.x, this.hero.sprite.y, this.enemy.sprite.x, this.enemy.sprite.y);

        const damage = Phaser.Math.Between(25, 35);

        this.time.delayedCall(500, () => {
            this.showDamageNumber(this.enemy.sprite.x, this.enemy.sprite.y, damage);
            this.enemy.updateHP(this.enemy.hp - damage);
            this.enemy.playHurtAnimation(this);

            if (this.enemy.hp <= 0) {
                this.onVictory();
            } else {
                this.time.delayedCall(1000, () => {
                    this.enemyTurn();
                });
            }
        });
    }

    enemyTurn() {
        console.log('敵人回合');

        this.enemy.playAttackAnimation(this, this.hero);

        const damage = Phaser.Math.Between(5, 15);

        this.time.delayedCall(300, () => {
            this.showDamageNumber(this.hero.sprite.x, this.hero.sprite.y, damage);
            this.hero.updateHP(this.hero.hp - damage);

            if (this.hero.hp <= 0) {
                this.onDefeat();
            } else {
                this.enableUI();
            }
        });
    }

    showDamageNumber(x, y, damage) {
        const damageText = this.add.text(x, y - 50, `-${damage}`, {
            fontSize: '32px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 傷害數字動畫
        this.tweens.add({
            targets: damageText,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    createFireballEffect(fromX, fromY, toX, toY) {
        const fireball = this.add.circle(fromX, fromY, 15, 0xff6600);

        this.tweens.add({
            targets: fireball,
            x: toX,
            y: toY,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // 爆炸效果
                const explosion = this.add.circle(toX, toY, 50, 0xff0000, 0.5);
                this.tweens.add({
                    targets: explosion,
                    scale: 2,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        explosion.destroy();
                        fireball.destroy();
                    }
                });
            }
        });
    }

    startBattleIntro() {
        console.log('戰鬥開始！');

        // 入場動畫
        this.hero.sprite.setAlpha(0);
        this.enemy.sprite.setAlpha(0);

        this.tweens.add({
            targets: this.hero.sprite,
            alpha: 1,
            duration: 500
        });

        this.tweens.add({
            targets: this.enemy.sprite,
            alpha: 1,
            duration: 500,
            delay: 200
        });

        this.disableUI();
        this.time.delayedCall(1000, () => {
            this.enableUI();
        });
    }

    onVictory() {
        console.log('勝利！');
        this.disableUI();

        // 敵人消失動畫
        this.tweens.add({
            targets: [this.enemy.sprite, this.enemy.nameText, this.enemy.hpBar, this.enemy.hpBarBg, this.enemy.hpText],
            alpha: 0,
            duration: 500
        });

        const victoryText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '勝利！', {
            fontSize: '64px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            scale: 1.2,
            duration: 500,
            ease: 'Back.out'
        });
    }

    onDefeat() {
        console.log('失敗...');
        this.disableUI();

        const defeatText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '失敗...', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: defeatText,
            alpha: 1,
            duration: 500
        });
    }

    disableUI() {
        if (this.battleUI) {
            this.battleUI.setAlpha(0.5);
            this.battleUI.list.forEach(item => {
                if (item.input) {
                    item.disableInteractive();
                }
            });
        }
    }

    enableUI() {
        if (this.battleUI) {
            this.battleUI.setAlpha(1);
            this.battleUI.list.forEach(item => {
                if (item.input !== undefined) {
                    item.setInteractive({ useHandCursor: true });
                }
            });
        }
    }
}

module.exports = BattleScene;
