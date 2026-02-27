import { useCallback, useEffect, useMemo } from 'react';
import { useAppState } from '../ui/context/useAppState';
import { compareVersions } from '../utils/version';
import { nextPatchVersion } from '../utils/version';
import { createLogger } from '../utils/logger';
import type { Catalog, CatalogReference, Source, Token, TokenType } from '../model/schemas';

const log = createLogger('CatalogVM');

export function useCatalogViewModel() {
  const { state, dispatch } = useAppState();
  const { catalogRefs, selectedRef, catalog, isCreating, createDialogOpen } = state.catalogs;

  useEffect(() => {
    log.debug('initial mount → LOAD_CATALOG_REFS');
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
      log.debug('selectCatalog', name, `v${version}`);
      dispatch({ type: 'SELECT_CATALOG', name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        log.debug('selectName', name, '→ highest version', `v${best.version}`);
        dispatch({ type: 'SELECT_CATALOG', name: best.name, version: best.version });
      } else {
        log.warn('selectName', name, '→ no versions found');
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    log.debug('openCreateDialog');
    dispatch({ type: 'OPEN_CREATE_DIALOG' });
  }, [dispatch]);

  const closeCreateDialog = useCallback(() => {
    log.debug('closeCreateDialog');
    dispatch({ type: 'CLOSE_CREATE_DIALOG' });
  }, [dispatch]);

  const createCatalog = useCallback(
    (params: { name: string; type: 'manual' | 'remote' }) => {
      log.debug('createCatalog', params.name, params.type);
      dispatch({ type: 'CREATE_CATALOG', params });
    },
    [dispatch],
  );

  const deleteVersion = useCallback(
    (name: string, version: string) => {
      log.debug('deleteVersion', name, `v${version}`);
      dispatch({ type: 'DELETE_VERSION', name, version });
    },
    [dispatch],
  );

  const updateSources = useCallback(
    (sources: Source[]) => {
      if (!catalog) {
        log.warn('updateSources called with no catalog loaded');
        return;
      }
      log.debug('updateSources', catalog.name, `${sources.length} source(s)`);
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
    if (!catalog || catalog.type !== 'manual' || catalog.locked) {
      log.warn('lockCatalog skipped:', !catalog ? 'no catalog' : catalog.locked ? 'already locked' : `type=${catalog.type}`);
      return;
    }
    log.debug('lockCatalog', catalog.name, `v${catalog.version}`);
    const updated: Catalog = { ...catalog, locked: true };
    dispatch({ type: 'SAVE_CATALOG', catalog: updated });
  }, [dispatch, catalog]);

  const syncCatalog = useCallback(() => {
    if (!catalog) {
      log.warn('syncCatalog called with no catalog loaded');
      return;
    }
    if (catalog.type !== 'remote') {
      log.warn('syncCatalog called on non-remote catalog', catalog.type);
      return;
    }
    log.debug('syncCatalog dispatching', catalog.name, `v${catalog.version}`,
      `(${catalog.sources.length} source(s))`);
    dispatch({ type: 'SYNC_CATALOG', catalog });
  }, [dispatch, catalog]);

  const addToken = useCallback(
    (key: string, tokenType: TokenType) => {
      if (!catalog) {
        log.warn('addToken called with no catalog loaded');
        return;
      }
      log.debug('addToken', key, tokenType, 'to', catalog.name);
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
      if (!catalog) {
        log.warn('removeToken called with no catalog loaded');
        return;
      }
      log.debug('removeToken', key, tokenType, 'from', catalog.name);
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
      if (!catalog) {
        log.warn('updateTokenKey called with no catalog loaded');
        return;
      }
      log.debug('updateTokenKey', oldKey, '→', newKey, tokenType, 'in', catalog.name);
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

  const bulkAddTokens = useCallback(
    (newTokens: Token[]) => {
      if (!catalog) {
        log.warn('bulkAddTokens called with no catalog loaded');
        return;
      }
      const existingKeys = new Set(catalog.tokens.map((t) => `${t.type}::${t.key}`));
      const unique = newTokens.filter((t) => !existingKeys.has(`${t.type}::${t.key}`));
      if (unique.length === 0) {
        log.debug('bulkAddTokens: all tokens already exist, nothing to add');
        return;
      }
      log.debug('bulkAddTokens', unique.length, 'new token(s) to', catalog.name,
        `(${newTokens.length - unique.length} duplicate(s) skipped)`);
      const base = catalog.locked
        ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
        : catalog;
      const updated: Catalog = {
        ...base,
        tokens: [...base.tokens, ...unique],
      };
      dispatch({ type: 'SAVE_CATALOG', catalog: updated });
    },
    [dispatch, catalog],
  );

  const revertToVersion = useCallback(
    (name: string, version: string) => {
      log.debug('revertToVersion', name, `v${version}`);
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
    bulkAddTokens,
    removeToken,
    updateTokenKey,
    revertToVersion,
  };
}
