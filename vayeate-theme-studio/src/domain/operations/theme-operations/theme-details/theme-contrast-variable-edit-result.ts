import type { ContrastComparisonMethod, ContrastVariableKey } from '../../../../model/schema/primitives';

/**
 * Contrast assignment field keys supported by field-level undo replay.
 */
export type ThemeContrastVariableField =
  | 'value'
  | 'min'
  | 'max'
  | 'comparisonMethod';

/**
 * Result of a single contrast assignment field edit.
 */
export interface ThemeContrastVariableEditResult {
  ref: ContrastVariableKey | string;
  side: 'light' | 'dark';
  field: ThemeContrastVariableField;
  before: number | string | null;
  after: number | string | null;
  changed: boolean;
}

export type ThemeContrastVariableFieldValue =
  | number
  | string
  | ContrastComparisonMethod
  | null;
