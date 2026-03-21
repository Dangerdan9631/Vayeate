import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogService } from '../../../../gateway/services/catalog-service';

/** Load catalog from disk without updating state. Single responsibility: read. */
@injectable()
export class LoadCatalogSnapshot {
  constructor(private readonly catalogService: CatalogService) {}

  async execute(name: string, version: string): Promise<Catalog | null> {
    return this.catalogService.loadCatalog(name, version);
  }
}


