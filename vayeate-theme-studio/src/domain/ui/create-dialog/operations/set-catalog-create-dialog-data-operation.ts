import { singleton } from 'tsyringe';
import type { CatalogType } from '../../../../model/schema/primitives';
import { CreateCatalogDialogStore } from '../../../state/create-dialog/create-catalog-dialog-store';

@singleton()
export class SetCatalogCreateDialogDataOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  execute(options: { name?: string, type?: CatalogType }): void {
    this.createCatalogDialogStore.getStore().setCreateCatalogDialogData(options.name, options.type);
  }
}
