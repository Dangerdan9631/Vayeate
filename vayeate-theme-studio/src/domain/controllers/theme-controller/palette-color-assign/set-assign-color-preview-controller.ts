import { singleton } from 'tsyringe';
import { SetAssignColorPreviewOperation } from '../../../operations/theme-operations/palette-color-assign/set-assign-color-preview-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color-hex';

@singleton()
export class SetAssignColorPreviewController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setAssignColorPreview: SetAssignColorPreviewOperation,
  ) {}

  async run(hex: string): Promise<void> {
    const normalized = normalizeHexSafe(hex);
    if (!normalized) return;
    const state = this.themesStateGetter.current();
    const theme = state.theme;
    const checkedColorRefs = new Set(state.checkedColorRefs);
    if (!theme || checkedColorRefs.size === 0) return;
    this.setAssignColorPreview.execute({
      normalizedHex: normalized,
      theme,
      checkedColorRefs,
      hueAdjustment: state.hueAdjustment,
    });
  }
}
