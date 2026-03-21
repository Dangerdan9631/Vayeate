import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { mergeSemanticSelectorInto } from '../../../utils/semantic-token';

@injectable()
export class MergeSemanticSelectorsIntoCatalog {
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
