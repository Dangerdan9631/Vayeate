/**
 * Parses a semantic version string into numeric major, minor, and patch components.
 *
 * @param v - Version string, optionally prefixed with `v` and suffixed with prerelease or build metadata.
 * @returns Tuple `[major, minor, patch]` with missing segments defaulting to zero.
 */
export function parseSemver(v: string): [number, number, number] {
  const cleaned = v.startsWith('v') ? v.slice(1) : v;
  const [major, minor, patch] = cleaned.split('-')[0].split('+')[0].split('.').map(Number);
  return [major ?? 0, minor ?? 0, patch ?? 0];
}
