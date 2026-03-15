import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatchV2, useCatalogsState } from '../ui/context/slice-contexts';
import { compareVersions } from '../utils/version';
import { nextPatchVersion } from '../utils/version';
import type { Catalog, CatalogReference, Token, TokenType } from '../model/schemas';
import { mergeSemanticSelectorInto } from '../core/semantic-token';

let catalogPageLoadDispatched = false;

export function useCatalogViewModel() {
  const dispatchV2 = useAppDispatchV2();
  const { catalogRefs, selectedRef, catalog, isCreating, createDialogOpen } = useCatalogsState();

  useEffect(() => {
    if (catalogPageLoadDispatched) return;
    catalogPageLoadDispatched = true;
    dispatchV2({ type: 'CATALOG_PAGE_ON_LOAD' });
  }, [dispatchV2]);

  const catalogNames = useMemo(() => {
    const names = new Set(catalogRefs.map((r) => r.name));
    return [...names].sort();
  }, [catalogRefs]);

  const selectedName = selectedRef?.name ?? null;

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return catalogRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [catalogRefs, selectedName]);

  const highestVersionForName = useCallback(
    (name: string): CatalogReference | null => {
      const refs = catalogRefs.filter((r) => r.name === name);
      if (refs.length === 0) return null;
      return refs.reduce((best, r) =>
        compareVersions(r.version, best.version) > 0 ? r : best,
      );
    },
    [catalogRefs],
  );

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName) return false;
    const best = catalogRefs
      .filter((r) => r.name === selectedName)
      .reduce<CatalogReference | null>(
        (acc, r) => (!acc || compareVersions(r.version, acc.version) > 0 ? r : acc),
        null,
      );
    return best !== null && best.version === selectedRef.version;
  }, [catalogRefs, selectedRef, selectedName]);

  const tokenCountsByType = useMemo(() => {
    if (!catalog) return { theme: 0, 'textmate token': 0, 'semantic token': 0 };
    const counts: Record<TokenType, number> = { theme: 0, 'textmate token': 0, 'semantic token': 0 };
    for (const t of catalog.tokens) {
      counts[t.type]++;
    }
    return counts;
  }, [catalog]);

  const tokensByType = useMemo(() => {
    const groups: Record<TokenType, Token[]> = { theme: [], 'textmate token': [], 'semantic token': [] };
    if (!catalog) return groups;
    for (const t of catalog.tokens) {
      groups[t.type].push(t);
    }
    return groups;
  }, [catalog]);

  const selectCatalog = useCallback(
    (name: string, version: string) => {
      dispatchV2({ type: 'CATALOG_CATALOGS_LIST_ON_COMMIT', name, version });
    },
    [dispatchV2],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        dispatchV2({ type: 'CATALOG_CATALOGS_LIST_ON_COMMIT', name: best.name, version: best.version });
      }
    },
    [dispatchV2, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    dispatchV2({ type: 'CATALOG_CATALOGS_CREATE_BUTTON_ON_CLICK' });
    dispatchV2({ type: 'CATALOG_CREATE_DIALOG_ON_OPEN' });
  }, [dispatchV2]);

  const closeCreateDialog = useCallback(() => {
    dispatchV2({ type: 'CATALOG_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK' });
  }, [dispatchV2]);

  const createCatalog = useCallback(
    (params: { name: string; type: 'manual' | 'remote' }) => {
      dispatchV2({ type: 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params });
    },
    [dispatchV2],
  );

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      dispatchV2({ type: 'CATALOG_DETAILS_DELETE_VERSION_BUTTON_ON_CLICK', name, version });
    },
    [dispatchV2],
  );

  const lockCatalog = useCallback(() => {
    dispatchV2({ type: 'CATALOG_DETAILS_LOCK_BUTTON_ON_CLICK' });
  }, [dispatchV2]);

  const syncCatalog = useCallback(() => {
    if (!catalog || catalog.type !== 'remote') return;
    dispatchV2({ type: 'CATALOG_DETAILS_SYNC_BUTTON_ON_CLICK', catalog });
  }, [dispatchV2, catalog]);

  const addToken = useCallback(
    (key: string, tokenType: TokenType) => {
      if (!catalog) return;
      if (tokenType === 'semantic token') {
        const current = {
          types: catalog.semanticTokenTypes ?? [],
          modifiers: catalog.semanticTokenModifiers ?? [],
          languages: catalog.semanticTokenLanguages ?? [],
        };
        const merged = mergeSemanticSelectorInto(key, current);
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
        dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
        return;
      }
      const newToken: Token = { key, type: tokenType };
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, tokens: [...base.tokens, newToken] };
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
  );

  const removeToken = useCallback(
    (key: string, tokenType: TokenType) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = {
        ...base,
        tokens: base.tokens.filter((t) => !(t.key === key && t.type === tokenType)),
      };
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
  );

  const updateTokenKey = useCallback(
    (oldKey: string, newKey: string, tokenType: TokenType) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = {
        ...base,
        tokens: base.tokens.map((t) =>
          t.key === oldKey && t.type === tokenType ? { ...t, key: newKey } : t,
        ),
      };
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
  );

  const bulkAddTokens = useCallback(
    (newTokens: Token[]) => {
      if (!catalog) return;
      const existingKeys = new Set(catalog.tokens.map((t) => `${t.type}::${t.key}`));
      const unique = newTokens.filter((t) => !existingKeys.has(`${t.type}::${t.key}`));
      if (unique.length === 0) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, tokens: [...base.tokens, ...unique] };
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
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
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
  );

  const setSemanticTypes = useCallback(
    (types: string[]) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, semanticTokenTypes: types };
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
  );

  const setSemanticModifiers = useCallback(
    (modifiers: string[]) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, semanticTokenModifiers: modifiers };
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
  );

  const setSemanticLanguages = useCallback(
    (languages: string[]) => {
      if (!catalog) return;
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, semanticTokenLanguages: languages };
      dispatchV2({ type: 'CATALOG_DETAILS_SAVE_CATALOG', catalog: updated });
    },
    [dispatchV2, catalog],
  );

  const revertToVersion = useCallback(
    (name: string, version: string) => {
      dispatchV2({ type: 'CATALOG_DETAILS_REVERT_BUTTON_ON_CLICK', name, version });
    },
    [dispatchV2],
  );

  return {
    catalogRefs,
    selectedRef,
    catalog,
    isCreating,
    createDialogOpen,
    catalogNames,
    selectedName,
    versionsForSelectedName,
    isLatestVersion,
    tokenCountsByType,
    tokensByType,
    highestVersionForName,
    selectCatalog,
    selectName,
    openCreateDialog,
    closeCreateDialog,
    createCatalog,
    deleteVersion,
    lockCatalog,
    syncCatalog,
    addToken,
    bulkAddTokens,
    removeToken,
    updateTokenKey,
    addSemanticFromSelector,
    setSemanticTypes,
    setSemanticModifiers,
    setSemanticLanguages,
    revertToVersion,
  };
}
