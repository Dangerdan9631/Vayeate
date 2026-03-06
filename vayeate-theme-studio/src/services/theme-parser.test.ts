import { describe, it, expect } from 'vitest';
import { tokenKeySchema } from '../model/schemas';
import { parseThemeJson } from './theme-parser';

describe('parseThemeJson', () => {
  it('extracts theme color keys from colors object', () => {
    const json = JSON.stringify({
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
      },
    });
    const result = parseThemeJson(json);
    expect(result.tokens).toEqual([
      { key: 'editor.background', type: 'theme' },
      { key: 'editor.foreground', type: 'theme' },
    ]);
    expect(result.counts.theme).toBe(2);
  });

  it('extracts TextMate scopes from tokenColors', () => {
    const json = JSON.stringify({
      tokenColors: [
        { scope: ['comment', 'string'], settings: { foreground: '#ff0000' } },
        { scope: 'keyword', settings: { foreground: '#0000ff' } },
      ],
    });
    const result = parseThemeJson(json);
    expect(result.tokens).toEqual([
      { key: 'comment', type: 'textmate token' },
      { key: 'string', type: 'textmate token' },
      { key: 'keyword', type: 'textmate token' },
    ]);
    expect(result.counts['textmate token']).toBe(3);
  });

  it('extracts semantic token keys from semanticTokenColors', () => {
    const json = JSON.stringify({
      semanticTokenColors: {
        class: '#0000ff',
        method: '#ff0000',
        '*.deprecated': { strikethrough: true },
      },
    });
    const result = parseThemeJson(json);
    expect(result.tokens).toEqual([
      { key: 'class', type: 'semantic token' },
      { key: 'method', type: 'semantic token' },
      { key: '*.deprecated', type: 'semantic token' },
    ]);
    expect(result.counts['semantic token']).toBe(3);
  });

  it('parses a full theme file with all three sections', () => {
    const json = JSON.stringify({
      name: 'Test Theme',
      type: 'dark',
      colors: { 'editor.background': '#1e1e1e' },
      tokenColors: [
        { scope: 'comment', settings: { foreground: '#608b4e' } },
      ],
      semanticTokenColors: { keyword: '#569cd6' },
    });
    const result = parseThemeJson(json);
    expect(result.counts).toEqual({ theme: 1, 'textmate token': 1, 'semantic token': 1 });
    expect(result.tokens).toHaveLength(3);
  });

  it('deduplicates tokens with the same key and type', () => {
    const json = JSON.stringify({
      tokenColors: [
        { scope: ['comment', 'string'], settings: {} },
        { scope: ['comment'], settings: {} },
      ],
    });
    const result = parseThemeJson(json);
    expect(result.tokens).toEqual([
      { key: 'comment', type: 'textmate token' },
      { key: 'string', type: 'textmate token' },
    ]);
  });

  it('skips tokenColors entries without scope', () => {
    const json = JSON.stringify({
      tokenColors: [
        { settings: { foreground: '#ff0000' } },
        { scope: 'keyword', settings: { foreground: '#0000ff' } },
      ],
    });
    const result = parseThemeJson(json);
    expect(result.tokens).toEqual([
      { key: 'keyword', type: 'textmate token' },
    ]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseThemeJson('not json')).toThrow();
  });

  it('throws on non-object JSON', () => {
    expect(() => parseThemeJson('"just a string"')).toThrow('Expected a JSON object');
  });

  it('returns empty result for empty object', () => {
    const result = parseThemeJson('{}');
    expect(result.tokens).toEqual([]);
    expect(result.counts).toEqual({ theme: 0, 'textmate token': 0, 'semantic token': 0 });
  });

  it('parses scope selectors with spaces (TextMate "or" style)', () => {
    const json = JSON.stringify({
      tokenColors: [
        { scope: 'meta.attribute keyword', settings: {} },
        { scope: 'comment.block.documentation string.quoted.double', settings: {} },
      ],
    });
    const result = parseThemeJson(json);
    expect(result.tokens).toHaveLength(2);
    result.tokens.forEach((t) => {
      expect(tokenKeySchema.safeParse(t.key).success, `key "${t.key}" should be valid`).toBe(true);
    });
  });
});
