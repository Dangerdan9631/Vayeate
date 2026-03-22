/**
 * TextMate tokenization for preview source files (vscode-textmate + vscode-oniguruma).
 * Call {@link initOniguruma} before {@link tokenizeFile}. Pass WASM bytes via {@link InitOnigurumaOptions.loadWasm}
 * (Electron renderer fetches bundled `onig.wasm`; Vitest can read from disk in the loader).
 */

import {
  loadWASM,
  createOnigScanner,
  createOnigString,
} from 'vscode-oniguruma';
import { Registry } from 'vscode-textmate';
import type { IRawGrammar } from 'vscode-textmate';
import type { TokenizedLine, TokenizedToken } from '../../model/preview-types';

export type { TokenizedPreview, TokenizedLine, TokenizedToken } from '../../model/preview-types';

type OnigLib = {
  createOnigScanner: typeof createOnigScanner;
  createOnigString: typeof createOnigString;
};

let onigurumaReady: Promise<OnigLib> | null = null;

export type InitOnigurumaOptions = {
  loadWasm: () => Promise<ArrayBuffer>;
};

/**
 * Load the Oniguruma WASM binary. Call once before tokenizing.
 */
export function initOniguruma(options: InitOnigurumaOptions): Promise<void> {
  if (onigurumaReady) return onigurumaReady.then(() => {});
  onigurumaReady = (async (): Promise<OnigLib> => {
    const data = await options.loadWasm();
    await loadWASM(data);
    return { createOnigScanner, createOnigString };
  })();
  return onigurumaReady.then(() => {});
}

/**
 * Tokenize source code with the given TextMate grammar JSON.
 */
export async function tokenizeFile(
  grammarJson: IRawGrammar,
  sourceCode: string,
): Promise<TokenizedLine[]> {
  if (!onigurumaReady) {
    throw new Error('initOniguruma must be called before tokenizeFile');
  }
  const onigLib = await onigurumaReady;

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
