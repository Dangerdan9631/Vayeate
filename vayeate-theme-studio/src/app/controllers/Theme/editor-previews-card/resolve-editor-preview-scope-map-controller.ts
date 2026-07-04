import { singleton } from 'tsyringe';
import { ResolveEditorPreviewScopeMapOperation } from '../../../../domain/operations/Theme/theme-operations/previews/resolve-editor-preview-scope-map-operation';
import { ThemePreviewStore } from '../../../../domain/state/Theme/ui/theme-preview-store';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';

/**
 * Orchestrates editor preview scope-map resolution for the theme UI.
 */
@singleton()
export class ResolveEditorPreviewScopeMapController {
  constructor(
    private readonly resolveEditorPreviewScopeMap: ResolveEditorPreviewScopeMapOperation,
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly themeUiStore: ThemeUiStore,
  ) {}

  /**
   * Reads the current preview inputs and invokes the domain operation.
   * @returns Background-queue continuation for async scope-map resolution.
   */
  run(): void {
    const themeState = this.themeUiStore.getStore().state;
    const previewState = this.themePreviewStore.getStore().state;

    this.resolveEditorPreviewScopeMap.execute({
      mappings: previewState.loadedTemplateForTheme?.mappings ?? [],
      colorAssignments: themeState.panePreviewColorAssignments,
      contrastAssignments: themeState.theme?.contrastAssignments ?? [],
      contrastVariables: previewState.loadedTemplateForTheme?.contrastVariables ?? [],
      scopeThemeInputsGeneration: themeState.scopeThemeInputsGeneration,
      scopeTemplateInputsGeneration: previewState.scopeTemplateInputsGeneration,
    });
  }
}
