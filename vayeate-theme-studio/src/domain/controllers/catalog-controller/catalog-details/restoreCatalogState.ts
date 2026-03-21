import type { Catalog } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { DeleteCatalog, RefreshCatalogRefs, SetCatalog } from '../../../operations/catalog-operations';

@singleton()
export class RestoreCatalogStateController {
  constructor(
    private readonly setCatalog: SetCatalog,
    private readonly deleteCatalog: DeleteCatalog,
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
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
