import type { MouseEvent } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import type { CatalogType } from '../../../model/schema/primitives';
import { CatalogActionType } from '../actions/catalog-action-type';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

export function useCreateCatalogDialogViewModel() {
  const dispatch = useAppDispatch();
  const name = useStore(catalogsStore.api, (state) => state.state.createFormName);
  const type = useStore(catalogsStore.api, (state) => state.state.createFormType);
  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: CatalogActionType.CatalogCreateDialogOkButtonOnClick });
  }

  function handleCancel() {
    dispatch({ type: CatalogActionType.CatalogCreateDialogCancelButtonOnClick });
  }

  function handleDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleNameChange(value: string) {
    dispatch({ type: CatalogActionType.CatalogCreateDialogNameTextOnChange, value });
  }

  function handleTypeChange(value: CatalogType) {
    dispatch({ type: CatalogActionType.CatalogCreateDialogTypeListOnCommit, value });
  }

  return {
    name,
    type,
    nameValid,
    canSubmit,
    handleSubmit,
    handleCancel,
    handleDialogContentClick,
    handleNameChange,
    handleTypeChange,
  };
}
