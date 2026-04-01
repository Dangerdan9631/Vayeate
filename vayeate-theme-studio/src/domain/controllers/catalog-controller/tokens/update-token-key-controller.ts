import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpCatalogVersionForEditOperation,
  SaveCatalogOperation,
  UpdateTokenKeyInCatalogOperation,
} from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class UpdateTokenKeyController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateTokenKeyInCatalog: UpdateTokenKeyInCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(oldKey: string, newKey: string, tokenType: TokenType): Promise<void> {
    const catalog = this.appStateGetter.current().catalogs.catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateTokenKeyInCatalog.execute(base, oldKey, newKey, tokenType);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
