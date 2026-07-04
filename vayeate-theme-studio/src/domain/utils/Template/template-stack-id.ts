/**
 * Builds the undo stack id for a template entity ref.
 *
 * @param name - Template name.
 * @param version - Template version string.
 * @returns Stable `template:name:version` stack identifier.
 */
export function templateStackId(name: string, version: string): string {
  return `template:${name}:${version}`;
}
