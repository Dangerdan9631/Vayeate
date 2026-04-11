import { compareVersions } from './compare-versions';

/** Highest semver ref for a fixed name (sorted ascending, take last). */
export function findHighestVersionRefSameName<T extends { name: string; version: string }>(
  refs: readonly T[],
  name: string,
): T | null {
  const same = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  return same.length > 0 ? same[same.length - 1]! : null;
}
