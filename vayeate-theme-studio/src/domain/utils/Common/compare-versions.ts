import { parseSemver } from './parse-semver';

/**
 * Compares two semantic version strings for sort ordering.
 *
 * @param a - First version string.
 * @param b - Second version string.
 * @returns Negative when `a` is less than `b`, positive when greater, zero when equal.
 */
export function compareVersions(a: string, b: string): number {
  const [aMaj, aMin, aPat] = parseSemver(a);
  const [bMaj, bMin, bPat] = parseSemver(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPat - bPat;
}
