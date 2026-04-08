import type { MouseEvent } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { ThemeActionType } from '../actions/theme-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

export function useCreateThemeDialogViewModel() {
  const dispatch = useAppDispatch();
  const { createFormName: name } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.themes;
    if (slice === undefined) {
      throw new Error('Theme state requires AppProvider.');
    }
    return slice;
  });
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
