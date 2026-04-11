import type { CatalogReference } from '../../model/schemas';
import { compareVersions } from './compare-versions';

/** Build catalog refs grouped by name, sorted by version descending (latest first). */
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
