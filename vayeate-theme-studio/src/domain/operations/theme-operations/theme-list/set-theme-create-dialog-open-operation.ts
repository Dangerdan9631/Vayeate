import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeCreateDialogOpenOperation {
  constructor(private readonly themesStateSetter: ThemesStore) {}

  execute(value: boolean): void {
    this.themesStateSetter.getStore().setCreateDialogOpen(value);
  }
}


