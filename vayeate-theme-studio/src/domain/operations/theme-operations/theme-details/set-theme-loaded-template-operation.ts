import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeLoadedTemplateOperation {
  constructor(private readonly themesStateSetter: ThemesStateSetter) {}

  execute(template: Template | null): void {
    this.themesStateSetter.apply({ type: 'SET_THEME_LOADED_TEMPLATE', template });
  }
}
