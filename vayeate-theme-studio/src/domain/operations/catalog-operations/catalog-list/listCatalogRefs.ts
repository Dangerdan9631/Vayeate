import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { CatalogService } from '../../../../gateway/services/catalog-service';

/** List catalog refs from disk without updating state. Single responsibility: read. */
@injectable()
export class ListCatalogRefs {
  constructor(private readonly catalogService: CatalogService) {}

  async execute(): Promise<CatalogReference[]> {
    return this.catalogService.listCatalogs();
  }
}


