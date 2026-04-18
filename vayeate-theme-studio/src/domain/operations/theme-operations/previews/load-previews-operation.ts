import { singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviewsOperation {
  constructor(
    private readonly ThemesStore: ThemesStore,
    private readonly previewGateway: PreviewGateway,
    private readonly backgroundQueueGateway: EnqueueBackgroundActionOperation,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.execute(async() => {
    try {
      const previews = await this.previewGateway.loadPreviews();
      this.ThemesStore.getStore().setEditorPreviews(previews);
      } catch {
        this.ThemesStore.getStore().setEditorPreviews([]);
      }
    }, 'Loading previews');
  }
}


