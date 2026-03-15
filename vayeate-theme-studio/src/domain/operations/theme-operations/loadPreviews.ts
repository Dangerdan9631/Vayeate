import { previewService } from '../../../gateway/services/preview-service';
import type { SetState } from './types';

/** Load tokenized preview files and set them in state. */
export async function loadPreviews(setState: SetState): Promise<void> {
  try {
    const previews = await previewService.loadPreviews();
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
  } catch {
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
  }
}
