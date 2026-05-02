import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';

@singleton()
export class ValidateSyncCatalog {
  test(catalog: Catalog | null | undefined): catalog is Catalog & { type: 'remote' } {
    return !!catalog && catalog.type === 'remote';
  }
}
