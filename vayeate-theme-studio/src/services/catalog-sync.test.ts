import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncCatalogTokens } from './catalog-sync';
import type { Source } from '../model/schemas';

function mockFetch(body: string, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    text: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch(''));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('syncCatalogTokens', () => {
  it('returns empty array for no sources', async () => {
    const result = await syncCatalogTokens([]);
    expect(result).toEqual([]);
  });

  it('extracts theme color tokens from backtick-quoted text', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch('Use `editor.background` and `editor.foreground` in your theme.'),
    );

    const sources: Source[] = [
      { url: 'https://example.com/docs', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
  });

  it('filters out theme candidates without a dot', async () => {
    vi.stubGlobal('fetch', mockFetch('`nodot` and `has.dot`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([{ key: 'has.dot', type: 'theme' }]);
  });

  it('filters out theme candidates shorter than 3 chars', async () => {
    vi.stubGlobal('fetch', mockFetch('`a.b` and `ab` and `abc.def`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'a.b', type: 'theme' },
      { key: 'abc.def', type: 'theme' },
    ]);
  });

  it('filters out theme candidates with whitespace', async () => {
    vi.stubGlobal('fetch', mockFetch('`has space.val` and `clean.val`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([{ key: 'clean.val', type: 'theme' }]);
  });

  it('extracts semantic token keys', async () => {
    vi.stubGlobal('fetch', mockFetch('`variable` and `class.static` tokens'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'semantic token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'class.static', type: 'semantic token' },
      { key: 'variable', type: 'semantic token' },
    ]);
  });

  it('rejects semantic tokens starting with uppercase', async () => {
    vi.stubGlobal('fetch', mockFetch('`Variable` and `variable`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'semantic token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([{ key: 'variable', type: 'semantic token' }]);
  });

  it('extracts TextMate scope tokens', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch('`source.python` and `entity.name.function` and `keyword.*`'),
    );
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'entity.name.function', type: 'token' },
      { key: 'keyword.*', type: 'token' },
      { key: 'source.python', type: 'token' },
    ]);
  });

  it('filters out TextMate candidates without a dot', async () => {
    vi.stubGlobal('fetch', mockFetch('`nodot` and `has.dot`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([{ key: 'has.dot', type: 'token' }]);
  });

  it('deduplicates tokens across multiple sources', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve('`editor.background`'),
      })
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve('`editor.background` and `editor.foreground`'),
      });
    vi.stubGlobal('fetch', fetchMock);

    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'theme' },
      { url: 'https://example.com/b', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
  });

  it('sorts tokens alphabetically within each type', async () => {
    vi.stubGlobal('fetch', mockFetch('`z.b` and `a.c` and `m.d`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.map((t) => t.key)).toEqual(['a.c', 'm.d', 'z.b']);
  });

  it('throws on fetch failure', async () => {
    vi.stubGlobal('fetch', mockFetch('', 404));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    await expect(syncCatalogTokens(sources)).rejects.toThrow('Failed to fetch');
  });

  it('throws on unsupported source type', async () => {
    const sources = [
      { url: 'https://example.com', type: 'unknown' as 'default', tokenType: 'theme' as const },
    ];
    await expect(syncCatalogTokens(sources)).rejects.toThrow('Unsupported source type');
  });

  it('trims whitespace from backtick contents', async () => {
    vi.stubGlobal('fetch', mockFetch('` editor.background ` is used'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([{ key: 'editor.background', type: 'theme' }]);
  });

  it('handles mixed token types from different sources', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve('`editor.background`'),
      })
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve('`variable` and `function`'),
      });
    vi.stubGlobal('fetch', fetchMock);

    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'theme' },
      { url: 'https://example.com/b', type: 'default', tokenType: 'semantic token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'function', type: 'semantic token' },
      { key: 'variable', type: 'semantic token' },
      { key: 'editor.background', type: 'theme' },
    ]);
  });

  it('extracts tokens from HTML <code> tags', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch('<li><code>editor.background</code>: Editor background color.</li>' +
        '<li><code>editor.foreground</code>: Editor foreground color.</li>'),
    );
    const sources: Source[] = [
      { url: 'https://example.com/docs', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
  });

  it('deduplicates tokens found in both backticks and code tags', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch('`editor.background` and <code>editor.background</code> and <code>editor.foreground</code>'),
    );
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
  });
});
