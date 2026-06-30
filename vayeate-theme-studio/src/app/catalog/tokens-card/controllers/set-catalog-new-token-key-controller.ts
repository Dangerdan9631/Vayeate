import { singleton } from 'tsyringe';
import { SetCatalogNewTokenKeyOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-new-token-key-operation';

/**
 * Updates the pending new-token key field on the tokens card.
 */
@singleton()
export class SetCatalogNewTokenKeyController {
  constructor(private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation) {}

  /**
   * Stores the typed new-token key before add is committed.
   * @param value - Key text from the add-token input.
   */
  run(value: string): void {
    this.setCatalogNewTokenKey.execute(value);
  }
}
