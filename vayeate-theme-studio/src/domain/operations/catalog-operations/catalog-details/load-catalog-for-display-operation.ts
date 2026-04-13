import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { CatalogsStateSetter } from '../../../state/catalog/catalogs-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

@singleton()
export class LoadCatalogForDisplayOperation {
  constructor(
    private readonly CatalogsStateSetter: CatalogsStateSetter,
    private readonly catalogGateway: CatalogGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(name: string, version: string): void {
    this.backgroundQueueGateway.enqueue(async() => {
      const loaded = await this.catalogGateway.loadCatalog(name, version);
      this.CatalogsStateSetter.apply({ type: 'SET_LOADED_CATALOG_FOR_DISPLAY', name, version, catalog: loaded });
    }, `Loading catalog ${name} ${version}`);
  }
}



