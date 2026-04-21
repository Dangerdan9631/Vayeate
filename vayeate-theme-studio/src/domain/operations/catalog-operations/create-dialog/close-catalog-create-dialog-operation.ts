import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';
import { DialogResultOkCancel } from '../../../../model/dialog-result';

@singleton()
export class CloseCatalogCreateDialogOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(result: DialogResultOkCancel): void {
    this.catalogsStore.getStore().closeCreateCatalogDialog(result);
  }
}
