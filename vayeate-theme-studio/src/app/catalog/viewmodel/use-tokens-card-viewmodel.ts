import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { getCatalogRefsFromCatalogMap } from '../../../domain/state/catalog/catalogs-state';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { SemanticTokenRegistryListKind, Token, TokenKey, TokenType } from '../../../model/schemas';
import { CatalogActionType } from '../actions/catalog-action-type';

export const CATALOG_TOKEN_LIST_SECTIONS: TokenType[] = ['theme', 'textmate token'];

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

export function useTokensCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, catalogMap, catalog, tokensSearchText, newSemanticTokenSelectorText } =
    useContextSelector(AppContext, (c) => {
      const slice = c?.state.catalogs;
      if (slice === undefined) {
        throw new Error('Catalog state requires AppProvider.');
      }
      return {
        selectedRef: slice.selectedRef,
        catalogMap: slice.catalogMap,
        catalog: slice.catalog,
        tokensSearchText: slice.tokensSearchText,
        newSemanticTokenSelectorText: slice.newSemanticTokenSelectorText,
      };
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
    (tokenType: TokenType, key: string) => {
      dispatch({
        type: CatalogActionType.CatalogTokensNewTokenAddButtonOnClick,
        tokenType,
        key,
      });
    },
    [dispatch],
  );

  const handleRemoveToken = useCallback(
    (tokenType: TokenType, key: string) => {
      dispatch({
        type: CatalogActionType.CatalogTokensTokenRemoveButtonOnClick,
        key: key as TokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const handleUpdateTokenKey = useCallback(
    (tokenType: TokenType, oldKey: string, newKey: string) => {
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

  const handleNewSemanticTokenSelectorTextChange = useCallback(
    (value: string) => {
      dispatch({ type: CatalogActionType.CatalogTokensNewSemanticTokenSelectorTextOnChange, value });
    },
    [dispatch],
  );

  const handleNewSemanticTokenSelectorAdd = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogTokensNewSemanticTokenSelectorAddButtonOnClick });
  }, [dispatch]);

  const handleSemanticRegistryTextCommit = useCallback(
    (registryList: SemanticTokenRegistryListKind, index: number, value: string) => {
      dispatch({
        type: CatalogActionType.CatalogTokensExistingSemanticTokenTextOnCommit,
        registryList,
        index,
        value,
      });
    },
    [dispatch],
  );

  const handleSemanticRegistryRemove = useCallback(
    (registryList: SemanticTokenRegistryListKind, index: number) => {
      dispatch({
        type: CatalogActionType.CatalogTokensExistingSemanticTokenRemoveButtonOnClick,
        registryList,
        index,
      });
    },
    [dispatch],
  );

  return {
    catalog,
    tokensSearchText,
    newSemanticTokenSelectorText,
    filteredTokensByType,
    canEdit,
    handleBulkAddClick,
    handleSearchChange,
    handleAddToken,
    handleRemoveToken,
    handleUpdateTokenKey,
    handleNewTokenKeyChange,
    handleNewSemanticTokenSelectorTextChange,
    handleNewSemanticTokenSelectorAdd,
    handleSemanticRegistryTextCommit,
    handleSemanticRegistryRemove,
  };
}
