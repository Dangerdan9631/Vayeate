import type { SourceType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpCatalogVersionForEditOperation,
  SaveCatalogOperation,
  UpdateSourceTypeInCatalogOperation,
} from '../../../operations/catalog-operations';
import { canUpdateCatalogSource } from '../../../validations/catalog-validations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class UpdateSourceTypeController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSourceTypeInCatalog: UpdateSourceTypeInCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(sourceIndex: number, value: SourceType): Promise<void> {
    const catalog = this.appStateGetter.current().catalogs.catalog;
    if (!canUpdateCatalogSource(catalog, sourceIndex)) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSourceTypeInCatalog.execute(base, sourceIndex, value);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
