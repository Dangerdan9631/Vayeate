import { singleton } from 'tsyringe';
import type { CatalogType } from '../../../../model/schemas';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';

export type CatalogCreateDialogData = {
  createFormName: string;
  createFormType: CatalogType;
};

/** Read current catalog create-dialog draft fields from app state. */
@singleton()
export class GetCatalogCreateDialogDataOperation {
  constructor(private readonly catalogsStateGetter: CatalogsStateGetter) {}

  execute(): CatalogCreateDialogData {
    const { createFormName, createFormType } = this.catalogsStateGetter.current();
    return { createFormName, createFormType };
  }
}
