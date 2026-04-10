import { describe, it, expect, vi, afterEach } from 'vitest';
import { WindowService } from './window-service';

afterEach(() => {
  vi.restoreAllMocks();
  window.electronAPI = undefined;
});

describe('WindowService', () => {
  it('init registers window state IPC and forwards to deps; does not use onWindowResize/onWindowMove IPC', () => {
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
    const onWindowResize = vi.fn(() => () => {});
    const onWindowMove = vi.fn(() => () => {});
    window.electronAPI = {
      onWindowState,
      onWindowResize,
      onWindowMove,
      getWindowBounds: vi.fn(() => Promise.resolve({ x: 7, y: 8, width: 300, height: 400 })),
    } as unknown as NonNullable<typeof window.electronAPI>;

    const svc = new WindowService();
    svc.init(callbacks);

    expect(onWindowState).toHaveBeenCalled();
    expect(onWindowResize).not.toHaveBeenCalled();
    expect(onWindowMove).not.toHaveBeenCalled();
    expect(callbacks.onStateEvent).toHaveBeenCalledWith('minimized');
    expect(callbacks.onViewportResize).toHaveBeenCalled();
  });

  it('init hydrates initial bounds through callbacks when getWindowBounds exists', async () => {
    const getWindowBounds = vi.fn(() => Promise.resolve({ x: 10, y: 20, width: 111, height: 222 }));
    window.electronAPI = {
      onWindowState: vi.fn(() => () => {}),
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
    } as unknown as NonNullable<typeof window.electronAPI>;

    const svc = new WindowService();
    const callbacks = {
      onStateEvent: () => {},
      onViewportResize: () => {},
      onGlobalKeyDown: () => {},
    };
    svc.init(callbacks);
    svc.init(callbacks);
    expect(unsub1).toHaveBeenCalled();
  });

  it('dispose unsubscribes all listeners registered by the last init', () => {
    const unsubState = vi.fn();
    window.electronAPI = {
      onWindowState: vi.fn(() => unsubState),
    } as unknown as NonNullable<typeof window.electronAPI>;

    const svc = new WindowService();
    svc.init({
      onStateEvent: () => {},
      onViewportResize: () => {},
      onGlobalKeyDown: () => {},
    });
    svc.dispose();

    expect(unsubState).toHaveBeenCalledTimes(1);
  });
});
