import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';

@injectable()
export class RevertCatalogOperation {
  execute(snapshot: Catalog, newVersion: string): Catalog {
    return { ...snapshot, version: newVersion, locked: false };
  }
}
