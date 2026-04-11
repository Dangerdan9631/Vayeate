import { compareVersions } from './compare-versions';

/** Latest semver ref among those with the given name. */
export function findBestVersionRef<T extends { name: string; version: string }>(
  refs: readonly T[],
  name: string,
): T | null {
  const same = refs.filter((r) => r.name === name);
  if (same.length === 0) return null;
  return same.reduce((a, b) => (compareVersions(a.version, b.version) > 0 ? a : b));
}
