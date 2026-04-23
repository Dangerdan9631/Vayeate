import type { MouseEvent } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';
import { CreateThemeDialogActionType } from './actions/create-theme-dialog-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;
const themesStore = container.resolve(ThemesStore);

export function useCreateThemeDialogViewModel() {
  const dispatch = useAppDispatch();
  const name = useStore(themesStore.api, (state): string => state.state.createFormName);
  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: CreateThemeDialogActionType.OkButtonOnClick, params: { name } });
  }

  function handleCancel() {
    dispatch({ type: CreateThemeDialogActionType.CancelButtonOnClick });
  }

  function handleDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleNameChange(value: string) {
    dispatch({ type: CreateThemeDialogActionType.NameTextOnChange, value });
  }

  const showNameError = name.length > 0 && !nameValid;

  return {
    name,
    canSubmit,
    showNameError,
    handleSubmit,
    handleCancel,
    handleDialogContentClick,
    handleNameChange,
  };
}

