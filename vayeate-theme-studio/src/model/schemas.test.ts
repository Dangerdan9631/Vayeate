import { describe, it, expect } from 'vitest';
import { hexColorSchema } from './schemas';

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
