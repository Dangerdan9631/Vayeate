import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';

@singleton()
export class RevertCatalogOperation {
  execute(snapshot: Catalog, newVersion: string): Catalog {
    return { ...snapshot, version: newVersion, locked: false };
  }
}
