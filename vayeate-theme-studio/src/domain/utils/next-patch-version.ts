import { parseSemver } from './parse-semver';

/**
 * Increments the patch component of a semantic version string.
 *
 * @param version - Current semver string to bump.
 * @returns New version with patch incremented by one.
 */
export function nextPatchVersion(version: string): string {
  const [major, minor, patch] = parseSemver(version);
  return `${major}.${minor}.${patch + 1}`;
}
