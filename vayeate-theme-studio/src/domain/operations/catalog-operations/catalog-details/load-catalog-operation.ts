import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

@singleton()
export class LoadCatalogOperation {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    return await this.catalogGateway.loadCatalog(name, version);
  }
}
