import { useCallback, useMemo, } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import type { CatalogType } from '../../../model/schema/primitives';
import { CatalogCreateDialogActionType } from './actions/catalog-create-dialog-action-type';
import { container } from 'tsyringe';
import { CreateCatalogDialogStore } from '../../../domain/state/ui/create-catalog-dialog-store';
import { useStore } from 'zustand';

const createCatalogDialogStore = container.resolve(CreateCatalogDialogStore);

/**
 * Subscribes to create-dialog store fields and exposes submit and field change callbacks.
 * @returns View model for `CreateCatalogDialog`.
 */
export function useCreateCatalogDialogViewModel() {
  const dispatch = useAppDispatch();
  const name = useStore(createCatalogDialogStore.api, (state) => state.state?.name ?? '');
  const type = useStore(createCatalogDialogStore.api, (state) => state.state?.type ?? 'manual');

  const errorMessage = useStore(createCatalogDialogStore.api, (state) => state.state?.errorMessage ?? null);
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
