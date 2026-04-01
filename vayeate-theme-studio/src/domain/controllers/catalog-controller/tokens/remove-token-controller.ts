import type { TokenKey, TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpCatalogVersionForEditOperation,
  RemoveTokenFromCatalogOperation,
  SaveCatalogOperation,
} from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class RemoveTokenController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeTokenFromCatalog: RemoveTokenFromCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(key: TokenKey, tokenType: TokenType): Promise<void> {
    const catalog = this.appStateGetter.current().catalogs.catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.removeTokenFromCatalog.execute(base, key, tokenType);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
