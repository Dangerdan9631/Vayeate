import { singleton } from 'tsyringe';
import type { CatalogType } from '../../../../model/schema/primitives';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

export type CatalogCreateDialogData = {
  createFormName: string;
  createFormType: CatalogType;
};

/** Read current catalog create-dialog draft fields from app state. */
@singleton()
export class GetCatalogCreateDialogDataOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(): CatalogCreateDialogData {
    const { createFormName, createFormType } = this.catalogsStore.getStore().state;
    return { createFormName, createFormType };
  }
}
