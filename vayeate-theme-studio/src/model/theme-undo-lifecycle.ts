import type { Theme, ThemeReference } from './schema/theme-schemas';

/**
 * Theme presence plus UI selection for create/delete/increment undo diffs.
 */
export interface ThemeLifecycleUndoSnapshot {
  theme: Theme | null;
  selectedRef: ThemeReference | null;
}
