/**
 * Pure formatting for VS Code theme JSON export (no Node fs).
 * Used by theme-exporter (main) and ThemeGateway (renderer via FileSystemService).
 */

/**
 * Formats a VS Code theme export filename from a theme name and mode flag.
 *
 * @param themeName - Raw theme name sanitized to lowercase alphanumeric and hyphens.
 * @param light - When true, appends the `-light` suffix to the base filename.
 * @returns Safe `.json` filename matching VS Code color theme conventions.
 */
export function toSafeFileName(themeName: string, light: boolean): string {
  const base = themeName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return light ? `${base}-light-color-theme.json` : `${base}-color-theme.json`;
}
