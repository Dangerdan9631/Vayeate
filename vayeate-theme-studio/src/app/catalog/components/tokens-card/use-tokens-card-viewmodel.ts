import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { compareVersions } from '../../../../domain/utils/compare-versions';
import type { Catalog, Token } from '../../../../model/schema/catalog';
import type { SemanticTokenRegistryListKind, TokenKey, TokenType } from '../../../../model/schema/primitives';
import { TokensCardActionType } from './actions/tokens-card-action-type';
import { container } from 'tsyringe';
import { CatalogsStore, getCurrentCatalog, getCurrentCatalogRefs } from '../../../../domain/catalog/state/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export const CATALOG_TOKEN_LIST_SECTIONS: TokenType[] = ['theme', 'textmate token'];

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

export function useTokensCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(catalogsStore.api, (state) => state.stateV2.selectedRef);
  const catalog: Catalog | null = useStore(catalogsStore.api, getCurrentCatalog);
  const tokensSearchText = useStore(catalogsStore.api, (state) => state.stateV2.tokensSearchText);
  const newSemanticTokenSelectorText = useStore(catalogsStore.api, (state) => state.stateV2.newSemanticTokenSelectorText);
  const catalogMap = useStore(catalogsStore.api, (state) => state.stateV2.catalogs);
  const catalogRefs = useMemo(() => getCurrentCatalogRefs(catalogMap), [catalogMap]);
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
    dispatch({ type: TokensCardActionType.BulkAddButtonOnClick });
  }, [dispatch]);

  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch({ type: TokensCardActionType.SearchTextOnChange, value });
    },
    [dispatch],
  );

  const handleAddToken = useCallback(
    (tokenType: TokenType, key: string) => {
      dispatch({
        type: TokensCardActionType.NewTokenAddButtonOnClick,
        tokenType,
        key,
      });
    },
    [dispatch],
  );

  const handleRemoveToken = useCallback(
    (tokenType: TokenType, key: string) => {
      dispatch({
        type: TokensCardActionType.TokenRemoveButtonOnClick,
        key: key as TokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const handleUpdateTokenKey = useCallback(
    (tokenType: TokenType, oldKey: string, newKey: string) => {
      dispatch({
        type: TokensCardActionType.ExistingTokenKeyTextOnCommit,
        value: newKey,
        key: oldKey as TokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const handleNewTokenKeyChange = useCallback(
    (value: string) => {
      dispatch({ type: TokensCardActionType.NewTokenKeyTextOnChange, value });
    },
    [dispatch],
  );

  const handleNewSemanticTokenSelectorTextChange = useCallback(
    (value: string) => {
      dispatch({ type: TokensCardActionType.NewSemanticTokenSelectorTextOnChange, value });
    },
    [dispatch],
  );

  const handleNewSemanticTokenSelectorAdd = useCallback(() => {
    dispatch({ type: TokensCardActionType.NewSemanticTokenSelectorAddButtonOnClick });
  }, [dispatch]);

  const handleSemanticRegistryTextCommit = useCallback(
    (registryList: SemanticTokenRegistryListKind, index: number, value: string) => {
      dispatch({
        type: TokensCardActionType.ExistingSemanticTokenTextOnCommit,
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
        type: TokensCardActionType.ExistingSemanticTokenRemoveButtonOnClick,
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
