import type { TokenizedPreview } from '../../../../model/Theme/preview-types';
import type { Template } from '../../../../model/Template/schema/template-schemas';
import type { ScopeColorMap } from '../../../operations/Theme/theme-operations/theme-utils/scope-resolver-operation';

/**
 * Theme preview pane UI state for sample selection, filters, and loaded preview template.
 */
export interface ThemePreviewState {
  /**
   * Whether the in-app editor preview has been enabled for this app session.
   */
  isInAppPreviewOpen: boolean;
  /**
   * Whether live theme export has been enabled by launching the VS Code preview host.
   */
  isPreviewHostEnabled: boolean;
  /**
   * Whether the preview-host extension is currently being generated and launched.
   */
  isPreviewHostOpening: boolean;
  /**
   * Last preview-host launch failure shown by the preview toolbar.
   */
  previewHostError: string | null;
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
  isInAppPreviewOpen: false,
  isPreviewHostEnabled: false,
  isPreviewHostOpening: false,
  previewHostError: null,
  filterText: '',
  selectedSampleKey: '',
  editorPreviews: [],
  loadedTemplateForTheme: null,
  scopeColorMap: { entries: [] },
  scopeTemplateInputsGeneration: 0,
  editorPreviewsGeneration: 0,
};
