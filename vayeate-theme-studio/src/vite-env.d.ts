/// <reference types="vite/client" />

import type { Catalog, CatalogReference, Template, TemplateReference, Theme, ThemeReference } from './model/schemas';
import type { TokenizedPreview } from './model/preview-types';

declare global {
  interface Window {
    electronAPI?: {
      saveCatalog: (catalog: Catalog) => Promise<void>;
      loadCatalog: (name: string, version: string) => Promise<Catalog | null>;
      listCatalogs: () => Promise<CatalogReference[]>;
      createCatalog: (params: { name: string; type: 'manual' | 'remote' }) => Promise<Catalog>;
      deleteCatalog: (name: string, version: string) => Promise<void>;
      createTemplate: (params: { name: string }) => Promise<Template>;
      saveTemplate: (template: Template) => Promise<void>;
      loadTemplate: (name: string, version: string) => Promise<Template | null>;
      listTemplates: () => Promise<TemplateReference[]>;
      deleteTemplate: (name: string, version: string) => Promise<void>;
      createTheme: (params: { name: string }) => Promise<Theme>;
      saveTheme: (theme: Theme) => Promise<void>;
      loadTheme: (name: string, version: string) => Promise<Theme | null>;
      listThemes: () => Promise<ThemeReference[]>;
      deleteTheme: (name: string, version: string) => Promise<void>;
      generateTheme: (
        themeName: string,
        themeVersion: string,
        templateName: string,
        templateVersion: string,
      ) => Promise<{ darkPath: string; lightPath: string }>;
      fetchUrl: (url: string) => Promise<string>;
      loadPreviews: () => Promise<TokenizedPreview[]>;
      /** All screen sources + bounds for full-screen color picker (multi-monitor). */
      eyedropperGetScreenSourcesWithBounds?: () => Promise<{
        sources: Array<{ sourceId: string; x: number; y: number; width: number; height: number }>;
        fullBounds: { x: number; y: number; width: number; height: number };
      }>;
      closeWindow?: () => Promise<void>;
      minimizeWindow?: () => Promise<void>;
      maximizeWindow?: () => Promise<void>;
      restoreWindow?: () => Promise<void>;
      dragWindow?: () => Promise<void>;
      reloadWindow?: () => Promise<void>;
      reloadWindowForce?: () => Promise<void>;
      toggleDevTools?: () => Promise<void>;
      /** Subscribe to main process logs so they appear in the renderer DevTools console. */
      onMainLog?: (callback: (level: 'debug' | 'info' | 'warn' | 'error', args: string[]) => void) => void;
      /** Subscribe to window state events from main. Returns unsubscribe. */
      onWindowState?: (
        callback: (event: 'minimized' | 'maximized' | 'unmaximized' | 'restored') => void,
      ) => () => void;
      /** Subscribe to window resize events from main. Returns unsubscribe. */
      onWindowResize?: (callback: (size: { width: number; height: number }) => void) => () => void;
      /** Subscribe to window move events from main. Returns unsubscribe. */
      onWindowMove?: (callback: (position: { x: number; y: number }) => void) => () => void;
      /** Send renderer logs to main process so they appear in the IDE/terminal console. */
      sendLog?: (level: 'debug' | 'info' | 'warn' | 'error', tag: string, args: string[]) => void;
      undoV2Save?: (stackId: string, payload: string) => Promise<void>;
      undoV2Load?: (stackId: string) => Promise<string | null>;
      undoV2ClearPersisted?: () => Promise<void>;
      saveConfig?: (config: { colorScheme?: string }) => Promise<void>;
    };
    electronInitialColorScheme?: 'light' | 'dark';
  }
}

export {};
