import { injectable } from 'tsyringe';
import type { CatalogReference } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';

/** List catalog refs from disk without updating state. Single responsibility: read. */
@injectable()
export class ListCatalogRefs {
  async execute(): Promise<CatalogReference[]> {
    return catalogService.listCatalogs();
  }
}


