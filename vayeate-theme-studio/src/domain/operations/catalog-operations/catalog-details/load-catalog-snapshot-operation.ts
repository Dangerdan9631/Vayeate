import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

/** Load catalog from disk without updating state. Single responsibility: read. */
@injectable()
export class LoadCatalogSnapshotOperation {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    return this.catalogGateway.loadCatalog(name, version);
  }
}


