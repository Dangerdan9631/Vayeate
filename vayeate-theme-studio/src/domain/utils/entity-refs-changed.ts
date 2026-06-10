/** True when a persist changes the entity identity shown in directory ref lists. */
export function entityRefsChanged(
  before: { name: string; version: string },
  after: { name: string; version: string },
): boolean {
  return before.name !== after.name || before.version !== after.version;
}
