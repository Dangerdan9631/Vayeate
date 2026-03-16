function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

type WindowStateEvent = 'minimized' | 'maximized' | 'unmaximized' | 'restored';

export const windowService = {
  close: async (): Promise<void> => {
    await getAPI().closeWindow?.();
  },
  minimize: async (): Promise<void> => {
    await getAPI().minimizeWindow?.();
  },
  maximize: async (): Promise<void> => {
    await getAPI().maximizeWindow?.();
  },
  restore: async (): Promise<void> => {
    await getAPI().restoreWindow?.();
  },
  drag: async (): Promise<void> => {
    await getAPI().dragWindow?.();
  },
  reload: async (): Promise<void> => {
    await getAPI().reloadWindow?.();
  },
  reloadForce: async (): Promise<void> => {
    await getAPI().reloadWindowForce?.();
  },
  toggleDevTools: async (): Promise<void> => {
    await getAPI().toggleDevTools?.();
  },
  onWindowState: (
    callback: (event: WindowStateEvent) => void,
  ): (() => void) | undefined => {
    return window.electronAPI?.onWindowState?.(callback);
  },
  onWindowResize: (
    callback: (size: { width: number; height: number }) => void,
  ): (() => void) | undefined => {
    return window.electronAPI?.onWindowResize?.(callback);
  },
  onWindowMove: (
    callback: (position: { x: number; y: number }) => void,
  ): (() => void) | undefined => {
    return window.electronAPI?.onWindowMove?.(callback);
  },
};
