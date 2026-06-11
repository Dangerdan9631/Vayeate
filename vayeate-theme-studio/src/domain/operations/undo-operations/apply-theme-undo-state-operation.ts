import { singleton } from 'tsyringe';
import type { Theme } from '../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../theme-operations/theme-details/set-theme-operation';

/**
 * Applies a theme snapshot through the standard in-memory and persist path (undo/redo).
 */
@singleton()
export class ApplyThemeUndoStateOperation {
  constructor(
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  /**
   * Runs the apply theme undo state mutation.
   * @param theme Theme (Theme).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(theme: Theme): void {
    this.setTheme.execute(theme);
    this.applyThemeStateAndSchedulePersist.execute(theme);
  }
}
