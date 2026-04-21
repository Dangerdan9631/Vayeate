import { singleton } from 'tsyringe';
import { VALIDATION_RESULT_OK, ValidationResult } from '../../model/validation-result';

@singleton()
export class Validator<T> {
  constructor(
    private readonly validations: { test: (input: T) => ValidationResult}[]
  ) {}

  test(input: T): ValidationResult {
    return this.validations.map(validation => validation.test(input))
      .find(result => !result.isValid) ?? VALIDATION_RESULT_OK;
  }
}
