import type { Catalog, Token } from '../../../model/schemas';
import type { TokenType } from '../../../model/schemas';
import { mergeSemanticSelectorInto } from '../../utils/semantic-token';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  saveCatalog as saveCatalogOp,
  setCatalogNewTokenKey,
  type SetState,
} from '../../operations/catalog-operations';
import type { GetState } from '../../operations/undo-operations';
import { catalogWithVersionBump, refreshRefsAndSelect } from './shared-flows';

export async function addNewToken(
  setState: SetState,
  setStoreState: SetStoreState,
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
    await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
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
  await refreshRefsAndSelect(setState, setStoreState, updated.name, updated.version);
  setCatalogNewTokenKey(setState, '');
}
