import { describe, it, expect, vi, afterEach } from 'vitest';
import { WebService } from './web-service';

afterEach(() => {
  vi.restoreAllMocks();
  window.electronAPI = undefined;
});

describe('WebService', () => {
  it('fetchUrl forwards to electronAPI.fetchUrl', async () => {
    const fetchUrl = vi.fn().mockResolvedValue('body');
    window.electronAPI = { fetchUrl } as unknown as NonNullable<typeof window.electronAPI>;
    const svc = new WebService();
    await expect(svc.fetchUrl('https://example.com/a')).resolves.toBe('body');
    expect(fetchUrl).toHaveBeenCalledWith('https://example.com/a');
  });

  it('throws when electronAPI is missing', async () => {
    window.electronAPI = undefined;
    const svc = new WebService();
    await expect(svc.fetchUrl('https://x')).rejects.toThrow(/Electron API not available/);
  });
});
