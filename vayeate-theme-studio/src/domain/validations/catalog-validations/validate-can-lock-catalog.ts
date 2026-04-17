import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';

@singleton()
export class ValidateCanLockCatalog {
  test(catalog: Catalog | null | undefined): boolean {
    return !!catalog && catalog.type === 'manual' && !catalog.locked;
  }
}
