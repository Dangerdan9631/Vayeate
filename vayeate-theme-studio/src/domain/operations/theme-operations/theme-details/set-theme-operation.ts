import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetThemeOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(theme: Theme | null, preserveHue?: boolean): void {
    this.themeUiStore.getStore().setTheme(theme, preserveHue);
    if (!theme) {
      this.themeUiStore.getStore().setThemeLoadState('unloaded');
      return;
    }
    const selectedRef = this.themeUiStore.getStore().state.selectedRef;
    if (selectedRef?.name === theme.name && selectedRef.version === theme.version) {
      this.themeUiStore.getStore().setThemeLoadState('loaded');
    }
  }
}


