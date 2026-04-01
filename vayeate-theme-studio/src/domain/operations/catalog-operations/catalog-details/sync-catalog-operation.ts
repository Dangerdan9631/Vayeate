import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { TokenSyncGateway } from '../../../../gateway/catalog/token-sync-gateway';
import { nextPatchVersion } from '../../../utils/version';

/** Sync tokens from sources and return updated catalog. No setState, no save. Single responsibility: sync. */
@injectable()
export class SyncCatalogOperation {
  constructor(private readonly tokenSyncGateway: TokenSyncGateway) {}

  async execute(catalog: Catalog): Promise<Catalog> {
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


