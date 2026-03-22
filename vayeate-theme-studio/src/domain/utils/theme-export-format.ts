/**
 * Pure formatting for VS Code theme JSON export (no Node fs).
 * Used by theme-exporter (main) and ThemeGateway (renderer via FileSystemService).
 */

import type { GeneratedTheme } from './theme-generator';

const THEME_FILE_PATTERN = /^[a-z0-9-]+(?:-light)?-color-theme\.json$/;

export function toSafeFileName(themeName: string, light: boolean): string {
  const base = themeName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return light ? `${base}-light-color-theme.json` : `${base}-color-theme.json`;
}

export function assertValidThemeFileName(fileName: string): void {
  if (!THEME_FILE_PATTERN.test(fileName)) {
    throw new Error(`Invalid theme output filename: ${fileName}`);
  }
}

/** Serialize theme to JSON with 4-space indent (matching VS Code theme format). */
export function stringifyTheme(theme: GeneratedTheme): string {
  return JSON.stringify(theme, null, 4) + '\n';
}
