import { compareVersions } from './compare-versions';

/**
 * After deleting `deletedVersion` of `deletedName`, pick the nearest remaining ref:
 * prefer the latest lower version, else the earliest higher version.
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
