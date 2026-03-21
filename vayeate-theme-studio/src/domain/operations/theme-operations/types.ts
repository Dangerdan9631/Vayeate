import type { Theme } from '../../../model/schemas';

/** @deprecated Backward compatibility — use injected AppStateSetter */
export type SetState = (update: import('../../state/app-state').AppStateUpdate) => void;

export interface RestoreThemeStateParams {
  theme?: Theme | null;
  checkedColorRefs?: string[];
  checkedContrastRefs?: string[];
  hueAdjustment?: number;
  hueReferenceHex?: string;
  deleteThemeVersionOnRestore?: { name: string; version: string };
}
