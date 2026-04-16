import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemePaneSelectionsOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.ThemesStore.getStore().setThemePaneSelections(checkedColorRefs, checkedContrastRefs);
  }
}
