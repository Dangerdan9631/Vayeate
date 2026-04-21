import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../../../domain/ui/create-dialog/operations/set-catalog-create-dialog-data-operation';
import { ValidateCatalogNameIsValid } from '../../../../../domain/catalog/validations/validate-catalog-name-is-valid';
import { SetCatalogCreateDialogErrorOperation } from '../../../../../domain/ui/create-dialog/operations/set-catalog-create-dialog-error-operation';
import { ValidateCatalogNameIsUnique } from '../../../../../domain/catalog/validations/validate-catalog-name-is-unique';
import { Validator } from '../../../../../domain/validations/validator';

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
