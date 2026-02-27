import { useCallback, useEffect, useMemo } from 'react';
import { useAppState } from '../ui/context/AppContext';
import { compareVersions } from '../utils/version';
import { nextPatchVersion } from '../utils/version';
import type { Catalog, CatalogReference, Source, Token, TokenType } from '../model/schemas';

export function useCatalogViewModel() {
  const { state, dispatch } = useAppState();
  const { catalogRefs, selectedRef, catalog, isCreating, createDialogOpen } = state.catalogs;

  useEffect(() => {
    dispatch({ type: 'LOAD_CATALOG_REFS' });
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
    if (!catalog) return { theme: 0, token: 0, 'semantic token': 0 };
    const counts: Record<TokenType, number> = { theme: 0, token: 0, 'semantic token': 0 };
    for (const t of catalog.tokens) {
      counts[t.type]++;
    }
    return counts;
  }, [catalog]);

  const tokensByType = useMemo(() => {
    const groups: Record<TokenType, Token[]> = { theme: [], token: [], 'semantic token': [] };
    if (!catalog) return groups;
    for (const t of catalog.tokens) {
      groups[t.type].push(t);
    }
    return groups;
  }, [catalog]);

  const selectCatalog = useCallback(
    (name: string, version: string) => {
      dispatch({ type: 'SELECT_CATALOG', name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        dispatch({ type: 'SELECT_CATALOG', name: best.name, version: best.version });
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    dispatch({ type: 'OPEN_CREATE_DIALOG' });
  }, [dispatch]);

  const closeCreateDialog = useCallback(() => {
    dispatch({ type: 'CLOSE_CREATE_DIALOG' });
  }, [dispatch]);

  const createCatalog = useCallback(
    (params: { name: string; type: 'manual' | 'remote' }) => {
      dispatch({ type: 'CREATE_CATALOG', params });
    },
    [dispatch],
  );

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: 'DELETE_VERSION', name, version });
    },
    [dispatch],
  );

  const updateSources = useCallback(
    (sources: Source[]) => {
      if (!catalog) return;
      const updated: Catalog = {
        ...catalog,
        sources,
        version: catalog.locked ? nextPatchVersion(catalog.version) : catalog.version,
        locked: false,
      };
      dispatch({ type: 'SAVE_CATALOG', catalog: updated });
    },
    [dispatch, catalog],
  );

  const lockCatalog = useCallback(() => {
    if (!catalog || catalog.type !== 'manual' || catalog.locked) return;
    const updated: Catalog = { ...catalog, locked: true };
    dispatch({ type: 'SAVE_CATALOG', catalog: updated });
  }, [dispatch, catalog]);

  const syncCatalog = useCallback(() => {
    if (!catalog || catalog.type !== 'remote') return;
    dispatch({ type: 'SYNC_CATALOG', catalog });
  }, [dispatch, catalog]);

  const addToken = useCallback(
    (key: string, tokenType: TokenType) => {
      if (!catalog) return;
      const newToken: Token = { key, type: tokenType };
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = {
        ...base,
        tokens: [...base.tokens, newToken],
      };
      dispatch({ type: 'SAVE_CATALOG', catalog: updated });
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
      dispatch({ type: 'SAVE_CATALOG', catalog: updated });
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
      dispatch({ type: 'SAVE_CATALOG', catalog: updated });
    },
    [dispatch, catalog],
  );

  const revertToVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: 'REVERT_TO_VERSION', name, version });
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
    updateSources,
    lockCatalog,
    syncCatalog,
    addToken,
    removeToken,
    updateTokenKey,
    revertToVersion,
  };
}
