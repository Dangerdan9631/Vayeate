import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { themeReferenceSchema, themeSchema } from '../model/schemas.js';
import type { Theme, ThemeName, ThemeReference, Version } from '../model/schemas.js';

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

  return {
    async saveTheme(theme: Theme): Promise<void> {
      const parsed = themeSchema.safeParse(theme);
      if (!parsed.success) {
        throw new Error('Invalid theme: ' + parsed.error.message);
      }
      const toPersist = { ...parsed.data } as Record<string, unknown>;
      delete toPersist.idePrimaryColorVariableRef;
      delete toPersist.idePrimaryColorContrastVariableRef;
      delete toPersist.themeBackgroundColorVariableRef;
      delete toPersist.lineNumberBackgroundColorVariableRef;
      delete toPersist.lineNumberBackgroundContrastVariableRef;
      delete toPersist.lineNumberForegroundColorVariableRef;
      delete toPersist.lineNumberForegroundContrastVariableRef;
      delete toPersist.ideTabColorVariableRef;
      delete toPersist.ideTabContrastVariableRef;
      delete toPersist.ideTabBarBackgroundColorVariableRef;
      delete toPersist.ideTabBarBackgroundContrastVariableRef;
      delete toPersist.ideTabBarForegroundColorVariableRef;
      delete toPersist.ideTabBarForegroundContrastVariableRef;
      delete toPersist.editorPreviewScrollbarBackgroundColorVariableRef;
      delete toPersist.editorPreviewScrollbarBackgroundContrastVariableRef;
      delete toPersist.editorPreviewScrollbarForegroundColorVariableRef;
      delete toPersist.editorPreviewScrollbarForegroundContrastVariableRef;
      delete toPersist.editorPreviewSelectionBackgroundColorVariableRef;
      delete toPersist.editorPreviewSelectionBackgroundContrastVariableRef;
      await mkdir(dir, { recursive: true });
      const path = filePath(baseDir, theme.name, theme.version);
      await writeFile(path, JSON.stringify(toPersist, null, 2), 'utf-8');
    },

    async loadTheme(name: ThemeName, version: Version): Promise<Theme | null> {
      const path = filePath(baseDir, name, version);
      try {
        const raw = await readFile(path, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        const result = themeSchema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
        return null;
      } catch {
        return null;
      }
    },

    async deleteTheme(name: ThemeName, version: Version): Promise<void> {
      const path = filePath(baseDir, name, version);
      try {
        await unlink(path);
      } catch {
        // file not found (no-op)
      }
    },

    async listThemes(): Promise<ThemeReference[]> {
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        const refs: ThemeReference[] = [];
        for (const ent of entries) {
          if (!ent.isFile()) continue;
          const parsed = parseFileName(ent.name);
          if (parsed) refs.push(parsed);
        }
        return refs;
      } catch {
        return [];
      }
    },
  };
}

export type ThemeRepository = ReturnType<typeof createThemeRepository>;
