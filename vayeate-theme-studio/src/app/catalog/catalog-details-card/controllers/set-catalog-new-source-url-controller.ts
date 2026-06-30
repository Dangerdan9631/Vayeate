import { singleton } from 'tsyringe';
import { SetCatalogNewSourceUrlOperation } from '../../../../domain/operations/catalog-operations/sources/set-catalog-new-source-url-operation';

/**
 * Stores the URL typed in the add-source row on the details card.
 */
@singleton()
export class SetCatalogNewSourceUrlController {
  constructor(private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlOperation) {}

  /**
   * Updates pending new-source URL UI state.
   * @param value - URL text from the add-source input.
   */
  run(value: string): void {
    this.setCatalogNewSourceUrl.execute(value);
  }
}
