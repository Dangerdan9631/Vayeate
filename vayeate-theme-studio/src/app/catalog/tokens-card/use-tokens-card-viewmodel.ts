import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import { mergeSemanticSelectorInto } from '../../../model/merge-semantic-selector-into';
import type { Catalog, Token } from '../../../model/schema/catalog';
import { tokenKeySchema, tokenTypeSchema, type SemanticTokenRegistryListKind, type TokenKey, type TokenType } from '../../../model/schema/primitives';
import { TokensCardActionType } from './actions/tokens-card-action-type';
import { container } from 'tsyringe';
import { CatalogsStore, getCurrentCatalogRefs } from '../../../domain/state/catalog/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export const CATALOG_TOKEN_LIST_SECTIONS: TokenType[] = tokenTypeSchema.options.filter((tokenType) => tokenType !== 'semantic token');

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

function isValidTokenKey(value: string): boolean {
  return tokenKeySchema.safeParse(value).success;
}

function canAddSemanticSelector(selector: string, catalog: Catalog | null): boolean {
  if (!catalog) return false;
  const trimmed = selector.trim();
  if (!trimmed) return false;
  const current = {
    types: catalog.semanticTokenTypes ?? [],
    modifiers: catalog.semanticTokenModifiers ?? [],
    languages: catalog.semanticTokenLanguages ?? [],
  };
  return mergeSemanticSelectorInto(trimmed, current) !== null;
}

export interface TokensCardViewModel {
  catalog: Catalog | null;
  tokensSearchText: string;
  newTokenKey: string;
  newSemanticTokenSelectorText: string;
  filteredTokensByType: Record<TokenType, Token[]>;
  canEdit: boolean;
  canAddNewTokenKey: boolean;
  canAddSemanticTokenSelector: boolean;
  shouldShowSemanticTokenSection: boolean;
  semanticRegistryItemCount: number;
  onBulkAddClick: () => void;
  onSearchChange: (value: string) => void;
  onNewTokenAddClick: (tokenType: TokenType) => void;
  onTokenRemoveClick: (tokenType: TokenType, key: string | undefined) => void;
  onTokenKeyCommit: (tokenType: TokenType, oldKey: string | undefined, value: string) => void;
  onNewTokenKeyChange: (value: string) => void;
  onNewSemanticTokenSelectorTextChange: (value: string) => void;
  onNewSemanticTokenSelectorAddClick: () => void;
  onSemanticRegistryTextCommit: (registryList: SemanticTokenRegistryListKind, index: number, value: string) => void;
  onSemanticRegistryRemoveClick: (registryList: SemanticTokenRegistryListKind, index: number) => void;
}

export function useTokensCardViewModel(): TokensCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(catalogsStore.api, (state) => state.stateV2.selectedRef);
  const tokensSearchText = useStore(catalogsStore.api, (state) => state.stateV2.tokensSearchText);
  const newTokenKey = useStore(catalogsStore.api, (state) => state.stateV2.newTokenKey);
  const newSemanticTokenSelectorText = useStore(catalogsStore.api, (state) => state.stateV2.newSemanticTokenSelectorText);
  const catalogMap = useStore(catalogsStore.api, (state) => state.stateV2.catalogs);
  const catalogRefs = useMemo(() => getCurrentCatalogRefs(catalogMap), [catalogMap]);
  const selectedName = useMemo(() => selectedRef?.name ?? null, [selectedRef]);

  const catalog: Catalog | null = useMemo(() => {
    if (!selectedRef) return null;
    const catalogEntry = catalogMap[selectedRef.name]?.[selectedRef.version];
    if (!catalogEntry || !catalogEntry.isLoaded) return null;
    return catalogEntry.catalog;
  }, [catalogMap, selectedRef]);

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

  const canEdit = useMemo(() => catalog !== null && catalog.type === 'manual' && isLatestVersion, [catalog, isLatestVersion]);
  const canAddNewTokenKey = useMemo(() => canEdit && isValidTokenKey(newTokenKey.trim()), [canEdit, newTokenKey]);
  const canAddSemanticTokenSelector = useMemo(
    () => canEdit && canAddSemanticSelector(newSemanticTokenSelectorText, catalog),
    [canEdit, catalog, newSemanticTokenSelectorText],
  );
  const semanticRegistryItemCount = useMemo(() => {
    if (!catalog) return 0;
    return (catalog.semanticTokenTypes ?? []).length
      + (catalog.semanticTokenModifiers ?? []).length
      + (catalog.semanticTokenLanguages ?? []).length;
  }, [catalog]);
  const shouldShowSemanticTokenSection = useMemo(
    () => canEdit || semanticRegistryItemCount > 0,
    [canEdit, semanticRegistryItemCount],
  );

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

  const onBulkAddClick = useCallback(() => {
    void dispatch({ type: TokensCardActionType.BulkAddButtonOnClick });
  }, [dispatch]);

  const onSearchChange = useCallback(
    (value: string) => {
      void dispatch({ type: TokensCardActionType.SearchTextOnChange, value });
    },
    [dispatch],
  );

  const onNewTokenAddClick = useCallback(
    (tokenType: TokenType) => {
      const key = newTokenKey.trim();
      if (!isValidTokenKey(key)) return;
      void dispatch({
        type: TokensCardActionType.NewTokenAddButtonOnClick,
        tokenType,
        key,
      });
    },
    [dispatch, newTokenKey],
  );

  const onTokenRemoveClick = useCallback(
    (tokenType: TokenType, key: string | undefined) => {
      if (!key) return;
      void dispatch({
        type: TokensCardActionType.TokenRemoveButtonOnClick,
        key: key as TokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const onTokenKeyCommit = useCallback(
    (tokenType: TokenType, oldKey: string | undefined, value: string) => {
      const newKey = value.trim();
      if (!oldKey || !newKey || newKey === oldKey || !isValidTokenKey(newKey)) return;
      void dispatch({
        type: TokensCardActionType.ExistingTokenKeyTextOnCommit,
        value: newKey,
        key: oldKey as TokenKey,
        tokenType,
      });
    },
    [dispatch],
  );

  const onNewTokenKeyChange = useCallback(
    (value: string) => {
      void dispatch({ type: TokensCardActionType.NewTokenKeyTextOnChange, value });
    },
    [dispatch],
  );

  const onNewSemanticTokenSelectorTextChange = useCallback(
    (value: string) => {
      void dispatch({ type: TokensCardActionType.NewSemanticTokenSelectorTextOnChange, value });
    },
    [dispatch],
  );

  const onNewSemanticTokenSelectorAddClick = useCallback(() => {
    if (!canAddSemanticTokenSelector) return;
    void dispatch({ type: TokensCardActionType.NewSemanticTokenSelectorAddButtonOnClick });
  }, [canAddSemanticTokenSelector, dispatch]);

  const onSemanticRegistryTextCommit = useCallback(
    (registryList: SemanticTokenRegistryListKind, index: number, value: string) => {
      void dispatch({
        type: TokensCardActionType.ExistingSemanticTokenTextOnCommit,
        registryList,
        index,
        value,
      });
    },
    [dispatch],
  );

  const onSemanticRegistryRemoveClick = useCallback(
    (registryList: SemanticTokenRegistryListKind, index: number) => {
      void dispatch({
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
    newTokenKey,
    newSemanticTokenSelectorText,
    filteredTokensByType,
    canEdit,
    canAddNewTokenKey,
    canAddSemanticTokenSelector,
    shouldShowSemanticTokenSection,
    semanticRegistryItemCount,
    onBulkAddClick,
    onSearchChange,
    onNewTokenAddClick,
    onTokenRemoveClick,
    onTokenKeyCommit,
    onNewTokenKeyChange,
    onNewSemanticTokenSelectorTextChange,
    onNewSemanticTokenSelectorAddClick,
    onSemanticRegistryTextCommit,
    onSemanticRegistryRemoveClick,
  };
}
