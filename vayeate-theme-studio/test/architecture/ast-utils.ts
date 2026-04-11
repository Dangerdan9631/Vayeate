import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

/** App `src` root (`vayeate-theme-studio/src`), resolved from this file's directory. */
export const srcRoot = path.resolve(thisDir, '../../src');

/** Electron main/preload root (`vayeate-theme-studio/electron`). */
export const electronRoot = path.resolve(thisDir, '../../electron');

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

/** All files under `srcRoot` with the given extension(s). */
export function listSourceFiles(extensions: string[]): string[] {
  const extSet = new Set(extensions.map((e) => (e.startsWith('.') ? e : `.${e}`)));
  return walkFiles(srcRoot).filter((f) => extSet.has(path.extname(f)));
}

export function readSourceFile(filePath: string): ts.SourceFile {
  const text = readFileSync(filePath, 'utf8');
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

export function readTsxSourceFile(filePath: string): ts.SourceFile {
  const text = readFileSync(filePath, 'utf8');
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function isExported(node: ts.Node): boolean {
  const flags = ts.getCombinedModifierFlags(node as ts.Declaration);
  return (flags & ts.ModifierFlags.Export) !== 0;
}

/** First top-level exported class (domain modules use a single primary class). */
export function getFirstExportedClassDeclaration(sf: ts.SourceFile): ts.ClassDeclaration | undefined {
  for (const stmt of sf.statements) {
    if (ts.isClassDeclaration(stmt) && stmt.name && isExported(stmt)) {
      return stmt;
    }
  }
  return undefined;
}

/** The `run` method on a controller class, if declared as a simple method (not a signature-only member). */
export function getRunMethodDeclaration(cls: ts.ClassDeclaration): ts.MethodDeclaration | undefined {
  for (const member of cls.members) {
    if (!ts.isMethodDeclaration(member) || !member.name) continue;
    if (ts.isIdentifier(member.name) && member.name.text === 'run') {
      return member;
    }
  }
  return undefined;
}

export function methodHasAsyncModifier(method: ts.MethodDeclaration): boolean {
  return method.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false;
}

const OPERATION_TYPE_RE = /\b[A-Za-z][A-Za-z0-9]*Operation\b/;
const CONTROLLER_TYPE_RE = /\b[A-Za-z][A-Za-z0-9]*Controller\b/;

/** Constructor parameter properties whose type matches `*Operation` (e.g. `SaveTemplateOperation`). */
export function collectCtorParameterPropertyNamesWithOperationType(
  sf: ts.SourceFile,
  cls: ts.ClassDeclaration,
): Set<string> {
  const names = new Set<string>();
  const ctor = cls.members.find(ts.isConstructorDeclaration);
  if (!ctor) return names;
  for (const p of ctor.parameters) {
    if (!ts.isParameterPropertyDeclaration(p, ctor) || !p.type) continue;
    const typeText = p.type.getText(sf);
    if (!OPERATION_TYPE_RE.test(typeText)) continue;
    if (ts.isIdentifier(p.name)) names.add(p.name.text);
  }
  return names;
}

/** Constructor parameter properties whose type matches `*Controller`. */
export function collectCtorParameterPropertyNamesWithControllerType(
  sf: ts.SourceFile,
  cls: ts.ClassDeclaration,
): Set<string> {
  const names = new Set<string>();
  const ctor = cls.members.find(ts.isConstructorDeclaration);
  if (!ctor) return names;
  for (const p of ctor.parameters) {
    if (!ts.isParameterPropertyDeclaration(p, ctor) || !p.type) continue;
    const typeText = p.type.getText(sf);
    if (!CONTROLLER_TYPE_RE.test(typeText)) continue;
    if (ts.isIdentifier(p.name)) names.add(p.name.text);
  }
  return names;
}

/**
 * Finds `this.<name>.execute(...)` calls where `<name>` is in `dependencyNames`.
 * Used to detect operations calling other operations' `.execute`.
 */
export function collectThisDependencyExecuteCalls(
  _sf: ts.SourceFile,
  cls: ts.ClassDeclaration,
  dependencyNames: Set<string>,
): string[] {
  const hits: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'execute') {
        const inner = expr.expression;
        if (
          ts.isPropertyAccessExpression(inner) &&
          inner.expression &&
          inner.expression.kind === ts.SyntaxKind.ThisKeyword
        ) {
          const field = inner.name.text;
          if (dependencyNames.has(field)) hits.push(field);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  for (const member of cls.members) {
    visit(member);
  }
  return hits;
}

/**
 * Finds `this.<name>.run(...)` calls where `<name>` is in `dependencyNames`.
 * Used to detect controllers calling other controllers' `.run`.
 */
export function collectThisDependencyRunCalls(
  _sf: ts.SourceFile,
  cls: ts.ClassDeclaration,
  dependencyNames: Set<string>,
): string[] {
  const hits: string[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'run') {
        const inner = expr.expression;
        if (
          ts.isPropertyAccessExpression(inner) &&
          inner.expression &&
          inner.expression.kind === ts.SyntaxKind.ThisKeyword
        ) {
          const field = inner.name.text;
          if (dependencyNames.has(field)) hits.push(field);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  for (const member of cls.members) {
    visit(member);
  }
  return hits;
}

/** All Electron `*.ts` sources under `electron/` (non-declaration). */
export function listElectronSourceFiles(): string[] {
  return walkFiles(electronRoot).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'));
}

/** Top-level exported class names (including `export default class Name`). */
export function collectExportedClassNames(sf: ts.SourceFile): string[] {
  const names: string[] = [];
  for (const stmt of sf.statements) {
    if (ts.isClassDeclaration(stmt) && stmt.name && isExported(stmt)) {
      names.push(stmt.name.text);
    }
  }
  return names;
}

/** Top-level exported function names (`export function` / `export async function` / `export default function Name`). */
export function collectExportedFunctionNames(sf: ts.SourceFile): string[] {
  const names: string[] = [];
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name && isExported(stmt)) {
      names.push(stmt.name.text);
    }
  }
  return names;
}
