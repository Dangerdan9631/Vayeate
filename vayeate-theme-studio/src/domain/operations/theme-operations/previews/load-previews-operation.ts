import { singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviewsOperation {
  constructor(
    private readonly ThemesStateSetter: ThemesStateSetter,
    private readonly previewGateway: PreviewGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(): void {
    this.backgroundQueueGateway.enqueue(async() => {
    try {
      const previews = await this.previewGateway.loadPreviews();
      this.ThemesStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
      } catch {
        this.ThemesStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
      }
    }, 'Loading previews');
  }
}
