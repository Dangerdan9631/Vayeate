/**
 * Writes generated dark and light theme JSON files to disk.
 * Uses atomic write (temp file + rename). Output directory must be the themes folder.
 */

import { writeFile, rename, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { GeneratedTheme } from './theme-generator';
import { assertValidThemeFileName } from './assert-valid-theme-file-name';
import { stringifyTheme } from './stringify-theme';
import { toSafeFileName } from './to-safe-theme-file-name';

export { assertValidThemeFileName } from './assert-valid-theme-file-name';

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
