import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpCatalogVersionForEditOperation,
  SaveCatalogOperation,
  UpdateSourceUrlInCatalogOperation,
} from '../../../operations/catalog-operations';
import { canUpdateCatalogSource } from '../../../validations/catalog-validations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class UpdateSourceUrlController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSourceUrlInCatalog: UpdateSourceUrlInCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(sourceIndex: number, value: string): Promise<void> {
    const catalog = this.appStateGetter.current().catalogs.catalog;
    if (!canUpdateCatalogSource(catalog, sourceIndex)) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSourceUrlInCatalog.execute(base, sourceIndex, value);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
