import type { TokenKey, TokenType } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { BumpCatalogVersionForEditOperation } from '../../../operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { RemoveTokenFromCatalogOperation } from '../../../operations/catalog-operations/tokens/remove-token-from-catalog-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';

@singleton()
export class RemoveTokenController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeTokenFromCatalog: RemoveTokenFromCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(key: TokenKey, tokenType: TokenType): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.removeTokenFromCatalog.execute(base, key, tokenType);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
