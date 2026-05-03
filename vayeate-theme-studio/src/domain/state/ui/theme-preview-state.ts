import type { TokenizedPreview } from '../../../model/preview-types';
import type { Template } from '../../../model/schema/template-schemas';

export interface ThemePreviewState {
  filterText: string;
  selectedSampleKey: string;
  editorPreviews: TokenizedPreview[];
  loadedTemplateForTheme: Template | null;
}

export const initialThemePreviewState: ThemePreviewState = {
  filterText: '',
  selectedSampleKey: '',
  editorPreviews: [],
  loadedTemplateForTheme: null,
};
