import { singleton } from 'tsyringe';
import type { ThemeLifecycleUndoSnapshot } from '../../../model/theme-undo-lifecycle';
import type { ThemeReference } from '../../../model/schema/theme-schemas';
import { DeleteThemeOperation } from '../theme-operations/theme-list/delete-theme-operation';
import { LoadThemeOperation } from '../theme-operations/theme-details/load-theme-operation';
import { LoadThemeRefsOperation } from '../theme-operations/theme-list/load-theme-refs-operation';
import { SetSelectedThemeRefOperation } from '../theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeOperation } from '../theme-operations/theme-details/set-theme-operation';
import { ApplyThemeUndoStateOperation } from './apply-theme-undo-state-operation';

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

  revertVersionDeleted(before: ThemeLifecycleUndoSnapshot): void {
    if (!before.theme) return;
    this.applyThemeUndoState.execute(before.theme);
  }

  applyVersionIncremented(after: ThemeLifecycleUndoSnapshot): void {
    if (!after.theme) return;
    this.applyThemeUndoState.execute(after.theme);
    if (after.selectedRef) {
      this.setSelectedThemeRef.execute(after.selectedRef);
    }
  }

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

  applyCreated(after: ThemeLifecycleUndoSnapshot): void {
    if (!after.theme) return;
    this.applyThemeUndoState.execute(after.theme);
    if (after.selectedRef) {
      this.setSelectedThemeRef.execute(after.selectedRef);
    }
  }

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
