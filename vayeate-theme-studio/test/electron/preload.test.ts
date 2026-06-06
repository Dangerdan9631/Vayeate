import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const exposeInMainWorld = vi.fn();
const invoke = vi.fn();
const send = vi.fn();
const on = vi.fn();
const removeListener = vi.fn();

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld,
  },
  ipcRenderer: {
    invoke,
    send,
    on,
    removeListener,
  },
}));

describe('electron preload bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('exposes the expected Electron API surface in the renderer', async () => {
    await import('../../electron/preload');

    expect(exposeInMainWorld).toHaveBeenCalledTimes(1);
    const [key, api] = exposeInMainWorld.mock.calls[0] as [string, Record<string, (...args: unknown[]) => unknown>];
    expect(key).toBe('electronAPI');

    await api.fetchUrl('https://example.test');
    await api.fsSaveFile('data/test.json', '{}');
    api.sendLog('info', 'tag', ['message']);

    expect(invoke).toHaveBeenCalledWith('net:fetch', 'https://example.test');
    expect(invoke).toHaveBeenCalledWith('fs:saveFile', 'data/test.json', '{}');
    expect(send).toHaveBeenCalledWith('renderer-log', 'info', 'tag', ['message']);
  });

  it('returns unsubscribe handlers for window event subscriptions', async () => {
    await import('../../electron/preload');
    const [, api] = exposeInMainWorld.mock.calls[0] as [string, Record<string, (...args: unknown[]) => unknown>];

    const unsubscribe = api.onWindowState(vi.fn()) as () => void;

    expect(on).toHaveBeenCalledWith('window:minimized', expect.any(Function));
    expect(on).toHaveBeenCalledWith('window:maximized', expect.any(Function));
    expect(on).toHaveBeenCalledWith('window:unmaximized', expect.any(Function));
    expect(on).toHaveBeenCalledWith('window:restored', expect.any(Function));

    unsubscribe();

    expect(removeListener).toHaveBeenCalledTimes(4);
  });
});
