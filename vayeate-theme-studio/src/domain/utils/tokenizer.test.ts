/**
 * @vitest-environment node
 */
import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import { initOniguruma, tokenizeFile } from './tokenizer';
import type { IRawGrammar } from 'vscode-textmate';

const require = createRequire(import.meta.url);

function loadOnigWasmFromNodeModules(): Promise<ArrayBuffer> {
  const wasmPath = path.join(path.dirname(require.resolve('vscode-oniguruma')), 'onig.wasm');
  const buf = fs.readFileSync(wasmPath);
  return Promise.resolve(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

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
    await initOniguruma({ loadWasm: loadOnigWasmFromNodeModules });
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
