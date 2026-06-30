import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { mergeSemanticSelectorInto } from '../../../../model/merge-semantic-selector-into';

/**
 * Merges semantic selectors into catalog into the catalog in the store.
 */

@singleton()
export class MergeSemanticSelectorsIntoCatalogOperation {

  /**
   * Runs the merge semantic selectors into catalog mutation.
   * @param catalog Catalog (Catalog).
   * @param tokenKey Token key (string).
   * @returns Catalog | null result.
   */
  execute(catalog: Catalog, tokenKey: string): Catalog | null {
    const current = {
      types: catalog.semanticTokenTypes ?? [],
      modifiers: catalog.semanticTokenModifiers ?? [],
      languages: catalog.semanticTokenLanguages ?? [],
    };
    const merged = mergeSemanticSelectorInto(tokenKey, current);
    if (!merged) return null;
    return {
      ...catalog,
      semanticTokenTypes: merged.types,
      semanticTokenModifiers: merged.modifiers,
      semanticTokenLanguages: merged.languages,
    };
  }
}
