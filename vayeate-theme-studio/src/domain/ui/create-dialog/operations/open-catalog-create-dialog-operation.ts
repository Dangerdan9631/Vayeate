import { singleton } from 'tsyringe';
import { CreateCatalogDialogStore } from '../state/create-catalog-dialog-store';

@singleton()
export class OpenCatalogCreateDialogOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  execute(): void {
    this.createCatalogDialogStore.getStore().openCreateCatalogDialog();
  }
}
