import { singleton } from 'tsyringe';
import { VALIDATION_RESULT_OK, type ValidationResult } from '../../../model/validation-result';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

@singleton()
export class ValidateCatalogNameIsValid {
  test(name: string): ValidationResult {
    if (name.length > 0 && !NAME_REGEX.test(name)) {
      return {
        isValid: false,
        errorMessage: 'Catalog name must use alphanumeric characters and hyphens only.',
      };
    }

    return VALIDATION_RESULT_OK;
  }
}
