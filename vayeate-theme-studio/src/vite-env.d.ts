/// <reference types="vite/client" />

/** Shape of `contextBridge.exposeInMainWorld('electronAPI', …)` in `electron/preload.ts`. */
export interface ElectronAPI {
  fetchUrl: (url: string) => Promise<string>;
  /** Multi-monitor layout + per-display PNG bytes (ScreenshotService). */
  screenshotGetFullDisplaySnapshot: () => Promise<{
    fullBounds: { x: number; y: number; width: number; height: number };
    displays: Array<{
      sourceId: string;
      x: number;
      y: number;
      width: number;
      height: number;
      png: Uint8Array;
    }>;
  }>;
  closeWindow: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  restoreWindow: () => Promise<void>;
  dragWindow: () => Promise<void>;
  reloadWindow: () => Promise<void>;
  reloadWindowForce: () => Promise<void>;
  toggleDevTools: () => Promise<void>;
  /** BrowserWindow bounds from main (x, y, width, height). */
  getWindowBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
  /** Subscribe to main process logs so they appear in the renderer DevTools console. */
  onMainLog: (callback: (level: 'debug' | 'info' | 'warn' | 'error', args: string[]) => void) => void;
  /** Subscribe to window state events from main. Returns unsubscribe. */
  onWindowState: (
    callback: (event: 'minimized' | 'maximized' | 'unmaximized' | 'restored') => void,
  ) => () => void;
  /** Subscribe to window resize events from main. Returns unsubscribe. */
  onWindowResize: (callback: (size: { width: number; height: number }) => void) => () => void;
  /** Subscribe to window move events from main. Returns unsubscribe. */
  onWindowMove: (callback: (position: { x: number; y: number }) => void) => () => void;
  /** Send renderer logs to main process so they appear in the IDE/terminal console. */
  sendLog: (level: 'debug' | 'info' | 'warn' | 'error', tag: string, args: string[]) => void;
  fsCreateFile: (relativePath: string) => Promise<void>;
  fsSaveFile: (relativePath: string, contents: string) => Promise<void>;
  fsLoadFile: (relativePath: string) => Promise<string | null>;
  fsDeleteFile: (relativePath: string) => Promise<void>;
  fsListFiles: (relativeDirPath: string) => Promise<string[]>;
  fsListDirEntries: (relativeDirPath: string) => Promise<Array<{ name: string; isDirectory: boolean }>>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electronInitialColorScheme?: 'light' | 'dark';
  }
}

export {};
