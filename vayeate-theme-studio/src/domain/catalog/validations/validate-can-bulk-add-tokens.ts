import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';

@singleton()
export class ValidateCanBulkAddTokens {
  test(catalog: Catalog | null | undefined, text: string | undefined): boolean {
    return !!catalog && !!text?.trim();
  }
}
