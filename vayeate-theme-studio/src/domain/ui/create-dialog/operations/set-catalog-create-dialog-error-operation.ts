import { singleton } from 'tsyringe';
import { CreateCatalogDialogStore } from '../state/create-catalog-dialog-store';

@singleton()
export class SetCatalogCreateDialogErrorOperation {
  constructor(private readonly createCatalogDialogStore: CreateCatalogDialogStore) {}

  execute(errorMessage: string | null): void {
    this.createCatalogDialogStore.getStore().setCreateCatalogDialogError(errorMessage);
  }
}
