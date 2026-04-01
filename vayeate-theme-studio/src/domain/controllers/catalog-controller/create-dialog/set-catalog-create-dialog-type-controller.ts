import type { CatalogType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogDataOperation } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogCreateDialogTypeController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogDataOperation) {}

  run(value: CatalogType): void {
    this.setCatalogCreateDialogData.execute({ type: value });
  }
}
