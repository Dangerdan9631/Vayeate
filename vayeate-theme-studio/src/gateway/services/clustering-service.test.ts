// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ClusteringService } from './clustering-service';

describe('ClusteringService', () => {
  it('clusters groups synchronously when Worker is unavailable', async () => {
    const service = new ClusteringService();
    const result = await service.clusterGroups([
      {
        groupKey: 'g1',
        hexes: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
        maxClusters: 2,
      },
      {
        groupKey: 'g2',
        hexes: ['#111111', '#222222'],
        maxClusters: 3,
      },
    ]);

    expect(result).not.toBeNull();
    expect(result!.g1.length).toBeGreaterThan(0);
    expect(result!.g1.length).toBeLessThanOrEqual(2);
    expect(result!.g2.length).toBeGreaterThan(0);
    expect(result!.g2.length).toBeLessThanOrEqual(2);
    expect(result!.g2[0]?.representative).toBeTruthy();
  });

  it('returns null for superseded requests when a newer call is made', async () => {
    const service = new ClusteringService();
    const slow = service.clusterGroups([
      { groupKey: 'slow', hexes: ['#010101', '#020202', '#030303'], maxClusters: 2 },
    ]);
    const fast = service.clusterGroups([
      { groupKey: 'fast', hexes: ['#ffffff'], maxClusters: 1 },
    ]);

    const [slowResult, fastResult] = await Promise.all([slow, fast]);
    expect(fastResult).not.toBeNull();
    expect(fastResult!.fast).toHaveLength(1);
    expect(slowResult).toBeNull();
  });
});
