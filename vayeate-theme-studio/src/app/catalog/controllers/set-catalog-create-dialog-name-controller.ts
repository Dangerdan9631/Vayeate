import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../domain/operations/catalog-operations/create-dialog/set-catalog-create-dialog-data-operation';

@singleton()
export class SetCatalogCreateDialogNameController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation) {}

  run(value: string): void {
    this.setCatalogCreateDialogData.execute({ name: value });
  }
}
