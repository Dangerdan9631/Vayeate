import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { Template } from '../../src/model/Template/schema/template-schemas';
import type { Theme } from '../../src/model/Theme/schema/theme-schemas';
import type { FileSystemService } from '../../src/gateway/services/Common/file-system-service';
import type { TemplateGateway } from '../../src/gateway/gateway/Template/template/template-gateway';
import {
  LIVE_THEMES_EXPORT_PREFIX,
  LIVE_DARK_THEME_FILE_NAME,
  LIVE_LIGHT_THEME_FILE_NAME,
  LiveThemeExportGateway,
} from '../../src/gateway/gateway/Theme/theme/live-theme-export-gateway';

function buildTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    name: 'demo',
    version: '1.0.0',
    templateRef: { name: 'base', version: '1.0.0' },
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
        colorRef: 'fg',
        dark: { value: '#FFFFFF' },
        light: { value: '#000000' },
        useDarkForLight: false,
      },
    ],
    contrastAssignments: [],
    styleAssignments: [],
    applyPaletteToDark: true,
    applyPaletteToLight: true,
    paletteClusterCountK: 5,
    paletteClusterGroupIds: [],
    ...overrides,
  };
}

function buildTemplate(): Template {
  return {
    name: 'base',
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [
      {
        token: { key: 'editor.foreground', type: 'theme' },
        colorVariableRef: 'fg',
        contrastVariableRef: null,
        styleVariableRef: null,
        ignored: false,
        groupRef: null,
      },
    ],
    colorVariables: [{ key: 'fg', groupRef: null }],
    contrastVariables: [],
    styleVariables: [],
    groups: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };
}

describe('LiveThemeExportGateway', () => {
  it('does not generate preview-host files before the host is enabled', async () => {
    const saveFile = vi.fn();
    const loadTemplate = vi.fn();
    const gateway = new LiveThemeExportGateway(
      { loadTemplate } as unknown as TemplateGateway,
      { saveFile } as unknown as FileSystemService,
    );

    await gateway.exportThemePair(buildTheme());

    expect(loadTemplate).not.toHaveBeenCalled();
    expect(saveFile).not.toHaveBeenCalled();
  });

  it('writes complete dark and light VS Code theme files under the live extension', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const loadTemplate = vi.fn().mockResolvedValue(buildTemplate());
    const gateway = new LiveThemeExportGateway(
      { loadTemplate } as unknown as TemplateGateway,
      { saveFile } as unknown as FileSystemService,
    );
    gateway.enable();

    await gateway.exportThemePair(buildTheme());

    expect(loadTemplate).toHaveBeenCalledWith('base', '1.0.0');
    expect(saveFile).toHaveBeenCalledTimes(2);

    const darkCall = saveFile.mock.calls.find(
      (call) =>
        call[0] === `${LIVE_THEMES_EXPORT_PREFIX}/${LIVE_DARK_THEME_FILE_NAME}`,
    );
    const lightCall = saveFile.mock.calls.find(
      (call) =>
        call[0] ===
        `${LIVE_THEMES_EXPORT_PREFIX}/${LIVE_LIGHT_THEME_FILE_NAME}`,
    );
    expect(darkCall).toBeDefined();
    expect(lightCall).toBeDefined();

    const darkJson = JSON.parse(String(darkCall![1]));
    const lightJson = JSON.parse(String(lightCall![1]));
    expect(darkJson.type).toBe('dark');
    expect(lightJson.type).toBe('light');
    expect(darkJson.colors['editor.foreground']).toBe('#FFFFFF');
    expect(lightJson.colors['editor.foreground']).toBe('#000000');
    expect(String(darkCall![1])).toMatch(/\n$/);
    expect(String(lightCall![1])).toMatch(/\n$/);
  });

  it('regenerates the same watched files with the latest enabled theme values', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gateway = new LiveThemeExportGateway(
      { loadTemplate: vi.fn().mockResolvedValue(buildTemplate()) } as unknown as TemplateGateway,
      { saveFile } as unknown as FileSystemService,
    );
    gateway.enable();

    await gateway.exportThemePair(buildTheme());
    await gateway.exportThemePair(
      buildTheme({
        colorAssignments: [
          {
            colorRef: 'fg',
            dark: { value: '#123456' },
            light: { value: '#654321' },
            useDarkForLight: false,
          },
        ],
      }),
    );

    const darkWrites = saveFile.mock.calls.filter(
      (call) => call[0] === `${LIVE_THEMES_EXPORT_PREFIX}/${LIVE_DARK_THEME_FILE_NAME}`,
    );
    const lightWrites = saveFile.mock.calls.filter(
      (call) => call[0] === `${LIVE_THEMES_EXPORT_PREFIX}/${LIVE_LIGHT_THEME_FILE_NAME}`,
    );
    expect(darkWrites).toHaveLength(2);
    expect(lightWrites).toHaveLength(2);
    expect(JSON.parse(String(darkWrites[1]?.[1])).colors['editor.foreground']).toBe('#123456');
    expect(JSON.parse(String(lightWrites[1]?.[1])).colors['editor.foreground']).toBe('#654321');
  });

  it('skips export when the theme has no template reference', async () => {
    const saveFile = vi.fn();
    const loadTemplate = vi.fn();
    const gateway = new LiveThemeExportGateway(
      { loadTemplate } as unknown as TemplateGateway,
      { saveFile } as unknown as FileSystemService,
    );
    gateway.enable();

    await gateway.exportThemePair(buildTheme({ templateRef: null }));

    expect(loadTemplate).not.toHaveBeenCalled();
    expect(saveFile).not.toHaveBeenCalled();
  });

  it('throws when the linked template cannot be loaded', async () => {
    const gateway = new LiveThemeExportGateway(
      {
        loadTemplate: vi.fn().mockResolvedValue(null),
      } as unknown as TemplateGateway,
      { saveFile: vi.fn() } as unknown as FileSystemService,
    );
    gateway.enable();

    await expect(gateway.exportThemePair(buildTheme())).rejects.toThrow(
      'Template not found: base v1.0.0',
    );
  });
});
