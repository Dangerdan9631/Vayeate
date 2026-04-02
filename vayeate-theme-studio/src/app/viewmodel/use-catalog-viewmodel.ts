import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useCatalogsState } from '../ui/context/slice-contexts';
import { getCatalogRefsFromCatalogsState } from '../../domain/state/catalog/catalogs-state';
import { compareVersions } from '../../domain/utils/version';
import { nextPatchVersion } from '../../domain/utils/version';
import type { Catalog, CatalogReference, Token, TokenType } from '../../model/schemas';
import { mergeSemanticSelectorInto } from '../../domain/utils/semantic-token';
import { CatalogActionType } from '../actions/action-types';

let catalogPageLoadDispatched = false;

export function useCatalogViewModel() {
  const dispatch = useAppDispatch();
  const catalogs = useCatalogsState();
  const { selectedRef, catalog, isCreating, createDialogOpen } = catalogs;
  const catalogRefs = useMemo(() => getCatalogRefsFromCatalogsState(catalogs), [catalogs]);

  useEffect(() => {
    if (catalogPageLoadDispatched) return;
    catalogPageLoadDispatched = true;
    dispatch({ type: CatalogActionType.CatalogPageOnLoad });
  }, [dispatch]);

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
      dispatch({ type: CatalogActionType.CatalogCatalogsListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        dispatch({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: best.name, version: best.version });
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogCatalogsCreateButtonOnClick });
    dispatch({ type: CatalogActionType.CatalogCreateDialogOnOpen });
  }, [dispatch]);

  const closeCreateDialog = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogCreateDialogCancelButtonOnClick });
  }, [dispatch]);

  const createCatalog = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogCreateDialogOkButtonOnClick });
  }, [dispatch]);

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick, name, version });
    },
    [dispatch],
  );

  const lockCatalog = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogDetailsLockButtonOnClick });
  }, [dispatch]);

  const syncCatalog = useCallback(() => {
    if (!catalog || catalog.type !== 'remote') return;
    dispatch({ type: CatalogActionType.CatalogDetailsSyncButtonOnClick, catalog });
  }, [dispatch, catalog]);

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
        dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
        return;
      }
      const newToken: Token = { key, type: tokenType };
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = { ...base, tokens: [...base.tokens, newToken] };
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
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
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
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
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
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
      dispatch({ type: CatalogActionType.CatalogDetailsSaveCatalog, catalog: updated });
    },
    [dispatch, catalog],
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

  const revertToVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: CatalogActionType.CatalogDetailsRevertButtonOnClick, name, version });
    },
    [dispatch],
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
