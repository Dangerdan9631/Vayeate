import { describe, it, expect, vi, afterEach } from 'vitest';
import { LogService } from './log-service';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LogService', () => {
  it('log writes to console and forwards serialized args to sendLog', () => {
    const sendLog = vi.fn();
    window.electronAPI = { sendLog } as unknown as NonNullable<typeof window.electronAPI>;
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const svc = new LogService();
    svc.log('info', 'tag', 'a', 'b');
    expect(sendLog).toHaveBeenCalledWith('info', 'tag', ['a', 'b']);
  });

  it('log propagates errors from sendLog', () => {
    window.electronAPI = {
      sendLog: vi.fn(() => {
        throw new Error('ipc failed');
      }),
    } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new LogService();
    expect(() => svc.log('warn', 't', 'x')).toThrow('ipc failed');
  });

  it('init subscribes to main logs and mirrors to console', () => {
    let subscribed: ((level: 'debug' | 'info' | 'warn' | 'error', args: string[]) => void) | undefined;
    const onMainLog = vi.fn((cb: typeof subscribed) => {
      subscribed = cb;
    });
    window.electronAPI = { onMainLog } as unknown as NonNullable<typeof window.electronAPI>;
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    new LogService().init();

    expect(onMainLog).toHaveBeenCalled();
    subscribed?.('info', ['hello']);
    expect(infoSpy).toHaveBeenCalledWith('[Main]', 'hello');
  });

  it('init propagates errors when onMainLog throws', () => {
    window.electronAPI = {
      onMainLog: vi.fn(() => {
        throw new Error('ipc failed');
      }),
    } as unknown as NonNullable<typeof window.electronAPI>;
    expect(() => new LogService().init()).toThrow('ipc failed');
  });
});
