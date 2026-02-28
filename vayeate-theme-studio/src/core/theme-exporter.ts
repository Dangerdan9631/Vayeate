/**
 * Writes generated dark and light theme JSON files to disk.
 * Uses atomic write (temp file + rename). Output directory must be the themes folder.
 */

import { writeFile, rename, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { GeneratedTheme } from './theme-generator';

const THEME_FILE_PATTERN = /^[a-z0-9-]+(?:-light)?-color-theme\.json$/;

function toSafeFileName(themeName: string, light: boolean): string {
  const base = themeName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return light ? `${base}-light-color-theme.json` : `${base}-color-theme.json`;
}

export function assertValidThemeFileName(fileName: string): void {
  if (!THEME_FILE_PATTERN.test(fileName)) {
    throw new Error(`Invalid theme output filename: ${fileName}`);
  }
}

/**
 * Serialize theme to JSON with 4-space indent (matching VS Code theme format).
 */
function stringifyTheme(theme: GeneratedTheme): string {
  return JSON.stringify(theme, null, 4) + '\n';
}

async function writeAtomic(targetPath: string, content: string): Promise<void> {
  const tempPath = `${targetPath}.tmp`;
  await writeFile(tempPath, content, 'utf8');
  await rename(tempPath, targetPath);
}

/**
 * Export dark and light theme JSON files to outputDir.
 * outputDir should be the absolute path to the themes directory (e.g. project root/themes).
 * Returns the paths of the written files.
 */
export async function exportThemePair(
  outputDir: string,
  themeName: string,
  dark: GeneratedTheme,
  light: GeneratedTheme,
): Promise<{ darkPath: string; lightPath: string }> {
  const darkFileName = toSafeFileName(themeName, false);
  const lightFileName = toSafeFileName(themeName, true);
  assertValidThemeFileName(darkFileName);
  assertValidThemeFileName(lightFileName);

  await mkdir(outputDir, { recursive: true });

  const darkPath = join(outputDir, darkFileName);
  const lightPath = join(outputDir, lightFileName);

  await writeAtomic(darkPath, stringifyTheme(dark));
  await writeAtomic(lightPath, stringifyTheme(light));

  return { darkPath, lightPath };
}
