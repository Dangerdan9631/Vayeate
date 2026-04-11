import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

/** Persist catalog to disk only. Single responsibility: save. */
@singleton()
export class SaveCatalogOperation {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(catalog: Catalog): Promise<void> {
    await this.catalogGateway.saveCatalog(catalog);
  }
}


