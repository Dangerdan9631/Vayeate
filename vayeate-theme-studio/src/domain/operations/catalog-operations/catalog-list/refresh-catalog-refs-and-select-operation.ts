import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';

/** After catalog mutations, refresh refs from disk and optionally select a catalog by name/version. */
@singleton()
export class RefreshCatalogRefsAndSelectOperation {
  constructor(
    private readonly catalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
  ) {}

  async execute(selectName?: string, selectVersion?: string): Promise<void> {
    const refs = await this.catalogGateway.listCatalogs();
    this.catalogsStateSetter.apply({
      type: 'SET_CATALOG_MAP_ENTRIES',
      entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
    });
    if (selectName && selectVersion) {
      const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
      if (match) {
        const catalog = await this.catalogGateway.loadCatalog(match.name, match.version);
        this.catalogsStateSetter.apply({ type: 'SET_SELECTED_REF', ref: match });
        this.catalogsStateSetter.apply({ type: 'SET_CATALOG', catalog });
      }
    }
  }
}
