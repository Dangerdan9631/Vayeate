/**
 * Builds the undo stack id for a theme entity ref.
 *
 * @param name - Theme name.
 * @param version - Theme version string.
 * @returns Stable `theme:name:version` stack identifier.
 */
export function themeStackId(name: string, version: string): string {
  return `theme:${name}:${version}`;
}
