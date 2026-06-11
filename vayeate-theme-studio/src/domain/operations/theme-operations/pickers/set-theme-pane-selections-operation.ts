import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates theme pane selections in the domain or UI store.
 */

@singleton()
export class SetThemePaneSelectionsOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set theme pane selections mutation.
   * @param checkedColorRefs Checked color refs (string[]).
   * @param checkedContrastRefs Checked contrast refs (string[]).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.themeUiStore.getStore().setThemePaneSelections(checkedColorRefs, checkedContrastRefs);
  }
}
