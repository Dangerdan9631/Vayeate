import type { SourceType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { BumpCatalogVersionForEditOperation } from '../../../operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateSourceTypeInCatalogOperation } from '../../../operations/catalog-operations/sources/update-source-type-in-catalog-operation';
import { ValidateCanUpdateCatalogSource } from '../../../validations/catalog-validations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class UpdateSourceTypeController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSourceTypeInCatalog: UpdateSourceTypeInCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanUpdateCatalogSource: ValidateCanUpdateCatalogSource,
  ) {}

  async run(sourceIndex: number, value: SourceType): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!catalog || !this.validateCanUpdateCatalogSource.test(catalog, sourceIndex)) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSourceTypeInCatalog.execute(base, sourceIndex, value);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
