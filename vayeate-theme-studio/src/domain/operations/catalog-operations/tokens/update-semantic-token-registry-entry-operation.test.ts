import { describe, expect, it } from 'vitest';
import { UpdateSemanticTokenRegistryEntryOperation } from './update-semantic-token-registry-entry-operation';
import type { Catalog } from '../../../../model/schemas';

const baseCatalog: Catalog = {
  name: 'c',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
  semanticTokenTypes: ['a', 'b'],
  semanticTokenModifiers: ['m'],
  semanticTokenLanguages: ['lang'],
};

describe('UpdateSemanticTokenRegistryEntryOperation', () => {
  const op = new UpdateSemanticTokenRegistryEntryOperation();

  it('replaces semantic token type at index', () => {
    const next = op.execute(baseCatalog, 'types', 0, 'z');
    expect(next.semanticTokenTypes).toEqual(['z', 'b']);
  });

  it('returns catalog unchanged when index out of range', () => {
    const next = op.execute(baseCatalog, 'types', 99, 'z');
    expect(next).toBe(baseCatalog);
  });
});
