import { singleton } from 'tsyringe';
import { LoadPreviewsOperation } from '../../../operations/theme-operations/previews/load-previews-operation';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class LoadThemePreviewsController {
  constructor(
    private readonly loadPreviews: LoadPreviewsOperation,
    private readonly themesStore: ThemesStore,
  ) {}

  async run(): Promise<void> {
    if (this.themesStore.getStore().state.editorPreviews.length > 0) {
      return;
    }
    await this.loadPreviews.execute();
  }
}
