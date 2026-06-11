import { compareVersions } from './compare-versions';

/**
 * Selects the nearest remaining ref after deleting a name/version pair.
 * Prefers the latest lower version, otherwise the earliest higher version.
 *
 * @param refs - Entity refs to search within.
 * @param deletedName - Name of the deleted entity.
 * @param deletedVersion - Version of the deleted entity.
 * @returns Nearest surviving ref for the same name, or null when none remain.
 */
export function findNearestVersionRef<T extends { name: string; version: string }>(
  refs: readonly T[],
  deletedName: string,
  deletedVersion: string,
): T | null {
  const sameNameRefs = refs
    .filter((r) => r.name === deletedName)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lower = sameNameRefs.filter((r) => compareVersions(r.version, deletedVersion) < 0);
  const higher = sameNameRefs.filter((r) => compareVersions(r.version, deletedVersion) > 0);
  return lower.length > 0 ? lower[lower.length - 1] : higher.length > 0 ? higher[0] : null;
}
