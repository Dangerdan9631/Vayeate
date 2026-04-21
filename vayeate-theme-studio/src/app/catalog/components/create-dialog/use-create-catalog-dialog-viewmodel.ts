import { useCallback, useMemo, } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import type { CatalogType } from '../../../../model/schema/primitives';
import { CatalogCreateDialogActionType } from './actions/catalog-create-dialog-action-type';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export function useCreateCatalogDialogViewModel() {
  const dispatch = useAppDispatch();
  const name = useStore(catalogsStore.api, (state) => state.stateV2.createCatalogDialog?.name ?? '');
  const type = useStore(catalogsStore.api, (state) => state.stateV2.createCatalogDialog?.type ?? 'manual');

  const errorMessage = useStore(catalogsStore.api, (state) => state.stateV2.createCatalogDialog?.errorMessage ?? null);
  const hasError = useMemo(() => errorMessage !== null, [errorMessage]);

  const canSubmit = useMemo(() => { return name.length > 0 && !hasError; }, [name, hasError]);

  const onNameChange = useCallback((value: string) => {
    dispatch({ type: CatalogCreateDialogActionType.NameTextOnChange, value });
  }, [dispatch]);

  const onTypeChange = useCallback((value: CatalogType) => {
    dispatch({ type: CatalogCreateDialogActionType.TypeListOnCommit, value });
  }, [dispatch]);

  const onOkClick = useCallback(() => {
    dispatch({ type: CatalogCreateDialogActionType.OkButtonOnClick });
  }, [dispatch]);
  const onCancelClick = useCallback(() => {
    dispatch({ type: CatalogCreateDialogActionType.CancelButtonOnClick });
  }, [dispatch]);

  return {
    name,
    type,
    hasError,
    errorMessage,
    canSubmit,
    onNameChange,
    onTypeChange,
    onOkClick,
    onCancelClick,
  };
}
