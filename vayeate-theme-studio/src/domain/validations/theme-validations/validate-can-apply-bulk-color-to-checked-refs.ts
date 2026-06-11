import { singleton } from 'tsyringe';
import type { Theme } from '../../../model/schema/theme-schemas';

/**
 * Checks that a theme is loaded and at least one color ref is selected for bulk palette or hue actions.
 */
@singleton()
export class ValidateCanApplyBulkColorToCheckedRefs {
  /**
   * Confirms edit targets exist before applying a bulk color change.
   *
   * @param theme - Theme being edited, or null/undefined when none is selected.
   * @param checkedCount - Number of color refs currently checked in the assign UI.
   * @returns `true` when a theme is present and at least one ref is checked.
   */
  test(theme: Theme | null | undefined, checkedCount: number): boolean {
    return !!theme && checkedCount > 0;
  }
}
