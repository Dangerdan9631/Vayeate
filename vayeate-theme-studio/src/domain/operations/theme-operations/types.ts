import type { Theme } from '../../../model/schema/theme-schemas';

/**
 * Input or state shape for restore theme state params.
 */

export interface RestoreThemeStateParams {
  theme?: Theme | null;
  checkedColorRefs?: string[];
  checkedContrastRefs?: string[];
  hueAdjustment?: number;
  hueReferenceHex?: string;
  deleteThemeVersionOnRestore?: Pick<Theme, 'name' | 'version'>;
}


