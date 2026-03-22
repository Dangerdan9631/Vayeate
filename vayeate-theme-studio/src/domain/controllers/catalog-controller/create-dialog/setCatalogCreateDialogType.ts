import type { CatalogType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { SetCatalogCreateDialogData } from '../../../operations/catalog-operations';

@singleton()
export class SetCatalogCreateDialogTypeController {
  constructor(private readonly setCatalogCreateDialogData: SetCatalogCreateDialogData) {}

  run(value: CatalogType): void {
    this.setCatalogCreateDialogData.execute({ type: value });
  }
}
