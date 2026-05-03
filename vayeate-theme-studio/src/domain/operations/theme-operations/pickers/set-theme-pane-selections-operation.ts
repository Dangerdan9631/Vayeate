import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetThemePaneSelectionsOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.themeUiStore.getStore().setThemePaneSelections(checkedColorRefs, checkedContrastRefs);
  }
}
