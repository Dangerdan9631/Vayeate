import type { TokenizedPreview } from '../../../../model/Theme/preview-types';
import type { Template } from '../../../../model/Template/schema/template-schemas';
import type { ScopeColorMap } from '../../../operations/Theme/theme-operations/theme-utils/scope-resolver-operation';

/**
 * Theme preview pane UI state for sample selection, filters, and loaded preview template.
 */
export interface ThemePreviewState {
  filterText: string;
  selectedSampleKey: string;
  editorPreviews: TokenizedPreview[];
  loadedTemplateForTheme: Template | null;
  scopeColorMap: ScopeColorMap;
  /**
   * Monotonic generation bumped when template mappings or contrast variables change.
   */
  scopeTemplateInputsGeneration: number;
  /**
   * Monotonic generation bumped when editor preview sample content changes.
   */
  editorPreviewsGeneration: number;
}

/**
 * Default theme preview pane state before samples or templates are loaded.
 */
export const initialThemePreviewState: ThemePreviewState = {
  filterText: '',
  selectedSampleKey: '',
  editorPreviews: [],
  loadedTemplateForTheme: null,
  scopeColorMap: { entries: [] },
  scopeTemplateInputsGeneration: 0,
  editorPreviewsGeneration: 0,
};
