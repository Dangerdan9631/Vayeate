import type { Theme } from '../model/schemas';
import { createLogger } from '../utils/logger';

const log = createLogger('ThemeService');

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const themeService = {
  createTheme: async (params: { name: string }): Promise<Theme> => {
    log.debug('IPC theme:create', params.name);
    const theme = await getAPI().createTheme(params);
    log.debug('IPC theme:create →', theme.name, `v${theme.version}`);
    return theme;
  },
  saveTheme: async (theme: Theme): Promise<void> => {
    log.debug('IPC theme:save', theme.name, `v${theme.version}`,
      `(${theme.colorAssignments.length} color, ${theme.contrastAssignments.length} contrast)`);
    await getAPI().saveTheme(theme);
    log.debug('IPC theme:save complete');
  },
  loadTheme: async (name: string, version: string): Promise<Theme | null> => {
    log.debug('IPC theme:load', name, `v${version}`);
    const theme = await getAPI().loadTheme(name, version);
    log.debug('IPC theme:load →', theme ? `${theme.colorAssignments.length} color assignment(s)` : '(not found)');
    return theme;
  },
  listThemes: async () => {
    log.debug('IPC theme:list');
    const refs = await getAPI().listThemes();
    log.debug('IPC theme:list →', refs.length, 'ref(s)');
    return refs;
  },
  deleteTheme: async (name: string, version: string): Promise<void> => {
    log.debug('IPC theme:delete', name, `v${version}`);
    await getAPI().deleteTheme(name, version);
    log.debug('IPC theme:delete complete');
  },
};
