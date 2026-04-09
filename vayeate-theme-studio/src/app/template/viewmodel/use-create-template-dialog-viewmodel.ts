import type { MouseEvent } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { TemplateActionType } from '../actions/template-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

export function useCreateTemplateDialogViewModel() {
  const dispatch = useAppDispatch();
  const { createFormName: name } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice;
  });
  const nameValid = name.length > 0 && NAME_REGEX.test(name);
  const canSubmit = nameValid;

  function handleSubmit() {
    if (!canSubmit) return;
    dispatch({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick });
  }

  function handleCancel() {
    dispatch({ type: TemplateActionType.TemplateCreateDialogCancelButtonOnClick });
  }

  function handleDialogContentClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleNameChange(value: string) {
    dispatch({ type: TemplateActionType.TemplateCreateDialogNameTextOnChange, value });
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
