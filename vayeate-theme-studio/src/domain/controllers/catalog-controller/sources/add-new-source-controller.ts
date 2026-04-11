import type { Source } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import {
  AddSourceToCatalogOperation,
  BumpCatalogVersionForEditOperation,
  SaveCatalogOperation,
  SetCatalogNewSourceTokenTypeOperation,
  SetCatalogNewSourceTypeOperation,
  SetCatalogNewSourceUrlOperation,
} from '../../../operations/catalog-operations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations';

@singleton()
export class AddNewSourceController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrlOperation,
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenTypeOperation,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceTypeOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addSourceToCatalog: AddSourceToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const state = this.catalogsStateGetter.current();
    const catalog = state.catalog;
    const url = state.newSourceUrl?.trim();
    if (!catalog || !url) return;
    const source: Source = {
      url,
      type: state.newSourceType,
      tokenType: state.newSourceTokenType,
    };
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addSourceToCatalog.execute(base, source);
    await this.saveCatalog.execute(updated);
    await this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
    this.setCatalogNewSourceUrl.execute('');
    this.setCatalogNewSourceTokenType.execute('theme');
    this.setCatalogNewSourceType.execute('default');
  }
}
