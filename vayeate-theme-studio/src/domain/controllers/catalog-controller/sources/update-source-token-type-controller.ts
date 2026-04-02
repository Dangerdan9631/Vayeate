import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import {
  BumpCatalogVersionForEditOperation,
  SaveCatalogOperation,
  UpdateSourceTokenTypeInCatalogOperation,
} from '../../../operations/catalog-operations';
import { canUpdateCatalogSource } from '../../../validations/catalog-validations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class UpdateSourceTokenTypeController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSourceTokenTypeInCatalog: UpdateSourceTokenTypeInCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(sourceIndex: number, value: TokenType): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!canUpdateCatalogSource(catalog, sourceIndex)) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSourceTokenTypeInCatalog.execute(base, sourceIndex, value);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
