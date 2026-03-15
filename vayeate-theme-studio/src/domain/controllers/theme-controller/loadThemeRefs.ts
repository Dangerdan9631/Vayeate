import { previewService } from '../../../gateway/services/preview-service';
import { loadThemeRefs as loadThemeRefsOp, type SetState } from '../../operations/theme-operations';

export async function loadThemeRefs(setState: SetState): Promise<void> {
  await loadThemeRefsOp(setState);
  try {
    const previews = await previewService.loadPreviews();
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
  } catch {
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
  }
}
