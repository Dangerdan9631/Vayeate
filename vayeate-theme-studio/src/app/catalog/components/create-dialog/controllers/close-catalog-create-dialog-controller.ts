import { singleton } from 'tsyringe';
import { CloseCatalogCreateDialogOperation } from '../../../../../domain/ui/create-dialog/operations/close-catalog-create-dialog-operation';
import { CreateCatalogOperation } from '../../../../../domain/operations/catalog-operations/catalog-list/create-catalog-operation';
import { SetSelectedCatalogOperation } from '../../../../../domain/operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { CreateCatalogDialogStore } from '../../../../../domain/ui/create-dialog/state/create-catalog-dialog-store';

export type CatalogCreateDialogOutcome = 'OK' | 'Cancel';

@singleton()
export class CloseCatalogCreateDialogController {
  constructor(
    private readonly createCatalogDialogStore: CreateCatalogDialogStore,
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialogOperation,
    private readonly createCatalog: CreateCatalogOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
  ) {}

  run(outcome: CatalogCreateDialogOutcome): void {
    this.closeCatalogCreateDialog.execute('OK');

    if (outcome === 'OK') {
      const store = this.createCatalogDialogStore.getStore().state;
      if (!store) return;

      const ref = this.createCatalog.execute({ name: store.name.trim(), type: store.type });
      this.setSelectedCatalog.execute(ref);
      return;
    }
  }
}
