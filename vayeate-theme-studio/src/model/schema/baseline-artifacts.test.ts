import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { catalogSchema } from './catalog';
import { appConfigSchema, hexColorSchema } from './primitives';
import { templateSchema } from './template-schemas';
import { themeSchema } from './theme-schemas';

const repoRoot = process.cwd();

async function loadJson(relativePath: string): Promise<unknown> {
  const absolutePath = path.join(repoRoot, relativePath);
  const raw = await readFile(absolutePath, 'utf8');
  return JSON.parse(raw) as unknown;
}

async function listFiles(relativeDir: string): Promise<string[]> {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

describe('baseline artifact fixtures', () => {
  it('parses every catalog fixture in data/catalogs', async () => {
    const fileNames = (await listFiles('data/catalogs')).filter((fileName) => fileName.endsWith('.json'));
    let validCount = 0;

    for (const fileName of fileNames) {
      const json = await loadJson(path.join('data/catalogs', fileName));
      expect(catalogSchema.safeParse(json).success, fileName).toBe(true);
      validCount += 1;
    }

    expect(validCount).toBeGreaterThan(0);
  });

  it('parses every template fixture in data/templates', async () => {
    const fileNames = (await listFiles('data/templates')).filter((fileName) =>
      fileName.endsWith('.template.json'),
    );
    let validCount = 0;

    for (const fileName of fileNames) {
      const json = await loadJson(path.join('data/templates', fileName));
      expect(templateSchema.safeParse(json).success, fileName).toBe(true);
      validCount += 1;
    }

    expect(validCount).toBeGreaterThan(0);
  });

  it('parses every theme fixture in data/themes', async () => {
    const fileNames = (await listFiles('data/themes')).filter((fileName) => fileName.endsWith('.theme.json'));
    let validCount = 0;

    for (const fileName of fileNames) {
      const json = await loadJson(path.join('data/themes', fileName));
      expect(themeSchema.safeParse(json).success, fileName).toBe(true);
      validCount += 1;
    }

    expect(validCount).toBeGreaterThan(0);
  });

  it('parses the persisted app config fixture', async () => {
    const json = await loadJson('data/config.json');
    expect(appConfigSchema.parse(json)).toEqual({ colorScheme: 'dark' });
  });

  it('normalizes accepted hex colors and rejects malformed values', () => {
    expect(hexColorSchema.parse('abc')).toBe('#abc');
    expect(hexColorSchema.parse('#A1b2c3')).toBe('#A1b2c3');
    expect(() => hexColorSchema.parse('#xyz')).toThrow();
  });
});
