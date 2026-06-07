import type { Theme } from '../../../model/schema/theme-schemas';

export interface RestoreThemeStateParams {
  theme?: Theme | null;
  checkedColorRefs?: string[];
  checkedContrastRefs?: string[];
  hueAdjustment?: number;
  hueReferenceHex?: string;
  deleteThemeVersionOnRestore?: Pick<Theme, 'name' | 'version'>;
}


