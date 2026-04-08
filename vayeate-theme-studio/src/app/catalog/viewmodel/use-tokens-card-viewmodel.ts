import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { getCatalogRefsFromCatalogMap } from '../../../domain/state/catalog/catalogs-state';
import { compareVersions } from '../../../domain/utils/version';
import { nextPatchVersion } from '../../../domain/utils/version';
import type { Catalog, Token, TokenKey, TokenType } from '../../../model/schemas';
import { mergeSemanticSelectorInto } from '../../../domain/utils/semantic-token';
import { CatalogActionType } from '../actions/catalog-action-type';

/** Sections shown in the catalog tokens pane: Theme Tokens, Textmate Tokens */
export const CATALOG_TOKEN_LIST_SECTIONS: TokenType[] = ['theme', 'textmate token'];

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

export function useTokensCardViewModel(catalog: Catalog | null) {
  const dispatch = useAppDispatch();
  const { selectedRef, catalogMap, tokensSearchText } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice;
  });
  const catalogRefs = useMemo(() => getCatalogRefsFromCatalogMap(catalogMap), [catalogMap]);
  const selectedName = selectedRef?.name ?? null;

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName) return false;
    const best = catalogRefs
      .filter((r) => r.name === selectedName)
      .reduce(
        (acc, r) => (!acc || compareVersions(r.version, acc.version) > 0 ? r : acc),
        null as (typeof catalogRefs)[number] | null,
      );
    return best !== null && best.version === selectedRef.version;
  }, [catalogRefs, selectedRef, selectedName]);

  const tokensByType = useMemo(() => {
    const groups: Record<TokenType, Token[]> = { theme: [], 'textmate token': [], 'semantic token': [] };
    if (!catalog) return groups;
    for (const t of catalog.tokens) {
      groups[t.type].push(t);
    }
    return groups;
  }, [catalog]);

  const canEdit = catalog !== null && catalog.type === 'manual' && isLatestVersion;

  const filteredTokensByType = useMemo(
    () =>
      Object.fromEntries(
        CATALOG_TOKEN_LIST_SECTIONS.map((tt) => [
          tt,
          tokensByType[tt]
            .filter((t) => matchesSearch(t.key, tokensSearchText))
            .sort((a, b) => a.key.localeCompare(b.key)),
        ]),
      ) as Record<TokenType, Token[]>,
    [tokensByType, tokensSearchText],
  );

  const handleBulkAddClick = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogTokensBulkAddButtonOnClick });
  }, [dispatch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch({ type: CatalogActionType.CatalogTokensSearchTextOnChange, value });
    },
    [dispatch],
  );

  const handleAddToken = useCallback(
    (tokenType: TokenType) => (key: string) => {
      dispatch({
        type: CatalogActionType.CatalogTokensNewTokenAddButtonOnClick,
        tokenType,
        key,
      });
    },
    [dispatch],
  );

  const handleRemoveToken = useCallback(
    (tokenType: TokenType) => (key: string) => {
      dispatch({
        type: CatalogActionType.CatalogTokensTokenRemoveButtonOnClick,
        key: key as TokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const handleUpdateTokenKey = useCallback(
    (tokenType: TokenType) => (oldKey: string, newKey: string) => {
      dispatch({
        type: CatalogActionType.CatalogTokensExistingTokenKeyTextOnCommit,
        value: newKey,
        key: oldKey as TokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const handleNewTokenKeyChange = useCallback(
    (value: string) => {
      dispatch({ type: CatalogActionType.CatalogTokensNewTokenKeyTextOnChange, value });
    },
    [dispatch],
  );

  const addSemanticFromSelector = useCallback(
    (selector: string) => {
      if (!catalog) return;
      const current = {
        types: catalog.semanticTokenTypes ?? [],
        modifiers: catalog.semanticTokenModifiers ?? [],
        languages: catalog.semanticTokenLanguages ?? [],
      };
      const merged = mergeSemanticSelectorInto(selector, current);
      if (!merged) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = {
        ...base,
        semanticTokenTypes: merged.types,
        semanticTokenModifiers: merged.modifiers,
        semanticTokenLanguages: merged.languages,
      };
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
  );

  const setSemanticTypes = useCallback(
    (types: string[]) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, semanticTokenTypes: types };
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
  );

  const setSemanticModifiers = useCallback(
    (modifiers: string[]) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, semanticTokenModifiers: modifiers };
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
  );

  const setSemanticLanguages = useCallback(
    (languages: string[]) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, semanticTokenLanguages: languages };
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
  );

  return {
    tokensSearchText,
    filteredTokensByType,
    canEdit,
    handleBulkAddClick,
    handleSearchChange,
    handleAddToken,
    handleRemoveToken,
    handleUpdateTokenKey,
    handleNewTokenKeyChange,
    onAddSemanticFromSelector: addSemanticFromSelector,
    onSetSemanticTypes: setSemanticTypes,
    onSetSemanticModifiers: setSemanticModifiers,
    onSetSemanticLanguages: setSemanticLanguages,
  };
}
