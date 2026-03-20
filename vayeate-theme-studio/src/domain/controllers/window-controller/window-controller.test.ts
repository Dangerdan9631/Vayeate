import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initialAppState } from '../../state/app-state';
import type { AppState } from '../../state/app-state';
import { AppStateGetter } from '../../state/app-state-getter';
import {
  CloseWindowController,
  MaximizeWindowController,
  RestoreWindowController,
  MinimizeWindowController,
  DragWindowController,
  ReloadWindowController,
  ForceReloadWindowController,
  ToggleDevToolsController,
} from '.';
import {
  CloseWindow,
  MaximizeWindow,
  RestoreWindow,
  MinimizeWindow,
  DragWindow,
  ReloadWindow,
  ToggleDevTools,
} from '../../operations/window-operations';

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

function mockStateGetter(overrides: Partial<Pick<AppState, 'window'>> = {}): AppStateGetter {
  const state: AppState = {
    ...initialAppState,
    ...overrides,
    window: { ...initialAppState.window, ...overrides.window },
  };
  return new AppStateGetter(() => state);
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

  it('CloseWindowController calls close', async () => {
    await new CloseWindowController(new CloseWindow()).run();
    expect(api.closeWindow).toHaveBeenCalledTimes(1);
  });

  it('MaximizeWindowController calls maximize when not already maximized', async () => {
    await new MaximizeWindowController(new MaximizeWindow(), mockStateGetter({ window: { ...initialAppState.window, isMaximized: false } })).run();
    expect(api.maximizeWindow).toHaveBeenCalledTimes(1);
  });

  it('MaximizeWindowController does not call maximize when already maximized', async () => {
    await new MaximizeWindowController(new MaximizeWindow(), mockStateGetter({ window: { ...initialAppState.window, isMaximized: true } })).run();
    expect(api.maximizeWindow).not.toHaveBeenCalled();
  });

  it('RestoreWindowController calls restore when maximized', async () => {
    await new RestoreWindowController(new RestoreWindow(), mockStateGetter({ window: { ...initialAppState.window, isMaximized: true, isMinimized: false } })).run();
    expect(api.restoreWindow).toHaveBeenCalledTimes(1);
  });

  it('RestoreWindowController does not call restore when not maximized or minimized', async () => {
    await new RestoreWindowController(new RestoreWindow(), mockStateGetter({ window: { ...initialAppState.window, isMaximized: false, isMinimized: false } })).run();
    expect(api.restoreWindow).not.toHaveBeenCalled();
  });

  it('MinimizeWindowController calls minimize when not already minimized', async () => {
    await new MinimizeWindowController(new MinimizeWindow(), mockStateGetter({ window: { ...initialAppState.window, isMinimized: false } })).run();
    expect(api.minimizeWindow).toHaveBeenCalledTimes(1);
  });

  it('MinimizeWindowController does not call minimize when already minimized', async () => {
    await new MinimizeWindowController(new MinimizeWindow(), mockStateGetter({ window: { ...initialAppState.window, isMinimized: true } })).run();
    expect(api.minimizeWindow).not.toHaveBeenCalled();
  });

  it('DragWindowController calls drag', async () => {
    await new DragWindowController(new DragWindow()).run();
    expect(api.dragWindow).toHaveBeenCalledTimes(1);
  });

  it('ReloadWindowController calls window reload', async () => {
    await new ReloadWindowController(new ReloadWindow()).run();
    expect(api.reloadWindow).toHaveBeenCalledTimes(1);
    expect(api.reloadWindowForce).not.toHaveBeenCalled();
  });

  it('ForceReloadWindowController calls window force reload', async () => {
    await new ForceReloadWindowController(new ReloadWindow()).run();
    expect(api.reloadWindowForce).toHaveBeenCalledTimes(1);
    expect(api.reloadWindow).not.toHaveBeenCalled();
  });

  it('ToggleDevToolsController calls toggleDevTools', async () => {
    await new ToggleDevToolsController(new ToggleDevTools()).run();
    expect(api.toggleDevTools).toHaveBeenCalledTimes(1);
  });
});
