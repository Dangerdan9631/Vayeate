import type { GeneratedTheme } from './theme-generator';

/** Serialize theme to JSON with 4-space indent (matching VS Code theme format). */
export function stringifyTheme(theme: GeneratedTheme): string {
  return JSON.stringify(theme, null, 4) + '\n';
}
