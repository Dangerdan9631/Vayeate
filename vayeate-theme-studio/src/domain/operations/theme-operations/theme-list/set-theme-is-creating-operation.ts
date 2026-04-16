import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeIsCreatingOperation {
  constructor(private readonly themesStateSetter: ThemesStore) {}

  execute(value: boolean): void {
    this.themesStateSetter.getStore().setIsCreating(value);
  }
}


