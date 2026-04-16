import type { MouseEvent } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { ThemesStore } from '../../../domain/state/theme/themes-store';
import { ThemeActionType } from '../actions/theme-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;
const themesStore = container.resolve(ThemesStore);

export function useCreateThemeDialogViewModel() {
  const dispatch = useAppDispatch();
  const name = useStore(themesStore.api, (state): string => state.state.createFormName);
  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: ThemeActionType.ThemeCreateDialogOkButtonOnClick, params: { name } });
  }

  function handleCancel() {
    dispatch({ type: ThemeActionType.ThemeCreateDialogCancelButtonOnClick });
  }

  function handleDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleNameChange(value: string) {
    dispatch({ type: ThemeActionType.ThemeCreateDialogNameTextOnChange, value });
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

