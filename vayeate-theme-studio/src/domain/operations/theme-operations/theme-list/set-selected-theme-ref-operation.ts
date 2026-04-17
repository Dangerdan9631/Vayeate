import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetSelectedThemeRefOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(ref: ThemeReference | null): void {
    this.ThemesStore.getStore().setSelectedRef(ref);
  }
}


