import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { ValidateIsTemplateNameValid } from '../../../domain/validations/template-validations/validate-is-template-name-valid';
import { container } from 'tsyringe';

const validateIsTemplateNameValid = container.resolve(ValidateIsTemplateNameValid);

export function useCreateTemplateDialogViewModel() {
  const dispatch = useAppDispatch();
  const { createFormName: name } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice;
  });
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
