/**
 * Worker-safe color clustering helpers. This module deliberately has no DI,
 * store, or operation-wrapper imports so it can run in a Web Worker.
 */

export interface ClusterResult {
  representative: string;
  members: string[];
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const MAX_ITERATIONS = 50;

function parseHexToRgb(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, '');
  const expanded = value.length === 3 ? value.split('').map((channel) => channel + channel).join('') : value;
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return null;
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16) / 255,
    g: Number.parseInt(expanded.slice(2, 4), 16) / 255,
    b: Number.parseInt(expanded.slice(4, 6), 16) / 255,
  };
}

function squaredDistance(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function meanRgb(points: Rgb[]): Rgb {
  if (points.length === 0) return { r: 0, g: 0, b: 0 };
  const total = points.reduce(
    (sum, point) => ({ r: sum.r + point.r, g: sum.g + point.g, b: sum.b + point.b }),
    { r: 0, g: 0, b: 0 },
  );
  return { r: total.r / points.length, g: total.g / points.length, b: total.b / points.length };
}

/**
 * Clusters unique valid hex colors in RGB space and returns a medoid per cluster.
 */
export function clusterColors(hexColors: string[], options?: { maxClusters?: number }): ClusterResult[] {
  const parsed: Array<{ hex: string; rgb: Rgb }> = [];
  const seen = new Set<string>();
  for (const raw of hexColors) {
    const hex = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`;
    const key = hex.toLowerCase();
    if (seen.has(key)) continue;
    const rgb = parseHexToRgb(hex);
    if (!rgb) continue;
    seen.add(key);
    parsed.push({ hex, rgb });
  }

  if (parsed.length === 0) return [];
  if (parsed.length === 1) return [{ representative: parsed[0].hex, members: [] }];

  const k = Math.min(parsed.length, Math.max(1, options?.maxClusters ?? 5));
  const points = parsed.map((item) => item.rgb);
  const centroids: Rgb[] = [{ ...points[0] }];
  const selected = new Set([0]);
  for (let clusterIndex = 1; clusterIndex < k; clusterIndex++) {
    let farthestIndex = -1;
    let farthestDistance = -1;
    for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
      if (selected.has(pointIndex)) continue;
      const nearestDistance = Math.min(...centroids.map((centroid) => squaredDistance(points[pointIndex], centroid)));
      if (nearestDistance > farthestDistance) {
        farthestDistance = nearestDistance;
        farthestIndex = pointIndex;
      }
    }
    selected.add(farthestIndex);
    centroids.push({ ...points[farthestIndex] });
  }

  const assignments = new Uint32Array(points.length);
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
      let nearest = 0;
      let nearestDistance = squaredDistance(points[pointIndex], centroids[0]);
      for (let clusterIndex = 1; clusterIndex < centroids.length; clusterIndex++) {
        const distance = squaredDistance(points[pointIndex], centroids[clusterIndex]);
        if (distance < nearestDistance) {
          nearest = clusterIndex;
          nearestDistance = distance;
        }
      }
      assignments[pointIndex] = nearest;
    }

    const nextCentroids = Array.from({ length: k }, (_, clusterIndex) =>
      meanRgb(points.filter((_, pointIndex) => assignments[pointIndex] === clusterIndex)),
    );
    const stable = centroids.every((centroid, index) => squaredDistance(centroid, nextCentroids[index]) <= 1e-10);
    centroids.splice(0, centroids.length, ...nextCentroids.map((centroid, index) =>
      centroid.r === 0 && centroid.g === 0 && centroid.b === 0 && !points.some((_, pointIndex) => assignments[pointIndex] === index)
        ? centroids[index]
        : centroid,
    ));
    if (stable) break;
  }

  const clusters = Array.from({ length: k }, () => [] as Array<{ hex: string; rgb: Rgb }>);
  for (let index = 0; index < parsed.length; index++) clusters[assignments[index]].push(parsed[index]);
  return clusters.flatMap((cluster) => {
    if (cluster.length === 0) return [];
    let representativeIndex = 0;
    let bestSum = Infinity;
    for (let index = 0; index < cluster.length; index++) {
      const sum = cluster.reduce((total, item, otherIndex) =>
        total + (index === otherIndex ? 0 : squaredDistance(cluster[index].rgb, item.rgb)), 0);
      if (sum < bestSum) {
        bestSum = sum;
        representativeIndex = index;
      }
    }
    return [{
      representative: cluster[representativeIndex].hex,
      members: cluster.filter((_, index) => index !== representativeIndex).map((item) => item.hex),
    }];
  });
}
