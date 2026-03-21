import { singleton } from 'tsyringe';
import { findHighestVersionRefSameName, nextPatchVersion } from '../../../utils/version';
import {
  ListCatalogRefs,
  LoadCatalogSnapshot,
  LockHeadCatalogIfUnlocked,
  RevertCatalog,
  SaveCatalog,
} from '../../../operations/catalog-operations';
import { CatalogSharedFlows } from '../shared-flows';

@singleton()
export class RevertCatalogToVersionController {
  constructor(
    private readonly loadCatalogSnapshot: LoadCatalogSnapshot,
    private readonly saveCatalog: SaveCatalog,
    private readonly listCatalogRefs: ListCatalogRefs,
    private readonly lockHeadCatalogIfUnlocked: LockHeadCatalogIfUnlocked,
    private readonly revertCatalog: RevertCatalog,
    private readonly catalogSharedFlows: CatalogSharedFlows,
  ) {}

  async run(name: string, version: string): Promise<void> {
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
    await this.catalogSharedFlows.refreshRefsAndSelect(reverted.name, reverted.version);
  }
}
