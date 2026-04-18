import { singleton } from 'tsyringe';
import { CatalogsStore } from '../../../state/catalog/catalogs-store';
import { findHighestVersionRefSameName } from '../../../utils/find-highest-version-ref-same-name';
import { nextPatchVersion } from '../../../utils/next-patch-version';
import { ListCatalogRefsOperation } from '../../../operations/catalog-operations/catalog-list/list-catalog-refs-operation';
import { LockHeadCatalogIfUnlockedOperation } from '../../../operations/catalog-operations/catalog-details/lock-head-catalog-if-unlocked-operation';
import { RevertCatalogOperation } from '../../../operations/catalog-operations/catalog-details/revert-catalog-operation';
import { SaveCatalogOperation } from '../../../operations/catalog-operations/catalog-details/save-catalog-operation';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation';
import { LoadCatalogOperation } from '../../../operations/catalog-operations/catalog-details/load-catalog-operation';

@singleton()
export class RevertCatalogToVersionController {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly loadCatalog: LoadCatalogOperation,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly listCatalogRefs: ListCatalogRefsOperation,
    private readonly lockHeadCatalogIfUnlocked: LockHeadCatalogIfUnlockedOperation,
    private readonly revertCatalog: RevertCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const ref = this.catalogsStore.getStore().state.selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    const snapshot = await this.loadCatalog.execute(name, version);
    if (!snapshot) return;

    const refs = await this.listCatalogRefs.execute();
    const highestRef = findHighestVersionRefSameName(refs, name);

    if (highestRef) {
      const highestCatalog = await this.loadCatalog.execute(highestRef.name, highestRef.version);
      const toLock = this.lockHeadCatalogIfUnlocked.execute(highestCatalog);
      if (toLock) {
        this.saveCatalog.execute(toLock);
      }
    }

    const newVersion = highestRef ? nextPatchVersion(highestRef.version) : nextPatchVersion(version);
    const reverted = this.revertCatalog.execute(snapshot, newVersion);
    this.saveCatalog.execute(reverted);
    this.refreshCatalogRefsAndSelect.execute(reverted.name, reverted.version);
  }
}
