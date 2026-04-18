import { singleton } from 'tsyringe';
import { CatalogGateway } from '../../../../gateway/catalog/catalog-gateway';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Delete one catalog version from disk. Single responsibility: delete. */
@singleton()
export class DeleteCatalogOperation {
  constructor(
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) { }

  execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(async() => {
      await this.catalogGateway.deleteCatalog(name, version);
    }, `Deleting catalog ${name} ${version}`);
  }
}


