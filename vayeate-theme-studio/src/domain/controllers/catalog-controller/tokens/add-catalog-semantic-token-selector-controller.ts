import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import {
  BumpCatalogVersionForEditOperation,
  MergeSemanticSelectorsIntoCatalogOperation,
  SaveCatalogOperation,
  SetCatalogNewSemanticTokenSelectorTextOperation,
} from '../../../operations/catalog-operations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations';

@singleton()
export class AddCatalogSemanticTokenSelectorController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly mergeSemanticSelectorsIntoCatalog: MergeSemanticSelectorsIntoCatalogOperation,
    private readonly setCatalogNewSemanticTokenSelectorText: SetCatalogNewSemanticTokenSelectorTextOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const state = this.catalogsStateGetter.current();
    const catalog = state.catalog;
    const selector = state.newSemanticTokenSelectorText?.trim();
    if (!catalog || !selector) return;

    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const merged = this.mergeSemanticSelectorsIntoCatalog.execute(base, selector);
    if (!merged) return;

    await this.saveCatalog.execute(merged);
    await this.refreshCatalogRefsAndSelect.execute(merged.name, merged.version);
    this.setCatalogNewSemanticTokenSelectorText.execute('');
  }
}
