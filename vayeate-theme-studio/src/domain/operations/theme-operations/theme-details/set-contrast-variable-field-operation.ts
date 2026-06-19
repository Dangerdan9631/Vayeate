import { singleton } from 'tsyringe';
import { DebouncedThemePersistGateway } from '../../../../gateway/theme/debounced-theme-persist-gateway';
import type { ContrastComparisonMethod, ContrastVariableKey } from '../../../../model/schema/primitives';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { parseContrastValue, updateContrastAssignment } from '../../../utils/contrast-utils';
import type {
  ThemeContrastVariableEditResult,
  ThemeContrastVariableField,
  ThemeContrastVariableFieldValue,
} from './theme-contrast-variable-edit-result';

function readFieldValue(
  theme: Theme,
  ref: string,
  side: 'light' | 'dark',
  field: ThemeContrastVariableField,
): number | string | null {
  const assignment = theme.contrastAssignments.find((entry) => entry.contrastVariableRef === ref);
  const sideValue = side === 'dark' ? assignment?.dark : assignment?.light;
  if (!sideValue) {
    if (field === 'comparisonMethod') return 'greaterThan';
    if (field === 'value') return 1;
    return null;
  }
  return sideValue[field] ?? null;
}

function normalizeFieldValue(
  field: ThemeContrastVariableField,
  value: ThemeContrastVariableFieldValue,
): number | string | null {
  if (field === 'comparisonMethod') {
    return typeof value === 'string' ? value : null;
  }
  if (field === 'value') {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseContrastValue(value);
    return null;
  }
  if (value === '' || value == null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseContrastValue(value);
  return null;
}

/**
 * Updates one contrast assignment field and returns before/after values for undo recording.
 */
@singleton()
export class SetContrastVariableFieldOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themesStore: ThemesStore,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
  ) {}

  /**
   * Runs the set contrast variable field mutation.
   * @param ref Contrast variable ref.
   * @param side Light or dark assignment slot.
   * @param field Assignment field to update.
   * @param value Next field value.
   * @returns Edit result when the theme changes, otherwise null.
   */
  execute(
    ref: ContrastVariableKey | string | undefined,
    side: 'light' | 'dark',
    field: ThemeContrastVariableField,
    value: ThemeContrastVariableFieldValue,
  ): ThemeContrastVariableEditResult | null {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || !ref) return null;

    const before = readFieldValue(theme, ref, side, field);
    const normalized = normalizeFieldValue(field, value);
    if (normalized == null && field !== 'min' && field !== 'max') return null;

    const update = field === 'comparisonMethod'
      ? { comparisonMethod: normalized as ContrastComparisonMethod }
      : { [field]: normalized };
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, side, update);
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.themeUiStore.getStore().setTheme(next);
    this.themesStore.getStore().updateTheme(next);
    const selectedRef = this.themeUiStore.getStore().state.selectedRef;
    if (selectedRef?.name === next.name && selectedRef.version === next.version) {
      this.themeUiStore.getStore().setThemeLoadState('loaded');
    }
    this.themeUiStore.getStore().setSaveError(null);
    this.debouncedThemePersist.schedule(next, (message) => {
      this.themeUiStore.getStore().setSaveError(message);
    });

    const after = readFieldValue(next, ref, side, field);
    return {
      ref,
      side,
      field,
      before,
      after,
      changed: before !== after,
    };
  }
}
