/**
 * Builds the relative data file key for a theme artifact.
 *
 * @param name - Theme name segment used in the filename.
 * @param version - Theme version segment used in the filename.
 * @returns Path under `data/themes/` suitable for `data_io` queue ordering.
 */
export function themeDataFileKey(name: string, version: string): string {
  return `data/themes/${name}-${version}.theme.json`;
}

/**
 * Builds the relative data file key for a catalog artifact.
 *
 * @param name - Catalog name segment used in the filename.
 * @param version - Catalog version segment used in the filename.
 * @returns Path under `data/catalogs/` suitable for `data_io` queue ordering.
 */
export function catalogDataFileKey(name: string, version: string): string {
  return `data/catalogs/${name}-${version}.json`;
}

/**
 * Builds the relative data file key for a template artifact.
 *
 * @param name - Template name segment used in the filename.
 * @param version - Template version segment used in the filename.
 * @returns Path under `data/templates/` suitable for `data_io` queue ordering.
 */
export function templateDataFileKey(name: string, version: string): string {
  return `data/templates/${name}-${version}.template.json`;
}

/**
 * Relative file key for persisted application configuration.
 */
export const APP_CONFIG_DATA_FILE_KEY = 'data/config.json';

/**
 * Builds the relative data file key for a persisted undo stack.
 *
 * @param stackId - Undo stack identifier; unsafe filename characters are replaced.
 * @returns Path under `data/.undo/` suitable for `data_io` queue ordering.
 */
export function undoStackDataFileKey(stackId: string): string {
  return `data/.undo/${stackId.replace(/[\\/:*?"<>|+]/g, '_')}.json`;
}
