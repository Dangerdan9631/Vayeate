import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetPaletteClusterByDarkOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(checked: boolean): void {
    this.themeUiStore.getStore().setPaletteClusterByDark(checked);
  }
}
