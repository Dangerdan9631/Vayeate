import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  closeWindow,
  maximizeWindow,
  restoreWindow,
  minimizeWindow,
  dragWindow,
  reloadWindow,
  forceReloadWindow,
  toggleDevTools,
} from '.';

type WindowAPI = {
  closeWindow?: () => Promise<void>;
  minimizeWindow?: () => Promise<void>;
  maximizeWindow?: () => Promise<void>;
  restoreWindow?: () => Promise<void>;
  dragWindow?: () => Promise<void>;
  reloadWindow?: () => Promise<void>;
  reloadWindowForce?: () => Promise<void>;
  toggleDevTools?: () => Promise<void>;
};

describe('window-controller', () => {
  let api: Record<keyof WindowAPI, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    api = {
      closeWindow: vi.fn().mockResolvedValue(undefined),
      minimizeWindow: vi.fn().mockResolvedValue(undefined),
      maximizeWindow: vi.fn().mockResolvedValue(undefined),
      restoreWindow: vi.fn().mockResolvedValue(undefined),
      dragWindow: vi.fn().mockResolvedValue(undefined),
      reloadWindow: vi.fn().mockResolvedValue(undefined),
      reloadWindowForce: vi.fn().mockResolvedValue(undefined),
      toggleDevTools: vi.fn().mockResolvedValue(undefined),
    };
    (window as unknown as { electronAPI?: WindowAPI }).electronAPI = api;
  });

  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  });

  it('closeWindow calls close', async () => {
    await closeWindow();
    expect(api.closeWindow).toHaveBeenCalledTimes(1);
  });

  it('maximizeWindow calls maximize', async () => {
    await maximizeWindow();
    expect(api.maximizeWindow).toHaveBeenCalledTimes(1);
  });

  it('restoreWindow calls restore', async () => {
    await restoreWindow();
    expect(api.restoreWindow).toHaveBeenCalledTimes(1);
  });

  it('minimizeWindow calls minimize', async () => {
    await minimizeWindow();
    expect(api.minimizeWindow).toHaveBeenCalledTimes(1);
  });

  it('dragWindow calls drag', async () => {
    await dragWindow();
    expect(api.dragWindow).toHaveBeenCalledTimes(1);
  });

  it('reloadWindow() calls window reload', async () => {
    await reloadWindow();
    expect(api.reloadWindow).toHaveBeenCalledTimes(1);
    expect(api.reloadWindowForce).not.toHaveBeenCalled();
  });

  it('forceReloadWindow calls window force reload', async () => {
    await forceReloadWindow();
    expect(api.reloadWindowForce).toHaveBeenCalledTimes(1);
    expect(api.reloadWindow).not.toHaveBeenCalled();
  });

  it('toggleDevTools calls toggleDevTools', async () => {
    await toggleDevTools();
    expect(api.toggleDevTools).toHaveBeenCalledTimes(1);
  });
});
