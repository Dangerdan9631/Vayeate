import { clusterColors, type ClusterResult } from '../../domain/utils/color-clustering';
import type { PaletteClusterGroupInput } from '../../domain/utils/palette-cluster-inputs';

/**
 * Message posted to the clustering worker to run one batched cluster job.
 */
export interface ClusterWorkerRequest {
  type: 'cluster';
  sequence: number;
  groups: PaletteClusterGroupInput[];
}

/**
 * Message posted back from the worker with clustered results for one sequence.
 */
export interface ClusterWorkerResponse {
  type: 'cluster-result';
  sequence: number;
  clustersByGroup: Record<string, ClusterResult[]>;
}

/**
 * Handles cluster requests by running `clusterColors` per group and posting results.
 */
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
