import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';
import { TokenSyncGateway } from '../../../../gateway/catalog/token-sync-gateway';
import { nextPatchVersion } from '../../../utils/next-patch-version';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Sync tokens from sources and return updated catalog. No setState, no save. Single responsibility: sync. */
@singleton()
export class SyncCatalogOperation {
  constructor(
    private readonly tokenSyncGateway: TokenSyncGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(catalog: Catalog): Promise<Catalog> {
    return this.enqueueBackgroundQueue.executeReturning(`Syncing catalog ${catalog.name} ${catalog.version}`, () =>
      this.syncBody(catalog),
    );
  }

  private async syncBody(catalog: Catalog): Promise<Catalog> {
    const result = await this.tokenSyncGateway.sync(catalog.sources);
    const version = catalog.locked ? nextPatchVersion(catalog.version) : catalog.version;
    return {
      ...catalog,
      tokens: result.tokens,
      semanticTokenTypes: result.semanticTokenTypes,
      semanticTokenModifiers: result.semanticTokenModifiers,
      semanticTokenLanguages: result.semanticTokenLanguages,
      version,
      locked: true,
    };
  }
}


