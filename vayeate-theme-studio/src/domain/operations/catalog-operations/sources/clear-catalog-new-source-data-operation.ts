import { singleton } from 'tsyringe';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

@singleton()
export class ClearCatalogNewSourceDataOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  execute(): void {
    this.catalogUiStore.getStore().clearNewSourceData();
  }
}
