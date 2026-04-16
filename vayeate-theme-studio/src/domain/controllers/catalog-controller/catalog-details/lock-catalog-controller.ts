import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { LockCatalogOperation as LockCatalogTransform } from '../../../operations/catalog-operations/catalog-details/lock-catalog-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { ValidateCanLockCatalog } from '../../../validations/catalog-validations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class LockCatalogController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly lockCatalogTransform: LockCatalogTransform,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanLockCatalog: ValidateCanLockCatalog,
  ) {}

  async run(): Promise<void> {
    const catalog = this.catalogsStore.getStore().state.catalog;
    if (!catalog || !this.validateCanLockCatalog.test(catalog)) return;
    const updated = this.lockCatalogTransform.execute(catalog);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version);
  }
}
