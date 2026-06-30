import { singleton } from 'tsyringe';
import { VALIDATION_RESULT_OK, ValidationResult } from '../../model/validation-result';

/**
 * Sequences multiple validations and returns the first failure for a shared input type.
 * Used when controllers or viewmodels need one combined check without calling peer validators.
 */
@singleton()
export class Validator<T> {
  constructor(
    private readonly validations: { test: (input: T) => ValidationResult}[]
  ) {}

  /**
   * Runs each validation in order until one fails or all succeed.
   *
   * @param input - Value passed to every validation in the sequence.
   * @returns The first invalid result, or {@link VALIDATION_RESULT_OK} when all pass.
   */
  test(input: T): ValidationResult {
    return this.validations.map(validation => validation.test(input))
      .find(result => !result.isValid) ?? VALIDATION_RESULT_OK;
  }
}
