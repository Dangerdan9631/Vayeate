import { singleton } from 'tsyringe';
import type { Source } from '../../model/schema/catalog';
import { parseSyncedCatalogTokens, resolveExportUrl, type SyncCatalogResult } from './parse-synced-catalog-tokens';
import { WebService } from '../services/web-service';

/**
 * Fetches remote catalog sources and converts response text into sync tokens.
 */
@singleton()
export class TokenSyncGateway {
  constructor(private readonly webService: WebService) {}

  /**
   * Downloads each source URL (and color-registry-set exports) then parses tokens.
   *
   * @param sources - Remote source descriptors from the catalog.
   * @returns Parsed tokens and semantic registry metadata.
   */
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
