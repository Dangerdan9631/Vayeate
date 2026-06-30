import { singleton } from 'tsyringe';
import { LoadPreviewsOperation } from '../../../../domain/operations/theme-operations/previews/load-previews-operation';
import { ThemePreviewStore } from '../../../../domain/state/ui/theme-preview-store';

/**
 * Orchestrates load theme previews work for the theme UI.
 */
@singleton()
export class LoadThemePreviewsController {
  constructor(
    private readonly loadPreviews: LoadPreviewsOperation,
    private readonly themePreviewStore: ThemePreviewStore,
  ) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Promise resolved when orchestration completes.
   */
  run(): void {
    if (this.themePreviewStore.getStore().state.editorPreviews.length > 0) {
      return;
    }
    this.loadPreviews.execute();
  }
}
