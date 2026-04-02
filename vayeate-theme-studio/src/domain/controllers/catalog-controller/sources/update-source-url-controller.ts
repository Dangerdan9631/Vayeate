import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
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
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSourceUrlInCatalog: UpdateSourceUrlInCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(sourceIndex: number, value: string): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!canUpdateCatalogSource(catalog, sourceIndex)) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSourceUrlInCatalog.execute(base, sourceIndex, value);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
