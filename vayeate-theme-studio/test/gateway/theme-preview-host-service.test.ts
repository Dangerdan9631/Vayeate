import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemePreviewHostService } from '../../src/gateway/services/Common/theme-preview-host-service';

describe('ThemePreviewHostService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the Electron bridge to build and launch the selected theme preview host', async () => {
    const openThemePreviewHost = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('window', {
      electronAPI: { openThemePreviewHost },
    });

    await new ThemePreviewHostService().open('Demo');

    expect(openThemePreviewHost).toHaveBeenCalledWith({ displayName: 'Demo' });
  });
});
