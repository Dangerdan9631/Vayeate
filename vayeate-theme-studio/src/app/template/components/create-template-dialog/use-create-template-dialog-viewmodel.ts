import { useStore } from 'zustand';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { ValidateIsTemplateNameValid } from '../../../../domain/validations/template-validations/validate-is-template-name-valid';
import { TemplatesStore } from '../../../../domain/state/template/templates-store';
import { container } from 'tsyringe';

const validateIsTemplateNameValid = container.resolve(ValidateIsTemplateNameValid);
const templatesStore = container.resolve(TemplatesStore);

export function useCreateTemplateDialogViewModel() {
  const dispatch = useAppDispatch();
  const name = useStore(templatesStore.api, (state) => state.state.createFormName);
  const nameValid = validateIsTemplateNameValid.test(name);
  const canSubmit = nameValid;
  const showNameError = name.length > 0 && !nameValid;

  return {
    name,
    canSubmit,
    showNameError,
    dispatch,
  };
}
