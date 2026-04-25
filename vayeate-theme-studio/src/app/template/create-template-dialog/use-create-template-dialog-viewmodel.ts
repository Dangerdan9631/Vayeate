import { useStore } from 'zustand';
import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../common/dispatch/use-app-dispatch';
import { ValidateIsTemplateNameValid } from '../../../domain/validations/template-validations/validate-is-template-name-valid';
import { TemplatesStore } from '../../../domain/state/template/templates-store';
import { container } from 'tsyringe';
import { TemplateCreateDialogActionType } from './actions/template-create-dialog-action-type';

const validateIsTemplateNameValid = container.resolve(ValidateIsTemplateNameValid);
const templatesStore = container.resolve(TemplatesStore);

export interface CreateTemplateDialogViewModel {
  name: string;
  canSubmit: boolean;
  showNameError: boolean;
  onNameChange: (value: string) => void;
  onCancelClick: () => void;
  onOkClick: () => void;
}

export function useCreateTemplateDialogViewModel(): CreateTemplateDialogViewModel {
  const dispatch = useAppDispatch();
  const name = useStore(templatesStore.api, (state) => state.state.createFormName);
  const nameValid = useMemo(() => validateIsTemplateNameValid.test(name), [name]);
  const canSubmit = useMemo(() => nameValid, [nameValid]);
  const showNameError = useMemo(() => name.length > 0 && !nameValid, [name, nameValid]);

  const onNameChange = useCallback((value: string) => {
    void dispatch({ type: TemplateCreateDialogActionType.NameTextOnChange, value });
  }, [dispatch]);

  const onCancelClick = useCallback(() => {
    void dispatch({ type: TemplateCreateDialogActionType.CancelButtonOnClick });
  }, [dispatch]);

  const onOkClick = useCallback(() => {
    void dispatch({ type: TemplateCreateDialogActionType.OkButtonOnClick });
  }, [dispatch]);

  return {
    name,
    canSubmit,
    showNameError,
    onNameChange,
    onCancelClick,
    onOkClick,
  };
}
