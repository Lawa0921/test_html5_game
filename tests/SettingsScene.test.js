/**
 * SettingsScene Integration Tests
 * Tests UI logic and interactions of the settings scene
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

const SettingsManager = require('../src/managers/SettingsManager.js');

describe('SettingsScene UI Logic', () => {
  let settingsManager;

  beforeEach(() => {
    localStorage.clear();
    settingsManager = new SettingsManager();
  });

  describe('Fullscreen Button Display Logic', () => {
    it('should show "Open" when fullscreen is false', () => {
      settingsManager.set('display', 'fullscreen', false);
      const buttonText = settingsManager.get('display', 'fullscreen') ? 'Close' : 'Open';
      expect(buttonText).toBe('Open');
    });

    it('should show "Close" when fullscreen is true', () => {
      settingsManager.set('display', 'fullscreen', true);
      const buttonText = settingsManager.get('display', 'fullscreen') ? 'Close' : 'Open';
      expect(buttonText).toBe('Close');
    });

    it('should toggle button text correctly on click', () => {
      // Initial: false, show "Open"
      settingsManager.set('display', 'fullscreen', false);
      let buttonText = settingsManager.get('display', 'fullscreen') ? 'Close' : 'Open';
      expect(buttonText).toBe('Open');

      // After click: toggle to true, should show "Close"
      settingsManager.toggleFullscreen();
      buttonText = settingsManager.get('display', 'fullscreen') ? 'Close' : 'Open';
      expect(buttonText).toBe('Close');

      // Click again: toggle to false, should show "Open"
      settingsManager.toggleFullscreen();
      buttonText = settingsManager.get('display', 'fullscreen') ? 'Close' : 'Open';
      expect(buttonText).toBe('Open');
    });
  });

  describe('Resolution Selector Logic', () => {
    it('should display current resolution', () => {
      const currentResolution = settingsManager.get('display', 'resolution');
      expect(currentResolution).toBe('1920x1080');
    });

    it('should cycle through resolutions', () => {
      const resolutions = settingsManager.supportedResolutions;
      const startIndex = resolutions.indexOf('1920x1080');

      // Next resolution
      const nextIndex = (startIndex + 1) % resolutions.length;
      const nextResolution = resolutions[nextIndex];
      settingsManager.setResolution(nextResolution);
      expect(settingsManager.get('display', 'resolution')).toBe(nextResolution);

      // Previous resolution
      const prevIndex = (nextIndex - 1 + resolutions.length) % resolutions.length;
      const prevResolution = resolutions[prevIndex];
      settingsManager.setResolution(prevResolution);
      expect(settingsManager.get('display', 'resolution')).toBe(prevResolution);
    });
  });

  describe('Volume Slider Logic', () => {
    it('should calculate slider position correctly (0-100%)', () => {
      settingsManager.setVolume('master', 0.5);
      const displayValue = Math.round(settingsManager.get('audio', 'masterVolume') * 100);
      expect(displayValue).toBe(50);
    });

    it('should display volume percentage correctly', () => {
      settingsManager.setVolume('bgm', 0.8);
      const displayText = `${Math.round(settingsManager.get('audio', 'bgmVolume') * 100)}%`;
      expect(displayText).toBe('80%');
    });

    it('should clamp slider value to 0-100% range', () => {
      settingsManager.setVolume('sfx', 1.5); // Out of range
      const value = settingsManager.get('audio', 'sfxVolume');
      expect(value).toBeLessThanOrEqual(1.0);
      expect(value).toBeGreaterThanOrEqual(0.0);
    });
  });

  describe('Settings Initialization', () => {
    it('should load correct default values on scene start', () => {
      expect(settingsManager.get('display', 'resolution')).toBe('1920x1080');
      expect(settingsManager.get('display', 'fullscreen')).toBe(false);
      expect(settingsManager.get('audio', 'masterVolume')).toBe(1.0);
      expect(settingsManager.get('audio', 'bgmVolume')).toBe(0.8);
      expect(settingsManager.get('audio', 'sfxVolume')).toBe(0.9);
    });

    it('should display correct fullscreen button text', () => {
      const isFullscreen = settingsManager.get('display', 'fullscreen');
      const expectedText = isFullscreen ? 'Close' : 'Open';
      expect(expectedText).toBe('Open'); // Default is false, so show "Open"
    });
  });

  describe('Reset Functionality', () => {
    it('should restore all default values after reset', () => {
      // Modify settings
      settingsManager.setVolume('master', 0.3);
      settingsManager.setResolution('800x600');
      settingsManager.set('display', 'fullscreen', true);

      // Reset
      settingsManager.resetToDefaults();

      // Verify
      expect(settingsManager.get('audio', 'masterVolume')).toBe(1.0);
      expect(settingsManager.get('display', 'resolution')).toBe('1920x1080');
      expect(settingsManager.get('display', 'fullscreen')).toBe(false);
    });

    it('should show "Open" for fullscreen button after reset', () => {
      settingsManager.set('display', 'fullscreen', true);
      settingsManager.resetToDefaults();

      const buttonText = settingsManager.get('display', 'fullscreen') ? 'Close' : 'Open';
      expect(buttonText).toBe('Open');
    });
  });

  describe('Settings Persistence', () => {
    it('should auto-save after modifying settings', () => {
      settingsManager.setVolume('master', 0.7);
      const saved = localStorage.getItem('gameSettings');
      expect(saved).not.toBeNull();
    });

    it('should persist settings after scene closes', () => {
      settingsManager.setVolume('master', 0.6);
      settingsManager.setResolution('1280x720');

      // Simulate scene reload
      const newManager = new SettingsManager();
      expect(newManager.get('audio', 'masterVolume')).toBe(0.6);
      expect(newManager.get('display', 'resolution')).toBe('1280x720');
    });
  });

  describe('Real-time Volume Updates', () => {
    it('should affect actual BGM volume when adjusting master volume', () => {
      settingsManager.setVolume('master', 0.5);
      settingsManager.setVolume('bgm', 0.8);

      const actualVolume = settingsManager.getActualVolume('bgm');
      expect(actualVolume).toBe(0.4); // 0.5 * 0.8
    });

    it('should not affect SFX volume when adjusting BGM volume', () => {
      const originalSfxVolume = settingsManager.get('audio', 'sfxVolume');
      settingsManager.setVolume('bgm', 0.3);

      expect(settingsManager.get('audio', 'sfxVolume')).toBe(originalSfxVolume);
    });
  });
});
