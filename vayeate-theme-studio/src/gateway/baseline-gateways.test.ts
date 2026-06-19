import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CatalogGateway } from './catalog/catalog-gateway';
import { ConfigGateway } from './config/config-gateway';
import { PreviewGateway } from './preview/preview-gateway';
import { TokenSyncGateway } from './catalog/token-sync-gateway';
import { LogService } from './services/log-service';
import { ScreenshotService } from './services/screenshot-service';
import { WebService } from './services/web-service';
import { TemplateGateway } from './template/template-gateway';
import { ThemeGateway } from './theme/theme-gateway';
import { WindowService } from './services/window-service';

function toElectronApi<T extends object>(api: T): T & NonNullable<typeof window.electronAPI> {
  return api as T & NonNullable<typeof window.electronAPI>;
}

describe('gateway baselines', () => {
  it('saves, lists, and safely rejects invalid persisted artifacts', async () => {
    const saved = new Map<string, string>();
    const fileSystemService = {
      saveFile: vi.fn(async (relativePath: string, contents: string) => {
        saved.set(relativePath, contents);
      }),
      loadFile: vi.fn(async (relativePath: string) => saved.get(relativePath) ?? null),
      deleteFile: vi.fn(async (relativePath: string) => {
        saved.delete(relativePath);
      }),
      listFiles: vi.fn(async (relativeDirPath: string) => {
        const prefix = `${relativeDirPath}/`;
        return [...saved.keys()]
          .filter((key) => key.startsWith(prefix))
          .map((key) => key.slice(prefix.length));
      }),
    };

    const catalogGateway = new CatalogGateway(fileSystemService as never);
    const templateGateway = new TemplateGateway(fileSystemService as never);
    const themeGateway = new ThemeGateway(fileSystemService as never);
    const configGateway = new ConfigGateway(fileSystemService as never);

    await catalogGateway.saveCatalog({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });
    await templateGateway.saveTemplate({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });
    await themeGateway.saveTheme({
      name: 'theme-a',
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
    });
    await configGateway.save({ colorScheme: 'light' });

    for (const path of [
      'data/catalogs/catalog-a-1.0.0.json',
      'data/templates/template-a-1.0.0.template.json',
      'data/themes/theme-a-1.0.0.theme.json',
    ]) {
      const contents = saved.get(path)!;
      expect(contents).toBe(JSON.stringify(JSON.parse(contents)));
      expect(contents).not.toContain('\n');
    }

    expect(await catalogGateway.listCatalogs()).toEqual([{ name: 'catalog-a', version: '1.0.0' }]);
    expect(await templateGateway.listTemplates()).toEqual([{ name: 'template-a', version: '1.0.0' }]);
    expect(await themeGateway.listThemes()).toEqual([{ name: 'theme-a', version: '1.0.0' }]);
    expect(await configGateway.load()).toEqual({ colorScheme: 'light' });

    saved.set('data/catalogs/bad-1.0.0.json', '{not-json');
    saved.set('data/config.json', '{"colorScheme":"unknown"}');

    expect(await catalogGateway.loadCatalog('bad', '1.0.0')).toBeNull();
    expect(await configGateway.load()).toEqual({ colorScheme: 'dark' });

    await themeGateway.deleteTheme('theme-a', '1.0.0');
    expect(await themeGateway.listThemes()).toEqual([]);
  });

  it('loads preview samples through the preview gateway seam', async () => {
    const fileSystemService = {
      listDirEntries: vi.fn(async () => [{ name: 'typescript', isDirectory: true }]),
      listFiles: vi.fn(async () => ['TypeScript.tmLanguage.json', 'example.ts', '.ignored.txt']),
      loadFile: vi.fn(async (relativePath: string) => {
        if (relativePath.endsWith('.tmLanguage.json')) {
          return JSON.stringify({ scopeName: 'source.ts' });
        }
        if (relativePath.endsWith('example.ts')) {
          return 'const value = 1;';
        }
        return null;
      }),
    };
    const tokenizer = {
      init: vi.fn(async () => {}),
      tokenizeFile: vi.fn(async () => [{ tokens: [{ text: 'const', scopes: ['keyword'] }] }]),
    };

    const gateway = new PreviewGateway(fileSystemService as never, tokenizer as never);
    const previews = await gateway.loadPreviews();

    expect(tokenizer.init).toHaveBeenCalledTimes(1);
    expect(tokenizer.tokenizeFile).toHaveBeenCalledTimes(1);
    expect(previews).toEqual([
      {
        language: 'typescript',
        fileName: 'example.ts',
        lines: [{ tokens: [{ text: 'const', scopes: ['keyword'] }] }],
      },
    ]);
  });

  it('expands color registry set manifests during token sync', async () => {
    const webService = {
      fetchUrl: vi.fn(async (url: string) => {
        if (url === 'https://example.test/manifest.ts') {
          return `export * from './colors.js';`;
        }
        if (url === 'https://example.test/colors.ts') {
          return `registerColor('editor.foreground', {});`;
        }
        throw new Error(`unexpected url: ${url}`);
      }),
    };

    const gateway = new TokenSyncGateway(webService as never);
    const result = await gateway.sync([
      {
        url: 'https://example.test/manifest.ts',
        type: 'color-registry-set',
        tokenType: 'theme',
      },
    ]);

    expect(webService.fetchUrl).toHaveBeenCalledTimes(2);
    expect(result.tokens).toEqual([{ key: 'editor.foreground', type: 'theme' }]);
    expect(result.semanticTokenTypes).toEqual([]);
  });

  it('delegates web, screenshot, and log service work through the Electron API seam', async () => {
    const sendLog = vi.fn();
    const onMainLog = vi.fn((callback: (level: 'debug' | 'info' | 'warn' | 'error', args: string[]) => void) => {
      callback('info', ['from-main']);
    });
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalElectronApi = window.electronAPI;

    const electronApi = toElectronApi({
      fetchUrl: vi.fn(async (url: string) => `payload:${url}`),
      screenshotGetFullDisplaySnapshot: vi.fn(async () => ({
        fullBounds: { x: 0, y: 0, width: 1, height: 1 },
        displays: [],
      })),
      sendLog,
      onMainLog,
    });
    window.electronAPI = electronApi;

    const webService = new WebService();
    const screenshotService = new ScreenshotService();
    const logService = new LogService();

    await expect(webService.fetchUrl('https://example.test')).resolves.toBe('payload:https://example.test');
    await expect(screenshotService.getFullDisplaySnapshot()).resolves.toEqual({
      fullBounds: { x: 0, y: 0, width: 1, height: 1 },
      displays: [],
    });

    logService.setLogLevel('debug');
    logService.init();
    logService.log('warn', 'Renderer', { ok: true });

    expect(onMainLog).toHaveBeenCalledTimes(1);
    expect(sendLog).toHaveBeenCalledTimes(1);
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();

    window.electronAPI = originalElectronApi;
    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('window service', () => {
    const originalElectronApi = window.electronAPI;

    beforeEach(() => {
      const electronApi = {
        closeWindow: vi.fn(async () => {}),
        minimizeWindow: vi.fn(async () => {}),
        maximizeWindow: vi.fn(async () => {}),
        restoreWindow: vi.fn(async () => {}),
        dragWindow: vi.fn(async () => {}),
        reloadWindow: vi.fn(async () => {}),
        reloadWindowForce: vi.fn(async () => {}),
        toggleDevTools: vi.fn(async () => {}),
        getWindowBounds: vi.fn(async () => ({ x: 10, y: 20, width: 1280, height: 720 })),
        onWindowState: vi.fn(() => vi.fn()),
      };
      window.electronAPI = toElectronApi(electronApi);
    });

    afterEach(() => {
      window.electronAPI = originalElectronApi;
    });

    it('delegates window commands and hydrates init callbacks', async () => {
      const service = new WindowService();
      const onMove = vi.fn();
      const onResize = vi.fn();
      const onViewportResize = vi.fn();
      const onStateEvent = vi.fn();
      const onGlobalKeyDown = vi.fn();

      service.initialize({
        onMove,
        onResize,
        onViewportResize,
        onStateEvent,
        onGlobalKeyDown,
      });

      await vi.waitFor(() => {
        expect(onMove).toHaveBeenCalledWith({ x: 10, y: 20 });
        expect(onResize).toHaveBeenCalledWith({ width: 1280, height: 720 });
        expect(onViewportResize).toHaveBeenCalled();
      });

      await service.close();
      await service.minimize();
      await service.maximize();
      await service.restore();
      await service.drag();
      await service.reload();
      await service.reloadForce();
      await service.toggleDevTools();

      expect(window.electronAPI?.closeWindow).toHaveBeenCalled();
      expect(window.electronAPI?.toggleDevTools).toHaveBeenCalled();
      expect(typeof onStateEvent).toBe('function');

      service.dispose();
    });
  });
});
