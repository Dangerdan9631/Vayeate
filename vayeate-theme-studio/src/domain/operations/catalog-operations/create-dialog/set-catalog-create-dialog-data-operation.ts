import { singleton } from 'tsyringe';
import type { CatalogType } from '../../../../model/schema/primitives';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

export type SetCatalogCreateDialogDataOptions = {
  name?: string;
  type?: CatalogType;
};

@singleton()
export class SetCatalogCreateDialogDataOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(options: SetCatalogCreateDialogDataOptions): void {
    if (options.name !== undefined) {
      this.catalogsStore.getStore().setCreateFormName(options.name);
    }
    if (options.type !== undefined) {
      this.catalogsStore.getStore().setCreateFormType(options.type);
    }
  }
}
