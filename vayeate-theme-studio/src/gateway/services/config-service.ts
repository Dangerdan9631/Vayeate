function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const configService = {
  save: async (config: { colorScheme: 'light' | 'dark' }): Promise<void> => {
    await getAPI().saveConfig?.(config);
  },
};
