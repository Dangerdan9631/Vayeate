import { singleton } from 'tsyringe';
import { generateThemePair } from '../../domain/utils/theme-generator';
import {
  assertValidThemeFileName,
  stringifyTheme,
  toSafeFileName,
} from '../../domain/utils/theme-export-format';
import { createThemeWithParams } from '../../model/factories';
import { themeReferenceSchema, themeSchema } from '../../model/schemas';
import type { Theme, ThemeName, ThemeReference, Version } from '../../model/schemas';
import { FileSystemService } from '../services/file-system-service';
import { TemplateGateway } from '../template/template-gateway';

const THEMES_RELATIVE_DIR = 'data/themes';

/**
 * Renderer-relative prefix resolved in main to repo-root `themes/` (sibling of Theme Studio package).
 * See `electron/main.ts` fs:saveFile handling for `exthemes/`.
 */
const EXTENSION_THEMES_EXPORT_PREFIX = 'exthemes';

/** Semver at end of filename: optional prerelease and build. */
const FILENAME_VERSION_REGEX = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;

function fileName(name: ThemeName, version: Version): string {
  return `${name}-${version}.theme.json`;
}

function themeRelativeFilePath(name: ThemeName, version: Version): string {
  return `${THEMES_RELATIVE_DIR}/${fileName(name, version)}`;
}

function parseFileName(baseName: string): { name: ThemeName; version: Version } | null {
  if (!baseName.endsWith('.theme.json')) return null;
  const withoutExt = baseName.slice(0, -'.theme.json'.length);
  const match = FILENAME_VERSION_REGEX.exec(withoutExt);
  if (!match) return null;
  const [, n, ver] = match;
  const refResult = themeReferenceSchema.safeParse({ name: n, version: ver });
  return refResult.success ? refResult.data : null;
}

@singleton()
export class ThemeGateway {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly templateGateway: TemplateGateway,
  ) {}

  /**
   * Generate VS Code dark/light theme JSON from a theme + template in `data/`, then write to repo-root `themes/`
   * via {@link FileSystemService} (main process maps `exthemes/...` to `../themes/...`).
   */
  async generateTheme(
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ): Promise<{ darkPath: string; lightPath: string }> {
    const theme = await this.loadTheme(themeName, themeVersion);
    if (!theme) {
      throw new Error(`Theme not found: ${themeName} v${themeVersion}`);
    }
    const template = await this.templateGateway.loadTemplate(templateName, templateVersion);
    if (!template) {
      throw new Error(`Template not found: ${templateName} v${templateVersion}`);
    }
    const { dark, light } = generateThemePair(theme, template);
    const darkFileName = toSafeFileName(theme.name, false);
    const lightFileName = toSafeFileName(theme.name, true);
    assertValidThemeFileName(darkFileName);
    assertValidThemeFileName(lightFileName);
    const darkRel = `${EXTENSION_THEMES_EXPORT_PREFIX}/${darkFileName}`;
    const lightRel = `${EXTENSION_THEMES_EXPORT_PREFIX}/${lightFileName}`;
    await this.fileSystemService.saveFile(darkRel, stringifyTheme(dark));
    await this.fileSystemService.saveFile(lightRel, stringifyTheme(light));
    return { darkPath: darkRel, lightPath: lightRel };
  }

  async createTheme(params: { name: string }): Promise<Theme> {
    const theme = createThemeWithParams(params);
    await this.saveTheme(theme);
    return theme;
  }

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
    const rel = themeRelativeFilePath(parsed.data.name, parsed.data.version);
    await this.fileSystemService.saveFile(rel, JSON.stringify(toPersist, null, 2));
  }

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

  async deleteTheme(name: string, version: string): Promise<void> {
    const rel = themeRelativeFilePath(name, version);
    try {
      await this.fileSystemService.deleteFile(rel);
    } catch {
      // file not found (no-op)
    }
  }

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
