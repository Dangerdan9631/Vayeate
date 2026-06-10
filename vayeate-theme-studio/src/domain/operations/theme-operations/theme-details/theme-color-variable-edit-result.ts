import type { ColorVariableKey } from '../../../../model/schema/primitives';

export interface ThemeColorVariableEditResult {
  ref: ColorVariableKey | string;
  before: string | null;
  after: string | null;
  changed: boolean;
}

