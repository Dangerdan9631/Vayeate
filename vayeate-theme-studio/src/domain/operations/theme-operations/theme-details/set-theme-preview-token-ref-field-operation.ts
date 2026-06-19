import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import type { ThemePreviewTokenRefField } from '../../../../model/schema/theme-schemas';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

export interface ThemePreviewTokenRefEditResult {
  field: ThemePreviewTokenRefField;
  before: string | null;
  after: string | null;
  changed: boolean;
}

/**
 * Updates one theme preview token ref field and returns before/after for undo recording.
 */
@singleton()
export class SetThemePreviewTokenRefFieldOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  execute(field: ThemePreviewTokenRefField, value: string | null): ThemePreviewTokenRefEditResult | null {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return null;

    const before = (theme[field] as string | null | undefined) ?? null;
    const after = value;
    if (before === after) {
      return { field, before, after, changed: false };
    }

    const next: Theme = { ...theme, [field]: after };
    this.persistTheme(next);
    return { field, before, after, changed: true };
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
