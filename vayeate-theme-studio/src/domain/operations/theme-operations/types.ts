import type { Theme } from '../../../model/schemas';
import type { ThemesStateUpdate } from '../../state/theme/themes-state-reducer';

/** @deprecated Backward compatibility — use injected ThemesStateSetter */
export type SetState = (update: ThemesStateUpdate) => void;

export interface RestoreThemeStateParams {
  theme?: Theme | null;
  checkedColorRefs?: string[];
  checkedContrastRefs?: string[];
  hueAdjustment?: number;
  hueReferenceHex?: string;
  deleteThemeVersionOnRestore?: { name: string; version: string };
}
