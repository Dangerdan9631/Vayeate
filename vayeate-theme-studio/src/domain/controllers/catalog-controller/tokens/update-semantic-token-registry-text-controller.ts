import type { SemanticTokenRegistryListKind } from '../../../../model/schemas';
import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import {
  BumpCatalogVersionForEditOperation,
  SaveCatalogOperation,
  UpdateSemanticTokenRegistryEntryOperation,
} from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class UpdateSemanticTokenRegistryTextController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSemanticTokenRegistryEntry: UpdateSemanticTokenRegistryEntryOperation,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(kind: SemanticTokenRegistryListKind, index: number, value: string): Promise<void> {
    const catalog = this.catalogsStateGetter.current().catalog;
    if (!catalog) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSemanticTokenRegistryEntry.execute(base, kind, index, value);
    await this.saveCatalog.execute(updated);
    await this.catalogSharedFlows.refreshRefsAndSelect(updated.name, updated.version);
  }
}
