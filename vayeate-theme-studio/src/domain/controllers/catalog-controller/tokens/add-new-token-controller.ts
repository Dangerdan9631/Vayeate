import type { Token } from '../../../../model/schemas';
import type { TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { AddPlainTokenToCatalogOperation } from '../../../operations/catalog-operations/tokens/add-plain-token-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { MergeSemanticSelectorsIntoCatalogOperation } from '../../../operations/catalog-operations/tokens/merge-semantic-selectors-into-catalog-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogNewTokenKeyOperation } from '../../../operations/catalog-operations/tokens/set-catalog-new-token-key-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class AddNewTokenController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addPlainTokenToCatalog: AddPlainTokenToCatalogOperation,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
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
      await this.refreshCatalogRefsAndSelect.execute(merged.name, merged.version);
      this.setCatalogNewTokenKey.execute('');
      return;
    }

    const newToken: Token = { key: tokenKey, type: tokenType };
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addPlainTokenToCatalog.execute(base, newToken);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
    this.setCatalogNewTokenKey.execute('');
  }
}
