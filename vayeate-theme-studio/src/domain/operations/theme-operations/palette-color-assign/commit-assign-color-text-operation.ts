import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { DebouncedThemePersistService } from '../../../../gateway/services/debounced-theme-persist-service';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/theme/themes-store';
import { normalizeHexSafe } from '../../../utils/color-hex';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';

/** Applies bulk color text from picker/eyedropper to checked color refs and persists. */
@singleton()
export class CommitAssignColorTextOperation {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly themesStateSetter: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistService,
    private readonly themeGateway: ThemeGateway,
  ) {}

  execute(value: string): void {
    const normalized = normalizeHexSafe(value);
    if (!normalized) return;
    const state = this.themesStateGetter.getStore().state;
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
    this.themesStateSetter.getStore().setHueAdjustment(0);
    this.themesStateSetter.getStore().setTheme(nextTheme, true);
    this.themesStateSetter.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(() => this.themeGateway.saveTheme(nextTheme), (message) => {
      this.themesStateSetter.getStore().setSaveError(message);
    });
  }
}

