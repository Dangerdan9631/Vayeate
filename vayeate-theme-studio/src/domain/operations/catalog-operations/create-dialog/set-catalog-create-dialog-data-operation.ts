import { singleton } from 'tsyringe';
import type { CatalogType } from '../../../../model/schema/primitives';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';

@singleton()
export class SetCatalogCreateDialogDataOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(options: { name?: string, type?: CatalogType }): void {
    this.catalogsStore.getStore().setCreateCatalogDialogData(options.name, options.type);
  }
}
