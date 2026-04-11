import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schemas';

@singleton()
export class ValidateCanUpdateCatalogSource {
  test(catalog: Catalog | null | undefined, sourceIndex: number): boolean {
    return !!catalog && sourceIndex >= 0 && sourceIndex < catalog.sources.length;
  }
}
