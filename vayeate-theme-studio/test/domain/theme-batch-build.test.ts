import 'reflect-metadata';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { TemplateGateway } from '../../src/gateway/gateway/Template/template/template-gateway';
import type { ThemeGateway } from '../../src/gateway/gateway/Theme/theme/theme-gateway';
import type { FileSystemService } from '../../src/gateway/services/Common/file-system-service';
import type { ThemeScreenshotService } from '../../src/gateway/services/Common/theme-screenshot-service';
import { GenerateAllThemesOperation } from '../../src/domain/operations/Theme/theme-operations/theme-details/generate-all-themes-operation';
import { GenerateThemeScreenshotsOperation } from '../../src/domain/operations/Theme/theme-operations/theme-details/generate-theme-screenshots-operation';
import { latestThemeReferences } from '../../src/domain/operations/Theme/theme-operations/theme-details/latest-theme-references-operation';
import { ValidateIsThemeFileNameValid } from '../../src/domain/validations/Theme/theme-validations/validate-is-theme-file-name-valid';
import { templateSchema, type Template } from '../../src/model/Template/schema/template-schemas';
import { themeSchema, type Theme } from '../../src/model/Theme/schema/theme-schemas';
import type { ThemeScreenshotRequest } from '../../src/model/Theme/theme-build';

const studioRoot = resolve(import.meta.dirname, '../..');
let baseTheme: Theme;
let baseTemplate: Template;

beforeAll(async () => {
  baseTheme = themeSchema.parse(JSON.parse(await readFile(
    resolve(studioRoot, 'data/themes/Vayeate-1.0.0.theme.json'),
    'utf8',
  )));
  baseTemplate = templateSchema.parse(JSON.parse(await readFile(
    resolve(studioRoot, 'data/templates/vayeate-1.0.17.template.json'),
    'utf8',
  )));
});

function theme(name: string, version: string): Theme {
  return { ...baseTheme, name, version };
}

function createThemeGateway(): ThemeGateway {
  const themes = new Map([
    ['Alpha:1.0.0', theme('Alpha', '1.0.0')],
    ['Alpha:1.2.0', theme('Alpha', '1.2.0')],
    ['Beta:2.0.0', theme('Beta', '2.0.0')],
  ]);
  return {
    listThemes: vi.fn().mockResolvedValue([
      { name: 'Alpha', version: '1.0.0' },
      { name: 'Beta', version: '2.0.0' },
      { name: 'Alpha', version: '1.2.0' },
    ]),
    loadTheme: vi.fn((name: string, version: string) =>
      Promise.resolve(themes.get(`${name}:${version}`) ?? null)),
  } as unknown as ThemeGateway;
}

function createTemplateGateway(): TemplateGateway {
  return {
    loadTemplate: vi.fn().mockResolvedValue(baseTemplate),
  } as unknown as TemplateGateway;
}

describe('latest theme batch builds', () => {
  it('selects one highest version per theme name in deterministic order', () => {
    expect(latestThemeReferences([
      { name: 'Beta', version: '1.0.0' },
      { name: 'Alpha', version: '1.1.0' },
      { name: 'Alpha', version: '1.3.0' },
      { name: 'Gamma', version: '2.0.0' },
      { name: 'Gamma', version: '2.0.0-beta.2' },
    ])).toEqual([
      { name: 'Alpha', version: '1.3.0' },
      { name: 'Beta', version: '1.0.0' },
      { name: 'Gamma', version: '2.0.0' },
    ]);
  });

  it('writes dark and light outputs only for each latest theme file', async () => {
    const themeGateway = createThemeGateway();
    const savedPaths: string[] = [];
    const saveFile = vi.fn(async (path: string) => {
      savedPaths.push(path);
    });
    const operation = new GenerateAllThemesOperation(
      themeGateway,
      createTemplateGateway(),
      { saveFile } as unknown as FileSystemService,
      new ValidateIsThemeFileNameValid(),
    );

    const result = await operation.execute();

    expect(result).toMatchObject({ success: true, generatedCount: 2, failures: [] });
    expect(themeGateway.loadTheme).toHaveBeenCalledTimes(2);
    expect(themeGateway.loadTheme).not.toHaveBeenCalledWith('Alpha', '1.0.0');
    expect(savedPaths).toEqual([
      'exthemes/alpha-color-theme.json',
      'exthemes/alpha-light-color-theme.json',
      'exthemes/beta-color-theme.json',
      'exthemes/beta-light-color-theme.json',
    ]);
  });

  it('captures dark and light screenshots from latest source data', async () => {
    const capturedRequests: ThemeScreenshotRequest[] = [];
    const screenshotService = {
      generateAll: vi.fn(async (requests: readonly ThemeScreenshotRequest[]) => {
        capturedRequests.push(...requests);
        return requests.map((request) => ({
          outputPath: request.outputPath,
          success: true,
        }));
      }),
    } as unknown as ThemeScreenshotService;
    const operation = new GenerateThemeScreenshotsOperation(
      createThemeGateway(),
      createTemplateGateway(),
      screenshotService,
      new ValidateIsThemeFileNameValid(),
    );

    const result = await operation.execute();

    expect(result).toMatchObject({ success: true, generatedCount: 4, failures: [] });
    expect(capturedRequests.map((request) => request.outputPath)).toEqual([
      'images/alpha-theme.png',
      'images/alpha-light-theme.png',
      'images/beta-theme.png',
      'images/beta-light-theme.png',
    ]);
    expect(capturedRequests.map((request) => request.theme.type)).toEqual([
      'dark',
      'light',
      'dark',
      'light',
    ]);
  });
});
