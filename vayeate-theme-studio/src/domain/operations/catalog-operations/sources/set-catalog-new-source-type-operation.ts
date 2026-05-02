import { singleton } from 'tsyringe';
import type { SourceType } from '../../../../model/schema/primitives';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';

@singleton()
export class SetCatalogNewSourceTypeOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: SourceType): void {
    this.catalogsStore.getStore().setNewSourceData(undefined, undefined, value);
  }
}



