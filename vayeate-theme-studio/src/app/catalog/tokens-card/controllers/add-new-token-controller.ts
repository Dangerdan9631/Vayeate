import type { Token } from '../../../../model/schema/catalog';
import type { TokenType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/catalog/catalogs-store';
import { AddPlainTokenToCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/add-plain-token-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { MergeSemanticSelectorsIntoCatalogOperation } from '../../../../domain/operations/catalog-operations/tokens/merge-semantic-selectors-into-catalog-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { SetCatalogNewTokenKeyOperation } from '../../../../domain/operations/catalog-operations/tokens/set-catalog-new-token-key-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/catalog/catalogs-store';

@singleton()
export class AddNewTokenController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogNewTokenKey: SetCatalogNewTokenKeyOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addPlainTokenToCatalog: AddPlainTokenToCatalogOperation,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  run(tokenType: TokenType, key?: string): void {
    const store = this.catalogsStore.getStore();
    const state = store.stateV2;
    const catalog = getCurrentCatalog(store);
    const tokenKey = (key ?? state.newTokenKey)?.trim();
    if (!catalog || !tokenKey) return;

    if (tokenType === 'semantic token') {
      const base = this.bumpCatalogVersionForEdit.execute(catalog);
      const merged = this.mergeSemanticSelectorsIntoCatalog.execute(base, tokenKey);
      if (!merged) return;
      this.saveCatalog.execute(merged);
      this.refreshCatalogRefsAndSelect.execute(merged.name, merged.version);
      this.setCatalogNewTokenKey.execute('');
      return;
    }

    const newToken: Token = { key: tokenKey, type: tokenType };
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addPlainTokenToCatalog.execute(base, newToken);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
    this.setCatalogNewTokenKey.execute('');
  }
}
