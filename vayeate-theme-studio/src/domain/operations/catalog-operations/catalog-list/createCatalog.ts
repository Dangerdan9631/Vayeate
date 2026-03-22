import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { createCatalogWithParams } from '../../../../model/factories';
import { AppStateSetter } from '../../../state/app-state-setter';
import { StoreStateSetter } from '../../../state/store-state-setter';
import { SaveCatalog } from '../catalog-details/saveCatalog';

@injectable()
export class CreateCatalog {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly storeStateSetter: StoreStateSetter,
    private readonly saveCatalog: SaveCatalog,
  ) {}

  async execute(params: { name: string; type: 'manual' | 'remote' }): Promise<CatalogReference> {
    this.appStateSetter.apply({ type: 'SET_IS_CREATING', value: true });
    try {
      const catalog = createCatalogWithParams(params);
      this.storeStateSetter.apply({
        type: 'SET_STORE_CATALOG_ENTRY',
        name: catalog.name,
        version: catalog.version,
        isLoaded: true,
        catalog,
      });
      await this.saveCatalog.execute(catalog);
      return { name: catalog.name, version: catalog.version };
    } finally {
      this.appStateSetter.apply({ type: 'SET_IS_CREATING', value: false });
    }
  }
}
