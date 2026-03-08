/**
 * @vitest-environment node
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createThemeRepository } from './theme-repository';
import type { Theme } from '../model/schemas';

describe('createThemeRepository', () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = mkdtempSync(join(tmpdir(), 'theme-repo-test-'));
  });

  afterEach(() => {
    rmSync(baseDir, { recursive: true, force: true });
  });

  const validTheme: Theme = {
    name: 'my-theme',
    version: '1.0.0',
    templateRef: null,
    idePrimaryTokenRef: null,
    ideForegroundTokenRef: null,
    themeBackgroundTokenRef: null,
    themeForegroundTokenRef: null,
    lineNumberBackgroundTokenRef: null,
    lineNumberForegroundTokenRef: null,
    ideTabTokenRef: null,
    ideTabBarBackgroundTokenRef: null,
    ideTabBarForegroundTokenRef: null,
    editorPreviewScrollbarBackgroundTokenRef: null,
    editorPreviewScrollbarForegroundTokenRef: null,
    editorPreviewSelectionBackgroundTokenRef: null,
    editorPreviewMenuForegroundTokenRef: null,
    editorPreviewMenuBackgroundTokenRef: null,
    colorAssignments: [],
    contrastAssignments: [],
  };

  it('saves and loads a theme round-trip', async () => {
    const repo = createThemeRepository(baseDir);
    await repo.saveTheme(validTheme);
    const loaded = await repo.loadTheme('my-theme', '1.0.0');
    expect(loaded).toEqual(validTheme);
  });

  it('listThemes returns saved theme references', async () => {
    const repo = createThemeRepository(baseDir);
    await repo.saveTheme(validTheme);
    const list = await repo.listThemes();
    expect(list).toContainEqual({ name: 'my-theme', version: '1.0.0' });
  });

  it('loadTheme returns null for missing file', async () => {
    const repo = createThemeRepository(baseDir);
    const loaded = await repo.loadTheme('missing', '1.0.0');
    expect(loaded).toBeNull();
  });

  it('saveTheme throws for invalid theme', async () => {
    const repo = createThemeRepository(baseDir);
    const invalid = { ...validTheme, name: 'invalid name!' } as Theme;
    await expect(repo.saveTheme(invalid)).rejects.toThrow(/Invalid theme/);
  });

  it('normalizes bare hex in color assignments on save', async () => {
    const repo = createThemeRepository(baseDir);
    const themeWithBareHex: Theme = {
      ...validTheme,
      colorAssignments: [
        {
          colorRef: 'primary',
          dark: { value: 'ff0000' },
          light: { value: '00ff00' },
          useDarkForLight: false,
        },
      ],
    };
    await repo.saveTheme(themeWithBareHex);
    const loaded = await repo.loadTheme('my-theme', '1.0.0');
    expect(loaded).not.toBeNull();
    expect(loaded!.colorAssignments[0].dark?.value).toBe('#ff0000');
    expect(loaded!.colorAssignments[0].light?.value).toBe('#00ff00');
  });

  it('deleteTheme removes the file', async () => {
    const repo = createThemeRepository(baseDir);
    await repo.saveTheme(validTheme);
    await repo.deleteTheme('my-theme', '1.0.0');
    const loaded = await repo.loadTheme('my-theme', '1.0.0');
    expect(loaded).toBeNull();
  });

  it('deleteTheme is a no-op for missing file', async () => {
    const repo = createThemeRepository(baseDir);
    await expect(repo.deleteTheme('missing', '1.0.0')).resolves.toBeUndefined();
  });

  it('lists multiple versions for the same name', async () => {
    const repo = createThemeRepository(baseDir);
    await repo.saveTheme(validTheme);
    await repo.saveTheme({ ...validTheme, version: '1.0.1' });
    const list = await repo.listThemes();
    expect(list).toHaveLength(2);
    expect(list).toContainEqual({ name: 'my-theme', version: '1.0.0' });
    expect(list).toContainEqual({ name: 'my-theme', version: '1.0.1' });
  });
});
