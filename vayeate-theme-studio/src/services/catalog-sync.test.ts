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
  it('returns empty result for no sources', async () => {
    const result = await syncCatalogTokens([]);
    expect(result.tokens).toEqual([]);
    expect(result.semanticTokenTypes).toEqual([]);
    expect(result.semanticTokenModifiers).toEqual([]);
    expect(result.semanticTokenLanguages).toEqual([]);
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
    expect(result.tokens).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
  });

  it('accepts theme candidates with or without a dot', async () => {
    vi.stubGlobal('fetch', mockFetch('`foreground` and `icon.foreground`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
      { key: 'foreground', type: 'theme' },
      { key: 'icon.foreground', type: 'theme' },
    ]);
  });

  it('filters out theme candidates shorter than 3 chars', async () => {
    vi.stubGlobal('fetch', mockFetch('`a.b` and `ab` and `abc.def`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
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
    expect(result.tokens).toEqual([{ key: 'clean.val', type: 'theme' }]);
  });

  it('extracts semantic token keys', async () => {
    vi.stubGlobal('fetch', mockFetch('`variable` and `class.static` tokens'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'semantic token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
      { key: 'class.static', type: 'semantic token' },
      { key: 'variable', type: 'semantic token' },
    ]);
    expect(result.semanticTokenTypes).toEqual(['class', 'variable']);
    expect(result.semanticTokenModifiers).toEqual(['static']);
    expect(result.semanticTokenLanguages).toEqual([]);
  });

  it('rejects semantic tokens starting with uppercase', async () => {
    vi.stubGlobal('fetch', mockFetch('`Variable` and `variable`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'semantic token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([{ key: 'variable', type: 'semantic token' }]);
  });

  it('accepts semantic tokens with * type and :language and omits * from types list', async () => {
    vi.stubGlobal('fetch', mockFetch('`variable.readonly.defaultLibrary:java` and `*.deprecated`'));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'semantic token' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
      { key: '*.deprecated', type: 'semantic token' },
      { key: 'variable.readonly.defaultLibrary:java', type: 'semantic token' },
    ]);
    expect(result.semanticTokenTypes).toEqual(['variable']);
    expect(result.semanticTokenModifiers).toEqual(['defaultLibrary', 'deprecated', 'readonly']);
    expect(result.semanticTokenLanguages).toEqual(['java']);
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
    expect(result.tokens).toEqual([
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
    expect(result.tokens).toEqual([{ key: 'has.dot', type: 'token' }]);
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
    expect(result.tokens).toEqual([
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
    expect(result.tokens.map((t) => t.key)).toEqual(['a.c', 'm.d', 'z.b']);
  });

  it('throws on fetch failure', async () => {
    vi.stubGlobal('fetch', mockFetch('', 404));
    const sources: Source[] = [
      { url: 'https://example.com', type: 'default', tokenType: 'theme' },
    ];
    await expect(syncCatalogTokens(sources)).rejects.toThrow('Failed to fetch');
  });

  it('throws when color-registry source has tokenType other than theme', async () => {
    const sources: Source[] = [
      { url: 'https://example.com/colors.ts', type: 'color-registry', tokenType: 'token' },
    ];
    await expect(syncCatalogTokens(sources)).rejects.toThrow(
      'color-registry and color-registry-set require tokenType theme',
    );
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
    expect(result.tokens).toEqual([{ key: 'editor.background', type: 'theme' }]);
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
    // Sorted by type then key: 'semantic token' before 'theme'
    expect(result.tokens).toEqual([
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
    expect(result.tokens).toEqual([
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
    expect(result.tokens).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
  });

  it('extracts theme token keys from color-registry source (registerColor)', async () => {
    const code = `
      export const foreground = registerColor('icon.foreground',
        { dark: '#C5C5C5', light: '#424242' },
        nls.localize('iconForeground', "The default color for icons."));
      export const x = registerColor("activityBar.background",
        { dark: '#333' }, nls.localize('x', ''));
      export const y = registerColor('editor.foreground', { dark: '#CCC' }, nls.localize('y', ''));
    `;
    vi.stubGlobal('fetch', mockFetch(code));
    const sources: Source[] = [
      { url: 'https://raw.githubusercontent.com/example/colors.ts', type: 'color-registry', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
      { key: 'activityBar.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
      { key: 'icon.foreground', type: 'theme' },
    ]);
  });

  it('accepts theme tokens with or without dot in color-registry source', async () => {
    const code = `
      registerColor('foreground', { dark: '#CCC' }, nls.localize('x', ''));
      registerColor('icon.foreground', { dark: '#C5C5C5' }, nls.localize('y', ''));
    `;
    vi.stubGlobal('fetch', mockFetch(code));
    const sources: Source[] = [
      { url: 'https://example.com/colors.ts', type: 'color-registry', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
      { key: 'foreground', type: 'theme' },
      { key: 'icon.foreground', type: 'theme' },
    ]);
  });

  it('deduplicates tokens from default and color-registry sources', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve('`editor.background` and `editor.foreground`'),
      })
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve("registerColor('editor.background', { dark: '#1e1e1e' }, nls.localize('x',''));"),
      });
    vi.stubGlobal('fetch', fetchMock);
    const sources: Source[] = [
      { url: 'https://example.com/docs', type: 'default', tokenType: 'theme' },
      { url: 'https://example.com/colors.ts', type: 'color-registry', tokenType: 'theme' },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
  });

  it('color-registry-set fetches manifest then each export and parses registerColor', async () => {
    const manifest = `
      export * from './colorUtils.js';
      export * from './colors/baseColors.js';
    `;
    const colorUtilsContent = '// no registerColor here';
    const baseColorsContent = `
      registerColor('foreground', { dark: '#CCC' }, nls.localize('x', ''));
      registerColor('icon.foreground', { dark: '#C5C5C5' }, nls.localize('y', ''));
    `;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve(manifest),
      })
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve(colorUtilsContent),
      })
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve(baseColorsContent),
      });
    vi.stubGlobal('fetch', fetchMock);

    const sources: Source[] = [
      {
        url: 'https://raw.githubusercontent.com/example/common/colorRegistry.ts',
        type: 'color-registry-set',
        tokenType: 'theme',
      },
    ];
    const result = await syncCatalogTokens(sources);
    expect(result.tokens).toEqual([
      { key: 'foreground', type: 'theme' },
      { key: 'icon.foreground', type: 'theme' },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const urls = fetchMock.mock.calls.map((c) => c[0]);
    expect(urls[0]).toBe('https://raw.githubusercontent.com/example/common/colorRegistry.ts');
    expect(urls[1]).toMatch(/\.ts$/);
    expect(urls[2]).toMatch(/\.ts$/);
  });

  it('color-registry-set resolves .js export paths to .ts URLs', async () => {
    const manifest = "export * from './colors/baseColors.js';";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve(manifest),
      })
      .mockResolvedValueOnce({
        ok: true, status: 200, statusText: 'OK',
        text: () => Promise.resolve("registerColor('editor.background', { dark: '#1e1e1e' }, nls.localize('x',''));"),
      });
    vi.stubGlobal('fetch', fetchMock);
    const sources: Source[] = [
      {
        url: 'https://example.com/theme/common/colorRegistry.ts',
        type: 'color-registry-set',
        tokenType: 'theme',
      },
    ];
    await syncCatalogTokens(sources);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/theme/common/colors/baseColors.ts');
  });
});
