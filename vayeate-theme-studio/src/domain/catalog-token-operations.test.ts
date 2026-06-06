import { describe, expect, it } from 'vitest';
import { AddPlainTokenToCatalogOperation } from './operations/catalog-operations/tokens/add-plain-token-to-catalog-operation';
import { MergeSemanticSelectorsIntoCatalogOperation } from './operations/catalog-operations/tokens/merge-semantic-selectors-into-catalog-operation';
import { RemoveSemanticTokenListItemOperation } from './operations/catalog-operations/tokens/remove-semantic-token-list-item-operation';
import { RemoveTokenFromCatalogOperation } from './operations/catalog-operations/tokens/remove-token-from-catalog-operation';
import { UpdateSemanticTokenRegistryEntryOperation } from './operations/catalog-operations/tokens/update-semantic-token-registry-entry-operation';
import { UpdateTokenKeyInCatalogOperation } from './operations/catalog-operations/tokens/update-token-key-in-catalog-operation';
import { ValidateCanUpdateCatalogSource } from './catalog/validations/validate-can-update-catalog-source';
import { ValidateCatalogNameIsUnique } from './catalog/validations/validate-catalog-name-is-unique';
import { ValidateCatalogNameIsValid } from './catalog/validations/validate-catalog-name-is-valid';
import { ValidateSyncCatalog } from './catalog/validations/validate-sync-catalog';
import { CatalogsStore } from './catalog/state/catalogs-store';

const catalog = {
  name: 'catalog-a',
  version: '1.0.0',
  type: 'manual' as const,
  locked: false,
  sources: [{ url: 'https://example.test', type: 'default' as const, tokenType: 'theme' as const }],
  tokens: [
    { key: 'editor.foreground', type: 'theme' as const },
    { key: 'keyword.control', type: 'textmate token' as const },
  ],
  semanticTokenTypes: ['variable'],
  semanticTokenModifiers: ['readonly'],
  semanticTokenLanguages: ['typescript'],
};

describe('catalog token and validation operations', () => {
  it('adds, updates, and removes plain tokens by key and type', () => {
    const addToken = new AddPlainTokenToCatalogOperation();
    const updateToken = new UpdateTokenKeyInCatalogOperation();
    const removeToken = new RemoveTokenFromCatalogOperation();

    const withAdded = addToken.execute(catalog, {
      key: 'string.quoted',
      type: 'textmate token',
    });
    expect(withAdded.tokens).toContainEqual({
      key: 'string.quoted',
      type: 'textmate token',
    });

    const withUpdated = updateToken.execute(withAdded, 'editor.foreground', 'editor.background', 'theme');
    expect(withUpdated.tokens).toContainEqual({
      key: 'editor.background',
      type: 'theme',
    });
    expect(withUpdated.tokens).not.toContainEqual({
      key: 'editor.foreground',
      type: 'theme',
    });

    const withRemoved = removeToken.execute(withUpdated, 'keyword.control', 'textmate token');
    expect(withRemoved.tokens).not.toContainEqual({
      key: 'keyword.control',
      type: 'textmate token',
    });
  });

  it('merges and edits semantic registry lists safely', () => {
    const mergeSemanticSelector = new MergeSemanticSelectorsIntoCatalogOperation();
    const updateRegistry = new UpdateSemanticTokenRegistryEntryOperation();
    const removeRegistry = new RemoveSemanticTokenListItemOperation();

    const merged = mergeSemanticSelector.execute(catalog, 'variable.readonly:javascript');
    expect(merged).not.toBeNull();
    expect(merged?.semanticTokenTypes).toEqual(['variable']);
    expect(merged?.semanticTokenModifiers).toEqual(['readonly']);
    expect(merged?.semanticTokenLanguages).toEqual(['javascript', 'typescript']);

    const updated = updateRegistry.execute(catalog, 'languages', 0, 'rust');
    expect(updated.semanticTokenLanguages).toEqual(['rust']);

    const removed = removeRegistry.execute(updated, 'languages', 0);
    expect(removed.semanticTokenLanguages).toEqual([]);

    expect(updateRegistry.execute(catalog, 'types', 99, 'ignored')).toBe(catalog);
    expect(removeRegistry.execute(catalog, 'types', 99)).toBe(catalog);
    expect(mergeSemanticSelector.execute(catalog, 'not a selector')).toBeNull();
  });

  it('validates naming, source updates, uniqueness, and sync eligibility', () => {
    const validateName = new ValidateCatalogNameIsValid();
    const validateUpdateSource = new ValidateCanUpdateCatalogSource();
    const validateSync = new ValidateSyncCatalog();
    const catalogsStore = new CatalogsStore();
    catalogsStore.getStore().upsertCatalogs([{
      ...catalog,
      type: 'manual',
    }]);
    const validateUnique = new ValidateCatalogNameIsUnique(catalogsStore);

    expect(validateName.test('catalog-a').isValid).toBe(true);
    expect(validateName.test('bad name').isValid).toBe(false);
    expect(validateUnique.test('catalog-a').isValid).toBe(false);
    expect(validateUnique.test('catalog-b').isValid).toBe(true);

    expect(validateUpdateSource.test(catalog, 0)).toBe(true);
    expect(validateUpdateSource.test(catalog, 1)).toBe(false);

    expect(validateSync.test({ ...catalog, type: 'remote' })).toBe(true);
    expect(validateSync.test(catalog)).toBe(false);
  });
});
