import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { StoreStateSetter } from '../../../state/store-state-setter';

@injectable()
export class SetCatalogRefs {
  constructor(private readonly storeStateSetter: StoreStateSetter) {}

  execute(refs: CatalogReference[]): void {
    this.storeStateSetter.apply({
      type: 'SET_STORE_CATALOG_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
    });
  }
}


