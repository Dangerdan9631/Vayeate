import { describe, it, expect, vi, afterEach } from 'vitest';
import { WindowService } from './window-service';

afterEach(() => {
  vi.restoreAllMocks();
  window.electronAPI = undefined;
});

describe('WindowService', () => {
  it('init registers IPC listeners and forwards to deps', () => {
    const callbacks = {
      onStateEvent: vi.fn(),
      onResize: vi.fn(),
      onMove: vi.fn(),
      onViewportResize: vi.fn(),
      onGlobalKeyDown: vi.fn(),
    };
    const onWindowState = vi.fn((cb: (e: string) => void) => {
      cb('minimized');
      return () => {};
    });
    const onWindowResize = vi.fn((cb: (s: { width: number; height: number }) => void) => {
      cb({ width: 10, height: 20 });
      return () => {};
    });
    const onWindowMove = vi.fn((cb: (p: { x: number; y: number }) => void) => {
      cb({ x: 1, y: 2 });
      return () => {};
    });
    window.electronAPI = {
      onWindowState,
      onWindowResize,
      onWindowMove,
      getWindowBounds: vi.fn(() => Promise.resolve({ x: 7, y: 8, width: 300, height: 400 })),
    } as unknown as NonNullable<typeof window.electronAPI>;

    const svc = new WindowService();
    svc.init(callbacks);

    expect(onWindowState).toHaveBeenCalled();
    expect(onWindowResize).toHaveBeenCalled();
    expect(onWindowMove).toHaveBeenCalled();
    expect(callbacks.onStateEvent).toHaveBeenCalledWith('minimized');
    expect(callbacks.onResize).toHaveBeenCalledWith({ width: 10, height: 20 });
    expect(callbacks.onMove).toHaveBeenCalledWith({ x: 1, y: 2 });
    expect(callbacks.onViewportResize).toHaveBeenCalled();
  });

  it('init hydrates initial bounds through callbacks when getWindowBounds exists', async () => {
    const getWindowBounds = vi.fn(() => Promise.resolve({ x: 10, y: 20, width: 111, height: 222 }));
    window.electronAPI = {
      onWindowState: vi.fn(() => () => {}),
      onWindowResize: vi.fn(() => () => {}),
      onWindowMove: vi.fn(() => () => {}),
      getWindowBounds,
    } as unknown as NonNullable<typeof window.electronAPI>;
    const callbacks = {
      onStateEvent: vi.fn(),
      onResize: vi.fn(),
      onMove: vi.fn(),
      onViewportResize: vi.fn(),
      onGlobalKeyDown: vi.fn(),
    };

    const svc = new WindowService();
    svc.init(callbacks);

    await vi.waitFor(() => {
      expect(getWindowBounds).toHaveBeenCalledTimes(1);
      expect(callbacks.onMove).toHaveBeenCalledWith({ x: 10, y: 20 });
      expect(callbacks.onResize).toHaveBeenCalledWith({ width: 111, height: 222 });
    });
  });

  it('init unsubscribes previous listeners before re-registering', () => {
    const unsub1 = vi.fn();
    const unsub2 = vi.fn();
    let call = 0;
    window.electronAPI = {
      onWindowState: vi.fn(() => {
        call += 1;
        return call === 1 ? unsub1 : unsub2;
      }),
      onWindowResize: vi.fn(() => () => {}),
      onWindowMove: vi.fn(() => () => {}),
    } as unknown as NonNullable<typeof window.electronAPI>;

    const svc = new WindowService();
    const callbacks = {
      onStateEvent: () => {},
      onResize: () => {},
      onMove: () => {},
      onViewportResize: () => {},
      onGlobalKeyDown: () => {},
    };
    svc.init(callbacks);
    svc.init(callbacks);
    expect(unsub1).toHaveBeenCalled();
  });

  it('dispose unsubscribes all listeners registered by the last init', () => {
    const unsubState = vi.fn();
    const unsubResize = vi.fn();
    const unsubMove = vi.fn();
    window.electronAPI = {
      onWindowState: vi.fn(() => unsubState),
      onWindowResize: vi.fn(() => unsubResize),
      onWindowMove: vi.fn(() => unsubMove),
    } as unknown as NonNullable<typeof window.electronAPI>;

    const svc = new WindowService();
    svc.init({
      onStateEvent: () => {},
      onResize: () => {},
      onMove: () => {},
      onViewportResize: () => {},
      onGlobalKeyDown: () => {},
    });
    svc.dispose();

    expect(unsubState).toHaveBeenCalledTimes(1);
    expect(unsubResize).toHaveBeenCalledTimes(1);
    expect(unsubMove).toHaveBeenCalledTimes(1);
  });
});
