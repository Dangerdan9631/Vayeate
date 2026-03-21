import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { CatalogService } from '../../../../gateway/services/catalog-service';

/** Persist catalog to disk only. Single responsibility: save. */
@injectable()
export class SaveCatalog {
  constructor(private readonly catalogService: CatalogService) {}

  async execute(catalog: Catalog): Promise<void> {
    await this.catalogService.saveCatalog(catalog);
  }
}


