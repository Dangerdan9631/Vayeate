/// <reference types="vite/client" />

import type { TokenizedPreview } from './model/preview-types';

declare global {
  interface Window {
    electronAPI?: {
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
      fsCreateFile: (relativePath: string) => Promise<void>;
      fsSaveFile: (relativePath: string, contents: string) => Promise<void>;
      fsLoadFile: (relativePath: string) => Promise<string | null>;
      fsDeleteFile: (relativePath: string) => Promise<void>;
      fsListFiles: (relativeDirPath: string) => Promise<string[]>;
    };
    electronInitialColorScheme?: 'light' | 'dark';
  }
}

export {};
