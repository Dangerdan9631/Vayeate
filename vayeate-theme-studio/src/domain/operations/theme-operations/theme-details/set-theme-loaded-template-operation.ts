import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';
import { ThemePreviewStore } from '../../../state/ui/theme-preview-store';

/**
 * Updates theme loaded template in the domain or UI store.
 */

@singleton()
export class SetThemeLoadedTemplateOperation {
  constructor(private readonly themePreviewStore: ThemePreviewStore) {}

  /**
   * Runs the set theme loaded template mutation.
   * @param template Template (Template | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(template: Template | null): void {
    this.themePreviewStore.getStore().setLoadedTemplate(template);
  }
}


