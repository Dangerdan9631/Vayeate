import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { LockCatalogOperation as LockCatalogTransform, SaveCatalogOperation } from '../../../operations/catalog-operations';
import { ValidateCanLockCatalog } from '../../../validations/catalog-validations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations';

@singleton()
export class LockCatalogController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly lockCatalogTransform: LockCatalogTransform,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanLockCatalog: ValidateCanLockCatalog,
  ) {}

  async run(): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!catalog || !this.validateCanLockCatalog.test(catalog)) return;
    const updated = this.lockCatalogTransform.execute(catalog);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(catalog.name, catalog.version);
  }
}
