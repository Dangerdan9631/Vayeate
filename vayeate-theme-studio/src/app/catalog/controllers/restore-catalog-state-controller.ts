import type { Catalog } from '../../../model/schema/catalog';
import { singleton } from 'tsyringe';
import { DeleteCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-list/delete-catalog-operation';
import { RefreshCatalogRefsOperation } from '../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-operation';
import { SetCatalogOperation } from '../../../domain/operations/catalog-operations/catalog-details/set-catalog-operation';

@singleton()
export class RestoreCatalogStateController {
  constructor(
    private readonly setCatalog: SetCatalogOperation,
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly refreshCatalogRefs: RefreshCatalogRefsOperation,
  ) {}

  async run(
    catalog: Catalog | null,
    deleteVersionOnRestore?: { name: string; version: string },
  ): Promise<void> {
    this.setCatalog.execute(catalog);
    if (deleteVersionOnRestore) {
      this.deleteCatalog.execute(deleteVersionOnRestore.name, deleteVersionOnRestore.version);
      this.refreshCatalogRefs.execute();
    }
  }
}
