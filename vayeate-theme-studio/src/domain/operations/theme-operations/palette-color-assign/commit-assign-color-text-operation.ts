import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { normalizeHexSafe } from '../../../utils/color-hex';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';

export interface ThemePaletteAssignColorEditResult {
  before: Theme;
  after: Theme;
  changed: boolean;
}

/** Applies bulk color text from picker/eyedropper to checked color refs and persists. */
@singleton()
export class CommitAssignColorTextOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
    private readonly themeGateway: ThemeGateway,
  ) {}

  execute(value: string): ThemePaletteAssignColorEditResult | null {
    const normalized = normalizeHexSafe(value);
    if (!normalized) return null;
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    const checkedColorRefs = new Set(state.checkedColorRefs);
    if (!theme || checkedColorRefs.size === 0) return null;
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
    this.restore(nextTheme);
    return {
      before: theme,
      after: nextTheme,
      changed: JSON.stringify(theme.colorAssignments) !== JSON.stringify(nextTheme.colorAssignments),
    };
  }

  restore(theme: Theme): void {
    this.themeUiStore.getStore().setHueAdjustment(0);
    this.themeUiStore.getStore().setTheme(theme, true);
    this.themesStore.getStore().updateTheme(theme);
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(() => this.themeGateway.saveTheme(theme), (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
