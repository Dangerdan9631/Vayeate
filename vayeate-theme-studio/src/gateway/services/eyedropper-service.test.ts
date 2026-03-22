import { describe, it, expect, vi, afterEach } from 'vitest';
import { EyedropperService } from './eyedropper-service';

afterEach(() => {
  vi.restoreAllMocks();
  window.electronAPI = undefined;
});

describe('EyedropperService', () => {
  it('isAvailable is false when eyedropper API is missing', () => {
    window.electronAPI = {} as unknown as NonNullable<typeof window.electronAPI>;
    expect(new EyedropperService().isAvailable()).toBe(false);
  });

  it('isAvailable is true when eyedropper API is present', () => {
    window.electronAPI = {
      eyedropperGetScreenSourcesWithBounds: vi.fn(),
    } as unknown as NonNullable<typeof window.electronAPI>;
    expect(new EyedropperService().isAvailable()).toBe(true);
  });

  it('getScreenSourcesWithBounds calls electron API', async () => {
    const payload = {
      sources: [],
      fullBounds: { x: 0, y: 0, width: 1920, height: 1080 },
    };
    const eyedropperGetScreenSourcesWithBounds = vi.fn().mockResolvedValue(payload);
    window.electronAPI = { eyedropperGetScreenSourcesWithBounds } as unknown as NonNullable<
      typeof window.electronAPI
    >;
    await expect(new EyedropperService().getScreenSourcesWithBounds()).resolves.toEqual(payload);
    expect(eyedropperGetScreenSourcesWithBounds).toHaveBeenCalledOnce();
  });

  it('getScreenSourcesWithBounds throws when API is missing', async () => {
    window.electronAPI = {} as unknown as NonNullable<typeof window.electronAPI>;
    await expect(new EyedropperService().getScreenSourcesWithBounds()).rejects.toThrow(
      'Electron eyedropper API is not available.',
    );
  });
});
