import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schema/theme-schemas';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetSelectedThemeRefOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(ref: ThemeReference | null): void {
    this.themeUiStore.getStore().setSelectedRef(ref);
  }
}


