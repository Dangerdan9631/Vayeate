import { singleton } from 'tsyringe';
import { themeDataFileKey } from '../../../../../model/Common/data-path-keys';
import { TemplateGateway } from '../../../../../gateway/gateway/Template/template/template-gateway';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import type { Template } from '../../../../../model/Template/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, StyleAssignment, Theme } from '../../../../../model/Theme/schema/theme-schemas';
import { ThemesStore } from '../../../../state/Theme/data/themes-store';
import { ThemePreviewStore } from '../../../../state/Theme/ui/theme-preview-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../../model/Queue/background-queue';

/**
 * Loads theme with linked template from persistence into the store.
 */

@singleton()
export class LoadThemeWithLinkedTemplateOperation {
  constructor(
    private readonly themesStore: ThemesStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly themeGateway: ThemeGateway,
    private readonly templateGateway: TemplateGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load theme with linked template mutation.
   * @param name Name (string).
   * @param version Version (string).
   * @returns Background-queue continuation for chained async work.
   */

  execute(name: string, version: string): ContinuationHandler {
    return this.enqueueBackgroundQueue.execute(
      'data_io',
      `Loading theme ${name} ${version}`,
      async () => {
        const cachedTemplateRef =
          this.themesStore.getStore().state.themeMap[name]?.[version]?.theme?.templateRef ?? null;

        const [loaded, cachedTemplate] = await Promise.all([
          this.themeGateway.loadTheme(name, version),
          cachedTemplateRef
            ? this.templateGateway.loadTemplate(cachedTemplateRef.name, cachedTemplateRef.version)
            : Promise.resolve(null as Template | null),
        ]);

        let template = cachedTemplate;
        const templateRef = loaded?.templateRef ?? null;
        if (templateRef) {
          const templateMatches =
            template != null
            && template.name === templateRef.name
            && template.version === templateRef.version;
          if (!templateMatches) {
            template = await this.templateGateway.loadTemplate(templateRef.name, templateRef.version);
          }
        } else {
          template = null;
        }

        const theme = loaded && template ? this.mergeThemeWithTemplateAssignments(loaded, template) : loaded;
        this.themeUiStore.getStore().setTheme(theme);
        if (theme) {
          this.themesStore.getStore().updateTheme(theme);
        }
        const selectedRef = this.themeUiStore.getStore().state.selectedRef;
        if (selectedRef?.name === name && selectedRef.version === version) {
          this.themeUiStore.getStore().setThemeLoadState(theme ? 'loaded' : 'unloaded');
        }

        this.themePreviewStore.getStore().setLoadedTemplate(template);
      },
      { key: themeDataFileKey(name, version), access: 'read' },
    );
  }

  private mergeThemeWithTemplateAssignments(theme: Theme, template: Template): Theme {
    const templateRef = { name: template.name, version: template.version };

    const existingColorMap = new Map<string, ColorAssignment>();
    for (const assignment of theme.colorAssignments) {
      existingColorMap.set(assignment.colorRef, assignment);
    }
    const colorAssignments: ColorAssignment[] = template.colorVariables.map((variable) => {
      const existing = existingColorMap.get(variable.key);
      return existing ?? { colorRef: variable.key, light: null, dark: null, useDarkForLight: false };
    });

    const existingContrastMap = new Map<string, ContrastAssignment>();
    for (const assignment of theme.contrastAssignments) {
      existingContrastMap.set(assignment.contrastVariableRef, assignment);
    }
    const contrastAssignments: ContrastAssignment[] = template.contrastVariables.map((variable) => {
      const existing = existingContrastMap.get(variable.key);
      return existing ?? { contrastVariableRef: variable.key, light: null, dark: null, useDarkForLight: false };
    });

    const existingStyleMap = new Map<string, StyleAssignment>();
    for (const assignment of theme.styleAssignments ?? []) {
      existingStyleMap.set(assignment.styleVariableRef, assignment);
    }
    const styleAssignments: StyleAssignment[] = (template.styleVariables ?? []).map((variable) => {
      const existing = existingStyleMap.get(variable.key);
      return existing ?? { styleVariableRef: variable.key, light: null, dark: null, useDarkForLight: false };
    });

    const themeTokenKeys = [...new Set(
      template.mappings
        .filter((mapping) => mapping.ignored !== true && mapping.token.type === 'theme' && mapping.colorVariableRef != null)
        .map((mapping) => mapping.token.key),
    )].sort();
    const validTokenRef = (tokenRef: string | null | undefined) =>
      tokenRef != null && themeTokenKeys.includes(tokenRef) ? tokenRef : null;

    return {
      ...theme,
      templateRef,
      idePrimaryTokenRef: validTokenRef(theme.idePrimaryTokenRef),
      ideForegroundTokenRef: validTokenRef(theme.ideForegroundTokenRef),
      themeBackgroundTokenRef: validTokenRef(theme.themeBackgroundTokenRef),
      themeForegroundTokenRef: validTokenRef(theme.themeForegroundTokenRef),
      lineNumberBackgroundTokenRef: validTokenRef(theme.lineNumberBackgroundTokenRef),
      lineNumberForegroundTokenRef: validTokenRef(theme.lineNumberForegroundTokenRef),
      ideTabTokenRef: validTokenRef(theme.ideTabTokenRef),
      ideTabBarBackgroundTokenRef: validTokenRef(theme.ideTabBarBackgroundTokenRef),
      ideTabBarForegroundTokenRef: validTokenRef(theme.ideTabBarForegroundTokenRef),
      editorPreviewScrollbarBackgroundTokenRef: validTokenRef(theme.editorPreviewScrollbarBackgroundTokenRef),
      editorPreviewScrollbarForegroundTokenRef: validTokenRef(theme.editorPreviewScrollbarForegroundTokenRef),
      editorPreviewSelectionBackgroundTokenRef: validTokenRef(theme.editorPreviewSelectionBackgroundTokenRef),
      editorPreviewMenuForegroundTokenRef: validTokenRef(theme.editorPreviewMenuForegroundTokenRef),
      editorPreviewMenuBackgroundTokenRef: validTokenRef(theme.editorPreviewMenuBackgroundTokenRef),
      colorAssignments,
      contrastAssignments,
      styleAssignments,
    };
  }
}
