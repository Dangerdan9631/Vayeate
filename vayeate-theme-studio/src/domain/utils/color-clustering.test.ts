import { describe, it, expect } from 'vitest';
import { clusterColors } from './color-clustering';

describe('clusterColors', () => {
  it('returns empty array for empty input', () => {
    expect(clusterColors([])).toEqual([]);
  });

  it('returns one cluster with no members for single color', () => {
    const result = clusterColors(['#ff0000']);
    expect(result).toHaveLength(1);
    expect(result[0].representative).toBe('#ff0000');
    expect(result[0].members).toEqual([]);
  });

  it('returns one cluster for three identical colors', () => {
    const result = clusterColors(['#00ff00', '#00ff00', '#00ff00'], { maxClusters: 3 });
    expect(result).toHaveLength(1);
    expect(result[0].representative).toBe('#00ff00');
    expect(result[0].members).toHaveLength(0);
  });

  it('returns three clusters for three far-apart colors with k=3', () => {
    const result = clusterColors(
      ['#ff0000', '#00ff00', '#0000ff'],
      { maxClusters: 3 },
    );
    expect(result).toHaveLength(3);
    const allHexes = result.flatMap((c) => [c.representative, ...c.members]);
    expect(allHexes).toContain('#ff0000');
    expect(allHexes).toContain('#00ff00');
    expect(allHexes).toContain('#0000ff');
    result.forEach((cluster) => {
      expect([cluster.representative, ...cluster.members]).toHaveLength(
        cluster.members.length + 1,
      );
    });
  });

  it('representative is one of the input colors', () => {
    const hexes = ['#ff0000', '#fe0000', '#fd0000', '#00ff00', '#0000ff'];
    const result = clusterColors(hexes, { maxClusters: 3 });
    const allInput = new Set(hexes.map((h) => h.toLowerCase()));
    result.forEach((cluster) => {
      expect(allInput.has(cluster.representative.toLowerCase())).toBe(true);
      cluster.members.forEach((m) => {
        expect(allInput.has(m.toLowerCase())).toBe(true);
      });
    });
  });

  it('caps k at number of unique colors', () => {
    const result = clusterColors(['#111', '#222'], { maxClusters: 10 });
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('skips invalid hex and dedupes', () => {
    const result = clusterColors(['#fff', 'nothex', '#fff', '#000'], { maxClusters: 5 });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('default maxClusters is 5', () => {
    const many = ['#100', '#200', '#300', '#400', '#500', '#600', '#700', '#800'];
    const result = clusterColors(many);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('respects maxClusters option', () => {
    const many = [
      '#100000', '#200000', '#300000', '#400000', '#500000',
      '#600000', '#700000', '#800000', '#900000', '#a00000',
    ];
    const result = clusterColors(many, { maxClusters: 3 });
    expect(result.length).toBeLessThanOrEqual(3);
  });
});
