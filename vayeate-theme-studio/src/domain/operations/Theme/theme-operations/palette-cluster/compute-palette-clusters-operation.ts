import { singleton } from 'tsyringe';
import { ClusteringService } from '../../../../../gateway/services/Common/clustering-service';
import { ThemePreviewStore } from '../../../../state/Theme/ui/theme-preview-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';
import { buildPaletteClusterGroupInputs } from '../theme-utils/palette-cluster-inputs-operation';

/**
 * Computes palette clusters from current theme or catalog data.
 */

@singleton()
export class ComputePaletteClustersOperation {
  private requestGeneration = 0;

  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly clusteringService: ClusteringService,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the compute palette clusters mutation.
   * @returns Nothing; the compute work is scheduled on the background queue.
   */

  execute(): void {
    const generation = ++this.requestGeneration;
    const uiState = this.themeUiStore.getStore().state;
    const theme = uiState.theme;
    const template = this.themePreviewStore.getStore().state.loadedTemplateForTheme;

    if (!theme?.templateRef || !template) {
      if (generation !== this.requestGeneration) return;
      this.themeUiStore.getStore().setPaletteClustersByGroup(null);
      return;
    }

    if (
      theme.templateRef.name !== template.name ||
      theme.templateRef.version !== template.version
    ) {
      this.themeUiStore.getStore().setPaletteClustersByGroup(null);
      return;
    }

    const variant = uiState.paletteClusterByDark ? 'dark' : 'light';
    const clusterCountK = uiState.previewClusterCountK ?? theme.paletteClusterCountK ?? 5;
    const groups = buildPaletteClusterGroupInputs(
      uiState.panePreviewColorAssignments,
      template.colorVariables ?? [],
      variant,
      clusterCountK,
    );

    this.themeUiStore.getStore().setPaletteClustersPending(true);

    this.enqueueBackgroundAction.execute(
      'deferred',
      'Computing palette clusters',
      async () => {
        try {
          const clustersByGroup = await this.clusteringService.clusterGroups(groups);
          if (generation !== this.requestGeneration) return;

          if (clustersByGroup !== null) {
            this.themeUiStore.getStore().setPaletteClustersByGroup(clustersByGroup);
          } else {
            this.themeUiStore.getStore().setPaletteClustersPending(false);
          }
        } catch {
          if (generation === this.requestGeneration) {
            this.themeUiStore.getStore().setPaletteClustersPending(false);
          }
        }
      },
    );
  }
}
