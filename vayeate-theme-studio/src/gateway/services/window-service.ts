function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

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
};
