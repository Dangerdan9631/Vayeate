import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schema/theme-schemas';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetSelectedThemeRefOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(ref: ThemeReference | null): void {
    this.themeUiStore.getStore().setSelectedRef(ref);
    this.themeUiStore.getStore().setThemeLoadState(ref ? 'loading' : 'unloaded');

    const theme = this.themeUiStore.getStore().state.theme;
    if (theme && theme.name === ref?.name && theme.version === ref.version) {
      this.themeUiStore.getStore().setThemeLoadState('loaded');
    }
  }
}


