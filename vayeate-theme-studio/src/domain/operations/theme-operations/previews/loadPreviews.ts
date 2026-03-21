import { container, singleton } from 'tsyringe';
import { PreviewService } from '../../../../gateway/services/preview-service';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviews {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly previewService: PreviewService,
  ) {}

  async execute(): Promise<void> {
    try {
      const previews = await this.previewService.loadPreviews();
      this.appStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
    } catch {
      this.appStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
    }
  }
}

/** @deprecated Use LoadPreviews class instead. */
export async function loadPreviews(setState: (update: AppStateUpdate) => void): Promise<void> {
  try {
    const previews = await container.resolve(PreviewService).loadPreviews();
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
  } catch {
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
  }
}



