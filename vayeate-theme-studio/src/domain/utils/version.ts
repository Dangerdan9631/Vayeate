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
