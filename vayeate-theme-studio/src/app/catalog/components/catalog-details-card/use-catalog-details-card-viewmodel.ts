import type { ChangeEvent, FocusEvent, MouseEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { compareVersions } from '../../../../domain/utils/compare-versions';
import type { Catalog } from '../../../../model/schema/catalog';
import type { SourceType, TokenType } from '../../../../model/schema/primitives';
import { CatalogActionType } from '../../actions/catalog-action-type';
import { container } from 'tsyringe';
import { CatalogsStore, getCurrentCatalog, getCurrentCatalogRefs } from '../../../../domain/catalog/state/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export function useCatalogDetailsCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(catalogsStore.api, (state) => state.stateV2.selectedRef);
  const catalog: Catalog | null = useStore(catalogsStore.api, getCurrentCatalog);
  const newSourceUrl = useStore(catalogsStore.api, (state) => state.stateV2.newSource.url);
  const newSourceTokenType = useStore(catalogsStore.api, (state) => state.stateV2.newSource.tokenType);
  const newSourceType = useStore(catalogsStore.api, (state) => state.stateV2.newSource.type);
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

  const lockCatalog = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogDetailsLockButtonOnClick });
  }, [dispatch]);

  const syncCatalog = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogDetailsSyncButtonOnClick });
  }, [dispatch]);

  const onDeleteVersion = useCallback(() => {
    if (!selectedRef) return;
    dispatch({ type: CatalogActionType.CatalogDetailsDeleteVersionButtonOnClick });
  }, [dispatch, selectedRef]);

  const onRevert = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogDetailsRevertButtonOnClick });
  }, [dispatch]);

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

  const onExistingSourceUrlFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const i = Number(e.currentTarget.dataset.sourceIndex);
      if (Number.isNaN(i) || !catalog) return;
      const url = catalog.sources[i]?.url ?? '';
      setEditingSourceIndex(i);
      setEditingSourceUrl(url);
    },
    [catalog],
  );

  const onExistingSourceUrlBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const i = Number(e.currentTarget.dataset.sourceIndex);
      if (Number.isNaN(i) || !catalog) return;
      const committedUrl = catalog.sources[i]?.url ?? '';
      const v = e.target.value.trim();
      if (v !== committedUrl) {
        commitSourceUrl(v, i);
      }
      setEditingSourceIndex(null);
    },
    [catalog, commitSourceUrl],
  );

  const onExistingSourceTokenTypeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const i = Number(e.currentTarget.dataset.sourceIndex);
      if (Number.isNaN(i)) return;
      commitSourceTokenType(e.target.value as TokenType, i);
    },
    [commitSourceTokenType],
  );

  const onExistingSourceTypeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const i = Number(e.currentTarget.dataset.sourceIndex);
      if (Number.isNaN(i)) return;
      commitSourceType(e.target.value as SourceType, i);
    },
    [commitSourceType],
  );

  const onRemoveExistingSourceClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const i = Number(e.currentTarget.dataset.sourceIndex);
      if (Number.isNaN(i)) return;
      removeSource(i);
    },
    [removeSource],
  );

  return {
    catalog,
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
    onExistingSourceUrlFocus,
    onExistingSourceUrlBlur,
    onExistingSourceTokenTypeChange,
    onExistingSourceTypeChange,
    onRemoveExistingSourceClick,
  };
}
