import type { CatalogType } from '../../../../model/Common/schema/primitives';
import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../../domain/operations/Catalog/create-dialog/operations/set-catalog-create-dialog-data-operation';

/**
 * Updates the manual versus remote type on the create-catalog dialog.
 */
@singleton()
export class SetCatalogCreateDialogTypeController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation) {}

  /**
   * Stores the selected catalog type.
   * @param value - Manual or remote catalog type.
   */
  run(value: CatalogType): void {
    this.setCatalogCreateDialogData.execute({ type: value });
  }
}
