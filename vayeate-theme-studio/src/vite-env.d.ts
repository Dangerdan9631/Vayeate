/// <reference types="vite/client" />

export interface ElectronAPI {
  fetchUrl: (url: string) => Promise<string>;
  screenshotGetFullDisplaySnapshot: () => Promise<{
    fullBounds: Rect; 
    displays: Array<{
      sourceId: string;
      bounds: Rect;
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
  getWindowBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
  onMainLog: (callback: (level: 'debug' | 'info' | 'warn' | 'error', args: string[]) => void) => void;
  onWindowState: (
    callback: (event: 'minimized' | 'maximized' | 'unmaximized' | 'restored') => void,
  ) => () => void;
  onWindowResize: (callback: (size: { width: number; height: number }) => void) => () => void;
  onWindowMove: (callback: (position: { x: number; y: number }) => void) => () => void;
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
  }
}

export {};
