import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isEyedropperSupported, pickColorFromScreen } from './eyedropper';

// Electron overlay (zoom, loupe, pixel feedback) is covered by manual QA; unit tests mock API and do not drive the overlay DOM.

describe('eyedropper', () => {
  const win = globalThis as unknown as Window & {
    EyeDropper?: unknown;
    electronAPI?: { eyedropperGetScreenSourcesWithBounds?: () => Promise<{ sources: unknown[]; fullBounds: unknown }> };
  };
  const originalEyeDropper = win.EyeDropper;
  const originalElectronAPI = win.electronAPI;

  afterEach(() => {
    win.EyeDropper = originalEyeDropper;
    win.electronAPI = originalElectronAPI;
  });

  describe('isEyedropperSupported', () => {
    it('returns false when EyeDropper and electronAPI eyedropper are missing', () => {
      delete win.EyeDropper;
      delete win.electronAPI;
      expect(isEyedropperSupported()).toBe(false);
    });

    it('returns true when electronAPI.eyedropperGetScreenSourcesWithBounds is present', () => {
      delete win.EyeDropper;
      win.electronAPI = {
        eyedropperGetScreenSourcesWithBounds: () =>
          Promise.resolve({ sources: [], fullBounds: { x: 0, y: 0, width: 0, height: 0 } }),
      } as unknown as Window['electronAPI'];
      expect(isEyedropperSupported()).toBe(true);
    });

    it('returns true when EyeDropper is on window', () => {
      win.electronAPI = undefined;
      const MockEyeDropper = class {
        open = () => Promise.resolve({ sRGBHex: '#000000' });
      };
      win.EyeDropper = MockEyeDropper as Window['EyeDropper'];
      expect(isEyedropperSupported()).toBe(true);
    });
  });

  describe('pickColorFromScreen', () => {
    beforeEach(() => {
      win.EyeDropper = undefined;
      win.electronAPI = undefined;
    });

    it('returns null when EyeDropper is not supported', async () => {
      const result = await pickColorFromScreen();
      expect(result).toBe(null);
    });

    it('returns sRGBHex when user selects a color (web EyeDropper)', async () => {
      const mockOpen = vi.fn().mockResolvedValue({ sRGBHex: '#aabbcc' });
      win.EyeDropper = class {
        open = mockOpen;
      } as Window['EyeDropper'];

      const result = await pickColorFromScreen();
      expect(mockOpen).toHaveBeenCalled();
      expect(result).toBe('#aabbcc');
    });

    it('returns null when user cancels (open rejects)', async () => {
      const mockOpen = vi.fn().mockRejectedValue(new Error('canceled'));
      win.EyeDropper = class {
        open = mockOpen;
      } as Window['EyeDropper'];

      const result = await pickColorFromScreen();
      expect(result).toBe(null);
    });

    it('returns null when open returns undefined result', async () => {
      const mockOpen = vi.fn().mockResolvedValue(undefined);
      win.EyeDropper = class {
        open = mockOpen;
      } as Window['EyeDropper'];

      const result = await pickColorFromScreen();
      expect(result).toBe(null);
    });
  });
});
