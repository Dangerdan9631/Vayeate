/** Relative file keys for `data_io` queue scheduling (match gateway save/load paths). */

export function themeDataFileKey(name: string, version: string): string {
  return `data/themes/${name}-${version}.theme.json`;
}

export function catalogDataFileKey(name: string, version: string): string {
  return `data/catalogs/${name}-${version}.json`;
}

export function templateDataFileKey(name: string, version: string): string {
  return `data/templates/${name}-${version}.template.json`;
}

export const APP_CONFIG_DATA_FILE_KEY = 'data/config.json';

export function undoStackDataFileKey(stackId: string): string {
  return `data/.undo/${stackId.replace(/[\\/:*?"<>|+]/g, '_')}.json`;
}
