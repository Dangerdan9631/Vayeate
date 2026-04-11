import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { closedEyedropperUiState } from '../../../state/ui/eyedropper-ui-state';
import { UiStateGetter } from '../../../state/ui/ui-state-reducer';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color';
import { CommitAssignColorTextOperation } from '../palette-color-assign/commit-assign-color-text-operation';
import { SetThemeHueAdjustmentOperation } from '../palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../palette-hue/set-theme-hue-reference-hex-operation';
import { ApplyThemeStateAndSchedulePersistOperation } from '../theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../theme-details/set-theme-operation';
import { SetEyedropperUiStateOperation } from './set-eyedropper-ui-state-operation';

const PREFIX_ASSIGN = 'eyedropper:assign:';
const PREFIX_DARK = 'eyedropper:dark:';
const PREFIX_LIGHT = 'eyedropper:light:';

/** Apply `ui.eyedropper.result` for the current eyedropper context, then close overlay. */
@singleton()
export class CommitEyedropperColorOperation {
  constructor(
    private readonly uiStateGetter: UiStateGetter,
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setEyedropperUiState: SetEyedropperUiStateOperation,
    private readonly commitAssignColorText: CommitAssignColorTextOperation,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  execute(): void {
    const { contextKey, result: hex } = this.uiStateGetter.current().eyedropper;
    if (hex === null) {
      this.setEyedropperUiState.execute(closedEyedropperUiState);
      return;
    }
    if (!contextKey) {
      this.setEyedropperUiState.execute(closedEyedropperUiState);
      return;
    }
    try {
      if (contextKey === 'eyedropper:hue') {
        this.setThemeHueReferenceHex.execute(hex);
        this.setThemeHueAdjustment.execute(0);
        return;
      }
      if (contextKey.startsWith(PREFIX_ASSIGN)) {
        this.commitAssignColorText.execute(hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_DARK)) {
        const ref = contextKey.slice(PREFIX_DARK.length) as ColorVariableKey;
        this.applyColorVariableDark(ref, hex);
        return;
      }
      if (contextKey.startsWith(PREFIX_LIGHT)) {
        const ref = contextKey.slice(PREFIX_LIGHT.length) as ColorVariableKey;
        this.applyColorVariableLight(ref, hex);
        return;
      }
    } finally {
      this.setEyedropperUiState.execute(closedEyedropperUiState);
    }
  }

  private applyColorVariableDark(ref: ColorVariableKey, value: string): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, dark: normalized !== null ? { value: normalized } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }

  private applyColorVariableLight(ref: ColorVariableKey, value: string): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, light: normalized !== null ? { value: normalized } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}
