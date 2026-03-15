import { previewService } from '../../../gateway/services/preview-service';
import type { SetStoreState } from '../../state/store-state-reducer';
import { loadThemeRefs as loadThemeRefsOp, type SetState } from '../../operations/theme-operations';

export async function loadThemeRefs(setState: SetState, setStoreState: SetStoreState): Promise<void> {
  await loadThemeRefsOp(setState, setStoreState);
  try {
    const previews = await previewService.loadPreviews();
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
  } catch {
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
  }
}
