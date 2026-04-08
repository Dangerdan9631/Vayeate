import { useCallback, useMemo, useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { getCatalogRefsFromCatalogMap } from '../../../domain/state/catalog/catalogs-state';
import { compareVersions } from '../../../domain/utils/version';
import type { Catalog, SourceType, TokenType } from '../../../model/schemas';
import { CatalogActionType } from '../actions/catalog-action-type';

export function useCatalogDetailsCardViewModel(catalog: Catalog | null) {
  const dispatch = useAppDispatch();
  const catalogsState = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice;
  });
  const { selectedRef, catalogMap, newSourceUrl, newSourceTokenType, newSourceType } = catalogsState;
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

  const tokenCounts = useMemo(() => {
    if (!catalog) return { theme: 0, 'textmate token': 0, 'semantic token': 0 };
    const counts: Record<TokenType, number> = { theme: 0, 'textmate token': 0, 'semantic token': 0 };
    for (const t of catalog.tokens) {
      counts[t.type]++;
    }
    return counts;
  }, [catalog]);

  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSourceUrl, setEditingSourceUrl] = useState('');

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

  const revertToVersion = useCallback(
    (name: string, version: string) => {
      dispatch({ type: CatalogActionType.CatalogDetailsRevertButtonOnClick, name, version });
    },
    [dispatch],
  );

  const onDeleteVersion = useCallback(() => {
    if (selectedRef) deleteVersion(selectedRef.name, selectedRef.version);
  }, [deleteVersion, selectedRef]);

  const onRevert = useCallback(() => {
    if (selectedRef) revertToVersion(selectedRef.name, selectedRef.version);
  }, [revertToVersion, selectedRef]);

  const commitSourceUrl = useCallback(
    (value: string, sourceIndex: number) => {
      dispatch({
        type: CatalogActionType.CatalogDetailsSourceUrlTextOnCommit,
        value,
        sourceIndex,
      });
    },
    [dispatch],
  );

  const commitSourceTokenType = useCallback(
    (value: TokenType, sourceIndex: number) => {
      dispatch({
        type: CatalogActionType.CatalogDetailsSourceTokenTypeListOnCommit,
        value,
        sourceIndex,
      });
    },
    [dispatch],
  );

  const commitSourceType = useCallback(
    (value: SourceType, sourceIndex: number) => {
      dispatch({
        type: CatalogActionType.CatalogDetailsSourceTypeListOnCommit,
        value,
        sourceIndex,
      });
    },
    [dispatch],
  );

  const removeSource = useCallback(
    (sourceIndex: number) => {
      dispatch({ type: CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick, sourceIndex });
    },
    [dispatch],
  );

  const changeNewSourceUrl = useCallback(
    (value: string) => {
      dispatch({ type: CatalogActionType.CatalogDetailsNewSourceUrlTextOnChange, value });
    },
    [dispatch],
  );

  const commitNewSourceTokenType = useCallback(
    (value: TokenType) => {
      dispatch({ type: CatalogActionType.CatalogDetailsNewSourceTokenTypeListOnCommit, value });
    },
    [dispatch],
  );

  const commitNewSourceType = useCallback(
    (value: SourceType) => {
      dispatch({ type: CatalogActionType.CatalogDetailsNewSourceTypeListOnCommit, value });
    },
    [dispatch],
  );

  const addNewSource = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogDetailsNewSourceAddButtonOnClick });
  }, [dispatch]);

  return {
    tokenCounts,
    isLatestVersion,
    onDeleteVersion,
    onLock: lockCatalog,
    onSync: syncCatalog,
    onRevert,
    newSourceUrl,
    newSourceTokenType,
    newSourceType,
    editingSourceIndex,
    editingSourceUrl,
    setEditingSourceIndex,
    setEditingSourceUrl,
    commitSourceUrl,
    commitSourceTokenType,
    commitSourceType,
    removeSource,
    changeNewSourceUrl,
    commitNewSourceTokenType,
    commitNewSourceType,
    addNewSource,
  };
}
