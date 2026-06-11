/**
 * Reports whether a persisted entity identity changed for directory ref lists.
 *
 * @param before - Entity ref before the persist operation.
 * @param after - Entity ref after the persist operation.
 * @returns True when name or version differs between before and after.
 */
export function entityRefsChanged(
  before: { name: string; version: string },
  after: { name: string; version: string },
): boolean {
  return before.name !== after.name || before.version !== after.version;
}
