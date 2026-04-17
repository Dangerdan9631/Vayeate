import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schema/catalog';

@singleton()
export class LockCatalogOperation {
  execute(catalog: Catalog): Catalog {
    return { ...catalog, locked: true };
  }
}
