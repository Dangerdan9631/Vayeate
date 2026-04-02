import type { Token } from '../../../../model/schemas';
import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import {
  AddPlainTokenToCatalogOperation,
  BumpCatalogVersionForEditOperation,
  MergeSemanticSelectorsIntoCatalogOperation,
  SaveCatalogOperation,
  SetCatalogNewTokenKeyOperation,
} from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class AddNewTokenController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addPlainTokenToCatalog: AddPlainTokenToCatalogOperation,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalogOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(tokenType: TokenType, key?: string): Promise<void> {
    const state = this.catalogsStateGetter.current();
    const catalog = state.catalog;
    const tokenKey = (key ?? state.newTokenKey)?.trim();
    if (!catalog || !tokenKey) return;

    if (tokenType === 'semantic token') {
      const base = this.bumpCatalogVersionForEdit.execute(catalog);
      const merged = this.mergeSemanticSelectorsIntoCatalog.execute(base, tokenKey);
      if (!merged) return;
      await this.saveCatalog.execute(merged);
      await this.catalogSharedFlows.refreshRefsAndSelect(merged.name, merged.version);
      this.setCatalogNewTokenKey.execute('');
      return;
    }

    const newToken: Token = { key: tokenKey, type: tokenType };
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addPlainTokenToCatalog.execute(base, newToken);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
    this.setCatalogNewTokenKey.execute('');
  }
}
