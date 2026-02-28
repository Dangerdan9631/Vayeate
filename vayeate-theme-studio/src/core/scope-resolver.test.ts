import { describe, it, expect } from 'vitest';
import {
  buildScopeColorMap,
  resolveTokenColor,
  type ScopeColorMap,
} from './scope-resolver';
import type { ColorAssignment, Mapping } from '../model/schemas';

function mapping(key: string, colorRef: string): Mapping {
  return {
    token: { key, type: 'token' },
    colorVariableRef: colorRef,
    contrastVariableRef: null,
  };
}

function colorAssignment(
  colorRef: string,
  dark: string,
  light: string,
  useDarkForLight = false,
): ColorAssignment {
  return {
    colorRef,
    dark: { value: dark },
    light: { value: light },
    useDarkForLight,
  };
}

describe('buildScopeColorMap', () => {
  it('builds entries from mappings and color assignments', () => {
    const mappings: Mapping[] = [
      mapping('keyword.control', 'keywordColor'),
      mapping('string.quoted', 'stringColor'),
    ];
    const assignments: ColorAssignment[] = [
      colorAssignment('keywordColor', '#569cd6', '#0000ff'),
      colorAssignment('stringColor', '#ce9178', '#a31515'),
    ];
    const map = buildScopeColorMap(mappings, assignments);
    expect(map.entries).toHaveLength(2);
    const keywordEntry = map.entries.find((e) => e.segments.join('.') === 'keyword.control');
    expect(keywordEntry?.darkColor).toBe('#569cd6');
    expect(keywordEntry?.lightColor).toBe('#0000ff');
  });

  it('sorts entries by segment count descending', () => {
    const mappings: Mapping[] = [
      mapping('keyword', 'c1'),
      mapping('keyword.control', 'c2'),
      mapping('keyword.control.export', 'c3'),
    ];
    const assignments: ColorAssignment[] = [
      colorAssignment('c1', '#1', '#1'),
      colorAssignment('c2', '#2', '#2'),
      colorAssignment('c3', '#3', '#3'),
    ];
    const map = buildScopeColorMap(mappings, assignments);
    expect(map.entries[0].segments).toEqual(['keyword', 'control', 'export']);
    expect(map.entries[1].segments).toEqual(['keyword', 'control']);
    expect(map.entries[2].segments).toEqual(['keyword']);
  });

  it('uses useDarkForLight for light color when set', () => {
    const mappings: Mapping[] = [mapping('comment', 'commentColor')];
    const assignments: ColorAssignment[] = [
      {
        colorRef: 'commentColor',
        dark: { value: '#6a9955' },
        light: { value: '#008000' },
        useDarkForLight: true,
      },
    ];
    const map = buildScopeColorMap(mappings, assignments);
    expect(map.entries[0].lightColor).toBe('#6a9955');
  });

  it('ignores mappings without colorVariableRef', () => {
    const mappings: Mapping[] = [
      { token: { key: 'keyword', type: 'token' }, colorVariableRef: null, contrastVariableRef: null },
    ];
    const map = buildScopeColorMap(mappings, []);
    expect(map.entries).toHaveLength(0);
  });
});

describe('resolveTokenColor', () => {
  const scopeColorMap: ScopeColorMap = {
    entries: [
      { segments: ['source', 'ts'], darkColor: '#1e1e1e', lightColor: '#1f1f1f' },
      { segments: ['keyword', 'control'], darkColor: '#569cd6', lightColor: '#0000ff' },
      { segments: ['keyword'], darkColor: '#c586c0', lightColor: '#af00db' },
      { segments: ['string', 'quoted'], darkColor: '#ce9178', lightColor: '#a31515' },
    ],
  };

  it('returns dark color for mode dark', () => {
    const color = resolveTokenColor(['source.ts', 'keyword.control.ts'], scopeColorMap, 'dark');
    expect(color).toBe('#569cd6');
  });

  it('returns light color for mode light', () => {
    const color = resolveTokenColor(['source.ts', 'keyword.control.export.ts'], scopeColorMap, 'light');
    expect(color).toBe('#0000ff');
  });

  it('picks most specific matching scope', () => {
    const color = resolveTokenColor(['meta.class.ts', 'keyword.control.export.ts'], scopeColorMap, 'dark');
    expect(color).toBe('#569cd6');
  });

  it('falls back to less specific match', () => {
    const color = resolveTokenColor(['keyword.other.ts'], scopeColorMap, 'dark');
    expect(color).toBe('#c586c0');
  });

  it('returns null when no match', () => {
    const color = resolveTokenColor(['entity.name.function'], scopeColorMap, 'dark');
    expect(color).toBeNull();
  });

  it('handles wildcard in token key', () => {
    const map: ScopeColorMap = {
      entries: [{ segments: ['string', '*'], darkColor: '#ce9178', lightColor: '#a31515' }],
    };
    const color = resolveTokenColor(['string.quoted.double.json'], map, 'dark');
    expect(color).toBe('#ce9178');
  });
});
