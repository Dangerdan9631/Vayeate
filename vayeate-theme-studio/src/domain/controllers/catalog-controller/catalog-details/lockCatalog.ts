import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import { LockCatalog as LockCatalogTransform, SaveCatalog } from '../../../operations/catalog-operations';
import { canLockCatalog } from '../../../validations/catalog-validations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class LockCatalogController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly lockCatalogTransform: LockCatalogTransform,
    private readonly saveCatalog: SaveCatalog,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(): Promise<void> {
    const catalog = this.appStateGetter.current().catalogs.catalog;
    if (!canLockCatalog(catalog)) return;
    const updated = this.lockCatalogTransform.execute(catalog);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(catalog.name, catalog.version);
  }
}
