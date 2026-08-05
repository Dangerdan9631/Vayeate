import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { ComputePaletteClustersOperation } from '../../src/domain/operations/Theme/theme-operations/palette-cluster/compute-palette-clusters-operation';
import type { ClusteringService } from '../../src/gateway/services/Common/clustering-service';
import type { ThemePreviewStore } from '../../src/domain/state/Theme/ui/theme-preview-store';
import type { ThemeUiStore } from '../../src/domain/state/Theme/ui/theme-ui-store';
import type { EnqueueBackgroundQueueActionOperation } from '../../src/domain/operations/Queue/background-queue/enqueue-background-queue-action-operation';

describe('ComputePaletteClustersOperation', () => {
  it('schedules clustering without awaiting it on the action queue', async () => {
    const setPaletteClustersPending = vi.fn();
    const setPaletteClustersByGroup = vi.fn();
    const clusterGroups = vi.fn().mockResolvedValue({ ui: [] });
    let scheduledWork: (() => Promise<void>) | undefined;
    const enqueue = vi.fn(
      (_queue: string, _description: string, run: () => Promise<void>) => {
        scheduledWork = run;
      },
    );

    const operation = new ComputePaletteClustersOperation(
      {
        getStore: () => ({
          state: {
            theme: {
              templateRef: { name: 'template', version: '1.0.0' },
              paletteClusterCountK: 5,
            },
            paletteClusterByDark: true,
            previewClusterCountK: null,
            panePreviewColorAssignments: [],
          },
          setPaletteClustersPending,
          setPaletteClustersByGroup,
        }),
      } as unknown as ThemeUiStore,
      {
        getStore: () => ({
          state: {
            loadedTemplateForTheme: {
              name: 'template',
              version: '1.0.0',
              colorVariables: [],
            },
          },
        }),
      } as unknown as ThemePreviewStore,
      { clusterGroups } as unknown as ClusteringService,
      { execute: enqueue } as unknown as EnqueueBackgroundQueueActionOperation,
    );

    operation.execute();

    expect(enqueue).toHaveBeenCalledWith('deferred', 'Computing palette clusters', expect.any(Function));
    expect(clusterGroups).not.toHaveBeenCalled();
    expect(setPaletteClustersPending).toHaveBeenCalledWith(true);

    await scheduledWork?.();

    expect(clusterGroups).toHaveBeenCalledOnce();
    expect(setPaletteClustersByGroup).toHaveBeenCalledWith({ ui: [] });
  });
});
