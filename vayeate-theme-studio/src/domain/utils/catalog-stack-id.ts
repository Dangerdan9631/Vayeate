/**
 * Builds the undo stack id for a catalog entity ref.
 *
 * @param name - Catalog name.
 * @param version - Catalog version string.
 * @returns Stable `catalog:name:version` stack identifier.
 */
export function catalogStackId(name: string, version: string): string {
  return `catalog:${name}:${version}`;
}
