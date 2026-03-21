import { injectable } from 'tsyringe';
import { catalogService } from '../../../../gateway/services/catalog-service';

/** Delete one catalog version from disk. Single responsibility: delete. */
@injectable()
export class DeleteCatalog {
  async execute(name: string, version: string): Promise<void> {
    await catalogService.deleteCatalog(name, version);
  }
}


