import { singleton } from 'tsyringe';
import { themeDataFileKey } from '../../../../model/data-path-keys';
import { TemplateGateway } from '../../../../gateway/template/template-gateway';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import type { Template } from '../../../../model/schema/template-schemas';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemePreviewStore } from '../../../state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';

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

        const theme = loaded && template ? mergeAssignmentsFromTemplate(loaded, template) : loaded;
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
}
