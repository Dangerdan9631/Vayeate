import type { CatalogType } from '../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../domain/operations/catalog-operations/create-dialog/set-catalog-create-dialog-data-operation';

@singleton()
export class SetCatalogCreateDialogTypeController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation) {}

  run(value: CatalogType): void {
    this.setCatalogCreateDialogData.execute({ type: value });
  }
}
