import { singleton } from 'tsyringe';
import { themeReferenceSchema, themeSchema } from '../../model/schema/theme-schemas';
import type { ThemeName, Version } from '../../model/schema/primitives';
import type { Theme, ThemeReference } from '../../model/schema/theme-schemas';
import { FileSystemService } from '../services/file-system-service';

/**
 * Package-relative path: Theme Studio root `data/themes/`.
 */
const THEMES_RELATIVE_DIR = 'data/themes';

/**
 * Semver at end of filename: optional prerelease and build.
 */
const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

/**
 * Builds the on-disk theme filename for a name and version pair.
 *
 * @param name - Theme name segment of the filename.
 * @param version - Semver segment of the filename.
 * @returns Filename in the form `<name>-<version>.theme.json`.
 */
function fileName(name: ThemeName, version: Version): string {
  return `${name}-${version}.theme.json`;
}

/**
 * Resolves the package-relative path for a theme JSON file.
 *
 * @param name - Theme name.
 * @param version - Theme version.
 * @returns Path under `data/themes/`.
 */
function themeRelativeFilePath(name: ThemeName, version: Version): string {
  return `${THEMES_RELATIVE_DIR}/${fileName(name, version)}`;
}

/**
 * Parses a theme filename (without path) into name and version, or null if not valid.
 *
 * @param baseName - Filename including extension.
 * @returns Parsed reference, or null when the name does not match the expected pattern.
 */
function parseFileName(baseName: string): { name: ThemeName; version: Version } | null {
  if (!baseName.endsWith('.theme.json')) return null;
  const withoutExt = baseName.slice(0, -'.theme.json'.length);
  const match = FILENAME_VERSION_REGEX.exec(withoutExt);
  if (!match) return null;
  const [, n, ver] = match;
  const refResult = themeReferenceSchema.safeParse({ name: n, version: ver });
  return refResult.success ? refResult.data : null;
}

/**
 * Persists themes under `data/themes/` with zod validation on read and write.
 */
@singleton()
export class ThemeGateway {
  constructor(private readonly fileSystemService: FileSystemService) {}

  /**
   * Validates and writes a theme JSON file for its name and version.
   *
   * @param theme - Domain theme to persist.
   * @returns Resolves when the file is saved.
   */
  async saveTheme(theme: Theme): Promise<void> {
    const parsed = themeSchema.safeParse(theme);
    if (!parsed.success) {
      throw new Error('Invalid theme: ' + parsed.error.message);
    }
    const rel = themeRelativeFilePath(parsed.data.name, parsed.data.version);
    await this.fileSystemService.saveFile(rel, JSON.stringify(parsed.data));
  }

  /**
   * Loads and parses a theme file by name and version.
   *
   * @param name - Theme name.
   * @param version - Theme version.
   * @returns Parsed theme, or null when missing or invalid.
   */
  async loadTheme(name: string, version: string): Promise<Theme | null> {
    const rel = themeRelativeFilePath(name, version);
    try {
      const raw = await this.fileSystemService.loadFile(rel);
      if (raw === null) return null;
      const parsedJson: unknown = JSON.parse(raw);
      const result = themeSchema.safeParse(parsedJson);
      if (result.success) {
        return result.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Deletes a theme file; missing files are ignored.
   *
   * @param name - Theme name.
   * @param version - Theme version.
   * @returns Resolves when delete completes or the file is absent.
   */
  async deleteTheme(name: string, version: string): Promise<void> {
    const rel = themeRelativeFilePath(name, version);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // file not found (no-op)
    }
  }

  /**
   * Lists theme name/version pairs inferred from filenames in `data/themes/`.
   *
   * @returns Valid theme references, or an empty list on I/O failure.
   */
  async listThemes(): Promise<ThemeReference[]> {
    try {
      const names = await this.fileSystemService.listFiles(THEMES_RELATIVE_DIR);
      const refs: ThemeReference[] = [];
      for (const n of names) {
        const parsed = parseFileName(n);
        if (parsed) refs.push(parsed);
      }
      return refs;
    } catch {
      return [];
    }
  }
}
