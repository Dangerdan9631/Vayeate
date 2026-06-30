import { singleton } from 'tsyringe';
import { findNearestVersionRef } from '../../../../domain/utils/find-nearest-version-ref';
import { DeleteCatalogOperation } from '../../../../domain/catalog/operations/delete-catalog-operation';
import { SetSelectedCatalogOperation } from '../../../../domain/operations/delete/set-selected-catalog-operation';
import { CatalogUiStore } from '../../../../domain/state/ui/catalog-ui-store';
import { LoadCatalogRefsOperation } from '../../../../domain/catalog/operations/load-catalog-refs-operation';
import { CatalogsStore, getCurrentCatalog, getCurrentCatalogRefs } from '../../../../domain/catalog/state/catalogs-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { deriveUndoContext } from '../../../../model/undo-history';
import { CATALOG_VERSION_DELETED } from '../../../../model/undo-action-types';

/**
 * Deletes the selected catalog version and selects the nearest remaining version.
 */
@singleton()
export class DeleteCurrentCatalogVersionController {
  constructor(
    private readonly catalogUiStore: CatalogUiStore,
    private readonly catalogsStore: CatalogsStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly deleteCatalog: DeleteCatalogOperation,
    private readonly loadCatalogRefs: LoadCatalogRefsOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Removes the current version from disk and updates selection.
   * @returns Promise that settles when delete, reload, and undo recording complete.
   */
  async run(): Promise<void> {
    const ref = this.catalogUiStore.getStore().state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    const catalog = getCurrentCatalog(this.catalogsStore.getStore().state.catalogs, ref);
    if (!catalog) return;
    const priorSelectedRef = ref;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: priorSelectedRef,
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    this.deleteCatalog.execute(name, version)
      .then('Loading next catalog version', () => {
        this.loadCatalogRefs.execute().then('Loading next catalog version', () => {
          const refs = getCurrentCatalogRefs(this.catalogsStore.getStore().state.catalogs);
          const next = findNearestVersionRef(refs, name, version);
          const nextRef = next ?? null;
          if (next) {
            this.setSelectedCatalog.execute(next);
          } else {
            this.setSelectedCatalog.execute(null);
          }

          void this.recordCatalogUndo.execute({
            description: `Delete catalog ${name}@${version}`,
            actionType: CATALOG_VERSION_DELETED,
            target: `${name}@${version}`,
            before: { catalog, selectedRef: priorSelectedRef },
            after: { catalog: null, selectedRef: nextRef },
          });
        });
      });
  }
}
