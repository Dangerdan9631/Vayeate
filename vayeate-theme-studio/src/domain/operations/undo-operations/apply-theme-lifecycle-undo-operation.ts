import { singleton } from 'tsyringe';
import type { ThemeLifecycleUndoSnapshot } from '../../../model/theme-undo-lifecycle';
import type { ThemeReference } from '../../../model/schema/theme-schemas';
import { DeleteThemeOperation } from '../theme-operations/theme-list/delete-theme-operation';
import { LoadThemeOperation } from '../theme-operations/theme-details/load-theme-operation';
import { LoadThemeRefsOperation } from '../theme-operations/theme-list/load-theme-refs-operation';
import { SetSelectedThemeRefOperation } from '../theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeOperation } from '../theme-operations/theme-details/set-theme-operation';
import { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';

/**
 * Applies theme lifecycle undo to the store as part of undo or theme replay.
 */

@singleton()
export class ApplyThemeLifecycleUndoOperation {
  constructor(
    private readonly deleteTheme: DeleteThemeOperation,
    private readonly applyThemeUndoState: ApplyThemeUndoStateOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadThemeRefs: LoadThemeRefsOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setTheme: SetThemeOperation,
  ) {}

  /**
   * Runs apply version deleted for apply theme lifecycle undo.
   * @param before Before (ThemeLifecycleUndoSnapshot).
   * @param after After (ThemeLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  applyVersionDeleted(before: ThemeLifecycleUndoSnapshot, after: ThemeLifecycleUndoSnapshot): void {
    const theme = before.theme;
    if (!theme) return;
    this.deleteTheme.execute(theme.name, theme.version)
      .then('Refresh theme refs after redo delete', () => {
        void this.loadThemeRefs.execute().then('Select theme after redo delete', () => {
          this.selectRefAndLoad(after.selectedRef);
        });
      });
  }

  /**
   * Runs revert version deleted for apply theme lifecycle undo.
   * @param before Before (ThemeLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  revertVersionDeleted(before: ThemeLifecycleUndoSnapshot): void {
    if (!before.theme) return;
    this.applyThemeUndoState.execute(before.theme);
  }

  /**
   * Runs apply version incremented for apply theme lifecycle undo.
   * @param after After (ThemeLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  applyVersionIncremented(after: ThemeLifecycleUndoSnapshot): void {
    if (!after.theme) return;
    this.applyThemeUndoState.execute(after.theme);
    if (after.selectedRef) {
      this.setSelectedThemeRef.execute(after.selectedRef);
    }
  }

  /**
   * Runs revert version incremented for apply theme lifecycle undo.
   * @param before Before (ThemeLifecycleUndoSnapshot).
   * @param after After (ThemeLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  revertVersionIncremented(before: ThemeLifecycleUndoSnapshot, after: ThemeLifecycleUndoSnapshot): void {
    const theme = after.theme;
    if (!theme) return;
    this.deleteTheme.execute(theme.name, theme.version)
      .then('Refresh theme refs after undo increment', () => {
        void this.loadThemeRefs.execute().then('Select theme after undo increment', () => {
          this.selectRefAndLoad(before.selectedRef);
        });
      });
  }

  /**
   * Runs apply created for apply theme lifecycle undo.
   * @param after After (ThemeLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  applyCreated(after: ThemeLifecycleUndoSnapshot): void {
    if (!after.theme) return;
    this.applyThemeUndoState.execute(after.theme);
    if (after.selectedRef) {
      this.setSelectedThemeRef.execute(after.selectedRef);
    }
  }

  /**
   * Runs revert created for apply theme lifecycle undo.
   * @param before Before (ThemeLifecycleUndoSnapshot).
   * @param after After (ThemeLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  revertCreated(before: ThemeLifecycleUndoSnapshot, after: ThemeLifecycleUndoSnapshot): void {
    const theme = after.theme;
    if (!theme) return;
    this.deleteTheme.execute(theme.name, theme.version)
      .then('Refresh theme refs after undo create', () => {
        void this.loadThemeRefs.execute().then('Select theme after undo create', () => {
          this.selectRefAndLoad(before.selectedRef);
        });
      });
  }

  private selectRefAndLoad(ref: ThemeReference | null): void {
    this.setSelectedThemeRef.execute(ref);
    if (ref) {
      void this.loadTheme.execute(ref.name, ref.version);
    } else {
      this.setTheme.execute(null);
    }
  }
}
