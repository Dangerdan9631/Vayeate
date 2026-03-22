import { describe, it, expect, vi, afterEach } from 'vitest';
import { TokenSyncGateway } from './token-sync-gateway';
import type { WebService } from '../services/web-service';

afterEach(() => {
  vi.restoreAllMocks();
});

function createWebMock(partial: Partial<{ fetchUrl: WebService['fetchUrl'] }> = {}): WebService {
  return {
    fetchUrl: vi.fn().mockResolvedValue(''),
    ...partial,
  } as unknown as WebService;
}

describe('TokenSyncGateway', () => {
  it('sync with empty sources does not call fetchUrl', async () => {
    const fetchUrl = vi.fn();
    const gw = new TokenSyncGateway(createWebMock({ fetchUrl }));
    const result = await gw.sync([]);
    expect(fetchUrl).not.toHaveBeenCalled();
    expect(result.tokens).toEqual([]);
    expect(result.semanticTokenTypes).toEqual([]);
    expect(result.semanticTokenModifiers).toEqual([]);
    expect(result.semanticTokenLanguages).toEqual([]);
  });

  it('sync delegates fetch to webService.fetchUrl for default sources', async () => {
    const fetchUrl = vi.fn().mockResolvedValue('Use `editor.foreground` for text.');
    const gw = new TokenSyncGateway(createWebMock({ fetchUrl }));
    const sources = [
      {
        type: 'default' as const,
        url: 'https://example.com/doc.md',
        tokenType: 'theme' as const,
      },
    ];
    const result = await gw.sync(sources);
    expect(fetchUrl).toHaveBeenCalledTimes(1);
    expect(fetchUrl).toHaveBeenCalledWith('https://example.com/doc.md');
    expect(result.tokens).toContainEqual({ key: 'editor.foreground', type: 'theme' });
  });
});
