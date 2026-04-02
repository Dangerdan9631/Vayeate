import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { LockCatalogOperation as LockCatalogTransform, SaveCatalogOperation } from '../../../operations/catalog-operations';
import { canLockCatalog } from '../../../validations/catalog-validations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class LockCatalogController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly lockCatalogTransform: LockCatalogTransform,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!canLockCatalog(catalog)) return;
    const updated = this.lockCatalogTransform.execute(catalog);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(catalog.name, catalog.version);
  }
}
