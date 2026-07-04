import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../../domain/operations/Catalog/create-dialog/operations/set-catalog-create-dialog-data-operation';
import { ValidateCatalogNameIsValid } from '../../../../domain/validations/Catalog/catalog/validate-catalog-name-is-valid';
import { SetCatalogCreateDialogErrorOperation } from '../../../../domain/operations/Catalog/create-dialog/operations/set-catalog-create-dialog-error-operation';
import { ValidateCatalogNameIsUnique } from '../../../../domain/validations/Catalog/catalog/validate-catalog-name-is-unique';
import { Validator } from '../../../../domain/validations/Common/validator';

/**
 * Updates the create-dialog name field and validates uniqueness and format.
 */
@singleton()
export class SetCatalogCreateDialogNameController {
  private readonly validateNameCanBeUsed: Validator<string>;
  constructor(
    private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation,
    private readonly setCatalogCreateDialogError: SetCatalogCreateDialogErrorOperation,
    validateCatalogNameIsValid: ValidateCatalogNameIsValid,
    validateCatalogNameIsUnique: ValidateCatalogNameIsUnique,
  ) {
    this.validateNameCanBeUsed = new Validator<string>([
      validateCatalogNameIsValid,
      validateCatalogNameIsUnique,
    ]);
  }

  /**
   * Stores the typed name and sets dialog error state when validation fails.
   * @param value - Name text from the dialog input.
   */
  run(value: string): void {
    this.setCatalogCreateDialogData.execute({ name: value });

    const validationResult = this.validateNameCanBeUsed.test(value);
    if (value.length > 0 && !validationResult.isValid) {
      this.setCatalogCreateDialogError.execute(validationResult.errorMessage);
    } else {
      this.setCatalogCreateDialogError.execute(null);
    }
  }
}
