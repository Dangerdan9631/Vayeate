import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initialAppState } from '../../state/app-state';
import type { AppState } from '../../state/app-state';
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

function mockGetState(overrides: Partial<Pick<AppState, 'window'>> = {}): () => AppState {
  const state: AppState = {
    ...initialAppState,
    ...overrides,
    window: { ...initialAppState.window, ...overrides.window },
  };
  return () => state;
}

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

  it('maximizeWindow calls maximize when not already maximized', async () => {
    await maximizeWindow(mockGetState({ window: { ...initialAppState.window, isMaximized: false } }));
    expect(api.maximizeWindow).toHaveBeenCalledTimes(1);
  });

  it('maximizeWindow does not call maximize when already maximized', async () => {
    await maximizeWindow(mockGetState({ window: { ...initialAppState.window, isMaximized: true } }));
    expect(api.maximizeWindow).not.toHaveBeenCalled();
  });

  it('restoreWindow calls restore when maximized', async () => {
    await restoreWindow(mockGetState({ window: { ...initialAppState.window, isMaximized: true, isMinimized: false } }));
    expect(api.restoreWindow).toHaveBeenCalledTimes(1);
  });

  it('restoreWindow does not call restore when not maximized or minimized', async () => {
    await restoreWindow(mockGetState({ window: { ...initialAppState.window, isMaximized: false, isMinimized: false } }));
    expect(api.restoreWindow).not.toHaveBeenCalled();
  });

  it('minimizeWindow calls minimize when not already minimized', async () => {
    await minimizeWindow(mockGetState({ window: { ...initialAppState.window, isMinimized: false } }));
    expect(api.minimizeWindow).toHaveBeenCalledTimes(1);
  });

  it('minimizeWindow does not call minimize when already minimized', async () => {
    await minimizeWindow(mockGetState({ window: { ...initialAppState.window, isMinimized: true } }));
    expect(api.minimizeWindow).not.toHaveBeenCalled();
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
