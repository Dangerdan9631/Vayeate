import { singleton } from 'tsyringe';
import { VALIDATION_RESULT_OK, type ValidationResult } from '../../../model/validation-result';
import { CatalogsStore } from '../state/catalogs-store';

@singleton()
export class ValidateCatalogNameIsUnique {
  constructor(private readonly catalogsStore: CatalogsStore) { }

  test(name: string): ValidationResult {
    if (this.catalogsStore.getStore().state.catalogs[name]) {
      return {
        isValid: false,
        errorMessage: 'Catalog name must be unique.',
      };
    }

    return VALIDATION_RESULT_OK;
  }
}
