import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schemas';

@singleton()
export class ValidateCanBulkAddTokens {
  test(catalog: Catalog | null | undefined, text: string | undefined): boolean {
    return !!catalog && !!text?.trim();
  }
}
