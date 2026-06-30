import type { SourceType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetCatalogNewSourceTypeOperation } from '../../../../domain/operations/catalog-operations/sources/set-catalog-new-source-type-operation';

/**
 * Stores the fetch type selected for the pending new source row.
 */
@singleton()
export class SetCatalogNewSourceTypeController {
  constructor(private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation) {}

  /**
   * Updates pending new-source type UI state.
   * @param value - Selected source fetch type.
   */
  run(value: SourceType): void {
    this.setCatalogNewSourceType.execute(value);
  }
}
