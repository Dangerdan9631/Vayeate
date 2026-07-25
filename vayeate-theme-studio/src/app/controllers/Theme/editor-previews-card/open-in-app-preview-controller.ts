import { singleton } from 'tsyringe';
import { OpenInAppPreviewOperation } from '../../../../domain/operations/Theme/theme-operations/previews/open-in-app-preview-operation';
import { LoadPreviewsOperation } from '../../../../domain/operations/Theme/theme-operations/previews/load-previews-operation';
import { ThemePreviewStore } from '../../../../domain/state/Theme/ui/theme-preview-store';

/**
 * Enables and initializes the in-app editor preview.
 */
@singleton()
export class OpenInAppPreviewController {
  constructor(
    private readonly openInAppPreview: OpenInAppPreviewOperation,
    private readonly loadPreviews: LoadPreviewsOperation,
    private readonly themePreviewStore: ThemePreviewStore,
  ) {}

  /**
   * Enables the session preview and lazily loads its sample content.
   */
  run(): void {
    const previewState = this.themePreviewStore.getStore().state;
    if (previewState.isInAppPreviewOpen) {
      return;
    }

    this.openInAppPreview.execute();
    if (previewState.editorPreviews.length === 0) {
      this.loadPreviews.execute();
    }
  }
}
