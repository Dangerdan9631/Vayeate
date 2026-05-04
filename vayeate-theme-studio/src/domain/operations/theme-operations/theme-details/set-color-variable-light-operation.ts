import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { normalizeHexSafe } from '../../../utils/color-hex';

@singleton()
export class SetColorVariableLightOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
    private readonly themeGateway: ThemeGateway,
  ) {}

  execute(ref: ColorVariableKey | string | undefined, value: string): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || !ref) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, light: normalized !== null ? { value: normalized } : null } : a,
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
  }
}
