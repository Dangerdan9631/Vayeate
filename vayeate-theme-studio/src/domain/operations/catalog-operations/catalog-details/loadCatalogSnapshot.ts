import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';

/** Load catalog from disk without updating state. Single responsibility: read. */
@injectable()
export class LoadCatalogSnapshot {
  async execute(name: string, version: string): Promise<Catalog | null> {
    return catalogService.loadCatalog(name, version);
  }
}


