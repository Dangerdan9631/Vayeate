import { describe, it, expect, afterEach } from 'vitest';
import {
  clampEyedropperZoom,
  clampEyedropperZoomToFitRange,
  clientToCanvasFloat,
  clientToCanvasPixel,
  eyedropperZoomFitContain,
  isEyedropperSupported,
  loupeCrosshairCenter,
  loupeFixedPosition,
  loupeSourceRect,
  rgbToHex,
} from './eyedropper';

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

  describe('clientToCanvasFloat', () => {
    it('maps center to half canvas dimensions', () => {
      const el = document.createElement('canvas');
      el.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 100, height: 50, right: 100, bottom: 50, x: 0, y: 0, toJSON: () => {} } as DOMRect);
      const r = clientToCanvasFloat(50, 25, el, 200, 100);
      expect(r).toEqual({ fx: 100, fy: 50 });
    });
  });

  describe('clampEyedropperZoom', () => {
    it('clamps to min/max', () => {
      expect(clampEyedropperZoom(0.5)).toBe(1);
      expect(clampEyedropperZoom(100)).toBe(8);
    });
  });

  describe('eyedropperZoomFitContain', () => {
    it('returns contain scale', () => {
      expect(eyedropperZoomFitContain(800, 600, 1600, 1200)).toBe(0.5);
      expect(eyedropperZoomFitContain(800, 600, 400, 300)).toBe(2);
    });
  });

  describe('clampEyedropperZoomToFitRange', () => {
    it('clamps relative to zFit; min is exactly fit', () => {
      const zf = 0.5;
      expect(clampEyedropperZoomToFitRange(0.01, zf)).toBeCloseTo(zf);
      expect(clampEyedropperZoomToFitRange(100, zf)).toBeCloseTo(zf * 8);
    });
  });

  describe('loupeSourceRect', () => {
    it('returns full side when away from edges', () => {
      expect(loupeSourceRect(50, 50, 2, 100, 100)).toEqual({ sx: 48, sy: 48, sw: 5, sh: 5 });
    });

    it('clamps at top-left', () => {
      expect(loupeSourceRect(1, 1, 2, 10, 10)).toEqual({ sx: 0, sy: 0, sw: 5, sh: 5 });
    });
  });

  describe('loupeCrosshairCenter', () => {
    it('places center on cursor cell', () => {
      const { cx, cy } = loupeCrosshairCenter(5, 5, 0, 0, 11, 11, 110);
      expect(cx).toBeCloseTo(55);
      expect(cy).toBeCloseTo(55);
    });
  });

  describe('loupeFixedPosition', () => {
    it('keeps loupe inside viewport', () => {
      const { left, top } = loupeFixedPosition(100, 100, 120, 400, 300);
      expect(left + 120).toBeLessThanOrEqual(400);
      expect(top + 120).toBeLessThanOrEqual(300);
      expect(left).toBeGreaterThanOrEqual(8);
    });
  });
});
