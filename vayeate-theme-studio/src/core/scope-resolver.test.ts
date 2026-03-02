import { describe, it, expect } from 'vitest';
import { contrastRatio } from './color';
import {
  buildScopeColorMap,
  resolveTokenColor,
  type ScopeColorMap,
} from './scope-resolver';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastVariable,
  Mapping,
} from '../model/schemas';

function mapping(
  key: string,
  colorRef: string,
  contrastRef: string | null = null,
): Mapping {
  return {
    token: { key, type: 'token' },
    colorVariableRef: colorRef,
    contrastVariableRef: contrastRef,
    groupRef: null,
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
      { token: { key: 'keyword', type: 'token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    const map = buildScopeColorMap(mappings, []);
    expect(map.entries).toHaveLength(0);
  });

  it('applies contrast adjustment when contrast variable and source are set', () => {
    const mappings: Mapping[] = [
      mapping('keyword.control', 'keywordColor', 'textContrast'),
    ];
    const colorAssignments: ColorAssignment[] = [
      colorAssignment('keywordColor', '#555555', '#888888'),
      colorAssignment('editorBg', '#1e1e1e', '#ffffff'),
    ];
    const contrastVariables: ContrastVariable[] = [
      { key: 'textContrast', comparisonSourceRef: 'editorBg', groupRef: null },
    ];
    const contrastAssignments: ContrastAssignment[] = [
      {
        contrastVariableRef: 'textContrast',
        dark: { value: 4.5, comparisonMethod: 'greaterThan', min: null, max: null },
        light: { value: 4.5, comparisonMethod: 'greaterThan', min: null, max: null },
        useDarkForLight: false,
      },
    ];
    const map = buildScopeColorMap(mappings, colorAssignments, contrastAssignments, contrastVariables);
    expect(map.entries).toHaveLength(1);
    const entry = map.entries[0];
    expect(entry.darkColor).not.toBe('#555555');
    expect(entry.lightColor).not.toBe('#888888');
    if (entry.darkColor) {
      expect(contrastRatio(entry.darkColor, '#1e1e1e')).toBeGreaterThanOrEqual(4.4);
    }
    if (entry.lightColor) {
      expect(contrastRatio(entry.lightColor, '#ffffff')).toBeGreaterThanOrEqual(4.4);
    }
  });

  it('uses raw color when contrast variable has null comparisonSourceRef', () => {
    const mappings: Mapping[] = [
      mapping('keyword', 'keywordColor', 'noSource'),
    ];
    const colorAssignments: ColorAssignment[] = [
      colorAssignment('keywordColor', '#569cd6', '#0000ff'),
    ];
    const contrastVariables: ContrastVariable[] = [
      { key: 'noSource', comparisonSourceRef: null, groupRef: null },
    ];
    const contrastAssignments: ContrastAssignment[] = [
      {
        contrastVariableRef: 'noSource',
        dark: { value: 4.5, comparisonMethod: 'greaterThan', min: null, max: null },
        light: null,
        useDarkForLight: false,
      },
    ];
    const map = buildScopeColorMap(mappings, colorAssignments, contrastAssignments, contrastVariables);
    expect(map.entries).toHaveLength(1);
    expect(map.entries[0].darkColor).toBe('#569cd6');
    expect(map.entries[0].lightColor).toBe('#0000ff');
  });

  it('uses raw color when no contrast params passed (backward compatible)', () => {
    const mappings: Mapping[] = [mapping('comment', 'commentColor')];
    const assignments: ColorAssignment[] = [
      colorAssignment('commentColor', '#6a9955', '#008000'),
    ];
    const map = buildScopeColorMap(mappings, assignments);
    expect(map.entries[0].darkColor).toBe('#6a9955');
    expect(map.entries[0].lightColor).toBe('#008000');
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
