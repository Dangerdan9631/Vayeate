import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations/create-dialog/set-catalog-create-dialog-data-operation';

@singleton()
export class SetCatalogCreateDialogNameController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation) {}

  async run(value: string): Promise<void> {
    this.setCatalogCreateDialogData.execute({ name: value });
  }
}
