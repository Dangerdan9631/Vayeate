import { describe, it, expect, vi, afterEach } from 'vitest';
import { LogService } from './log-service';

afterEach(() => {
  vi.restoreAllMocks();
  window.electronAPI = undefined;
});

describe('LogService', () => {
  it('send forwards to electronAPI.sendLog', () => {
    const sendLog = vi.fn();
    window.electronAPI = { sendLog } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new LogService();
    svc.send('info', 'tag', ['a', 'b']);
    expect(sendLog).toHaveBeenCalledWith('info', 'tag', ['a', 'b']);
  });

  it('send swallows errors from sendLog', () => {
    window.electronAPI = {
      sendLog: vi.fn(() => {
        throw new Error('ipc failed');
      }),
    } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new LogService();
    expect(() => svc.send('warn', 't', [])).not.toThrow();
  });
});
