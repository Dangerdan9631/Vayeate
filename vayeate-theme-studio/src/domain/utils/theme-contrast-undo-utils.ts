import {
  THEME_CONTRAST_VARIABLE_DARK_MAX_SET,
  THEME_CONTRAST_VARIABLE_DARK_METHOD_SET,
  THEME_CONTRAST_VARIABLE_DARK_MIN_SET,
  THEME_CONTRAST_VARIABLE_DARK_VALUE_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_METHOD_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_MIN_SET,
  THEME_CONTRAST_VARIABLE_LIGHT_VALUE_SET,
} from '../../model/undo-action-types';
import type { ThemeContrastVariableField } from '../operations/theme-operations/theme-details/theme-contrast-variable-edit-result';

export interface ThemeContrastActionField {
  side: 'light' | 'dark';
  field: ThemeContrastVariableField;
}

const CONTRAST_ACTION_FIELD_MAP: Record<string, ThemeContrastActionField> = {
  [THEME_CONTRAST_VARIABLE_LIGHT_VALUE_SET]: { side: 'light', field: 'value' },
  [THEME_CONTRAST_VARIABLE_LIGHT_MIN_SET]: { side: 'light', field: 'min' },
  [THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET]: { side: 'light', field: 'max' },
  [THEME_CONTRAST_VARIABLE_LIGHT_METHOD_SET]: { side: 'light', field: 'comparisonMethod' },
  [THEME_CONTRAST_VARIABLE_DARK_VALUE_SET]: { side: 'dark', field: 'value' },
  [THEME_CONTRAST_VARIABLE_DARK_MIN_SET]: { side: 'dark', field: 'min' },
  [THEME_CONTRAST_VARIABLE_DARK_MAX_SET]: { side: 'dark', field: 'max' },
  [THEME_CONTRAST_VARIABLE_DARK_METHOD_SET]: { side: 'dark', field: 'comparisonMethod' },
};

/**
 * Resolves contrast undo action metadata used for field-level replay.
 * @param actionType Theme contrast undo action type.
 * @returns Side and field metadata when the action type is supported.
 */
export function resolveThemeContrastActionField(actionType: string): ThemeContrastActionField | null {
  return CONTRAST_ACTION_FIELD_MAP[actionType] ?? null;
}

export const THEME_CONTRAST_FIELD_ACTION_TYPES = Object.keys(CONTRAST_ACTION_FIELD_MAP);
