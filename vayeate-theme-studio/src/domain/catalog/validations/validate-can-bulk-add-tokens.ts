import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';

/**
 * Checks whether bulk-add token text can be applied to the current catalog.
 */
@singleton()
export class ValidateCanBulkAddTokens {
  /**
   * Requires a loaded catalog and non-whitespace bulk-add paste or draft text.
   *
   * @param catalog - Current catalog selection, if any.
   * @param text - Bulk-add dialog text from user input.
   * @returns True when both catalog and trimmed text are present.
   */
  test(catalog: Catalog | null | undefined, text: string | undefined): boolean {
    return !!catalog && !!text?.trim();
  }
}
