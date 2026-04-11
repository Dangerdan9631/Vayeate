import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';

/** Delete one catalog version from disk. Single responsibility: delete. */
@singleton()
export class DeleteCatalogOperation {
  constructor(private readonly catalogGateway: CatalogGateway) {}

  async execute(name: string, version: string): Promise<void> {
    await this.catalogGateway.deleteCatalog(name, version);
  }
}


