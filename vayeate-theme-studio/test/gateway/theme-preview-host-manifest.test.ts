import { describe, expect, it } from 'vitest';
import {
  buildThemePreviewExtensionManifest,
  buildThemePreviewUserSettings,
} from '../../electron/theme-preview-host';

describe('VS Code theme preview extension build', () => {
  it('references the fixed live files regenerated for the selected theme', () => {
    const manifest = buildThemePreviewExtensionManifest('Demo');

    expect(manifest.displayName).toContain('Demo');
    expect(manifest.contributes.themes).toEqual([
      {
        label: 'Vayeate Live Preview',
        uiTheme: 'vs-dark',
        path: './themes/active-color-theme.json',
      },
      {
        label: 'Vayeate Live Preview Light',
        uiTheme: 'vs',
        path: './themes/active-light-color-theme.json',
      },
    ]);
  });

  it('selects the generated preview theme in the isolated extension-host profile', () => {
    expect(buildThemePreviewUserSettings()).toMatchObject({
      'workbench.colorTheme': 'Vayeate Live Preview',
      'window.autoDetectColorScheme': false,
    });
  });
});
