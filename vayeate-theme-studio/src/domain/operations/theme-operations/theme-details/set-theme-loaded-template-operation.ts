import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schemas';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetThemeLoadedTemplateOperation {
  constructor(private readonly themesStateSetter: ThemesStore) {}

  execute(template: Template | null): void {
    this.themesStateSetter.getStore().setLoadedTemplate(template);
  }
}


