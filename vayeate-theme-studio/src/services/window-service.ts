function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const windowService = {
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
