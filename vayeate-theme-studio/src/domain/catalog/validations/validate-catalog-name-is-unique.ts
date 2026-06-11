import { singleton } from 'tsyringe';
import { VALIDATION_RESULT_OK, type ValidationResult } from '../../../model/validation-result';
import { CatalogsStore } from '../state/catalogs-store';

/**
 * Ensures a proposed catalog name is not already present in the store.
 */
@singleton()
export class ValidateCatalogNameIsUnique {
  constructor(private readonly catalogsStore: CatalogsStore) { }

  /**
   * Rejects names that already have at least one version entry in the catalogs map.
   *
   * @param name - Proposed catalog name from user input.
   * @returns Ok result, or an error message when the name is taken.
   */
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
