import { describe, it, expect, vi, afterEach } from 'vitest';
import { createTemplateWithParams, createThemeWithParams } from '../../model/factories';
import type { Theme } from '../../model/schemas';
import { ThemeGateway } from './theme-gateway';
import type { FileSystemService } from '../services/file-system-service';
import type { TemplateGateway } from '../template/template-gateway';

afterEach(() => {
  vi.restoreAllMocks();
});

function createFsMock(partial: Partial<FileSystemService> = {}): FileSystemService {
  return {
    createFile: vi.fn().mockResolvedValue(undefined),
    saveFile: vi.fn().mockResolvedValue(undefined),
    loadFile: vi.fn().mockResolvedValue(null),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    listFiles: vi.fn().mockResolvedValue([]),
    ...partial,
  } as unknown as FileSystemService;
}

function createTemplateGatewayMock(
  partial: Partial<Pick<TemplateGateway, 'loadTemplate'>> = {},
): TemplateGateway {
  return {
    loadTemplate: vi.fn().mockResolvedValue(null),
    ...partial,
  } as unknown as TemplateGateway;
}

const validTheme: Theme = {
  name: 'my-theme',
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
  colorAssignments: [],
  contrastAssignments: [],
  applyPaletteToDark: true,
  applyPaletteToLight: true,
  paletteClusterCountK: 5,
  paletteClusterGroupIds: [],
};

describe('ThemeGateway', () => {
  it('generateTheme loads theme/template, then writes VS Code JSON via saveFile under exthemes/', async () => {
    const theme = createThemeWithParams({ name: 'export-me' });
    const template = createTemplateWithParams({ name: 'tpl' });
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const loadFile = vi.fn().mockResolvedValue(JSON.stringify(theme));
    const loadTemplate = vi.fn().mockResolvedValue(template);
    const gw = new ThemeGateway(
      createFsMock({ saveFile, loadFile }),
      createTemplateGatewayMock({ loadTemplate }),
    );
    const result = await gw.generateTheme('export-me', '1.0.0', 'tpl', '1.0.0');
    expect(loadFile).toHaveBeenCalledWith('data/themes/export-me-1.0.0.theme.json');
    expect(loadTemplate).toHaveBeenCalledWith('tpl', '1.0.0');
    expect(saveFile).toHaveBeenCalledTimes(2);
    expect(saveFile.mock.calls[0][0]).toBe('exthemes/export-me-color-theme.json');
    expect(saveFile.mock.calls[1][0]).toBe('exthemes/export-me-light-color-theme.json');
    expect(result.darkPath).toBe('exthemes/export-me-color-theme.json');
    expect(result.lightPath).toBe('exthemes/export-me-light-color-theme.json');
  });

  it('saveTheme writes validated theme JSON under data/themes', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new ThemeGateway(createFsMock({ saveFile }), createTemplateGatewayMock());
    await gw.saveTheme(validTheme);
    expect(saveFile).toHaveBeenCalledTimes(1);
    expect(saveFile.mock.calls[0][0]).toBe('data/themes/my-theme-1.0.0.theme.json');
    const json = saveFile.mock.calls[0][1] as string;
    expect(json).toContain('"name": "my-theme"');
    expect(JSON.parse(json)).toMatchObject({ name: 'my-theme', version: '1.0.0' });
  });

  it('createTheme persists then returns the new theme', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new ThemeGateway(createFsMock({ saveFile }), createTemplateGatewayMock());
    const theme = await gw.createTheme({ name: 'foo' });
    expect(theme.name).toBe('foo');
    expect(saveFile).toHaveBeenCalledWith('data/themes/foo-1.0.0.theme.json', expect.any(String));
  });

  it('loadTheme returns parsed theme when file is valid JSON', async () => {
    const stored = createThemeWithParams({ name: 'bar' });
    const loadFile = vi.fn().mockResolvedValue(JSON.stringify(stored));
    const gw = new ThemeGateway(createFsMock({ loadFile }), createTemplateGatewayMock());
    const loaded = await gw.loadTheme('bar', '1.0.0');
    expect(loadFile).toHaveBeenCalledWith('data/themes/bar-1.0.0.theme.json');
    expect(loaded).toEqual(stored);
  });

  it('loadTheme returns null when loadFile returns null', async () => {
    const loadFile = vi.fn().mockResolvedValue(null);
    const gw = new ThemeGateway(createFsMock({ loadFile }), createTemplateGatewayMock());
    await expect(gw.loadTheme('x', '1.0.0')).resolves.toBeNull();
  });

  it('listThemes maps filenames via parseFileName and returns refs', async () => {
    const listFiles = vi.fn().mockResolvedValue(['acme-1.0.0.theme.json', 'ignore.txt']);
    const gw = new ThemeGateway(createFsMock({ listFiles }), createTemplateGatewayMock());
    const refs = await gw.listThemes();
    expect(listFiles).toHaveBeenCalledWith('data/themes');
    expect(refs).toContainEqual({ name: 'acme', version: '1.0.0' });
    expect(refs).toHaveLength(1);
  });

  it('listThemes returns empty array when listFiles throws', async () => {
    const listFiles = vi.fn().mockRejectedValue(new Error('no dir'));
    const gw = new ThemeGateway(createFsMock({ listFiles }), createTemplateGatewayMock());
    await expect(gw.listThemes()).resolves.toEqual([]);
  });

  it('deleteTheme swallows deleteFile errors', async () => {
    const deleteFile = vi.fn().mockRejectedValue(new Error('ENOENT'));
    const gw = new ThemeGateway(createFsMock({ deleteFile }), createTemplateGatewayMock());
    await expect(gw.deleteTheme('n', '1.0.0')).resolves.toBeUndefined();
    expect(deleteFile).toHaveBeenCalledWith('data/themes/n-1.0.0.theme.json');
  });
});
