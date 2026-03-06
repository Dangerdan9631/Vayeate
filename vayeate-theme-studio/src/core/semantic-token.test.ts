import { describe, it, expect } from 'vitest';
import {
  parseSemanticSelector,
  formatSemanticSelector,
  mergeSemanticSelectorInto,
} from './semantic-token';

describe('parseSemanticSelector', () => {
  it('parses type only', () => {
    expect(parseSemanticSelector('variable')).toEqual({
      type: 'variable',
      modifiers: [],
      language: null,
    });
  });

  it('parses type with one modifier', () => {
    expect(parseSemanticSelector('variable.readonly')).toEqual({
      type: 'variable',
      modifiers: ['readonly'],
      language: null,
    });
  });

  it('parses type with multiple modifiers', () => {
    expect(parseSemanticSelector('variable.readonly.defaultLibrary')).toEqual({
      type: 'variable',
      modifiers: ['readonly', 'defaultLibrary'],
      language: null,
    });
  });

  it('parses type with modifier and language', () => {
    expect(parseSemanticSelector('variable.readonly:java')).toEqual({
      type: 'variable',
      modifiers: ['readonly'],
      language: 'java',
    });
  });

  it('parses full selector variable.readonly.defaultLibrary:java', () => {
    expect(parseSemanticSelector('variable.readonly.defaultLibrary:java')).toEqual({
      type: 'variable',
      modifiers: ['readonly', 'defaultLibrary'],
      language: 'java',
    });
  });

  it('parses * type', () => {
    expect(parseSemanticSelector('*')).toEqual({
      type: '*',
      modifiers: [],
      language: null,
    });
  });

  it('parses * with modifier', () => {
    expect(parseSemanticSelector('*.deprecated')).toEqual({
      type: '*',
      modifiers: ['deprecated'],
      language: null,
    });
  });

  it('parses * with language', () => {
    expect(parseSemanticSelector('*:java')).toEqual({
      type: '*',
      modifiers: [],
      language: 'java',
    });
  });

  it('returns empty for empty string', () => {
    expect(parseSemanticSelector('')).toEqual({
      type: '',
      modifiers: [],
      language: null,
    });
  });

  it('trims whitespace', () => {
    expect(parseSemanticSelector('  variable.readonly  ')).toEqual({
      type: 'variable',
      modifiers: ['readonly'],
      language: null,
    });
  });

  it('throws for invalid segment characters', () => {
    expect(() => parseSemanticSelector('var@iable')).toThrow(/Invalid semantic selector segment/);
  });
});

describe('formatSemanticSelector', () => {
  it('formats type only', () => {
    expect(formatSemanticSelector('variable', [], null)).toBe('variable');
  });

  it('formats type with modifiers (sorted alphabetically)', () => {
    expect(formatSemanticSelector('variable', ['defaultLibrary', 'readonly'], null)).toBe(
      'variable.defaultLibrary.readonly',
    );
  });

  it('formats type with language', () => {
    expect(formatSemanticSelector('variable', [], 'java')).toBe('variable:java');
  });

  it('formats full selector (modifiers sorted alphabetically)', () => {
    expect(
      formatSemanticSelector('variable', ['readonly', 'defaultLibrary'], 'java'),
    ).toBe('variable.defaultLibrary.readonly:java');
  });

  it('returns empty for empty type', () => {
    expect(formatSemanticSelector('', [], null)).toBe('');
  });
});

describe('mergeSemanticSelectorInto', () => {
  const empty = { types: [] as string[], modifiers: [] as string[], languages: [] as string[] };

  it('merges foo.bar.baz:java into empty catalog', () => {
    const result = mergeSemanticSelectorInto('foo.bar.baz:java', empty);
    expect(result).toEqual({
      types: ['foo'],
      modifiers: ['bar', 'baz'],
      languages: ['java'],
    });
  });

  it('merges *.bar into empty catalog (modifier only)', () => {
    const result = mergeSemanticSelectorInto('*.bar', empty);
    expect(result).toEqual({
      types: [],
      modifiers: ['bar'],
      languages: [],
    });
  });

  it('merges foo into empty catalog (type only)', () => {
    const result = mergeSemanticSelectorInto('foo', empty);
    expect(result).toEqual({
      types: ['foo'],
      modifiers: [],
      languages: [],
    });
  });

  it('returns null for empty string', () => {
    expect(mergeSemanticSelectorInto('', empty)).toBeNull();
    expect(mergeSemanticSelectorInto('  ', empty)).toBeNull();
  });

  it('returns null for * only (nothing to add)', () => {
    expect(mergeSemanticSelectorInto('*', empty)).toBeNull();
  });

  it('returns null for invalid selector', () => {
    expect(mergeSemanticSelectorInto('var@iable', empty)).toBeNull();
  });

  it('dedupes and sorts when merging into existing', () => {
    const current = {
      types: ['class'],
      modifiers: ['readonly'],
      languages: ['java'] as string[],
    };
    const result = mergeSemanticSelectorInto('foo.bar.baz:java', current);
    expect(result).toEqual({
      types: ['class', 'foo'],
      modifiers: ['bar', 'baz', 'readonly'],
      languages: ['java'],
    });
  });
});
