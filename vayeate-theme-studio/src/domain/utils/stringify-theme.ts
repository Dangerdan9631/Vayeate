import type { GeneratedTheme } from './theme-generator';

/**
 * Serializes a generated theme to JSON with four-space indent.
 *
 * @param theme - Generated VS Code theme object to export.
 * @returns JSON string with trailing newline matching VS Code theme file format.
 */
export function stringifyTheme(theme: GeneratedTheme): string {
  return JSON.stringify(theme, null, 4) + '\n';
}
