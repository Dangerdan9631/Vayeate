import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

/** Load catalog from disk without updating state. Single responsibility: read. */
@singleton()
export class LoadCatalogSnapshotOperation {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    return this.catalogGateway.loadCatalog(name, version);
  }
}


