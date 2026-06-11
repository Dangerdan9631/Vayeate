import { singleton } from 'tsyringe';
import { VALIDATION_RESULT_OK, type ValidationResult } from '../../../model/validation-result';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

/**
 * Validates catalog display name character rules for create and rename flows.
 */
@singleton()
export class ValidateCatalogNameIsValid {
  /**
   * Ensures the name uses only alphanumeric characters and hyphens when non-empty.
   *
   * @param name - Proposed catalog name from user input.
   * @returns Ok result, or an error message when characters are invalid.
   */
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
