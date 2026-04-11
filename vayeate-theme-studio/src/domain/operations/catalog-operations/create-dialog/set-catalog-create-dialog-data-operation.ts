import { singleton } from 'tsyringe';
import type { CatalogType } from '../../../../model/schemas';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

export type SetCatalogCreateDialogDataOptions = {
  name?: string;
  type?: CatalogType;
};

@singleton()
export class SetCatalogCreateDialogDataOperation {
  constructor(private readonly CatalogsStateSetter: CatalogsStateSetter) {}

  execute(options: SetCatalogCreateDialogDataOptions): void {
    if (options.name !== undefined) {
      this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_CREATE_FORM_NAME', value: options.name });
    }
    if (options.type !== undefined) {
      this.CatalogsStateSetter.apply({ type: 'SET_CATALOG_CREATE_FORM_TYPE', value: options.type });
    }
  }
}
