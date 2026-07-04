import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/state/Catalog/catalog/catalogs-store';
import { nextPatchVersion } from '../../../../domain/utils/Common/next-patch-version';
import { LockHeadCatalogIfUnlockedOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/lock-head-catalog-if-unlocked-operation';
import { RevertCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/revert-catalog-operation';
import { SaveCatalogOperation } from '../../../../domain/operations/Catalog/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../domain/operations/Catalog/delete/refresh-catalog-refs-and-select-operation';
import { compareVersions } from '../../../../domain/utils/Common/compare-versions';
import { Catalog } from '../../../../model/Catalog/schema/catalog';
import { CatalogUiStore } from '../../../../domain/state/Catalog/ui/catalog-ui-store';
import { TemplateUiStore } from '../../../../domain/state/Template/ui/template-ui-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import { RecordCatalogUndoOperation } from '../../../../domain/operations/Common/undo-operations/record-catalog-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/Common/undo-operations/set-current-undo-stack-id-operation';
import { entityRefsChanged } from '../../../../domain/utils/Common/entity-refs-changed';
import { deriveUndoContext } from '../../../../model/Common/undo-history';
import { CATALOG_LOCKED, CATALOG_REVERTED_TO_VERSION } from '../../../../model/Common/undo-action-types';

/**
 * Creates a new head version from an older selected catalog snapshot.
 */
@singleton()
export class RevertCatalogToVersionController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogUiStore: CatalogUiStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly lockHeadCatalogIfUnlocked: LockHeadCatalogIfUnlockedOperation,
    private readonly revertCatalog: RevertCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
    private readonly recordCatalogUndo: RecordCatalogUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  /**
   * Reverts the catalog to the selected historical version as a new patch version.
   * @returns Promise that settles when persist and undo recording complete.
   */
  async run(): Promise<void> {
    const store = this.catalogsStore.getStore();
    const state = store.state;
    const ref = this.catalogUiStore.getStore().state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    const snapshot = state.catalogs[name]?.[version]?.catalog;
    if (!snapshot) return;

    const priorRef = ref;
    const versions = state.catalogs[name] ?? {};
    const highestCatalog = Object.values(versions)
      .map((v) => v.catalog)
      .filter((c): c is Catalog => c !== null)
      .sort((a, b) => compareVersions(a.version, b.version))
      .pop();

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: priorRef,
      templateRef: this.templateUiStore.getStore().state.selectedRef,
      themeRef: this.themeUiStore.getStore().state.selectedRef,
    }));

    const toLock = highestCatalog ? this.lockHeadCatalogIfUnlocked.execute(highestCatalog) : null;
    if (toLock) {
      this.saveCatalog.execute(toLock);
    }

    const newVersion = highestCatalog ? nextPatchVersion(highestCatalog.version) : nextPatchVersion(version);
    const reverted = this.revertCatalog.execute(snapshot, newVersion);
    this.saveCatalog.execute(reverted);
    this.refreshCatalogRefsAndSelect.execute(reverted.name, reverted.version, reverted, entityRefsChanged(ref, reverted));

    await this.recordCatalogUndo.execute({
      description: `Revert catalog ${name} to ${snapshot.version}`,
      actionType: CATALOG_REVERTED_TO_VERSION,
      target: `${name}@${snapshot.version}->${newVersion}`,
      before: {
        deleteVersion: { name: reverted.name, version: reverted.version },
        selectedRef: priorRef,
      },
      after: reverted,
      extraDiffs: toLock && highestCatalog ? [{
        actionType: CATALOG_LOCKED,
        target: `${name}@${highestCatalog.version}`,
        before: highestCatalog,
        after: toLock,
      }] : undefined,
    });
  }
}
