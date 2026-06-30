import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import type { ThemePaletteAssignUndoValue } from '../../../../model/theme-palette-assign-undo';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { normalizeHexSafe } from '../../../utils/color-hex';
import { applyPaletteAdjustmentsToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';
import { buildThemePaletteAssignUndoValue, themePaletteAssignUndoValuesEqual } from '../../../utils/theme-palette-assign-undo-utils';

/**
 * Input or state shape for theme palette assign color edit result.
 */

export interface ThemePaletteAssignColorEditResult {
  before: ThemePaletteAssignUndoValue;
  after: ThemePaletteAssignUndoValue;
  changed: boolean;
}

/**
 * Input or state shape for theme palette assign color base state.
 */

export interface ThemePaletteAssignColorBaseState {
  theme: Theme | null;
  checkedColorRefs: readonly string[];
  hueAdjustment: number;
  saturationAdjustment: number;
  valueAdjustment: number;
}

/**
 * Applies bulk color text from picker/eyedropper to checked color refs and persists.
 */
@singleton()
export class CommitAssignColorTextOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  /**
   * Runs the commit assign color text mutation.
   * @param value Value (string).
   * @param baseState Base state (ThemePaletteAssignColorBaseState).
   * @returns ThemePaletteAssignColorEditResult | null result.
   */

  execute(value: string, baseState?: ThemePaletteAssignColorBaseState): ThemePaletteAssignColorEditResult | null {
    const normalized = normalizeHexSafe(value);
    if (!normalized) return null;
    const state = this.themeUiStore.getStore().state;
    const theme = baseState?.theme ?? state.theme;
    const checkedColorRefs = new Set(baseState?.checkedColorRefs ?? state.checkedColorRefs);
    if (!theme || checkedColorRefs.size === 0) return null;
    const applyToDark = theme.applyPaletteToDark ?? true;
    const applyToLight = theme.applyPaletteToLight ?? true;
    const hueAdjustment = baseState?.hueAdjustment ?? state.hueAdjustment;
    const saturationAdjustment = baseState?.saturationAdjustment ?? state.saturationAdjustment;
    const valueAdjustment = baseState?.valueAdjustment ?? state.valueAdjustment;
    let workingAssignments = theme.colorAssignments;
    if (hueAdjustment !== 0 || saturationAdjustment !== 0 || valueAdjustment !== 0) {
      workingAssignments = applyPaletteAdjustmentsToAssignmentsFiltered(
        theme.colorAssignments,
        { hueAdjustment, saturationAdjustment, valueAdjustment },
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
    this.restore(nextTheme);
    const beforePatch = buildThemePaletteAssignUndoValue(theme, checkedColorRefs);
    const afterPatch = buildThemePaletteAssignUndoValue(nextTheme, checkedColorRefs);
    return {
      before: beforePatch,
      after: afterPatch,
      changed: !themePaletteAssignUndoValuesEqual(beforePatch, afterPatch),
    };
  }

  /**
   * Runs restore for commit assign color text.
   * @param theme Theme (Theme).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  restore(theme: Theme): void {
    this.themeUiStore.getStore().setHueAdjustment(0);
    this.themeUiStore.getStore().setSaturationAdjustment(0);
    this.themeUiStore.getStore().setValueAdjustment(0);
    this.themeUiStore.getStore().setTheme(theme, true);
    this.themesStore.getStore().updateTheme(theme);
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(theme, (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
