import { singleton } from 'tsyringe';
import { CloseCatalogCreateDialogOperation } from '../../../../../domain/operations/catalog-operations/create-dialog/close-catalog-create-dialog-operation';
import { CreateCatalogOperation } from '../../../../../domain/operations/catalog-operations/catalog-list/create-catalog-operation';
import { SetSelectedCatalogOperation } from '../../../../../domain/operations/catalog-operations/catalog-list/set-selected-catalog-operation';
import { CatalogsStore } from '../../../../../domain/catalog/state/catalogs-store';

export type CatalogCreateDialogOutcome = 'OK' | 'Cancel';

@singleton()
export class CloseCatalogCreateDialogController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly closeCatalogCreateDialog: CloseCatalogCreateDialogOperation,
    private readonly createCatalog: CreateCatalogOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
  ) {}

  run(outcome: CatalogCreateDialogOutcome): void {
    this.closeCatalogCreateDialog.execute('OK');

    if (outcome === 'OK') {
      const store = this.catalogsStore.getStore().stateV2.createCatalogDialog;
      if (!store) return;

      const ref = this.createCatalog.execute({ name: store.name.trim(), type: store.type });
      this.setSelectedCatalog.execute(ref);
      return;
    }
  }
}
