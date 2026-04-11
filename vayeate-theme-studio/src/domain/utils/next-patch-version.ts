import { parseSemver } from './parse-semver';

export function nextPatchVersion(version: string): string {
  const [major, minor, patch] = parseSemver(version);
  return `${major}.${minor}.${patch + 1}`;
}
