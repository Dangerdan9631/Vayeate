import type { GeneratedTheme } from './theme-generator';
import { yieldToEventLoop } from '../core/scheduler';

/**
 * Serializes a generated theme to JSON with four-space indent.
 *
 * @param theme - Generated VS Code theme object to export.
 * @returns JSON string with trailing newline matching VS Code theme file format.
 */
export function stringifyTheme(theme: GeneratedTheme): string {
  return JSON.stringify(theme, null, 4) + '\n';
}

/**
 * Serializes a generated theme after yielding so deferred-queue work can paint.
 *
 * @param theme - Generated VS Code theme object to export.
 * @returns JSON string with trailing newline matching VS Code theme file format.
 */
export async function stringifyThemeAsync(theme: GeneratedTheme): Promise<string> {
  await yieldToEventLoop();
  return stringifyTheme(theme);
}
