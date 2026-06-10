import { singleton } from 'tsyringe';
import { ClusteringService } from '../../../../gateway/services/clustering-service';
import { ThemePreviewStore } from '../../../state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { buildPaletteClusterGroupInputs } from '../../../utils/palette-cluster-inputs';

@singleton()
export class ComputePaletteClustersOperation {
  private requestGeneration = 0;

  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly clusteringService: ClusteringService,
  ) {}

  async execute(): Promise<void> {
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
      return;
    }

    const variant = uiState.paletteClusterByDark ? 'dark' : 'light';
    const clusterCountK = uiState.previewClusterCountK ?? theme.paletteClusterCountK ?? 5;
    const groups = buildPaletteClusterGroupInputs(
      uiState.paneDisplayColorAssignments,
      template.colorVariables ?? [],
      variant,
      clusterCountK,
    );

    this.themeUiStore.getStore().setPaletteClustersPending(true);

    const clustersByGroup = await this.clusteringService.clusterGroups(groups);
    if (generation !== this.requestGeneration) return;

    if (clustersByGroup !== null) {
      this.themeUiStore.getStore().setPaletteClustersByGroup(clustersByGroup);
    } else {
      this.themeUiStore.getStore().setPaletteClustersPending(false);
    }
  }
}
