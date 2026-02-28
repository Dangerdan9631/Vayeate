import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { themeReferenceSchema, themeSchema } from '../model/schemas.js';
import type { Theme, ThemeName, ThemeReference, Version } from '../model/schemas.js';

const TAG = '[ThemeRepo]';
const THEMES_DIR = 'themes';

const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

function themesPath(baseDir: string): string {
  return join(baseDir, THEMES_DIR);
}

function fileName(name: ThemeName, version: Version): string {
  return `${name}-${version}.theme.json`;
}

function filePath(baseDir: string, name: ThemeName, version: Version): string {
  return join(themesPath(baseDir), fileName(name, version));
}

function parseFileName(baseName: string): { name: ThemeName; version: Version } | null {
  if (!baseName.endsWith('.theme.json')) return null;
  const withoutExt = baseName.slice(0, -'.theme.json'.length);
  const match = FILENAME_VERSION_REGEX.exec(withoutExt);
  if (!match) return null;
  const [, name, version] = match;
  const refResult = themeReferenceSchema.safeParse({ name, version });
  return refResult.success ? refResult.data : null;
}

export function createThemeRepository(baseDir: string) {
  const dir = themesPath(baseDir);
  console.debug(TAG, 'initialized with dir:', dir);

  return {
    async saveTheme(theme: Theme): Promise<void> {
      console.debug(TAG, 'saveTheme', theme.name, `v${theme.version}`,
        `(${theme.colorAssignments.length} color, ${theme.contrastAssignments.length} contrast)`);
      const parsed = themeSchema.safeParse(theme);
      if (!parsed.success) {
        console.error(TAG, 'saveTheme validation failed:', parsed.error.message);
        throw new Error('Invalid theme: ' + parsed.error.message);
      }
      await mkdir(dir, { recursive: true });
      const path = filePath(baseDir, theme.name, theme.version);
      await writeFile(path, JSON.stringify(parsed.data, null, 2), 'utf-8');
      console.debug(TAG, 'saveTheme written to', path);
    },

    async loadTheme(name: ThemeName, version: Version): Promise<Theme | null> {
      const path = filePath(baseDir, name, version);
      console.debug(TAG, 'loadTheme', name, `v${version}`, 'from', path);
      try {
        const raw = await readFile(path, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        const result = themeSchema.safeParse(parsed);
        if (result.success) {
          console.debug(TAG, 'loadTheme →', result.data.colorAssignments.length, 'color assignment(s)');
          return result.data;
        }
        console.warn(TAG, 'loadTheme validation failed for', path);
        return null;
      } catch {
        console.debug(TAG, 'loadTheme file not found or unreadable:', path);
        return null;
      }
    },

    async deleteTheme(name: ThemeName, version: Version): Promise<void> {
      const path = filePath(baseDir, name, version);
      console.debug(TAG, 'deleteTheme', name, `v${version}`, path);
      try {
        await unlink(path);
        console.debug(TAG, 'deleteTheme removed', path);
      } catch {
        console.debug(TAG, 'deleteTheme file not found (no-op):', path);
      }
    },

    async listThemes(): Promise<ThemeReference[]> {
      console.debug(TAG, 'listThemes scanning', dir);
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        const refs: ThemeReference[] = [];
        for (const ent of entries) {
          if (!ent.isFile()) continue;
          const parsed = parseFileName(ent.name);
          if (parsed) refs.push(parsed);
        }
        console.debug(TAG, 'listThemes →', refs.length, 'ref(s)');
        return refs;
      } catch {
        console.debug(TAG, 'listThemes directory does not exist yet, returning empty');
        return [];
      }
    },
  };
}

export type ThemeRepository = ReturnType<typeof createThemeRepository>;
