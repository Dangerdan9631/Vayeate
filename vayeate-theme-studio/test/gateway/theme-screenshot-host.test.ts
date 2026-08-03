import { describe, expect, it } from 'vitest';
import {
  buildThemeScreenshotExtensionManifest,
  buildThemeScreenshotExtensionSource,
  buildThemeScreenshotUserSettings,
  SCREENSHOT_DARK_THEME_LABEL,
  SCREENSHOT_LIGHT_THEME_LABEL,
} from '../../electron/theme-screenshot-host';

describe('VS Code screenshot Extension Development Host', () => {
  it('contributes fixed dark and light files for live batch replacement', () => {
    expect(buildThemeScreenshotExtensionManifest().contributes.themes).toEqual([
      {
        label: SCREENSHOT_DARK_THEME_LABEL,
        uiTheme: 'vs-dark',
        path: './themes/active-color-theme.json',
      },
      {
        label: SCREENSHOT_LIGHT_THEME_LABEL,
        uiTheme: 'vs',
        path: './themes/active-light-color-theme.json',
      },
    ]);
  });

  it('isolates startup settings and suppresses screenshot noise', () => {
    expect(buildThemeScreenshotUserSettings(SCREENSHOT_LIGHT_THEME_LABEL)).toMatchObject({
      'workbench.colorTheme': SCREENSHOT_LIGHT_THEME_LABEL,
      'workbench.secondarySideBar.defaultVisibility': 'hidden',
      'extensions.ignoreRecommendations': true,
      'security.workspace.trust.enabled': false,
      'telemetry.telemetryLevel': 'off',
    });
  });

  it('builds an extension worker that applies controls and acknowledges readiness', () => {
    const source = buildThemeScreenshotExtensionSource('C:\\examples\\Example.cs');
    expect(source).toContain("require('vscode')");
    expect(source).toContain("'colorTheme'");
    expect(source).toContain("'ready.json'");
    expect(source).toContain('C:\\\\examples\\\\Example.cs');
  });
});
