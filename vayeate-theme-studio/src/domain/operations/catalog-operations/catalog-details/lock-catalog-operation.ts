import { singleton } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';

@singleton()
export class LockCatalogOperation {
  execute(catalog: Catalog): Catalog {
    return { ...catalog, locked: true };
  }
}
