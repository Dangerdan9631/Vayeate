import { singleton } from 'tsyringe';
import type { SourceType } from '../../../../model/schema/primitives';
import { CatalogUiStore } from '../../../state/ui/catalog-ui-store';

@singleton()
export class SetCatalogNewSourceTypeOperation {
  constructor(private readonly catalogUiStore: CatalogUiStore) {}

  execute(value: SourceType): void {
    this.catalogUiStore.getStore().setNewSourceData(undefined, undefined, value);
  }
}



