import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogCreateDialogNameController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation) {}

  run(value: string): void {
    this.setCatalogCreateDialogData.execute({ name: value });
  }
}
