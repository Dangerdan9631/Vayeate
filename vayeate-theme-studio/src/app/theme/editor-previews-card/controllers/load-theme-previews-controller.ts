import { singleton } from 'tsyringe';
import { LoadPreviewsOperation } from '../../../../domain/operations/theme-operations/previews/load-previews-operation';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';

@singleton()
export class LoadThemePreviewsController {
  constructor(
    private readonly loadPreviews: LoadPreviewsOperation,
    private readonly themesStore: ThemesStore,
  ) {}

  run(): void {
    if (this.themesStore.getStore().state.editorPreviews.length > 0) {
      return;
    }
    this.loadPreviews.execute();
  }
}
