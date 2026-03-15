import type { Theme } from '../../model/schemas';

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const themeService = {
  createTheme: async (params: { name: string }): Promise<Theme> => {
    const theme = await getAPI().createTheme(params);
    return theme;
  },
  saveTheme: async (theme: Theme): Promise<void> => {
    await getAPI().saveTheme(theme);
  },
  loadTheme: async (name: string, version: string): Promise<Theme | null> => {
    const theme = await getAPI().loadTheme(name, version);
    return theme;
  },
  listThemes: async () => {
    const refs = await getAPI().listThemes();
    return refs;
  },
  deleteTheme: async (name: string, version: string): Promise<void> => {
    await getAPI().deleteTheme(name, version);
  },

  generateTheme: async (
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ): Promise<{ darkPath: string; lightPath: string }> => {
    const result = await getAPI().generateTheme(
      themeName,
      themeVersion,
      templateName,
      templateVersion,
    );
    return result;
  },
};
