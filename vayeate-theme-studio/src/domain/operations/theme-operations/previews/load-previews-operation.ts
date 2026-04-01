import { container, singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviewsOperation {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly previewGateway: PreviewGateway,
  ) {}

  async execute(): Promise<void> {
    try {
      const previews = await this.previewGateway.loadPreviews();
      this.appStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
    } catch {
      this.appStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
    }
  }
}

/** @deprecated Use LoadPreviewsOperation class instead. */
export async function loadPreviews(setState: (update: AppStateUpdate) => void): Promise<void> {
  try {
    const previews = await container.resolve(PreviewGateway).loadPreviews();
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
  } catch {
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
  }
}



