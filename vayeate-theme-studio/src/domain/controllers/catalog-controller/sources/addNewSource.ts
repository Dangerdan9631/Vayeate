import type { Source } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  AddSourceToCatalog,
  BumpCatalogVersionForEdit,
  SaveCatalog,
  SetCatalogNewSourceTokenType,
  SetCatalogNewSourceType,
  SetCatalogNewSourceUrl,
} from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class AddNewSourceController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveCatalog: SaveCatalog,
    private readonly setCatalogNewSourceUrl: SetCatalogNewSourceUrl,
    private readonly setCatalogNewSourceTokenType: SetCatalogNewSourceTokenType,
    private readonly setCatalogNewSourceType: SetCatalogNewSourceType,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEdit,
    private readonly addSourceToCatalog: AddSourceToCatalog,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(): Promise<void> {
    const state = this.appStateGetter.current().catalogs;
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
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
    this.setCatalogNewSourceUrl.execute('');
    this.setCatalogNewSourceTokenType.execute('theme');
    this.setCatalogNewSourceType.execute('default');
  }
}
