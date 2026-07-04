import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../../gateway/gateway/Theme/theme/debounced-theme-persist-gateway';
import type { Theme } from '../../../../../model/Theme/schema/theme-schemas';
import { ThemesStore } from '../../../../state/Theme/data/themes-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { applyPaletteAdjustmentsToAssignmentsFiltered } from '../theme-utils/theme-assignment-utils-operation';

/**
 * Palette adjustment snapshot committed immediately before a theme pane selection change.
 */
export interface PendingPaletteAdjustmentCommit {
  beforeTheme: Theme;
  afterTheme: Theme;
  hueAdjustment: number;
  saturationAdjustment: number;
  valueAdjustment: number;
}

/**
 * Commits current slider adjustments against the existing selection, then resets sliders to center.
 */
@singleton()
export class CommitPendingPaletteAdjustmentForSelectionOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  /**
   * Applies pending palette slider adjustments to the current selection before a pane selection change.
   * @returns Commit details for undo recording, or null when sliders are already centered.
   */
  execute(): PendingPaletteAdjustmentCommit | null {
    const store = this.themeUiStore.getStore();
    const state = store.state;
    const theme = state.theme;
    if (!theme) return null;
    const hueAdjustment = state.hueAdjustment;
    const saturationAdjustment = state.saturationAdjustment;
    const valueAdjustment = state.valueAdjustment;
    if (hueAdjustment === 0 && saturationAdjustment === 0 && valueAdjustment === 0) return null;

    const checkedColorRefs = new Set(state.checkedColorRefs);
    const afterTheme: Theme = {
      ...theme,
      colorAssignments: applyPaletteAdjustmentsToAssignmentsFiltered(
        theme.colorAssignments,
        { hueAdjustment, saturationAdjustment, valueAdjustment },
        checkedColorRefs,
        {
          applyToDark: theme.applyPaletteToDark ?? true,
          applyToLight: theme.applyPaletteToLight ?? true,
        },
      ),
    };

    store.setTheme(afterTheme);
    this.themesStore.getStore().updateTheme(afterTheme);
    const selectedRef = store.state.selectedRef;
    if (selectedRef?.name === afterTheme.name && selectedRef.version === afterTheme.version) {
      store.setThemeLoadState('loaded');
    }
    store.setTheme(afterTheme, true);
    store.setSaveError(null);
    this.debouncedThemePersist.schedule(afterTheme, (message) => {
      store.setSaveError(message);
    });
    store.setHueAdjustment(0);
    store.setSaturationAdjustment(0);
    store.setValueAdjustment(0);

    return {
      beforeTheme: theme,
      afterTheme,
      hueAdjustment,
      saturationAdjustment,
      valueAdjustment,
    };
  }
}
