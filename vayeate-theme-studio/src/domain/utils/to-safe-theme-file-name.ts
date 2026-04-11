/**
 * Pure formatting for VS Code theme JSON export (no Node fs).
 * Used by theme-exporter (main) and ThemeGateway (renderer via FileSystemService).
 */

export function toSafeFileName(themeName: string, light: boolean): string {
  const base = themeName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return light ? `${base}-light-color-theme.json` : `${base}-color-theme.json`;
}
