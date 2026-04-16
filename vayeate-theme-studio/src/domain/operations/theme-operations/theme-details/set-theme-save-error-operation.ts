import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeSaveErrorOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(error: string | null): void {
    this.ThemesStore.getStore().setSaveError(error);
  }
}


