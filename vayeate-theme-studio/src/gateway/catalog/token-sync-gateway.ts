import { singleton } from 'tsyringe';
import type { Source } from '../../model/schema/catalog';
import { syncCatalogTokens, type SyncCatalogResult } from '../../domain/utils/sync-catalog-tokens';
import { WebService } from '../services/web-service';

@singleton()
export class TokenSyncGateway {
  constructor(private readonly webService: WebService) {}

  async sync(sources: readonly Source[]): Promise<SyncCatalogResult> {
    return syncCatalogTokens(sources, (url) => this.webService.fetchUrl(url));
  }
}
