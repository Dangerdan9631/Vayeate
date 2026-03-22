import { describe, it, expect, afterEach } from 'vitest';
import { clientToCanvasPixel, isEyedropperSupported, rgbToHex } from './eyedropper';

describe('eyedropper utils', () => {
  const win = globalThis as unknown as Window & {
    electronAPI?: { screenshotGetFullDisplaySnapshot?: () => Promise<unknown> };
  };
  const originalElectronAPI = win.electronAPI;

  afterEach(() => {
    win.electronAPI = originalElectronAPI;
  });

  describe('isEyedropperSupported', () => {
    it('returns false when screenshot API is missing', () => {
      delete win.electronAPI;
      expect(isEyedropperSupported()).toBe(false);
    });

    it('returns true when screenshotGetFullDisplaySnapshot is present', () => {
      win.electronAPI = {
        screenshotGetFullDisplaySnapshot: () =>
          Promise.resolve({
            fullBounds: { x: 0, y: 0, width: 1, height: 1 },
            displays: [],
          }),
      } as unknown as NonNullable<Window['electronAPI']>;
      expect(isEyedropperSupported()).toBe(true);
    });
  });

  describe('rgbToHex', () => {
    it('returns lowercase hex with hash', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(10, 20, 30)).toBe('#0a141e');
    });
  });

  describe('clientToCanvasPixel', () => {
    it('maps center of wrapper to canvas center', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 100, height: 50, right: 100, bottom: 50, x: 0, y: 0, toJSON: () => {} } as DOMRect);
      expect(clientToCanvasPixel(50, 25, el, 200, 100)).toEqual({ px: 100, py: 50 });
    });

    it('returns null when outside wrapper', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () =>
        ({ left: 10, top: 10, width: 20, height: 20, right: 30, bottom: 30, x: 10, y: 10, toJSON: () => {} } as DOMRect);
      expect(clientToCanvasPixel(5, 15, el, 100, 100)).toBe(null);
    });
  });
});
