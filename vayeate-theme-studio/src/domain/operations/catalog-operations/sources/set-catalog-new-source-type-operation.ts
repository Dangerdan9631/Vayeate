import { singleton } from 'tsyringe';
import type { SourceType } from '../../../../model/schema/primitives';
import { CatalogsStore } from '../../../catalog/state/catalogs-store';

@singleton()
export class SetCatalogNewSourceTypeOperation {
  constructor(private readonly catalogsStore: CatalogsStore) {}

  execute(value: SourceType): void {
    this.catalogsStore.getStore().setNewSourceData(undefined, undefined, value);
  }
}



