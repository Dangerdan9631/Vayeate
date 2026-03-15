/**
 * TextMate tokenization for preview source files.
 * Runs in the main process (Node/Electron); uses vscode-textmate + vscode-oniguruma.
 */

import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  loadWASM,
  createOnigScanner,
  createOnigString,
} from 'vscode-oniguruma';
import { Registry } from 'vscode-textmate';
import type { IRawGrammar } from 'vscode-textmate';
import type { TokenizedLine, TokenizedToken } from '../../model/preview-types';

const require = createRequire(import.meta.url);

export type { TokenizedPreview, TokenizedLine, TokenizedToken } from '../../model/preview-types';

type OnigLib = {
  createOnigScanner: typeof createOnigScanner;
  createOnigString: typeof createOnigString;
};

let onigurumaReady: Promise<OnigLib> | null = null;

/**
 * Load the Oniguruma WASM binary. Call once before tokenizing (e.g. from preview controller).
 * In Electron main process, uses path to node_modules.
 */
export function initOniguruma(wasmPath?: string): Promise<void> {
  if (onigurumaReady) return onigurumaReady.then(() => {});
  const resolved =
    wasmPath ??
    path.join(path.dirname(require.resolve('vscode-oniguruma')), 'onig.wasm');
  const data = fs.readFileSync(resolved);
  onigurumaReady = loadWASM(data).then(
    (): OnigLib => ({ createOnigScanner, createOnigString }),
  );
  return onigurumaReady.then(() => {});
}

/**
 * Tokenize source code with the given TextMate grammar JSON.
 * Returns one tokenized line per line of source; each line has tokens with text and scope stack.
 */
export async function tokenizeFile(
  grammarJson: IRawGrammar,
  sourceCode: string,
): Promise<TokenizedLine[]> {
  if (!onigurumaReady) await initOniguruma();
  const onigLib = await onigurumaReady!;

  const scopeName = grammarJson.scopeName;
  if (!scopeName) {
    throw new Error('Grammar must have a scopeName');
  }

  const registry = new Registry({
    onigLib: Promise.resolve(onigLib),
    loadGrammar: async (name: string) => {
      if (name === scopeName) return grammarJson;
      return undefined;
    },
  });

  const grammar = await registry.loadGrammar(scopeName);
  if (!grammar) {
    throw new Error(`Failed to load grammar for ${scopeName}`);
  }

  const lines = sourceCode.split(/\r?\n/);
  const result: TokenizedLine[] = [];
  let ruleStack = null;

  for (const lineText of lines) {
    const tokenizeResult = grammar.tokenizeLine(lineText, ruleStack);
    ruleStack = tokenizeResult.ruleStack;
    const tokens: TokenizedToken[] = tokenizeResult.tokens.map((t) => ({
      text: lineText.substring(t.startIndex, t.endIndex),
      scopes: [...t.scopes],
    }));
    result.push({ tokens });
  }

  (grammar as unknown as { dispose(): void }).dispose();
  return result;
}
