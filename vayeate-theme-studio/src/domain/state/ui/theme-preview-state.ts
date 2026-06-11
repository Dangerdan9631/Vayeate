import type { TokenizedPreview } from '../../../model/preview-types';
import type { Template } from '../../../model/schema/template-schemas';

/**
 * Theme preview pane UI state for sample selection, filters, and loaded preview template.
 */
export interface ThemePreviewState {
  filterText: string;
  selectedSampleKey: string;
  editorPreviews: TokenizedPreview[];
  loadedTemplateForTheme: Template | null;
}

/**
 * Default theme preview pane state before samples or templates are loaded.
 */
export const initialThemePreviewState: ThemePreviewState = {
  filterText: '',
  selectedSampleKey: '',
  editorPreviews: [],
  loadedTemplateForTheme: null,
};
