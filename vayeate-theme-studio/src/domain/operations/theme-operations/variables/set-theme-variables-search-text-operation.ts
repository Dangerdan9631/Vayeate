import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/** Set search filter text for the theme variables list. */
@singleton()
export class SetThemeVariablesSearchTextOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(value: string): void {
    this.themeUiStore.getStore().setThemeVariablesSearchText(value);
  }
}


