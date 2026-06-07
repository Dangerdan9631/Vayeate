import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, 'src');
const electronRoot = path.join(repoRoot, 'electron');
const importRegex =
  /import\s+(?:type\s+)?(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]|export\s+(?:type\s+)?[^'"]*?\s+from\s+['"]([^'"]+)['"]/g;

async function walk(relativeDir: string): Promise<string[]> {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const childRelative = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) {
        return walk(childRelative);
      }
      if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\.(ts|tsx)$/.test(entry.name)) {
        return [];
      }
      return [path.join(repoRoot, childRelative)];
    }),
  );
  return nested.flat();
}

async function walkMany(relativeDirs: string[]): Promise<string[]> {
  const nested = await Promise.all(relativeDirs.map((relativeDir) => walk(relativeDir)));
  return nested.flat();
}

async function getRelativeImportTargets(filePath: string): Promise<string[]> {
  const source = await readFile(filePath, 'utf8');
  const targets: string[] = [];

  for (const match of source.matchAll(importRegex)) {
    const specifier = match[1] ?? match[2];
    if (!specifier || !specifier.startsWith('.')) {
      continue;
    }
    targets.push(path.resolve(path.dirname(filePath), specifier));
  }

  return targets;
}

function isInside(target: string, root: string): boolean {
  return target === root || target.startsWith(`${root}${path.sep}`);
}

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, '/');
}

function authoringControllerRoots(): string[] {
  return [
    'src/app/catalog/catalog-details-card/controllers',
    'src/app/catalog/tokens-card/controllers',
    'src/app/catalog/bulk-add-dialog/controllers',
    'src/app/template/groups-card/controllers',
    'src/app/template/variables-card/controllers',
    'src/app/template/mappings-card/controllers',
    'src/app/template/template-catalogs-card/controllers',
    'src/app/theme/theme-details-card/controllers',
    'src/app/theme/theme-palette-card/controllers',
    'src/app/theme/theme-variables-card/controllers',
  ];
}

describe('layer boundaries', () => {
  it('keeps model imports independent from app, gateway, domain, and electron details', async () => {
    const files = await walk('src/model');

    for (const filePath of files) {
      const targets = await getRelativeImportTargets(filePath);
      for (const target of targets) {
        expect(isInside(target, path.join(sourceRoot, 'app')), filePath).toBe(false);
        expect(isInside(target, path.join(sourceRoot, 'gateway')), filePath).toBe(false);
        expect(isInside(target, path.join(sourceRoot, 'domain')), filePath).toBe(false);
        expect(isInside(target, electronRoot), filePath).toBe(false);
      }
    }
  });

  it('keeps domain imports independent from app and electron details', async () => {
    const files = await walk('src/domain');

    for (const filePath of files) {
      const targets = await getRelativeImportTargets(filePath);
      for (const target of targets) {
        expect(isInside(target, path.join(sourceRoot, 'app')), filePath).toBe(false);
        expect(isInside(target, electronRoot), filePath).toBe(false);
      }
    }
  });

  it('keeps gateway imports independent from app and electron details', async () => {
    const files = await walk('src/gateway');

    for (const filePath of files) {
      const targets = await getRelativeImportTargets(filePath);
      for (const target of targets) {
        expect(isInside(target, path.join(sourceRoot, 'app')), filePath).toBe(false);
        expect(isInside(target, electronRoot), filePath).toBe(false);
      }
    }
  });

  it('keeps duplicate action contract compatibility paths out of the app layer', async () => {
    const files = (await walk('src/app')).map(normalizeSlashes);

    for (const filePath of files) {
      expect(filePath.includes('/src/app/app/components/app-shell/actions/'), filePath).toBe(false);
      expect(filePath.includes('/src/app/theme/components/'), filePath).toBe(false);
    }
  });

  it('keeps top-level authoring handlers thin and free of policy or detail ownership', async () => {
    const files = [
      path.join(sourceRoot, 'app/catalog/actions/catalog-handler.ts'),
      path.join(sourceRoot, 'app/template/actions/template-handler.ts'),
      path.join(sourceRoot, 'app/theme/actions/theme-handler.ts'),
    ];

    for (const filePath of files) {
      const targets = await getRelativeImportTargets(filePath);
      for (const target of targets) {
        expect(isInside(target, path.join(sourceRoot, 'domain/operations')), filePath).toBe(false);
        expect(isInside(target, path.join(sourceRoot, 'gateway')), filePath).toBe(false);
        expect(target.includes(`${path.sep}controllers${path.sep}`), filePath).toBe(false);
      }
    }
  });

  it('keeps focused authoring controllers free of handler chaining and outer detail imports', async () => {
    const files = await walkMany(authoringControllerRoots());

    for (const filePath of files) {
      const targets = await getRelativeImportTargets(filePath);
      for (const target of targets) {
        expect(isInside(target, path.join(sourceRoot, 'gateway')), filePath).toBe(false);
        expect(isInside(target, electronRoot), filePath).toBe(false);
        expect(target.includes(`${path.sep}actions${path.sep}`), filePath).toBe(false);
        expect(target.includes(`${path.sep}controllers${path.sep}`), filePath).toBe(false);
      }
    }
  });
});
