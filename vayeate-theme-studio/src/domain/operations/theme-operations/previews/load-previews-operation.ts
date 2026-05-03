import { singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { ThemePreviewStore } from '../../../state/ui/theme-preview-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/background-queue';

@singleton()
export class LoadPreviewsOperation {
  constructor(
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly previewGateway: PreviewGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      'Loading previews',
      async () => {
        try {
          const previews = await this.previewGateway.loadPreviews();
          this.themePreviewStore.getStore().setEditorPreviews(previews);
        } catch {
          this.themePreviewStore.getStore().setEditorPreviews([]);
        }
      }
    );
  }
}

