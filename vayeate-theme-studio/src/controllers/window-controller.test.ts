import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleViewMenuReload,
  handleViewMenuForceReload,
  handleViewMenuToggleDevTools,
} from './window-controller';

describe('window-controller', () => {
  let reloadMock: ReturnType<typeof vi.fn>;
  let reloadForceMock: ReturnType<typeof vi.fn>;
  let toggleDevToolsMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    reloadMock = vi.fn().mockResolvedValue(undefined);
    reloadForceMock = vi.fn().mockResolvedValue(undefined);
    toggleDevToolsMock = vi.fn().mockResolvedValue(undefined);
    (window as unknown as { electronAPI?: { reloadWindow?: () => Promise<void>; reloadWindowForce?: () => Promise<void>; toggleDevTools?: () => Promise<void> } }).electronAPI = {
      reloadWindow: reloadMock,
      reloadWindowForce: reloadForceMock,
      toggleDevTools: toggleDevToolsMock,
    };
  });

  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  });

  it('handleViewMenuReload calls window reload', async () => {
    await handleViewMenuReload();
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('handleViewMenuForceReload calls window force reload', async () => {
    await handleViewMenuForceReload();
    expect(reloadForceMock).toHaveBeenCalledTimes(1);
  });

  it('handleViewMenuToggleDevTools calls toggleDevTools', async () => {
    await handleViewMenuToggleDevTools();
    expect(toggleDevToolsMock).toHaveBeenCalledTimes(1);
  });
});
