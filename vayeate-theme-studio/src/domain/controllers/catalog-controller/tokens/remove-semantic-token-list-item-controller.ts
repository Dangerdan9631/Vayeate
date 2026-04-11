import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import type { SemanticTokenRegistryListKind } from '../../../../model/schemas';
import {
  BumpCatalogVersionForEditOperation,
  RemoveSemanticTokenListItemOperation,
  SaveCatalogOperation,
} from '../../../operations/catalog-operations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations';

@singleton()
export class RemoveSemanticTokenListItemController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeSemanticTokenListItem: RemoveSemanticTokenListItemOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(kind: SemanticTokenRegistryListKind, index: number): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.removeSemanticTokenListItem.execute(base, kind, index);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
