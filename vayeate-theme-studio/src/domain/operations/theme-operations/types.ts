import type { Theme } from '../../../model/schemas';
import type { AppStateUpdate } from '../../state/app-state';

export type SetState = (update: AppStateUpdate) => void;

export interface RestoreThemeStateParams {
  theme?: Theme | null;
  checkedColorRefs?: string[];
  checkedContrastRefs?: string[];
  hueAdjustment?: number;
  hueReferenceHex?: string;
  deleteThemeVersionOnRestore?: { name: string; version: string };
}
