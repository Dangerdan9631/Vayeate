import { singleton } from 'tsyringe';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

@singleton()
export class SetCatalogNewSourceUrlOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  execute(value: string): void {
    this.catalogUiStore.getStore().setNewSourceData(value);
  }
}

