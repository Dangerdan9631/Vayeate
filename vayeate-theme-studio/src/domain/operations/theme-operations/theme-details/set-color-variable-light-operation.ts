import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { normalizeHexSafe } from '../../../utils/color-hex';
import type { ThemeColorVariableEditResult } from './theme-color-variable-edit-result';

/**
 * Updates color variable light in the domain or UI store.
 */

@singleton()
export class SetColorVariableLightOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
    private readonly themeGateway: ThemeGateway,
  ) {}

  /**
   * Runs the set color variable light mutation.
   * @param ref Ref (ColorVariableKey | string | undefined).
   * @param value Value (string).
   * @returns ThemeColorVariableEditResult | null result.
   */

  execute(ref: ColorVariableKey | string | undefined, value: string): ThemeColorVariableEditResult | null {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || !ref) return null;
    const before = theme.colorAssignments.find((assignment) => assignment.colorRef === ref)?.light?.value ?? null;
    const normalized = normalizeHexSafe(value);
    const after = normalized !== null ? normalized : null;
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, light: after !== null ? { value: after } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.themeUiStore.getStore().setTheme(next);
    this.themesStore.getStore().updateTheme(next);
    const selectedRef = this.themeUiStore.getStore().state.selectedRef;
    if (selectedRef?.name === next.name && selectedRef.version === next.version) {
      this.themeUiStore.getStore().setThemeLoadState('loaded');
    }
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(() => this.themeGateway.saveTheme(next), (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
    return { ref, before, after, changed: before !== after };
  }
}
