import type { ColorVariableKey } from '../../../../model/schema/primitives';

/**
 * Input or state shape for theme color variable edit result.
 */

export interface ThemeColorVariableEditResult {
  ref: ColorVariableKey | string;
  before: string | null;
  after: string | null;
  changed: boolean;
}

