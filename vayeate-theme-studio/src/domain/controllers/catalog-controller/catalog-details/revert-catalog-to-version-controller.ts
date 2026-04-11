import { singleton } from 'tsyringe';
import { CatalogsStateGetter } from '../../../state/catalog/catalogs-state-reducer';
import { findHighestVersionRefSameName, nextPatchVersion } from '../../../utils/version';
import {
  ListCatalogRefsOperation,
  LoadCatalogSnapshotOperation,
  LockHeadCatalogIfUnlockedOperation,
  RevertCatalogOperation,
  SaveCatalogOperation,
} from '../../../operations/catalog-operations';
import { RefreshCatalogRefsAndSelectOperation } from '../../../operations/catalog-operations';

@singleton()
export class RevertCatalogToVersionController {
  constructor(
    private readonly catalogsStateGetter: CatalogsStateGetter,
    private readonly loadCatalogSnapshot: LoadCatalogSnapshotOperation,
    private readonly saveCatalog: SaveCatalogOperation,
    private readonly listCatalogRefs: ListCatalogRefsOperation,
    private readonly lockHeadCatalogIfUnlocked: LockHeadCatalogIfUnlockedOperation,
    private readonly revertCatalog: RevertCatalogOperation,
    private readonly refreshCatalogRefsAndSelect: RefreshCatalogRefsAndSelectOperation,
  ) {}

  async run(): Promise<void> {
    const ref = this.catalogsStateGetter.current().selectedRef;
    if (!ref) return;

    const { name, version } = ref;
    const snapshot = await this.loadCatalogSnapshot.execute(name, version);
    if (!snapshot) return;

    const refs = await this.listCatalogRefs.execute();
    const highestRef = findHighestVersionRefSameName(refs, name);

    if (highestRef) {
      const highestCatalog = await this.loadCatalogSnapshot.execute(highestRef.name, highestRef.version);
      const toLock = this.lockHeadCatalogIfUnlocked.execute(highestCatalog);
      if (toLock) {
        await this.saveCatalog.execute(toLock);
      }
    }

    const newVersion = highestRef ? nextPatchVersion(highestRef.version) : nextPatchVersion(version);
    const reverted = this.revertCatalog.execute(snapshot, newVersion);
    await this.saveCatalog.execute(reverted);
    await this.refreshCatalogRefsAndSelect.execute(reverted.name, reverted.version);
  }
}
