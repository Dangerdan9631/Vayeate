import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';

/**
 * Checks that a source row index is valid for the current catalog.
 */
@singleton()
export class ValidateCanUpdateCatalogSource {
  /**
   * Confirms the catalog is loaded and the source index refers to an existing row.
   *
   * @param catalog - Current catalog selection, if any.
   * @param sourceIndex - Zero-based index of the source row being edited.
   * @returns True when the index is in range for `catalog.sources`.
   */
  test(catalog: Catalog | null | undefined, sourceIndex: number): boolean {
    return !!catalog && sourceIndex >= 0 && sourceIndex < catalog.sources.length;
  }
}
