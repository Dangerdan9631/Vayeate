/**
 * Compares undo before/after snapshots using JSON serialization.
 * @param before Snapshot value before the edit.
 * @param after Snapshot value after the edit.
 * @returns True when both values serialize identically.
 */
export function undoValuesEqual(before: unknown, after: unknown): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}
