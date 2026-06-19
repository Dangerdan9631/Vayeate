import { singleton } from 'tsyringe';
import { createOnigScanner, createOnigString, loadWASM } from 'vscode-oniguruma';
import { Registry } from 'vscode-textmate';
import type { IRawGrammar } from 'vscode-textmate';
import type { TokenizedLine, TokenizedToken } from '../../model/preview-types';
import { DEFERRED_WORK_YIELD_INTERVAL, yieldEvery } from '../../domain/core/scheduler';
/**
 * Oniguruma bindings passed to the TextMate registry after WASM load.
 */
type OnigLib = {
  createOnigScanner: typeof createOnigScanner;
  createOnigString: typeof createOnigString;
};

/**
 * Options for one-time Oniguruma WASM initialization.
 */
export type InitTextmateTokenizerOptions = {
  loadWasm: () => Promise<ArrayBuffer>;
};

/**
 * Tokenizes source files with vscode-textmate after Oniguruma WASM is loaded.
 */
@singleton()
export class TextmateTokenizerService {
  private onigurumaReady: Promise<OnigLib> | null = null;

  /**
   * Loads Oniguruma WASM once and prepares the tokenizer for `tokenizeFile`.
   *
   * @param options - WASM loader supplied by the caller (e.g. Vite asset URL).
   * @returns Resolves when Oniguruma is ready.
   */
  async init(options: InitTextmateTokenizerOptions): Promise<void> {
    if (!this.onigurumaReady) {
      this.onigurumaReady = (async (): Promise<OnigLib> => {
        const data = await options.loadWasm();
        await loadWASM(data);
        return { createOnigScanner, createOnigString };
      })();
    }

    await this.onigurumaReady;
  }

  /**
   * Tokenizes each line of source text with the given TextMate grammar.
   *
   * @param grammarJson - Raw grammar JSON including `scopeName`.
   * @param sourceCode - Full sample file contents.
   * @returns Per-line tokens with text spans and scope stacks.
   */
  async tokenizeFile(grammarJson: IRawGrammar, sourceCode: string): Promise<TokenizedLine[]> {
    if (!this.onigurumaReady) {
      throw new Error('TextmateTokenizerService.init must be called before tokenizeFile');
    }

    const onigLib = await this.onigurumaReady;
    const scopeName = grammarJson.scopeName;
    if (!scopeName) {
      throw new Error('Grammar must have a scopeName');
    }

    const registry = new Registry({
      onigLib: Promise.resolve(onigLib),
      loadGrammar: async (name: string) => {
        if (name === scopeName) {
          return grammarJson;
        }
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
    const yieldGate = yieldEvery(DEFERRED_WORK_YIELD_INTERVAL);

    for (const lineText of lines) {
      await yieldGate();
      const tokenizedLine = grammar.tokenizeLine(lineText, ruleStack);
      ruleStack = tokenizedLine.ruleStack;
      const tokens: TokenizedToken[] = tokenizedLine.tokens.map((token) => ({
        text: lineText.substring(token.startIndex, token.endIndex),
        scopes: [...token.scopes],
      }));
      result.push({ tokens });
    }

    (grammar as unknown as { dispose(): void }).dispose();
    return result;
  }
}
