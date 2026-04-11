import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load catalog refs from data dir into store (set catalog entries from ref list). */
@singleton()
export class LoadCatalogRefsOperation {
  constructor(
    private readonly catalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => {
      const refs = await this.catalogGateway.listCatalogs();
      this.catalogsStateSetter.apply({
        type: 'SET_CATALOG_MAP_ENTRIES',
        entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, catalog: undefined })),
      });
    });
  }
}
