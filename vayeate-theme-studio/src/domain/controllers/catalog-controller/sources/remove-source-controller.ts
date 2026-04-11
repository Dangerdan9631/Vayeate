import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import {
  BumpCatalogVersionForEditOperation,
  RemoveSourceAtIndexOperation,
  SaveCatalogOperation,
} from '../../../operations/catalog-operations';
import { ValidateCanUpdateCatalogSource } from '../../../validations/catalog-validations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations';

@singleton()
export class RemoveSourceController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeSourceAtIndex: RemoveSourceAtIndexOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanUpdateCatalogSource: ValidateCanUpdateCatalogSource,
  ) {}

  async run(sourceIndex: number): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!catalog || !this.validateCanUpdateCatalogSource.test(catalog, sourceIndex)) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.removeSourceAtIndex.execute(base, sourceIndex);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
