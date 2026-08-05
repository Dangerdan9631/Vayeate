import type { Source } from '../../../../model/Catalog/schema/catalog';
import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { AddSourceToCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/sources/add-source-to-catalog-operation';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/Catalog/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { ClearCatalogNewSourceDataOperation } from '../../../../domain/operations/Catalog/catalog-operations/sources/clear-catalog-new-source-data-operation';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/Catalog/catalog-undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/Common/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import { CATALOG_SOURCE_ADDED } from '../../../../model/Undo/undo-action-types';

/**
 * Appends the new-source row to the selected remote catalog and records undo.
 */
@singleton()
export class AddNewSourceController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly addSourceToCatalog: AddSourceToCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly clearCatalogNewSourceData: ClearCatalogNewSourceDataOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Commits the pending new source fields when URL and catalog are valid.
   */
  run(): void {
    const store = this.catalogsStore.getStore();
    const uiStore = this.catalogUiStore.getStore();
    const state = uiStore.state;
    const catalog = getCurrentCatalog(store.state.catalogs, state.selectedRef);
    const url = state.newSource.url?.trim();
    if (!catalog || !url) return;
    const source: Source = {
      url,
      type: state.newSource.type,
      tokenType: state.newSource.tokenType,
    };

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog.name, version: catalog.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const base = this.bumpCatalogVersionForEdit.execute(catalog);
    const updated = this.addSourceToCatalog.execute(base, source);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version, updated, entityRefsChanged(catalog, updated));
    this.clearCatalogNewSourceData.execute();

    void this.recordCatalogUndo.execute({
      description: `Add catalog source ${url}`,
      actionType: CATALOG_SOURCE_ADDED,
      target: `${catalog.name}@${catalog.version}:source:${url}`,
      before: catalog,
      after: updated,
    });
  }
}
