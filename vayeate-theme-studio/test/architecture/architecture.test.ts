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
 * | `PascalCase filenames for .tsx under a components/ directory` | [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc), [component.mdc](../../../.cursor/rules/component.mdc) — § Contract (PascalCase `*.tsx`) |
 * | `*-controller.ts: one exported class ending with Controller` | [controller.mdc](../../../.cursor/rules/controller.mdc), [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) |
 * | `*-operation.ts: one exported class ending with Operation` | [operation.mdc](../../../.cursor/rules/operation.mdc), [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) |
 * | `validate-*.ts: one exported class starting with Validate` | [validation.mdc](../../../.cursor/rules/validation.mdc), [layer-domain.mdc](../../../.cursor/rules/layer-domain.mdc) |
 * | `*-gateway.ts: one exported class ending with Gateway` | [gateway.mdc](../../../.cursor/rules/gateway.mdc), [layer-gateway.mdc](../../../.cursor/rules/layer-gateway.mdc) |
 * | `*-service.ts: one exported class ending with Service` | [service.mdc](../../../.cursor/rules/service.mdc), [layer-gateway.mdc](../../../.cursor/rules/layer-gateway.mdc) |
 * | `*-handler.ts: one exported class ending with Handler` | [layer-app.mdc](../../../.cursor/rules/layer-app.mdc) — § Structure / Actions (handlers) |
 * | `use-*-viewmodel.ts: at least one exported function...` | [viewmodel.mdc](../../../.cursor/rules/viewmodel.mdc), [layer-app.mdc](../../../.cursor/rules/layer-app.mdc) — § Structure (`viewmodel/`) |
 * | `components/*.tsx: exported function name matches filename stem` | [component.mdc](../../../.cursor/rules/component.mdc), [app-architecture.mdc](../../../.cursor/rules/app-architecture.mdc) — § DI and files (filename ↔ export) |
 */
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  collectExportedClassNames,
  collectExportedFunctionNames,
  listSourceFiles,
  readSourceFile,
  readTsxSourceFile,
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

/** @see ../../../.cursor/rules/app-architecture.mdc — § DI and files; [component.mdc](../../../.cursor/rules/component.mdc) — § Contract (PascalCase `*.tsx` in `components/`). */
describe('PascalCase filenames for .tsx under a components/ directory', () => {
  const files = listSourceFiles(['.tsx']).filter((f) => {
    const b = basename(f);
    if (isExcludedTestFile(b)) return false;
    return path.basename(path.dirname(f)) === 'components';
  });

  it.each(files)('%s', (file) => {
    const stem = basename(file).replace(/\.tsx$/, '');
    expect(stem, 'component filename stem must be PascalCase').toMatch(PASCAL_STEM);
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

  it.each(files)('%s', (file) => {
    const stem = basename(file).replace(/\.tsx$/, '');
    const sf = readTsxSourceFile(file);
    const fnames = collectExportedFunctionNames(sf);
    expect(fnames, `expected an export function named ${stem}`).toContain(stem);
  });
});
