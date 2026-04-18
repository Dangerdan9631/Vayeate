import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { nextPatchVersion } from '../../../utils/next-patch-version';
import { LockHeadCatalogIfUnlockedOperation } from '../../../operations/catalog-operations/catalog-details/lock-head-catalog-if-unlocked-operation';
import { RevertCatalogOperation } from '../../../operations/catalog-operations/catalog-details/revert-catalog-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { compareVersions } from '../../../utils/compare-versions';
import { Catalog } from '../../../../model/schema/catalog';


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
    const ref = this.catalogsStore.getStore().state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    const snapshot = this.catalogsStore.getStore().state.catalogMap[name]?.[version]?.catalog;
    if (!snapshot) return;

    const catalogMap = this.catalogsStore.getStore().state.catalogMap;
    const highestCatalog = Object.entries(catalogMap[name] ?? {})
      .map(([_, entry]) => entry.catalog)
      .filter((catalog) => catalog !== undefined)
      .sort((a, b) => compareVersions(a.version, b.version))
      .pop() as Catalog | undefined;
    
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
