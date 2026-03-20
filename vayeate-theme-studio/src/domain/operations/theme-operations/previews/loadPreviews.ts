import { singleton } from 'tsyringe';
import { previewService } from '../../../../gateway/services/preview-service';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { SetState } from '../types';

/** Load tokenized preview files and set them in state. */
@singleton()
export class LoadPreviews {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  async execute(): Promise<void> {
    try {
      const previews = await previewService.loadPreviews();
      this.appStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
    } catch {
      this.appStateSetter.apply({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
    }
  }
}

/** @deprecated Use LoadPreviews class instead. */
export async function loadPreviews(setState: SetState): Promise<void> {
  try {
    const previews = await previewService.loadPreviews();
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
  } catch {
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
  }
}



