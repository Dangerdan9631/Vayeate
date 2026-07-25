import { singleton } from 'tsyringe';
import { ThemePreviewStore } from '../../../../state/Theme/ui/theme-preview-store';

/**
 * Enables the in-app editor preview for the remainder of the app session.
 */
@singleton()
export class OpenInAppPreviewOperation {
  constructor(private readonly themePreviewStore: ThemePreviewStore) {}

  /**
   * Enables preview rendering and preview-related update work.
   */
  execute(): void {
    this.themePreviewStore.getStore().setInAppPreviewOpen(true);
  }
}
