/**
 * 音效管理器
 * 負責管理遊戲中的所有音效和音樂
 */
class AudioManager {
    constructor(scene, gameState) {
        this.scene = scene;
        this.gameState = gameState;

        // 音效和音樂對象
        this.music = null;
        this.sounds = {};

        // 當前音量
        this.volume = gameState.settings?.volume ?? 1.0;
        this.musicEnabled = gameState.settings?.musicEnabled ?? true;
        this.sfxEnabled = gameState.settings?.sfxEnabled ?? true;

        // 初始化
        this.initialize();
    }

    /**
     * 初始化音效系統
     */
    initialize() {
        // 目前音效資源尚未載入,暫時創建佔位符
        // 實際音效需要在 BootScene 中使用 this.load.audio() 載入

        console.log('AudioManager initialized');
        console.log('Volume:', this.volume);
        console.log('Music enabled:', this.musicEnabled);
        console.log('SFX enabled:', this.sfxEnabled);
    }

    /**
     * 播放背景音樂
     */
    playMusic(key) {
        if (!this.musicEnabled) return;

        // 停止當前音樂
        if (this.music) {
            this.music.stop();
        }

        // 檢查音效是否已載入
        if (this.scene.cache.audio.exists(key)) {
            this.music = this.scene.sound.add(key, {
                volume: this.volume,
                loop: true
            });
            this.music.play();
        } else {
            console.warn(`Music '${key}' not found. Please load it in BootScene.`);
        }
    }

    /**
     * 停止背景音樂
     */
    stopMusic() {
        if (this.music) {
            this.music.stop();
        }
    }

    /**
     * 暫停背景音樂
     */
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }

    /**
     * 恢復背景音樂
     */
    resumeMusic() {
        if (this.music) {
            this.music.resume();
        }
    }

    /**
     * 播放音效
     */
    playSFX(key, options = {}) {
        if (!this.sfxEnabled) return;

        // 檢查音效是否已載入
        if (this.scene.cache.audio.exists(key)) {
            const sound = this.scene.sound.add(key, {
                volume: this.volume * (options.volume || 1.0),
                loop: options.loop || false
            });
            sound.play();

            // 如果需要保存引用
            if (options.name) {
                this.sounds[options.name] = sound;
            }

            return sound;
        } else {
            console.warn(`Sound '${key}' not found. Please load it in BootScene.`);
            return null;
        }
    }

    /**
     * 停止音效
     */
    stopSFX(name) {
        if (this.sounds[name]) {
            this.sounds[name].stop();
            delete this.sounds[name];
        }
    }

    /**
     * 停止所有音效
     */
    stopAllSFX() {
        Object.keys(this.sounds).forEach(name => {
            this.stopSFX(name);
        });
    }

    /**
     * 設置主音量
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));

        // 更新背景音樂音量
        if (this.music) {
            this.music.setVolume(this.volume);
        }

        // 更新所有音效音量
        Object.values(this.sounds).forEach(sound => {
            sound.setVolume(this.volume);
        });

        // 更新遊戲狀態
        this.gameState.updateSettings({ volume: this.volume });
    }

    /**
     * 切換音樂開關
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if (this.musicEnabled) {
            this.resumeMusic();
        } else {
            this.pauseMusic();
        }

        this.gameState.updateSettings({ musicEnabled: this.musicEnabled });
    }

    /**
     * 切換音效開關
     */
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        this.gameState.updateSettings({ sfxEnabled: this.sfxEnabled });
    }

    /**
     * 清理
     */
    destroy() {
        this.stopMusic();
        this.stopAllSFX();
    }
}

module.exports = AudioManager;
