import { clusterColors, type ClusterResult } from '../../domain/utils/color-clustering';
import type { PaletteClusterGroupInput } from '../../domain/utils/palette-cluster-inputs';

export interface ClusterWorkerRequest {
  type: 'cluster';
  sequence: number;
  groups: PaletteClusterGroupInput[];
}

export interface ClusterWorkerResponse {
  type: 'cluster-result';
  sequence: number;
  clustersByGroup: Record<string, ClusterResult[]>;
}

self.onmessage = (event: MessageEvent<ClusterWorkerRequest>) => {
  const message = event.data;
  if (message.type !== 'cluster') return;

  const clustersByGroup: Record<string, ClusterResult[]> = {};
  for (const group of message.groups) {
    clustersByGroup[group.groupKey] = clusterColors(group.hexes, { maxClusters: group.maxClusters });
  }

  const response: ClusterWorkerResponse = {
    type: 'cluster-result',
    sequence: message.sequence,
    clustersByGroup,
  };
  self.postMessage(response);
};
