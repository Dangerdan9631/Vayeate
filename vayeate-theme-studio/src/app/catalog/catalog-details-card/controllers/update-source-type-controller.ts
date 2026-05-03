import type { SourceType } from '../../../../model/schema/primitives';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/data/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateSourceTypeInCatalogOperation } from '../../../../domain/operations/catalog-operations/sources/update-source-type-in-catalog-operation';
import { ValidateCanUpdateCatalogSource } from '../../../../domain/catalog/validations/validate-can-update-catalog-source';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/data/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';

@singleton()
export class UpdateSourceTypeController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSourceTypeInCatalog: UpdateSourceTypeInCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanUpdateCatalogSource: ValidateCanUpdateCatalogSource,
  ) {}

  run(sourceIndex: number, value: SourceType): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.stateV2.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!catalog || !this.validateCanUpdateCatalogSource.test(catalog, sourceIndex)) return;
    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSourceTypeInCatalog.execute(base, sourceIndex, value);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version);
  }
}
