import { describe, expect, it, vi } from 'vitest';
import type { Template } from '../../model/schema/template-schemas';
import type { Theme } from '../../model/schema/theme-schemas';
import { generateThemePair, generateThemePairAsync } from './theme-generator';

const template: Template = {
  name: 'template-a',
  version: '1.0.0',
  locked: false,
  catalogRefs: [{ name: 'catalog-a', version: '1.0.0' }],
  mappings: [
    {
      token: { key: 'editor.foreground', type: 'theme' },
      colorVariableRef: 'editorForeground',
      contrastVariableRef: null,
      groupRef: null,
    },
    {
      token: { key: 'keyword.control', type: 'textmate token' },
      colorVariableRef: 'editorForeground',
      contrastVariableRef: null,
      groupRef: null,
    },
    {
      token: { key: '*.deprecated', type: 'semantic token' },
      colorVariableRef: null,
      contrastVariableRef: null,
      groupRef: null,
    },
  ],
  colorVariables: [{ key: 'editorForeground', groupRef: null }],
  contrastVariables: [],
  groups: [],
  semanticTokenModifiers: ['deprecated'],
  semanticTokenLanguages: ['typescript'],
};

const theme: Theme = {
  name: 'baseline',
  version: '1.0.0',
  templateRef: { name: 'template-a', version: '1.0.0' },
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
    {
      colorRef: 'editorForeground',
      dark: { value: '#112233' },
      light: { value: '#445566' },
      useDarkForLight: false,
    },
  ],
  contrastAssignments: [],
  applyPaletteToDark: true,
  applyPaletteToLight: true,
  paletteClusterCountK: 5,
  paletteClusterGroupIds: [],
};

describe('theme-generator async yielding', () => {
  it('generateThemePairAsync matches synchronous output', async () => {
    const sync = generateThemePair(theme, template);
    const asyncResult = await generateThemePairAsync(theme, template, vi.fn(async () => {}));
    expect(asyncResult).toEqual(sync);
  });

  it('generateThemePairAsync invokes the yield gate for each mapping in both modes', async () => {
    const yieldGate = vi.fn(async () => {});
    await generateThemePairAsync(theme, template, yieldGate);
    expect(yieldGate).toHaveBeenCalledTimes(template.mappings.length * 2);
  });

  it('omits ignored template mappings from generated themes', () => {
    const ignoredTemplate: Template = {
      ...template,
      mappings: template.mappings.map((mapping) => ({
        ...mapping,
        ignored: true,
      })),
    };

    const generated = generateThemePair(theme, ignoredTemplate);

    expect(generated.dark.colors).toEqual({});
    expect(generated.dark.tokenColors).toEqual([]);
    expect(generated.dark.semanticTokenColors).toEqual({});
    expect(generated.light.colors).toEqual({});
    expect(generated.light.tokenColors).toEqual([]);
    expect(generated.light.semanticTokenColors).toEqual({});
  });
});
