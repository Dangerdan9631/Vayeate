import { describe, it, expect } from 'vitest';
import { resolveColor, generateTheme, generateThemePair } from './theme-generator';
import type { Theme, Template, Mapping } from '../model/schemas';

function theme(overrides: Partial<Theme> = {}): Theme {
  return {
    name: 'test',
    version: '1.0.0',
    templateRef: null,
    idePrimaryTokenRef: null,
    ideForegroundTokenRef: null,
    themeBackgroundTokenRef: null,
    themeForegroundTokenRef: null,
    lineNumberBackgroundTokenRef: null,
    lineNumberForegroundTokenRef: null,
    ideTabTokenRef: null,
    ideTabBarBackgroundTokenRef: null,
    ideTabBarForegroundTokenRef: null,
    editorPreviewScrollbarBackgroundTokenRef: null,
    editorPreviewScrollbarForegroundTokenRef: null,
    editorPreviewSelectionBackgroundTokenRef: null,
    editorPreviewMenuForegroundTokenRef: null,
    editorPreviewMenuBackgroundTokenRef: null,
    colorAssignments: [
      { colorRef: 'fg', dark: { value: '#d4d4d4' }, light: { value: '#1f1f1f' }, useDarkForLight: false },
      { colorRef: 'comment', dark: { value: '#6a9955' }, light: { value: '#008000' }, useDarkForLight: false },
    ],
    contrastAssignments: [],
    applyPaletteToDark: true,
    applyPaletteToLight: true,
    paletteClusterCountK: 5,
    paletteClusterGroupIds: [],
    ...overrides,
  };
}

function template(mappings: Mapping[], overrides: Partial<Template> = {}): Template {
  return {
    name: 'test-tpl',
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings,
    colorVariables: [
      { key: 'fg', groupRef: null },
      { key: 'comment', groupRef: null },
    ],
    contrastVariables: [],
    groups: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
    ...overrides,
  };
}

function mapping(
  key: string,
  tokenType: 'theme' | 'textmate token' | 'semantic token',
  colorRef: string | null = null,
  contrastRef: string | null = null,
): Mapping {
  return {
    token: { key, type: tokenType },
    colorVariableRef: colorRef,
    contrastVariableRef: contrastRef,
    groupRef: null,
  };
}

describe('resolveColor', () => {
  it('returns hex for theme mapping with color ref', () => {
    const t = theme();
    const tpl = template([mapping('editor.foreground', 'theme', 'fg')]);
    expect(resolveColor(t, tpl, tpl.mappings[0], 'dark')).toBe('#d4d4d4');
    expect(resolveColor(t, tpl, tpl.mappings[0], 'light')).toBe('#1f1f1f');
  });

  it('returns null when color ref not assigned', () => {
    const t = theme({ colorAssignments: [] });
    const tpl = template([mapping('editor.foreground', 'theme', 'fg')]);
    expect(resolveColor(t, tpl, tpl.mappings[0], 'dark')).toBeNull();
  });

  it('respects useDarkForLight for light mode', () => {
    const t = theme({
      colorAssignments: [
        { colorRef: 'fg', dark: { value: '#d4d4d4' }, light: { value: '#1f1f1f' }, useDarkForLight: true },
      ],
    });
    const tpl = template([mapping('editor.foreground', 'theme', 'fg')]);
    expect(resolveColor(t, tpl, tpl.mappings[0], 'light')).toBe('#d4d4d4');
  });

  it('returns null when mapping has no colorVariableRef', () => {
    const t = theme();
    const tpl = template([mapping('editor.foreground', 'theme', null)]);
    expect(resolveColor(t, tpl, tpl.mappings[0], 'dark')).toBeNull();
  });

});

describe('generateTheme', () => {
  it('produces colors from theme-type mappings', () => {
    const t = theme();
    const tpl = template([
      mapping('editor.foreground', 'theme', 'fg'),
      mapping('editor.background', 'theme', 'comment'),
    ]);
    const out = generateTheme(t, tpl, 'dark');
    expect(out.type).toBe('dark');
    expect(out.name).toBe('Test');
    expect(out.colors['editor.foreground']).toBe('#d4d4d4');
    expect(out.colors['editor.background']).toBe('#6a9955');
  });

  it('produces light display name for light mode', () => {
    const t = theme();
    const tpl = template([mapping('editor.foreground', 'theme', 'fg')]);
    const out = generateTheme(t, tpl, 'light');
    expect(out.name).toBe('Test Light');
    expect(out.type).toBe('light');
  });

  it('groups token-type mappings by colorVariableRef into tokenColors', () => {
    const t = theme();
    const tpl = template([
      mapping('keyword', 'textmate token', 'fg'),
      mapping('keyword.control', 'textmate token', 'fg'),
      mapping('comment', 'textmate token', 'comment'),
    ]);
    const out = generateTheme(t, tpl, 'dark');
    expect(out.tokenColors).toHaveLength(2);
    const fgGroup = out.tokenColors.find((r) => r.name === 'fg');
    const commentGroup = out.tokenColors.find((r) => r.name === 'comment');
    expect(fgGroup?.scope).toContain('keyword');
    expect(fgGroup?.scope).toContain('keyword.control');
    expect(fgGroup?.settings.foreground).toBe('#d4d4d4');
    expect(commentGroup?.scope).toEqual(['comment']);
    expect(commentGroup?.settings.foreground).toBe('#6a9955');
  });

  it('produces semanticTokenColors from semantic token mappings', () => {
    const t = theme();
    const tpl = template([
      mapping('keyword', 'semantic token', 'fg'),
      mapping('comment', 'semantic token', 'comment'),
    ]);
    const out = generateTheme(t, tpl, 'dark');
    expect(out.semanticTokenColors['keyword']).toBe('#d4d4d4');
    expect(out.semanticTokenColors['comment']).toBe('#6a9955');
  });

  it('adds *.deprecated with strikethrough only', () => {
    const t = theme();
    const tpl = template([
      {
        token: { key: '*.deprecated', type: 'semantic token' },
        colorVariableRef: null,
        contrastVariableRef: null,
        groupRef: null,
      },
    ]);
    const out = generateTheme(t, tpl, 'dark');
    expect(out.semanticTokenColors['*.deprecated']).toEqual({ strikethrough: true });
  });

  it('produces semanticTokenColors for composite key variable.readonly.defaultLibrary:java', () => {
    const t = theme();
    const tpl = template([
      mapping('variable.readonly.defaultLibrary:java', 'semantic token', 'fg'),
    ]);
    const out = generateTheme(t, tpl, 'dark');
    expect(out.semanticTokenColors['variable.readonly.defaultLibrary:java']).toBe('#d4d4d4');
  });

  it('sets semanticHighlighting true', () => {
    const t = theme();
    const tpl = template([]);
    const out = generateTheme(t, tpl, 'dark');
    expect(out.semanticHighlighting).toBe(true);
  });
});

describe('generateThemePair', () => {
  it('returns dark and light themes', () => {
    const t = theme();
    const tpl = template([mapping('editor.foreground', 'theme', 'fg')]);
    const { dark, light } = generateThemePair(t, tpl);
    expect(dark.type).toBe('dark');
    expect(light.type).toBe('light');
    expect(dark.colors['editor.foreground']).toBe('#d4d4d4');
    expect(light.colors['editor.foreground']).toBe('#1f1f1f');
  });
});
