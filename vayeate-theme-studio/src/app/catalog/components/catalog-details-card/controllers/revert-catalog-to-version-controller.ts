import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../../../domain/catalog/state/catalogs-store';
import { nextPatchVersion } from '../../../../../domain/utils/next-patch-version';
import { LockHeadCatalogIfUnlockedOperation } from '../../../../../domain/operations/catalog-operations/catalog-details/lock-head-catalog-if-unlocked-operation';
import { RevertCatalogOperation } from '../../../../../domain/operations/catalog-operations/catalog-details/revert-catalog-operation';
import { SaveCatalogOperation } from '../../../../../domain/operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../../../domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { compareVersions } from '../../../../../domain/utils/compare-versions';
import { Catalog } from '../../../../../model/schema/catalog';


@singleton()
export class RevertCatalogToVersionController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly lockHeadCatalogIfUnlocked: LockHeadCatalogIfUnlockedOperation,
    private readonly revertCatalog: RevertCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const store = this.catalogsStore.getStore();
    const state = store.stateV2;
    const ref = state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    const snapshot = state.catalogs[name]?.[version]?.catalog;
    if (!snapshot) return;

    const versions = state.catalogs[name] ?? {};
    const highestCatalog = Object.values(versions)
      .map((v) => v.catalog)
      .filter((c): c is Catalog => c !== null)
      .sort((a, b) => compareVersions(a.version, b.version))
      .pop();

    if (highestCatalog) {
      const toLock = this.lockHeadCatalogIfUnlocked.execute(highestCatalog);
      if (toLock) {
        this.saveCatalog.execute(toLock);
      }
    }

    const newVersion = highestCatalog ? nextPatchVersion(highestCatalog.version) : nextPatchVersion(version);
    const reverted = this.revertCatalog.execute(snapshot, newVersion);
    this.saveCatalog.execute(reverted);
    this.refreshCatalogRefsAndSelect.execute(reverted.name, reverted.version);
  }
}
