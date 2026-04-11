import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

/** Load catalog JSON from disk. Does not mutate app state. */
@singleton()
export class LoadCatalogOperation {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    return this.catalogGateway.loadCatalog(name, version);
  }
}
