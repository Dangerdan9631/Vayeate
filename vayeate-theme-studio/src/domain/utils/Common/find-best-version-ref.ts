import { compareVersions } from './compare-versions';

/**
 * Finds the highest semver ref among entries sharing the given name.
 *
 * @param refs - Entity refs to search within.
 * @param name - Entity name to match.
 * @returns Ref with the greatest version for that name, or null when none exist.
 */
export function findBestVersionRef<T extends { name: string; version: string }>(
  refs: readonly T[],
  name: string,
): T | null {
  const same = refs.filter((r) => r.name === name);
  if (same.length === 0) return null;
  return same.reduce((a, b) => (compareVersions(a.version, b.version) > 0 ? a : b));
}
