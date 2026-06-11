import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../model/schema/template-schemas';
import { catalogDataFileKey } from '../../../model/data-path-keys';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { CatalogsStore } from '../state/catalogs-store';
import { EnqueueBackgroundQueueActionOperation } from '../../operations/background-queue/enqueue-background-queue-action-operation';
import { CatalogType } from '../../../model/schema/primitives';

/**
 * Creates a new catalog at version 1.0.0 in memory and schedules disk persist.
 */
@singleton()
export class CreateCatalogOperation {
  constructor(
    private readonly catalogsStore: CatalogsStore,
    private readonly catalogGateway: CatalogGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Builds a default empty catalog, upserts it into the store, and enqueues save I/O.
   *
   * @param params - Display name and catalog type (`manual` or `remote`).
   * @returns Name/version ref for the new catalog.
   */
  execute(params: { name: string; type: CatalogType }): CatalogReference {
    const catalog = {
      name: params.name,
      version: '1.0.0',
      type: params.type,
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    const ref = { name: catalog.name, version: catalog.version };
    this.catalogsStore.getStore().upsertCatalogs([catalog]);
    this.enqueueBackgroundAction.execute(
      'data_io',
      `Saving catalog ${catalog.name} ${catalog.version}`,
      async () => {
        await this.catalogGateway.saveCatalog(catalog);
      },
      { key: catalogDataFileKey(catalog.name, catalog.version), access: 'write' },
    );

    return ref;
  }
}
