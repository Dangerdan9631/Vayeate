import { catalogService } from '../../../gateway/services/catalog-service';

/** Delete one catalog version from disk. Single responsibility: delete. */
export async function deleteCatalog(name: string, version: string): Promise<void> {
  await catalogService.deleteCatalog(name, version);
}
