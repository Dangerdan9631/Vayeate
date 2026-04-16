import { singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviewsOperation {
  constructor(
    private readonly ThemesStore: ThemesStore,
    private readonly previewGateway: PreviewGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => {
    try {
      const previews = await this.previewGateway.loadPreviews();
      this.ThemesStore.getStore().setEditorPreviews(previews);
      } catch {
        this.ThemesStore.getStore().setEditorPreviews([]);
      }
    }, 'Loading previews');
  }
}


