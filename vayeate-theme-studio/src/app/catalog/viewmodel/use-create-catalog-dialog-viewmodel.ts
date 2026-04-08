import type { MouseEvent } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import type { CatalogType } from '../../../model/schemas';
import { CatalogActionType } from '../actions/catalog-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

export function useCreateCatalogDialogViewModel() {
  const dispatch = useAppDispatch();
  const { createFormName: name, createFormType: type } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice;
  });
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
