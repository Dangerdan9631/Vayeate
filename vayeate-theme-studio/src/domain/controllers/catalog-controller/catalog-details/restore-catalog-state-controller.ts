import type { Catalog } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { DeleteCatalogOperation } from '../../../operations/catalog-operations/catalog-list/delete-catalog-operation';
import { RefreshCatalogRefsOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-operation';
import { SetCatalogOperation } from '../../../operations/catalog-operations/catalog-details/set-catalog-operation';

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
      await this.deleteCatalog.execute(deleteVersionOnRestore.name, deleteVersionOnRestore.version);
      await this.refreshCatalogRefs.execute();
    }
  }
}
