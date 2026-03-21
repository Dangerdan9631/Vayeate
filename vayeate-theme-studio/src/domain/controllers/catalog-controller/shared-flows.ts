import { injectable } from 'tsyringe';
import { LoadCatalog, RefreshCatalogRefs, SetSelectedRef } from '../../operations/catalog-operations';

@injectable()
export class CatalogSharedFlows {
  constructor(
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
    private readonly setSelectedRef: SetSelectedRef,
    private readonly loadCatalog: LoadCatalog,
  ) {}

  async refreshRefsAndSelect(selectName?: string, selectVersion?: string): Promise<void> {
    const refs = await this.refreshCatalogRefs.execute();
    if (selectName && selectVersion) {
      const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
      if (match) {
        this.setSelectedRef.execute(match);
        await this.loadCatalog.execute(match.name, match.version);
      }
    }
  }
}
