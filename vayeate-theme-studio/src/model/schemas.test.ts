import { describe, it, expect } from 'vitest';
import { hexColorSchema, sourceSchema } from './schemas';

describe('hexColorSchema', () => {
  it('accepts # prefixed hex and returns unchanged', () => {
    expect(hexColorSchema.parse('#ff0000')).toBe('#ff0000');
    expect(hexColorSchema.parse('#f00')).toBe('#f00');
    expect(hexColorSchema.parse('#ff0000ff')).toBe('#ff0000ff');
  });

  it('accepts bare hex and normalizes to # form', () => {
    expect(hexColorSchema.parse('ff0000')).toBe('#ff0000');
    expect(hexColorSchema.parse('f00')).toBe('#f00');
    expect(hexColorSchema.parse('ff0000ff')).toBe('#ff0000ff');
  });

  it('trims whitespace before parsing', () => {
    expect(hexColorSchema.parse('  ff0000  ')).toBe('#ff0000');
    expect(hexColorSchema.parse('  #f00  ')).toBe('#f00');
  });

  it('rejects invalid hex', () => {
    expect(() => hexColorSchema.parse('gg0000')).toThrow();
    expect(() => hexColorSchema.parse('ff')).toThrow();
    expect(() => hexColorSchema.parse('ff00')).toThrow();
    expect(() => hexColorSchema.parse('ff000')).toThrow();
    expect(() => hexColorSchema.parse('')).toThrow();
  });
});

describe('sourceSchema', () => {
  it('rejects color-registry with tokenType other than theme', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/colors.ts',
      type: 'color-registry',
      tokenType: 'textmate token',
    });
    expect(result.success).toBe(false);
  });

  it('accepts color-registry-set with tokenType theme', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/colorRegistry.ts',
      type: 'color-registry-set',
      tokenType: 'theme',
    });
    expect(result.success).toBe(true);
  });

  it('rejects color-registry-set with tokenType other than theme', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/colorRegistry.ts',
      type: 'color-registry-set',
      tokenType: 'textmate token',
    });
    expect(result.success).toBe(false);
  });

  it('accepts semantic-token-registry with tokenType semantic token', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/tokenClassification.ts',
      type: 'semantic-token-registry',
      tokenType: 'semantic token',
    });
    expect(result.success).toBe(true);
  });

  it('rejects semantic-token-registry with tokenType theme', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/tokenClassification.ts',
      type: 'semantic-token-registry',
      tokenType: 'theme',
    });
    expect(result.success).toBe(false);
  });

  it('rejects semantic-token-registry with tokenType textmate token', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/tokenClassification.ts',
      type: 'semantic-token-registry',
      tokenType: 'textmate token',
    });
    expect(result.success).toBe(false);
  });

  it('accepts textmate-xml with tokenType textmate token', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/JSON.tmLanguage',
      type: 'textmate-xml',
      tokenType: 'textmate token',
    });
    expect(result.success).toBe(true);
  });

  it('accepts textmate-json with tokenType textmate token', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/rust.tmLanguage.json',
      type: 'textmate-json',
      tokenType: 'textmate token',
    });
    expect(result.success).toBe(true);
  });

  it('rejects textmate-xml with tokenType theme', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/JSON.tmLanguage',
      type: 'textmate-xml',
      tokenType: 'theme',
    });
    expect(result.success).toBe(false);
  });

  it('rejects textmate-json with tokenType semantic token', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/rust.tmLanguage.json',
      type: 'textmate-json',
      tokenType: 'semantic token',
    });
    expect(result.success).toBe(false);
  });
});
