import { singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviewsOperation {
  constructor(
    private readonly ThemesStore: ThemesStore,
    private readonly previewGateway: PreviewGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): void {
    this.enqueueBackgroundAction.execute(
      'Loading previews',
      async () => {
        try {
          const previews = await this.previewGateway.loadPreviews();
          this.ThemesStore.getStore().setEditorPreviews(previews);
        } catch {
          this.ThemesStore.getStore().setEditorPreviews([]);
        }
      }
    );
  }
}


