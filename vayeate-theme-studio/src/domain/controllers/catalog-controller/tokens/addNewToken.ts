import type { Token } from '../../../../model/schemas';
import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  AddPlainTokenToCatalog,
  BumpCatalogVersionForEdit,
  MergeSemanticSelectorsIntoCatalog,
  SaveCatalog,
  SetCatalogNewTokenKey,
} from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class AddNewTokenController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveCatalog: SaveCatalog,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKey,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEdit,
    private readonly addPlainTokenToCatalog: AddPlainTokenToCatalog,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalog,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(tokenType: TokenType, key?: string): Promise<void> {
    const state = this.appStateGetter.current().catalogs;
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
