import { describe, expect, it } from 'vitest';
import { RemoveSemanticTokenListItemOperation } from './remove-semantic-token-list-item-operation';
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

describe('RemoveSemanticTokenListItemOperation', () => {
  const op = new RemoveSemanticTokenListItemOperation();

  it('removes one semantic token type at index', () => {
    const next = op.execute(baseCatalog, 'types', 0);
    expect(next.semanticTokenTypes).toEqual(['b']);
    expect(next.semanticTokenModifiers).toEqual(['m']);
  });

  it('removes modifier at index', () => {
    const next = op.execute(baseCatalog, 'modifiers', 0);
    expect(next.semanticTokenModifiers).toEqual([]);
  });

  it('returns catalog unchanged when index out of range', () => {
    const next = op.execute(baseCatalog, 'types', 99);
    expect(next).toBe(baseCatalog);
  });
});
