import { injectable } from 'tsyringe';
import { CatalogService } from '../../../../gateway/services/catalog-service';

/** Delete one catalog version from disk. Single responsibility: delete. */
@injectable()
export class DeleteCatalog {
  constructor(private readonly catalogService: CatalogService) {}

  async execute(name: string, version: string): Promise<void> {
    await this.catalogService.deleteCatalog(name, version);
  }
}


