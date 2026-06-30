import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { readStyleAssignmentField, updateStyleAssignment, type StyleAssignmentField } from '../../../utils/style-assignment-utils';

export interface ThemeStyleVariableEditResult {
  ref: string;
  side: 'light' | 'dark';
  field: StyleAssignmentField;
  before: boolean;
  after: boolean;
  changed: boolean;
}

/**
 * Updates one style assignment flag and returns before/after values for undo recording.
 */
@singleton()
export class SetStyleVariableFieldOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  execute(
    ref: string | undefined,
    side: 'light' | 'dark',
    field: StyleAssignmentField,
    checked: boolean,
  ): ThemeStyleVariableEditResult | null {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || !ref) return null;

    const before = readStyleAssignmentField(theme.styleAssignments, ref, side, field);
    const after = checked === true;
    if (before === after) return { ref, side, field, before, after, changed: false };

    const styleAssignments = updateStyleAssignment(theme.styleAssignments, ref, side, { [field]: after });
    const next: Theme = { ...theme, styleAssignments };
    this.persistTheme(next);
    return { ref, side, field, before, after, changed: true };
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
