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

function isAllowedBaselineDomainAppSeam(target: string): boolean {
  const normalizedTarget = normalizeSlashes(target);
  return [
    '/src/app/core/action-queue/',
    '/src/app/core/background-queue/',
    '/src/app/app/window/controllers/',
    '/src/app/app/app-shell/controllers/handle-keyboard-shortcut-controller',
  ].some((allowedPrefix) => normalizedTarget.includes(allowedPrefix));
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
        const importsApp = isInside(target, path.join(sourceRoot, 'app'));
        if (importsApp) {
          expect(isAllowedBaselineDomainAppSeam(target), filePath).toBe(true);
        }
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
});
