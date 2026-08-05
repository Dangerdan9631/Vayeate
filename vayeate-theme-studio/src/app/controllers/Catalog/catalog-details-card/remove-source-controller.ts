import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { RemoveSourceAtIndexOperation } from '../../../../domain/operations/Catalog/catalog-operations/sources/remove-source-at-index-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/save-catalog-operation';
import { ValidateCanUpdateCatalogSource } from '../../../../domain/validations/Catalog/catalog/validate-can-update-catalog-source';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/Catalog/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/Catalog/catalog-undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/Common/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import { CATALOG_SOURCE_REMOVED } from '../../../../model/Undo/undo-action-types';

/**
 * Removes a remote source row from the selected catalog version.
 */
@singleton()
export class RemoveSourceController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly bumpCatalogVersionForEdit: BumpCatalogVersionForEditOperation,
    private readonly removeSourceAtIndex: RemoveSourceAtIndexOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanUpdateCatalogSource: ValidateCanUpdateCatalogSource,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Deletes the source at the given index after validation.
   * @param sourceIndex - Zero-based index in the catalog sources array.
   */
  run(sourceIndex: number): void {
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
    const updated = this.removeSourceAtIndex.execute(base, sourceIndex);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version, updated, entityRefsChanged(catalog, updated));

    void this.recordCatalogUndo.execute({
      description: 'Remove catalog source',
      actionType: CATALOG_SOURCE_REMOVED,
      target: `${catalog.name}@${catalog.version}:source:${sourceIndex}`,
      before: catalog,
      after: updated,
    });
  }
}
