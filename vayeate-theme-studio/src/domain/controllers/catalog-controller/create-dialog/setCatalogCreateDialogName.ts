import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogData } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogCreateDialogNameController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogData) {}

  run(value: string): void {
    this.setCatalogCreateDialogData.execute({ name: value });
  }
}
