import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import type { ThemeBooleanAssignmentEditResult } from './set-contrast-use-dark-for-light-operation';

/**
 * Updates style assignment useDarkForLight and returns before/after for undo recording.
 */
@singleton()
export class SetStyleUseDarkForLightOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  execute(ref: string | undefined, checked: boolean): ThemeBooleanAssignmentEditResult | null {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || !ref) return null;

    const assignment = theme.styleAssignments?.find((entry) => entry.styleVariableRef === ref);
    const before = assignment?.useDarkForLight === true;
    const after = checked === true;
    if (before === after) return { ref, before, after, changed: false };

    const styleAssignments = (theme.styleAssignments ?? []).map((entry) =>
      entry.styleVariableRef === ref ? { ...entry, useDarkForLight: after } : entry,
    );
    const next: Theme = { ...theme, styleAssignments };
    this.persistTheme(next);
    return { ref, before, after, changed: true };
  }

  private persistTheme(next: Theme): void {
    this.themeUiStore.getStore().setTheme(next);
    this.themesStore.getStore().updateTheme(next);
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(next, (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });
  }
}
