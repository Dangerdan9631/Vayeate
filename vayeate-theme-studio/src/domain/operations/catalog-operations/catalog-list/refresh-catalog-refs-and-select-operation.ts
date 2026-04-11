import { singleton } from 'tsyringe';
import { LoadCatalogOperation } from '../catalog-details/load-catalog-operation';
import { RefreshCatalogRefsOperation } from './refresh-catalog-refs-operation';
import { SetSelectedCatalogOperation } from './set-selected-catalog-operation';

/** After catalog mutations, refresh refs from disk and optionally select a catalog by name/version. */
@singleton()
export class RefreshCatalogRefsAndSelectOperation {
  constructor(
    private readonly refreshCatalogRefs: RefreshCatalogRefsOperation,
    private readonly setSelectedCatalog: SetSelectedCatalogOperation,
    private readonly loadCatalog: LoadCatalogOperation,
  ) {}

  async execute(selectName?: string, selectVersion?: string): Promise<void> {
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
