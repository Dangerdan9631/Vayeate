import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

/** Set search filter text for the theme variables list. */
@singleton()
export class SetThemeVariablesSearchTextOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(value: string): void {
    this.ThemesStore.getStore().setThemeVariablesSearchText(value);
  }
}


