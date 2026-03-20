function parseSemver(v: string): [number, number, number] {
  const cleaned = v.startsWith('v') ? v.slice(1) : v;
  const [major, minor, patch] = cleaned.split('-')[0].split('+')[0].split('.').map(Number);
  return [major ?? 0, minor ?? 0, patch ?? 0];
}

export function compareVersions(a: string, b: string): number {
  const [aMaj, aMin, aPat] = parseSemver(a);
  const [bMaj, bMin, bPat] = parseSemver(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPat - bPat;
}

export function nextPatchVersion(version: string): string {
  const [major, minor, patch] = parseSemver(version);
  return `${major}.${minor}.${patch + 1}`;
}

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

/** Latest semver ref among those with the given name. */
export function findBestVersionRef<T extends { name: string; version: string }>(
  refs: readonly T[],
  name: string,
): T | null {
  const same = refs.filter((r) => r.name === name);
  if (same.length === 0) return null;
  return same.reduce((a, b) => (compareVersions(a.version, b.version) > 0 ? a : b));
}

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
