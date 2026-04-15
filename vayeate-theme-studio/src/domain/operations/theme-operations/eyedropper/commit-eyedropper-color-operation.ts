import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { DebouncedThemePersistService } from '../../../../gateway/services/debounced-theme-persist-service';
import { initialEyedropperUiState } from '../../../state/ui/eyedropper-ui-state';
import { ThemesStateGetter, ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color-hex';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';
import { EyedropperUiStore } from '../../../state/ui/eyedropper-ui-store';
const PREFIX_ASSIGN = 'eyedropper:assign:';
const PREFIX_DARK = 'eyedropper:dark:';
const PREFIX_LIGHT = 'eyedropper:light:';

/** Apply `ui.eyedropper.result` for the current eyedropper context, then close overlay. */
@singleton()
export class CommitEyedropperColorOperation {
  constructor(
    private readonly eyedropperUiStore: EyedropperUiStore,
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly debouncedThemePersist: DebouncedThemePersistService,
  ) {}

  execute(): void {
    const { contextKey, result: hex } = this.eyedropperUiStore.getStore().state;
    if (hex === null) {
      this.eyedropperUiStore.getStore().setState(initialEyedropperUiState);
      return;
    }
    if (!contextKey) {
      this.eyedropperUiStore.getStore().setState(initialEyedropperUiState);
      return;
    }
    try {
      if (contextKey === 'eyedropper:hue') {
        this.themesStateSetter.apply({ type: 'SET_THEME_HUE_REFERENCE_HEX', value: hex });
        this.themesStateSetter.apply({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
        return;
      }
      if (contextKey.startsWith(PREFIX_ASSIGN)) {
        this.commitAssignColorText(hex);
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
      this.eyedropperUiStore.getStore().setState(initialEyedropperUiState);
    }
  }

  private commitAssignColorText(value: string): void {
    const normalized = normalizeHexSafe(value);
    if (!normalized) return;
    const state = this.themesStateGetter.current();
    const theme = state.theme;
    const checkedColorRefs = new Set(state.checkedColorRefs);
    if (!theme || checkedColorRefs.size === 0) return;
    const applyToDark = theme.applyPaletteToDark ?? true;
    const applyToLight = theme.applyPaletteToLight ?? true;
    const hueAdjustment = state.hueAdjustment;
    let workingAssignments = theme.colorAssignments;
    if (hueAdjustment !== 0) {
      workingAssignments = applyHueToAssignmentsFiltered(
        theme.colorAssignments,
        hueAdjustment / 100,
        checkedColorRefs,
        { applyToDark, applyToLight },
      );
    }
    const newAssignments = workingAssignments.map((a) => {
      if (!checkedColorRefs.has(a.colorRef)) return a;
      let next = { ...a };
      if (applyToDark) next = { ...next, dark: { value: normalized } };
      if (applyToLight) next = { ...next, light: { value: normalized } };
      return next;
    });
    const base = { ...theme };
    const nextTheme: Theme = { ...base, colorAssignments: newAssignments };
    this.themesStateSetter.apply({ type: 'SET_THEME_HUE_ADJUSTMENT', value: 0 });
    this.themesStateSetter.apply({ type: 'SET_THEME', theme: nextTheme, preserveHue: true });
    this.themesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error: null });
    this.debouncedThemePersist.schedule(nextTheme);
  }

  private applyColorVariableDark(ref: ColorVariableKey, value: string): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, dark: normalized !== null ? { value: normalized } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.themesStateSetter.apply({ type: 'SET_THEME', theme: next });
    this.themesStateSetter.apply({ type: 'SET_THEME', theme: next, preserveHue: true });
    this.themesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error: null });
    this.debouncedThemePersist.schedule(next);
  }

  private applyColorVariableLight(ref: ColorVariableKey, value: string): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, light: normalized !== null ? { value: normalized } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.themesStateSetter.apply({ type: 'SET_THEME', theme: next });
    this.themesStateSetter.apply({ type: 'SET_THEME', theme: next, preserveHue: true });
    this.themesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error: null });
    this.debouncedThemePersist.schedule(next);
  }
}
