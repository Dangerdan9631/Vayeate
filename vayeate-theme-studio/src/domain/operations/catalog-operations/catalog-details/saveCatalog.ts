import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { catalogService } from '../../../../gateway/services/catalog-service';

/** Persist catalog to disk only. Single responsibility: save. */
@injectable()
export class SaveCatalog {
  async execute(catalog: Catalog): Promise<void> {
    await catalogService.saveCatalog(catalog);
  }
}


