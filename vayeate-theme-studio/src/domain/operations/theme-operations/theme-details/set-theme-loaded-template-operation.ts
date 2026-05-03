import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { ThemePreviewStore } from '../../../state/ui/theme-preview-store';

@singleton()
export class SetThemeLoadedTemplateOperation {
  constructor(private readonly themePreviewStore: ThemePreviewStore) {}

  execute(template: Template | null): void {
    this.themePreviewStore.getStore().setLoadedTemplate(template);
  }
}


