import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Persist catalog to disk only. Single responsibility: save. */
@singleton()
export class SaveCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) { }

  execute(catalog: Catalog): void {
    this.enqueueBackgroundAction.execute(async() => {
      await this.catalogGateway.saveCatalog(catalog);
    }, `Saving catalog ${catalog.name} ${catalog.version}`);
  }
}


