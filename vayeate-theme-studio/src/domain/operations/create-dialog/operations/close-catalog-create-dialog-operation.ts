import { singleton } from 'tsyringe';
import { CreateCatalogDialogStore } from '../../../state/ui/create-catalog-dialog-store';
import { DialogResultOkCancel } from '../../../../model/dialog-result';

@singleton()
export class CloseCatalogCreateDialogOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  execute(result: DialogResultOkCancel): void {
    this.createCatalogDialogStore.getStore().closeCreateCatalogDialog(result);
  }
}
