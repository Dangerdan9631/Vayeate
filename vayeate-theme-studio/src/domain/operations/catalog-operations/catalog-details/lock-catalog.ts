import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';

@injectable()
export class LockCatalog {
  execute(catalog: Catalog): Catalog {
    return { ...catalog, locked: true };
  }
}
