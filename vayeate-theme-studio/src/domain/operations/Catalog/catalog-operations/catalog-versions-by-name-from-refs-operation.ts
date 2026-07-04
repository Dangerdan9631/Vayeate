import { singleton } from 'tsyringe';
import type { CatalogReference } from '../../../../model/Template/schema/template-schemas';
import { compareVersions } from '../../../utils/Common/compare-versions';

/**
 * Groups catalog refs by name with versions sorted latest-first.
 */
@singleton()
export class CatalogVersionsByNameFromRefsOperation {

  /**
   * Groups catalog refs by name.
   * @param catalogRefs Catalog references from a template or directory listing.
   * @returns Catalog references keyed by name and ordered by descending version.
   */
  execute(catalogRefs: CatalogReference[]): Record<string, CatalogReference[]> {
    const map: Record<string, CatalogReference[]> = {};
    for (const ref of catalogRefs) {
      if (!map[ref.name]) map[ref.name] = [];
      map[ref.name].push(ref);
    }
    for (const name of Object.keys(map)) {
      map[name].sort((a, b) => compareVersions(b.version, a.version));
    }
    return map;
  }
}
