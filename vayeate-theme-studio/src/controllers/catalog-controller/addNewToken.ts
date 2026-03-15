import type { Catalog, Token } from '../../model/schemas';
import type { TokenType } from '../../model/schemas';
import { mergeSemanticSelectorInto } from '../../core/semantic-token';
import {
  saveCatalog as saveCatalogOp,
  setCatalogNewTokenKey,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogWithVersionBump, refreshRefsAndSelect } from './_helpers';

export async function addNewToken(
  setState: SetState,
  getState: GetState,
  tokenType: TokenType,
  key?: string,
): Promise<void> {
  const state = getState().catalogs;
  const catalog = state.catalog;
  const tokenKey = (key ?? state.newTokenKey)?.trim();
  if (!catalog || !tokenKey) return;

  if (tokenType === 'semantic token') {
    const current = {
      types: catalog.semanticTokenTypes ?? [],
      modifiers: catalog.semanticTokenModifiers ?? [],
      languages: catalog.semanticTokenLanguages ?? [],
    };
    const merged = mergeSemanticSelectorInto(tokenKey, current);
    if (!merged) return;
    const base = catalogWithVersionBump(catalog);
    const updated: Catalog = {
      ...base,
      semanticTokenTypes: merged.types,
      semanticTokenModifiers: merged.modifiers,
      semanticTokenLanguages: merged.languages,
    };
    await saveCatalogOp(updated);
    await refreshRefsAndSelect(setState, updated.name, updated.version);
    setCatalogNewTokenKey(setState, '');
    return;
  }

  const newToken: Token = { key: tokenKey, type: tokenType };
  const base = catalogWithVersionBump(catalog);
  const updated: Catalog = {
    ...base,
    tokens: [...base.tokens, newToken],
  };
  await saveCatalogOp(updated);
  await refreshRefsAndSelect(setState, updated.name, updated.version);
  setCatalogNewTokenKey(setState, '');
}
