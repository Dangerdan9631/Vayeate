// @vitest-environment node
/**
 * Static convention tests (Vitest + TypeScript AST). Rules are defined in Cursor rule files under
 * `.cursor/rules/`; each `describe` below names the file(s) that define the same requirement.
 *
 * **Keep in sync:** When you change a rule’s file naming, export shape, or exceptions, update the
 * matching `describe` here (and the cross-reference in the rule file). When you change a test’s
 * scope, regex, or filters, update the corresponding rule text so authors and CI agree.
 *
 * | `describe(...)` | Rule file(s) |
 * |---|---|
 * | `kebab-case filenames for non-test .ts sources` | [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — § DI and files (kebab-case modules) |
 * | `*-controller.ts: one exported class ending with Controller` | [controller.mdc](../../../.cursor/rules/controller.mdc), [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) |
 * | `*-controller.ts: declares a run method` | [controller.mdc](../../../.cursor/rules/controller.mdc) |
 * | `*-operation.ts: one exported class ending with Operation` | [operation.mdc](../../../.cursor/rules/operation.mdc), [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) |
 * | `validate-*.ts: one exported class starting with Validate` | [validation.mdc](../../../.cursor/rules/validation.mdc), [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) |
 * | `*-gateway.ts: one exported class ending with Gateway` | [gateway.mdc](../../../.cursor/rules/gateway.mdc), [layer-gateway.mdc](../../../.cursor/rules/layer-gateway.mdc) |
 * | `*-service.ts: one exported class ending with Service` | [service.mdc](../../../.cursor/rules/service.mdc), [layer-gateway.mdc](../../../.cursor/rules/layer-gateway.mdc) |
 * | `*-handler.ts: one exported class ending with Handler` | [layer-app.mdc](../../../.cursor/rules/layer-app.mdc) — § Structure / Actions (handlers) |
 * | `use-*-viewmodel.ts: at least one exported function...` | [viewmodel.mdc](../../../.cursor/rules/viewmodel.mdc), [layer-app.mdc](../../../.cursor/rules/layer-app.mdc) — § Structure (`viewmodel/`) |
 * | `components/*.tsx: exported function name matches filename stem` | [component.mdc](../../../.cursor/rules/component.mdc), [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — § DI and files (filename ↔ export) |
 * | `PascalCase filenames for .tsx under src/app` | [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc), [component.mdc](../../../.cursor/rules/component.mdc) — § Contract (PascalCase `*.tsx`) |
 * | `domain *-operation.ts: no disallowed this.<OtherOperation>.execute` | [operation.mdc](../../../.cursor/rules/operation.mdc), [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — mutation flow |
 * | `domain *-controller.ts: no this.<OtherController>.run` | [controller.mdc](../../../.cursor/rules/controller.mdc), [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — mutation flow |
 * | `actions/*-handler.ts: no imports from domain operations/validations/state` | [layer-app.mdc](../../../.cursor/rules/layer-app.mdc) — handlers |
 * | `actions/*-action-type.ts: exported is*Action guard` | [layer-app.mdc](../../../.cursor/rules/layer-app.mdc) — § Structure / Actions (guards) |
 * | `electron/*.ts: no imports from renderer src/` | [layer-electron.mdc](../../../.cursor/rules/layer-electron.mdc) — no domain in main |
 * | `src/app` tree `.tsx`: no useContextSelector | [viewmodel.mdc](../../../.cursor/rules/viewmodel.mdc), [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) |
 * | `actions/*-action-type.ts: no imports from domain/state` | [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — § Actions (payloads) |
 */
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  collectCtorParameterPropertyNamesWithControllerType,
  collectCtorParameterPropertyTypesWithOperationType,
  collectExportedClassNames,
  collectExportedFunctionNames,
  collectThisDependencyExecuteCalls,
  collectThisDependencyRunCalls,
  getFirstExportedClassDeclaration,
  getRunMethodDeclaration,
  listElectronSourceFiles,
  listSourceFiles,
  readSourceFile,
  readTsxSourceFile,
  srcRoot,
} from './ast-utils';

const KEBAB_STEM = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const PASCAL_STEM = /^[A-Z][a-zA-Z0-9]*$/;

function basename(file: string): string {
  return path.basename(file);
}

function isExcludedTestFile(name: string): boolean {
  return name.endsWith('.test.ts') || name.endsWith('.sync.test.ts') || name.endsWith('.test.tsx');
}

function isNonTestTsSource(name: string): boolean {
  return (
    name.endsWith('.ts') &&
    !isExcludedTestFile(name) &&
    name !== 'index.ts'
  );
}

function isViewmodelFile(name: string): boolean {
  return /^use-.+-viewmodel\.ts$/.test(name);
}

function isUnderSrcApp(file: string): boolean {
  return path.relative(srcRoot, file).replace(/\\/g, '/').startsWith('app/');
}

const IMPORT_FROM_RE = /\bfrom\s+['"]([^'"]+)['"]/g;

function forbiddenDomainImportsInSource(source: string): string[] {
  const bad: string[] = [];
  for (const m of source.matchAll(IMPORT_FROM_RE)) {
    const p = m[1].replace(/\\/g, '/');
    if (
      p.includes('/domain/operations/') ||
      p.includes('/domain/validations/') ||
      p.includes('/domain/state/')
    ) {
      bad.push(p);
    }
  }
  return bad;
}

/** Relative import path whose resolved target is the renderer src tree (e.g. ../src/...). */
function pointsAtRendererSrcModule(spec: string): boolean {
  const n = spec.replace(/\\/g, '/');
  return /^(\.\.\/)+src(\/|$)/.test(n);
}

/** @see ../../../.cursor/rules/app-architecture.mdc — § DI and files (kebab-case for non-`*.tsx` modules). Sync exclusions with that section and with [model.mdc](../../../.cursor/rules/model.mdc) § Files. */
describe('kebab-case filenames for non-test .ts sources', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    // Ambient .d.ts shims (e.g. vite-env.d.ts) are not kebab-stemmed the same way as modules.
    if (b.endsWith('.d.ts')) return false;
    return true;
  });

  it.each(files)('%s', (file) => {
    const stem = basename(file).replace(/\.ts$/, '');
    expect(stem, 'filename stem must be kebab-case').toMatch(KEBAB_STEM);
  });
});

/** @see ../../../.cursor/rules/app-architecture.mdc — § DI and files; [component.mdc](../../../.cursor/rules/component.mdc) — § Contract (PascalCase `*.tsx` under `src/app/`). */
describe('PascalCase filenames for .tsx under src/app', () => {
  const files = listSourceFiles(['.tsx']).filter((f) => {
    const b = basename(f);
    if (isExcludedTestFile(b)) return false;
    return isUnderSrcApp(f);
  });

  it.each(files)('%s', (file) => {
    const stem = basename(file).replace(/\.tsx$/, '');
    expect(stem, 'app *.tsx filename stem must be PascalCase').toMatch(PASCAL_STEM);
  });
});

/** @see ../../../.cursor/rules/controller.mdc — § Contract / Naming; [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) — § Structure (`controllers/`). */
describe('*-controller.ts: one exported class ending with Controller', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return b.endsWith('-controller.ts');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const classes = collectExportedClassNames(sf);
    expect(classes, 'expected exactly one exported class').toHaveLength(1);
    expect(classes[0]).toMatch(/Controller$/);
  });
});

/** @see ../../../.cursor/rules/controller.mdc — § Contract (`run` returns void or Promise). */
describe('*-controller.ts: declares a run method', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return b.endsWith('-controller.ts');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const cls = getFirstExportedClassDeclaration(sf);
    expect(cls, 'expected one exported class').toBeDefined();
    const runMethod = getRunMethodDeclaration(cls!);
    expect(runMethod, 'Controller must declare a run(...) method').toBeDefined();
  });
});

/** @see ../../../.cursor/rules/operation.mdc — § Contract; [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) — § Structure (`operations/`). */
describe('*-operation.ts: one exported class ending with Operation', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return b.endsWith('-operation.ts');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const classes = collectExportedClassNames(sf);
    expect(classes, 'expected exactly one exported class').toHaveLength(1);
    expect(classes[0]).toMatch(/Operation$/);
  });
});

/** @see ../../../.cursor/rules/validation.mdc — § Contract (`Validate*`); [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) — § Structure (`validations/`). */
describe('validate-*.ts: one exported class starting with Validate', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return b.startsWith('validate-') && b.endsWith('.ts');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const classes = collectExportedClassNames(sf);
    expect(classes, 'expected exactly one exported class').toHaveLength(1);
    expect(classes[0]).toMatch(/^Validate/);
  });
});

/** @see ../../../.cursor/rules/gateway.mdc — DI / role; [layer-gateway.mdc](../../../.cursor/rules/layer-gateway.mdc) — § Gateways / Callers. */
describe('*-gateway.ts: one exported class ending with Gateway', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return b.endsWith('-gateway.ts');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const classes = collectExportedClassNames(sf);
    expect(classes, 'expected exactly one exported class').toHaveLength(1);
    expect(classes[0]).toMatch(/Gateway$/);
  });
});

/** @see ../../../.cursor/rules/service.mdc — § Role / DI; [layer-gateway.mdc](../../../.cursor/rules/layer-gateway.mdc) — § Services. */
describe('*-service.ts: one exported class ending with Service', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return b.endsWith('-service.ts');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const classes = collectExportedClassNames(sf);
    expect(classes, 'expected exactly one exported class').toHaveLength(1);
    expect(classes[0]).toMatch(/Service$/);
  });
});

/** @see ../../../.cursor/rules/layer-app.mdc — § Structure (`actions/` handlers) / § Actions. */
describe('*-handler.ts: one exported class ending with Handler', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    if (b === 'continuation-handler.ts') return false;
    return b.endsWith('-handler.ts');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const classes = collectExportedClassNames(sf);
    expect(classes, 'expected exactly one exported class').toHaveLength(1);
    expect(classes[0]).toMatch(/Handler$/);
  });
});

/** @see ../../../.cursor/rules/viewmodel.mdc — § Contract (hooks); [layer-app.mdc](../../../.cursor/rules/layer-app.mdc) — § Structure (`viewmodel/`). */
describe('use-*-viewmodel.ts: at least one exported function whose name starts with use', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return isViewmodelFile(b);
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const fnames = collectExportedFunctionNames(sf);
    const hooks = fnames.filter((n) => n.startsWith('use'));
    expect(hooks.length, 'expected at least one exported function starting with "use"').toBeGreaterThan(0);
  });
});

/** @see ../../../.cursor/rules/component.mdc — § Contract (filename ↔ component); [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — § DI and files. */
describe('components/*.tsx: exported function name matches filename stem', () => {
  const files = listSourceFiles(['.tsx']).filter((f) => {
    const b = basename(f);
    if (isExcludedTestFile(b)) return false;
    return path.basename(path.dirname(f)) === 'components';
  });

  if (files.length === 0) {
    it('has no direct components/*.tsx modules to check', () => {});
    return;
  }

  it.each(files)('%s', (file) => {
    const stem = basename(file).replace(/\.tsx$/, '');
    const sf = readTsxSourceFile(file);
    const fnames = collectExportedFunctionNames(sf);
    expect(fnames, `expected an export function named ${stem}`).toContain(stem);
  });
});

function isAllowedOperationExecuteCall(file: string, operationType: string): boolean {
  if (operationType === 'EnqueueBackgroundQueueActionOperation') return true;

  const rel = path.relative(srcRoot, file).replace(/\\/g, '/');
  const isThemeColorVariableOperation = /^domain\/operations\/theme-operations\/theme-details\/set-color-variable-(dark|light)-operation\.ts$/.test(rel);
  if (
    isThemeColorVariableOperation &&
    (operationType === 'SetThemeOperation' || operationType === 'ApplyThemeStateAndSchedulePersistOperation')
  ) {
    return true;
  }

  if (rel === 'domain/operations/undo-operations/apply-catalog-undo-state-operation.ts') {
    return operationType === 'SaveCatalogOperation' || operationType === 'RefreshCatalogRefsAndSelectOperation';
  }
  if (rel === 'domain/operations/undo-operations/apply-template-undo-state-operation.ts') {
    return operationType === 'SaveTemplateOperation' || operationType === 'RefreshTemplateRefsAndSelectOperation';
  }
  if (rel === 'domain/operations/undo-operations/apply-theme-undo-state-operation.ts') {
    return operationType === 'SetThemeOperation' || operationType === 'ApplyThemeStateAndSchedulePersistOperation';
  }
  if (rel === 'domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation.ts') {
    return operationType === 'ApplyThemeStateOperation';
  }

  if (rel === 'domain/operations/undo-operations/apply-catalog-lifecycle-undo-operation.ts') {
    return (
      operationType === 'DeleteCatalogOperation' ||
      operationType === 'ApplyCatalogUndoStateOperation' ||
      operationType === 'SetSelectedCatalogOperation' ||
      operationType === 'LoadCatalogRefsOperation' ||
      operationType === 'RefreshCatalogRefsAndSelectOperation'
    );
  }
  if (rel === 'domain/operations/undo-operations/apply-template-lifecycle-undo-operation.ts') {
    return (
      operationType === 'DeleteTemplateOperation' ||
      operationType === 'ApplyTemplateUndoStateOperation' ||
      operationType === 'SetSelectedTemplateRefOperation' ||
      operationType === 'RefreshTemplateRefsOperation' ||
      operationType === 'LoadTemplateOperation' ||
      operationType === 'SetTemplateOperation'
    );
  }
  if (rel === 'domain/operations/undo-operations/apply-theme-lifecycle-undo-operation.ts') {
    return (
      operationType === 'DeleteThemeOperation' ||
      operationType === 'ApplyThemeUndoStateOperation' ||
      operationType === 'SetSelectedThemeRefOperation' ||
      operationType === 'LoadThemeRefsOperation' ||
      operationType === 'LoadThemeOperation' ||
      operationType === 'SetThemeOperation'
    );
  }

  if (
    rel === 'domain/operations/undo-operations/record-catalog-undo-operation.ts' ||
    rel === 'domain/operations/undo-operations/record-template-undo-operation.ts' ||
    rel === 'domain/operations/undo-operations/record-theme-undo-operation.ts'
  ) {
    return operationType === 'RecordUndoEntryOperation' || operationType === 'BuildUniversalUndoProcessorOperation';
  }

  if (
    rel === 'domain/operations/undo-operations/load-undo-history-operation.ts' ||
    rel === 'domain/operations/undo-operations/set-current-undo-stack-id-operation.ts' ||
    rel === 'domain/operations/undo-operations/undo-operation.ts' ||
    rel === 'domain/operations/undo-operations/redo-operation.ts' ||
    rel === 'domain/operations/undo-operations/history-go-to-operation.ts'
  ) {
    return operationType === 'BuildUniversalUndoProcessorOperation';
  }

  return false;
}

/** @see ../../../.cursor/rules/operation.mdc — no disallowed `Operation.execute` chaining; [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — mutation flow. */
describe('domain *-operation.ts: operations do not call disallowed operation .execute', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    if (!b.endsWith('-operation.ts')) return false;
    const rel = path.relative(srcRoot, f).replace(/\\/g, '/');
    return rel.startsWith('domain/');
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const cls = getFirstExportedClassDeclaration(sf);
    expect(cls, 'expected one exported class').toBeDefined();
    const opDeps = collectCtorParameterPropertyTypesWithOperationType(sf, cls!);
    const hits = collectThisDependencyExecuteCalls(sf, cls!, new Set(opDeps.keys()));
    const disallowedHits = hits.filter((field) => !isAllowedOperationExecuteCall(file, opDeps.get(field) ?? ''));
    expect(disallowedHits, 'operations must not call disallowed this.<OtherOperation>.execute(...)').toEqual([]);
  });
});

/** @see ../../../.cursor/rules/controller.mdc — controllers do not call other controllers; [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc). */
describe('domain *-controller.ts: controllers do not call other controllers .run', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    if (!b.endsWith('-controller.ts')) return false;
    const rel = path.relative(srcRoot, f).replace(/\\/g, '/');
    return rel.startsWith('domain/');
  });

  if (files.length === 0) {
    it('has no domain *-controller.ts modules to check', () => {});
    return;
  }

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const cls = getFirstExportedClassDeclaration(sf);
    expect(cls, 'expected one exported class').toBeDefined();
    const cDeps = collectCtorParameterPropertyNamesWithControllerType(sf, cls!);
    const hits = collectThisDependencyRunCalls(sf, cls!, cDeps);
    expect(hits, 'controllers must not call this.<OtherController>.run(...)').toEqual([]);
  });
});

/** @see ../../../.cursor/rules/layer-app.mdc — handlers route to controllers only. */
describe('actions/*-handler.ts: no imports from domain operations, validations, or state', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return /[\\/]actions[\\/].*-handler\.ts$/.test(f);
  });

  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8');
    const bad = forbiddenDomainImportsInSource(src);
    expect(bad, 'handler must not import domain operations, validations, or state').toEqual([]);
  });
});

/** @see ../../../.cursor/rules/layer-app.mdc — action guards in action type modules. */
describe('actions/*-action-type.ts: at least one exported is*Action guard', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return /[\\/]actions[\\/].*-action-type\.ts$/.test(f);
  });

  it.each(files)('%s', (file) => {
    const sf = readSourceFile(file);
    const fnames = collectExportedFunctionNames(sf);
    const guards = fnames.filter((name) => /^is[A-Z].*Action$/.test(name));
    expect(guards.length, 'expected at least one exported is*Action guard').toBeGreaterThan(0);
  });
});

/** @see ../../../.cursor/rules/layer-electron.mdc — Electron must not depend on renderer `src/`. */
describe('electron/*.ts: no imports from renderer src/', () => {
  const files = listElectronSourceFiles();

  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8');
    const importers: string[] = [];
    for (const m of src.matchAll(IMPORT_FROM_RE)) {
      const p = m[1];
      if (pointsAtRendererSrcModule(p)) importers.push(p);
    }
    expect(importers, 'electron must not import the renderer src tree').toEqual([]);
  });
});

/** @see ../../../.cursor/rules/viewmodel.mdc — [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) (useContextSelector in viewmodels, not components). */
describe('src/app/**/*.tsx: components do not use useContextSelector', () => {
  const files = listSourceFiles(['.tsx']).filter((f) => {
    const b = basename(f);
    if (isExcludedTestFile(b)) return false;
    return isUnderSrcApp(f);
  });

  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src.includes('useContextSelector'), 'move selectors into a viewmodel hook').toBe(false);
  });
});

/** @see ../../../.cursor/rules/app-architecture.mdc — § Actions (payloads: user input / ids, not state snapshots). */
describe('actions/*-action-type.ts: no imports from domain/state', () => {
  const files = listSourceFiles(['.ts']).filter((f) => {
    const b = basename(f);
    if (!isNonTestTsSource(b)) return false;
    return /[\\/]actions[\\/].*-action-type\.ts$/.test(f);
  });

  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8');
    const bad: string[] = [];
    for (const m of src.matchAll(IMPORT_FROM_RE)) {
      const p = m[1].replace(/\\/g, '/');
      if (p.includes('/domain/state/')) bad.push(p);
    }
    expect(bad, 'action payloads must not be typed from domain state modules').toEqual([]);
  });
});
