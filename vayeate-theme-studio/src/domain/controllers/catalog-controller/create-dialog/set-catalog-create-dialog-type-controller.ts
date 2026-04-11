import type { CatalogType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations/create-dialog/set-catalog-create-dialog-data-operation';

@singleton()
export class SetCatalogCreateDialogTypeController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation) {}

  async run(value: CatalogType): Promise<void> {
    this.setCatalogCreateDialogData.execute({ type: value });
  }
}
