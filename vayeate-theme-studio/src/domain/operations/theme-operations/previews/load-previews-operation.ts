import { singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviewsOperation {
  constructor(
    private readonly ThemesStateSetter: ThemesStateSetter,
    private readonly previewGateway: PreviewGateway,
  ) {}

  async execute(): Promise<void> {
    try {
      const previews = await this.previewGateway.loadPreviews();
      this.ThemesStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
    } catch {
      this.ThemesStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
    }
  }
}
