import type { CatalogReference } from '../../model/schema/template-schemas';
import { compareVersions } from './compare-versions';

/**
 * Groups catalog refs by name with versions sorted latest-first.
 *
 * @param catalogRefs - Catalog references from a template or directory listing.
 * @returns Record mapping each catalog name to its refs ordered by descending version.
 */
export function catalogVersionsByNameFromRefs(
  catalogRefs: CatalogReference[],
): Record<string, CatalogReference[]> {
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
