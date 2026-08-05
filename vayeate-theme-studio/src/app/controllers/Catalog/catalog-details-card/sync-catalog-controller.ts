import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { SaveCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/save-catalog-operation';
import { SyncCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/sync-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/Catalog/delete/refresh-catalog-refs-and-select-operation';
import { ValidateSyncCatalog } from '../../../../domain/validations/Catalog/catalog/validate-sync-catalog';
import { getCurrentCatalog } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/Catalog/catalog-undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Undo/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/Undo/undo-history';
import { CATALOG_SYNCED } from '../../../../model/Undo/undo-action-types';

/**
 * Pulls token data from remote sources into the selected catalog version.
 */
@singleton()
export class SyncCatalogController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly validateSyncCatalog: ValidateSyncCatalog,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly syncCatalog: SyncCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Syncs remote catalog sources when validation passes.
   * @returns Promise that settles when sync and undo recording complete.
   */
  async run(): Promise<void> {
    const store = this.catalogsStore.getStore();
    const catalog = getCurrentCatalog(store.state.catalogs, this.catalogUiStore.getStore().state.selectedRef);
    if (!this.validateSyncCatalog.test(catalog)) return;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: catalog!.name, version: catalog!.version },
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const synced = await this.syncCatalog.execute(catalog!);
    this.saveCatalog.execute(synced);
    this.refreshCatalogRefsAndSelect.execute(synced.name, synced.version, synced, false);

    await this.recordCatalogUndo.execute({
      description: `Sync catalog ${catalog!.name} from sources`,
      actionType: CATALOG_SYNCED,
      target: `${catalog!.name}@${catalog!.version}`,
      before: catalog!,
      after: synced,
    });
  }
}
