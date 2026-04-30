import { singleton } from 'tsyringe';
import type { Source } from '../../model/schema/catalog';
import { parseSyncedCatalogTokens, resolveExportUrl, type SyncCatalogResult } from './parse-synced-catalog-tokens';
import { WebService } from '../services/web-service';

@singleton()
export class TokenSyncGateway {
  constructor(private readonly webService: WebService) {}

  async sync(sources: readonly Source[]): Promise<SyncCatalogResult> {
    const sourceTextByUrl: Record<string, string> = {};

    for (const source of sources) {
      sourceTextByUrl[source.url] = await this.webService.fetchUrl(source.url);
      if (source.type !== 'color-registry-set') {
        continue;
      }

      const manifestText = sourceTextByUrl[source.url];
      const exportPathMatches = manifestText.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g);
      for (const match of exportPathMatches) {
        const exportUrl = resolveExportUrl(match[1].trim(), source.url);
        if (sourceTextByUrl[exportUrl] === undefined) {
          sourceTextByUrl[exportUrl] = await this.webService.fetchUrl(exportUrl);
        }
      }
    }

    return parseSyncedCatalogTokens(sources, sourceTextByUrl);
  }
}
