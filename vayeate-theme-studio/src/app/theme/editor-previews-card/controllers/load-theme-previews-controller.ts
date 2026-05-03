import { singleton } from 'tsyringe';
import { LoadPreviewsOperation } from '../../../../domain/operations/theme-operations/previews/load-previews-operation';
import { ThemePreviewStore } from '../../../../domain/state/ui/theme-preview-store';

@singleton()
export class LoadThemePreviewsController {
  constructor(
    private readonly loadPreviews: LoadPreviewsOperation,
    private readonly themePreviewStore: ThemePreviewStore,
  ) {}

  run(): void {
    if (this.themePreviewStore.getStore().state.editorPreviews.length > 0) {
      return;
    }
    this.loadPreviews.execute();
  }
}
