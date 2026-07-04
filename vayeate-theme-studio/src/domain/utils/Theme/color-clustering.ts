/**
 * Clusters hex colors in RGB space using k-means; returns one representative
 * (medoid) per cluster and the other members of each cluster.
 */

import type { Rgb } from './color-types';
import { hexToRgb } from './color-hex';

/**
 * One k-means cluster with a medoid representative and member hex colors.
 */
export interface ClusterResult {
  representative: string;
  members: string[];
}

const MAX_ITERATIONS = 50;

function parseHexToRgb(hex: string): Rgb | null {
  try {
    return hexToRgb(hex.trim().startsWith('#') ? hex : `#${hex}`);
  } catch {
    return null;
  }
}

function squaredDistance(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function meanRgb(points: Rgb[]): Rgb {
  if (points.length === 0) return { r: 0, g: 0, b: 0 };
  const n = points.length;
  let r = 0, g = 0, b = 0;
  for (const p of points) {
    r += p.r;
    g += p.g;
    b += p.b;
  }
  return { r: r / n, g: g / n, b: b / n };
}

/**
 * Clusters hex colors in RGB space and returns one medoid representative per cluster.
 *
 * @param hexColors - Input hex strings; invalid and duplicate values are skipped.
 * @param options - Optional `maxClusters` cap (default 5).
 * @returns Cluster results with representative and member hex lists.
 */
export function clusterColors(
  hexColors: string[],
  options?: { maxClusters?: number },
): ClusterResult[] {
  const maxClusters = options?.maxClusters ?? 5;
  const parsed: { hex: string; rgb: Rgb }[] = [];
  const seen = new Set<string>();

  for (const raw of hexColors) {
    const normalized = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`;
    const lower = normalized.toLowerCase();
    if (seen.has(lower)) continue;
    const rgb = parseHexToRgb(normalized);
    if (rgb) {
      seen.add(lower);
      parsed.push({ hex: normalized, rgb });
    }
  }

  if (parsed.length === 0) return [];
  if (parsed.length === 1) {
    return [{ representative: parsed[0].hex, members: [] }];
  }

  const k = Math.min(parsed.length, Math.max(1, maxClusters));
  const n = parsed.length;
  const rgbPoints = parsed.map((p) => p.rgb);

  // Initialize centroids: spread first k points (or k-means++ style: first, then farthest)
  const centroids: Rgb[] = [];
  const indices = new Set<number>();
  indices.add(0);
  centroids.push({ ...rgbPoints[0] });

  for (let c = 1; c < k; c++) {
    let bestIdx = -1;
    let bestDist = -1;
    for (let i = 0; i < n; i++) {
      if (indices.has(i)) continue;
      let minDist = Infinity;
      for (const cen of centroids) {
        const d = squaredDistance(rgbPoints[i], cen);
        if (d < minDist) minDist = d;
      }
      if (minDist > bestDist) {
        bestDist = minDist;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      indices.add(bestIdx);
      centroids.push({ ...rgbPoints[bestIdx] });
    }
  }

  const assignment = new Uint32Array(n);

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = squaredDistance(rgbPoints[i], centroids[0]);
      for (let c = 1; c < centroids.length; c++) {
        const d = squaredDistance(rgbPoints[i], centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      assignment[i] = best;
    }

    const newCentroids: Rgb[] = [];
    for (let c = 0; c < k; c++) {
      const cluster: Rgb[] = [];
      for (let i = 0; i < n; i++) {
        if (assignment[i] === c) cluster.push(rgbPoints[i]);
      }
      newCentroids.push(cluster.length > 0 ? meanRgb(cluster) : centroids[c]);
    }

    let stable = true;
    for (let c = 0; c < k; c++) {
      if (squaredDistance(centroids[c], newCentroids[c]) > 1e-10) {
        stable = false;
        break;
      }
    }
    for (let c = 0; c < k; c++) centroids[c] = newCentroids[c];
    if (stable) break;
  }

  // Build clusters (hex per index)
  const clusters: { hex: string; rgb: Rgb }[][] = [];
  for (let c = 0; c < k; c++) clusters.push([]);
  for (let i = 0; i < n; i++) {
    clusters[assignment[i]].push(parsed[i]);
  }

  const results: ClusterResult[] = [];
  for (const cluster of clusters) {
    if (cluster.length === 0) continue;
    if (cluster.length === 1) {
      results.push({ representative: cluster[0].hex, members: [] });
      continue;
    }
    // Medoid: point with smallest sum of squared distances to others
    let bestIdx = 0;
    let bestSum = Infinity;
    for (let i = 0; i < cluster.length; i++) {
      let sum = 0;
      for (let j = 0; j < cluster.length; j++) {
        if (i !== j) sum += squaredDistance(cluster[i].rgb, cluster[j].rgb);
      }
      if (sum < bestSum) {
        bestSum = sum;
        bestIdx = i;
      }
    }
    const representative = cluster[bestIdx].hex;
    const members = cluster.filter((_, i) => i !== bestIdx).map((p) => p.hex);
    results.push({ representative, members });
  }

  return results;
}
