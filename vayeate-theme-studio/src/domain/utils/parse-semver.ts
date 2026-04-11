export function parseSemver(v: string): [number, number, number] {
  const cleaned = v.startsWith('v') ? v.slice(1) : v;
  const [major, minor, patch] = cleaned.split('-')[0].split('+')[0].split('.').map(Number);
  return [major ?? 0, minor ?? 0, patch ?? 0];
}
