import { container, singleton } from 'tsyringe';
import { PreviewGateway } from '../../../../gateway/preview/preview-gateway';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

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

/** @deprecated Use LoadPreviewsOperation class instead. */
export async function loadPreviews(setState: (update: ThemesStateUpdate) => void): Promise<void> {
  try {
    const previews = await container.resolve(PreviewGateway).loadPreviews();
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews });
  } catch {
    setState({ type: 'SET_THEME_EDITOR_PREVIEWS', previews: [] });
  }
}



