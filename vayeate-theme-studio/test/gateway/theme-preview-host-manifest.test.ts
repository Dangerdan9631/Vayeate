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
    expect(manifest.contributes['markdown.previewStyles']).toEqual([
      './styles/markdown-preview.css',
    ]);
    expect(manifest.contributes.colors.map(({ id }) => id)).toEqual([
      'vayeate.markdownHeading1Foreground',
      'vayeate.markdownHeading2Foreground',
      'vayeate.markdownHeading3Foreground',
      'vayeate.markdownHeading4Foreground',
      'vayeate.markdownHeading5Foreground',
      'vayeate.markdownHeading6Foreground',
      'vayeate.markdownBoldForeground',
      'vayeate.markdownItalicForeground',
      'vayeate.markdownUnorderedListMarkerForeground',
      'vayeate.markdownOrderedListMarkerForeground',
      'vayeate.markdownQuoteForeground',
      'vayeate.markdownTableHeaderForeground',
      'vayeate.markdownTableHeaderBackground',
      'vayeate.markdownTableHeaderBorder',
      'vayeate.markdownBackground',
      'vayeate.markdownCodeBlockBackground',
      'vayeate.markdownQuoteBackground',
      'vayeate.markdownTableRowBackground',
    ]);
  });

  it('selects the generated preview theme in the isolated extension-host profile', () => {
    expect(buildThemePreviewUserSettings()).toMatchObject({
      'workbench.colorTheme': 'Vayeate Live Preview',
      'window.autoDetectColorScheme': false,
    });
  });
});
