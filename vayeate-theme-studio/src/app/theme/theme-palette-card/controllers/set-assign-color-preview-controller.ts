import { singleton } from 'tsyringe';
import { SetAssignColorPreviewOperation } from '../../../../domain/operations/theme-operations/palette-color-assign/set-assign-color-preview-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { normalizeHexSafe } from '../../../../domain/utils/color-hex';

@singleton()
export class SetAssignColorPreviewController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setAssignColorPreview: SetAssignColorPreviewOperation,
  ) {}

  run(hex: string): void {
    const normalized = normalizeHexSafe(hex);
    if (!normalized) return;
    const state = this.themeUiStore.getStore().state;
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


