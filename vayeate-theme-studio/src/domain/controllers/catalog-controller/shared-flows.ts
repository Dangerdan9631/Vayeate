import { injectable } from 'tsyringe';
import { LoadCatalog, RefreshCatalogRefs, SetSelectedCatalog } from '../../operations/catalog-operations';

@injectable()
export class CatalogSharedFlows {
  constructor(
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
    private readonly setSelectedCatalog: SetSelectedCatalog,
    private readonly loadCatalog: LoadCatalog,
  ) {}

  async refreshRefsAndSelect(selectName?: string, selectVersion?: string): Promise<void> {
    const refs = await this.refreshCatalogRefs.execute();
    if (selectName && selectVersion) {
      const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
      if (match) {
        const catalog = await this.loadCatalog.execute(match.name, match.version);
        this.setSelectedCatalog.execute(match, catalog ?? null);
      }
    }
  }
}
