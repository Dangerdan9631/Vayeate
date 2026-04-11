import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

/** App `src` root (`vayeate-theme-studio/src`), resolved from this file's directory. */
export const srcRoot = path.resolve(thisDir, '../../src');

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
