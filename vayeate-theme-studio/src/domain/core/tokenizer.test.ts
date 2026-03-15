/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { tokenizeFile } from './tokenizer';
import type { IRawGrammar } from 'vscode-textmate';

const minimalGrammar: IRawGrammar = {
  scopeName: 'source.test',
  patterns: [
    {
      match: '\\b(foo|bar)\\b',
      name: 'keyword.control.test',
    },
    {
      match: '"[^"]*"',
      name: 'string.quoted.test',
    },
  ],
  repository: {} as IRawGrammar['repository'],
};

describe('tokenizer', () => {
  beforeEach(async () => {
    const { initOniguruma } = await import('./tokenizer');
    const { createRequire } = await import('node:module');
    const path = await import('node:path');
    const fs = await import('node:fs');
    const require = createRequire(import.meta.url);
    const wasmPath = path.join(path.dirname(require.resolve('vscode-oniguruma')), 'onig.wasm');
    if (fs.existsSync(wasmPath)) {
      await initOniguruma(wasmPath);
    }
  });

  it('tokenizeFile throws when grammar has no scopeName', async () => {
    const badGrammar = { patterns: [], repository: {} } as unknown as IRawGrammar;
    await expect(tokenizeFile(badGrammar, 'hello')).rejects.toThrow('scopeName');
  });

  it('tokenizeFile returns lines with tokens for minimal grammar', async () => {
    const source = 'foo "bar" baz';
    const lines = await tokenizeFile(minimalGrammar, source);
    expect(lines).toHaveLength(1);
    expect(lines[0].tokens.length).toBeGreaterThan(0);
    const texts = lines[0].tokens.map((t) => t.text);
    expect(texts.join('')).toBe(source);
    const keywordToken = lines[0].tokens.find((t) => t.scopes.some((s) => s.includes('keyword')));
    expect(keywordToken).toBeDefined();
    expect(keywordToken?.text).toBe('foo');
  });
});
