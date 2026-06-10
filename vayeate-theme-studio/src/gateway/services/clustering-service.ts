import { singleton } from 'tsyringe';
import { clusterColors, type ClusterResult } from '../../domain/utils/color-clustering';
import type { PaletteClusterGroupInput } from '../../domain/utils/palette-cluster-inputs';
import type { ClusterWorkerRequest, ClusterWorkerResponse } from './clustering-worker';

@singleton()
export class ClusteringService {
  private worker: Worker | null = null;
  private sequence = 0;
  private latestSequence = 0;

  /**
   * Cluster each group's hex colors off the main thread. Returns null when a
   * newer request superseded this one before the worker responded.
   */
  clusterGroups(groups: PaletteClusterGroupInput[]): Promise<Record<string, ClusterResult[]> | null> {
    const seq = ++this.sequence;
    this.latestSequence = seq;

    if (typeof Worker === 'undefined') {
      return new Promise((resolve) => {
        queueMicrotask(() => {
          const result = this.clusterGroupsSync(groups);
          resolve(seq !== this.latestSequence ? null : result);
        });
      });
    }

    return new Promise((resolve, reject) => {
      const worker = this.getWorker();

      const onMessage = (event: MessageEvent<ClusterWorkerResponse>) => {
        const message = event.data;
        if (message.type !== 'cluster-result' || message.sequence !== seq) return;
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        if (seq !== this.latestSequence) {
          resolve(null);
          return;
        }
        resolve(message.clustersByGroup);
      };

      const onError = (event: ErrorEvent) => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        reject(event.error ?? new Error(event.message));
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      const request: ClusterWorkerRequest = { type: 'cluster', sequence: seq, groups };
      worker.postMessage(request);
    });
  }

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./clustering-worker.ts', import.meta.url), { type: 'module' });
    }
    return this.worker;
  }

  private clusterGroupsSync(groups: PaletteClusterGroupInput[]): Record<string, ClusterResult[]> {
    const clustersByGroup: Record<string, ClusterResult[]> = {};
    for (const group of groups) {
      clustersByGroup[group.groupKey] = clusterColors(group.hexes, { maxClusters: group.maxClusters });
    }
    return clustersByGroup;
  }
}
