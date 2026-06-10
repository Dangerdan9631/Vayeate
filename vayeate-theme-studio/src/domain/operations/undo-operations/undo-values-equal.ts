/** Deep equality for undo before/after snapshots (JSON-serializable values). */
export function undoValuesEqual(before: unknown, after: unknown): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}
