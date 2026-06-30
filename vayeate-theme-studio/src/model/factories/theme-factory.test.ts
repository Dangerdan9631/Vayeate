import { describe, expect, it } from 'vitest';
import { themeSchema } from '../schema/theme-schemas';
import { createThemeWithParams } from './theme-factory';

describe('createThemeWithParams', () => {
  it('copies source theme values while resetting identity to name and version 1.0.0', () => {
    const sourceTheme = themeSchema.parse({
      name: 'source-theme',
      version: '2.3.4',
      templateRef: { name: 'template-a', version: '1.0.0' },
      idePrimaryTokenRef: 'primary',
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#112233' }, light: { value: '#445566' }, useDarkForLight: false },
      ],
      contrastAssignments: [
        {
          contrastVariableRef: 'editorContrast',
          dark: { value: 4.5, comparisonMethod: 'greaterThan', min: 3, max: 7 },
          light: null,
          useDarkForLight: true,
        },
      ],
      styleAssignments: [
        {
          styleVariableRef: 'editorStyle',
          dark: { bold: true, underline: false, italic: true, strikethrough: false },
          light: null,
          useDarkForLight: true,
        },
      ],
      applyPaletteToDark: false,
      applyPaletteToLight: true,
      paletteClusterCountK: 8,
      paletteClusterGroupIds: ['group-a'],
    });

    const duplicate = createThemeWithParams({
      name: 'copied-theme',
      sourceTheme,
    });

    expect(duplicate).toEqual({
      ...sourceTheme,
      name: 'copied-theme',
      version: '1.0.0',
    });
  });
});
