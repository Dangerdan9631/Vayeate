import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { UNDO_RECORDING_EXCLUDED_CONTROLLERS } from './undo-controller-exclusions';

const repoRoot = process.cwd();

const RECORDING_OPERATION_NAMES = [
  'RecordCatalogUndoOperation',
  'RecordTemplateUndoOperation',
  'RecordThemeUndoOperation',
  'RecordUndoEntryOperation',
] as const;

async function walkAppControllers(relativeDir: string): Promise<string[]> {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const childRelative = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) {
        return walkAppControllers(childRelative);
      }
      if (!entry.name.endsWith('-controller.ts') || entry.name.endsWith('.test.ts')) {
        return [];
      }
      return [path.join(repoRoot, childRelative)];
    }),
  );
  return nested.flat();
}

function toRepoRelative(filePath: string): string {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function importsUndoRecording(source: string): boolean {
  return RECORDING_OPERATION_NAMES.some((name) => source.includes(name));
}

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

describe('undo controller coverage', () => {
  it('classifies every src/app *-controller.ts as recording or explicitly excluded', async () => {
    const controllerFiles = await walkAppControllers('src/app');
    const controllerPaths = controllerFiles.map(toRepoRelative).sort();
    const excludedSet = new Set(UNDO_RECORDING_EXCLUDED_CONTROLLERS);

    const unclassified: string[] = [];
    const staleExclusions = UNDO_RECORDING_EXCLUDED_CONTROLLERS.filter(
      (excludedPath) => !controllerPaths.includes(excludedPath),
    );
    const orphanExclusions: string[] = [];
    for (const excludedPath of UNDO_RECORDING_EXCLUDED_CONTROLLERS) {
      if (!(await fileExists(excludedPath))) {
        orphanExclusions.push(excludedPath);
      }
    }

    for (const relativePath of controllerPaths) {
      const source = await readFile(path.join(repoRoot, relativePath), 'utf8');
      const isExcluded = excludedSet.has(relativePath);
      const recordsUndo = importsUndoRecording(source);

      if (!isExcluded && !recordsUndo) {
        unclassified.push(relativePath);
      }
      if (isExcluded && recordsUndo) {
        unclassified.push(`${relativePath} (listed as excluded but imports Record*UndoOperation)`);
      }
    }

    expect(
      orphanExclusions,
      `Exclusion inventory references missing controllers:\n${orphanExclusions.join('\n')}`,
    ).toEqual([]);
    expect(
      staleExclusions,
      `Exclusion inventory lists controllers that no longer exist:\n${staleExclusions.join('\n')}`,
    ).toEqual([]);
    expect(
      unclassified,
      [
        'Every *-controller.ts under src/app/** must either import',
        'RecordCatalogUndoOperation / RecordTemplateUndoOperation / RecordThemeUndoOperation / RecordUndoEntryOperation,',
        'or appear in UNDO_RECORDING_EXCLUDED_CONTROLLERS (test/architecture/undo-controller-exclusions.ts).',
        'Unclassified controllers:',
        ...unclassified,
      ].join('\n'),
    ).toEqual([]);
    expect(controllerPaths.length).toBe(UNDO_RECORDING_EXCLUDED_CONTROLLERS.length + controllerPaths.filter(
      (relativePath) => !excludedSet.has(relativePath),
    ).length);
  });
});
