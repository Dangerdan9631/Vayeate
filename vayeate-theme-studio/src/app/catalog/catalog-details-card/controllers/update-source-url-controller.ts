import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { UpdateSourceUrlInCatalogOperation } from '../../../../domain/operations/catalog-operations/sources/update-source-url-in-catalog-operation';
import { ValidateCanUpdateCatalogSource } from '../../../../domain/catalog/validations/validate-can-update-catalog-source';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/undo-history';
import { CATALOG_SOURCE_URL_UPDATED } from '../../../../model/undo-action-types';

@singleton()
export class UpdateSourceUrlController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly updateSourceUrlInCatalog: UpdateSourceUrlInCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanUpdateCatalogSource: ValidateCanUpdateCatalogSource,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  run(sourceIndex: number, value: string): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.state.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!catalog || !this.validateCanUpdateCatalogSource.test(catalog, sourceIndex)) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog.name, version: catalog.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.updateSourceUrlInCatalog.execute(base, sourceIndex, value);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version, updated, entityRefsChanged(catalog, updated));

    void this.recordCatalogUndo.execute({
      description: 'Update catalog source URL',
      actionType: CATALOG_SOURCE_URL_UPDATED,
      target: `${catalog.name}@${catalog.version}:source:${sourceIndex}`,
      before: catalog,
      after: updated,
    });
  }
}
