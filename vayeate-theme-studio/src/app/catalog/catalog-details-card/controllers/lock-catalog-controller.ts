import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { LockCatalogOperation as LockCatalogTransform } from '../../../../domain/operations/catalog-operations/catalog-details/lock-catalog-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { ValidateCanLockCatalog } from '../../../../domain/catalog/validations/validate-can-lock-catalog';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/delete/refresh-catalog-refs-and-select-operation';
import { getCurrentCatalog } from '../../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import { CATALOG_LOCKED } from '../../../../model/undo-action-types';

/**
 * Locks a manual catalog on the latest version so tokens cannot be edited.
 */
@singleton()
export class LockCatalogController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly lockCatalogTransform: LockCatalogTransform,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly validateCanLockCatalog: ValidateCanLockCatalog,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Locks the selected catalog when validation allows.
   */
  run(): void {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.state.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!catalog || !this.validateCanLockCatalog.test(catalog)) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog.name, version: catalog.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const updated = this.lockCatalogTransform.execute(catalog);
    this.saveCatalog.execute(updated);
    this.refreshCatalogRefsAndSelect.execute(updated.name, updated.version, updated, false);

    void this.recordCatalogUndo.execute({
      description: `Lock catalog ${catalog.name}`,
      actionType: CATALOG_LOCKED,
      target: `${catalog.name}@${catalog.version}`,
      before: catalog,
      after: updated,
    });
  }
}
