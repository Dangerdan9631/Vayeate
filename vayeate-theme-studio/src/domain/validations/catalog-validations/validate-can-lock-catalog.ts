import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schemas';

@singleton()
export class ValidateCanLockCatalog {
  test(catalog: Catalog | null | undefined): boolean {
    return !!catalog && catalog.type === 'manual' && !catalog.locked;
  }
}
