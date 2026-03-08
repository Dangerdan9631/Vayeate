import { useMemo, useState } from 'react';
import type { ColorAssignment, ColorVariable } from '../../model/schemas';
import { clusterColors } from '../../core/color-clustering';

const UNGROUPED_KEY = '__ungrouped__';

const CLUSTER_K_MIN = 1;
const CLUSTER_K_MAX = 12;
const CLUSTER_K_DEFAULT = 5;

interface ThemePaletteCardProps {
  hueAdjustment: number;
  onHueChange: (value: number) => void;
  onCommit: () => void;
  onRevert: () => void;
  colorAssignments: readonly ColorAssignment[];
  colorVariables: readonly ColorVariable[];
  groups: readonly string[];
}

function sortedGroupKeys(byGroup: Map<string, unknown[]>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(UNGROUPED_KEY);
  return hasUngrouped ? [...named, UNGROUPED_KEY] : named;
}

function buildColorAssignmentsByGroup(
  assignments: readonly ColorAssignment[],
  colorVariables: readonly ColorVariable[],
): Map<string, ColorAssignment[]> {
  const varMap = new Map(colorVariables.map((v) => [v.key, v]));
  const byGroup = new Map<string, ColorAssignment[]>();
  for (const a of assignments) {
    const groupRef = varMap.get(a.colorRef)?.groupRef ?? null;
    const groupKey = groupRef ?? UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(a);
  }
  return byGroup;
}

function collectHexForGroup(assignments: readonly ColorAssignment[]): string[] {
  const hexes: string[] = [];
  const seen = new Set<string>();
  for (const a of assignments) {
    if (a.dark?.value) {
      const h = a.dark.value.toLowerCase();
      if (!seen.has(h)) {
        seen.add(h);
        hexes.push(a.dark.value);
      }
    }
    if (!a.useDarkForLight && a.light?.value) {
      const h = a.light.value.toLowerCase();
      if (!seen.has(h)) {
        seen.add(h);
        hexes.push(a.light.value);
      }
    }
  }
  return hexes;
}

export function ThemePaletteCard({
  hueAdjustment,
  onHueChange,
  onCommit,
  onRevert,
  colorAssignments,
  colorVariables,
  groups: _groups,
}: ThemePaletteCardProps) {
  const showCommitRevert = hueAdjustment !== 0;
  const [clusterCountK, setClusterCountK] = useState(CLUSTER_K_DEFAULT);

  const byGroup = useMemo(
    () => buildColorAssignmentsByGroup(colorAssignments, colorVariables),
    [colorAssignments, colorVariables],
  );
  const groupKeysInOrder = useMemo(() => sortedGroupKeys(byGroup), [byGroup]);

  const clustersByGroup = useMemo(() => {
    const map = new Map<string, ReturnType<typeof clusterColors>>();
    for (const groupKey of groupKeysInOrder) {
      const groupAssignments = byGroup.get(groupKey) ?? [];
      const hexes = collectHexForGroup(groupAssignments);
      map.set(groupKey, clusterColors(hexes, { maxClusters: clusterCountK }));
    }
    return map;
  }, [byGroup, groupKeysInOrder, clusterCountK]);

  return (
    <div className="catalog-details-card placeholder theme-palette-card">
      <h2>Theme Palette</h2>
      <div className="theme-palette-hue-row">
        <label htmlFor="theme-palette-hue-slider" className="theme-palette-hue-label">
          Hue Adjustment
        </label>
        {showCommitRevert && (
          <div className="theme-palette-actions">
            <button type="button" className="theme-palette-btn" onClick={onRevert} aria-label="Revert hue adjustment">
              Revert
            </button>
            <button type="button" className="theme-palette-btn" onClick={onCommit} aria-label="Commit hue adjustment">
              Commit
            </button>
          </div>
        )}
      </div>
      <div className="theme-palette-slider-wrap">
        <input
          id="theme-palette-hue-slider"
          type="range"
          className="theme-palette-hue-slider"
          min={-100}
          max={100}
          step={1}
          value={hueAdjustment}
          onChange={(e) => onHueChange(Number(e.target.value))}
          aria-label="Hue adjustment"
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={hueAdjustment}
        />
      </div>

      <div className="theme-palette-k-row">
        <label htmlFor="theme-palette-k-slider" className="theme-palette-k-label">
          Cluster count (k)
        </label>
        <div className="theme-palette-k-slider-wrap">
          <input
            id="theme-palette-k-slider"
            type="range"
            className="theme-palette-k-slider"
            min={CLUSTER_K_MIN}
            max={CLUSTER_K_MAX}
            step={1}
            value={clusterCountK}
            onChange={(e) => setClusterCountK(Number(e.target.value))}
            aria-label="Cluster count (k)"
            aria-valuemin={CLUSTER_K_MIN}
            aria-valuemax={CLUSTER_K_MAX}
            aria-valuenow={clusterCountK}
          />
        </div>
        <span className="theme-palette-k-value" aria-hidden>{clusterCountK}</span>
      </div>

      <div className="theme-palette-scroll">
        <div className="theme-palette-swatches-wrap">
          {groupKeysInOrder.map((groupKey) => {
            const clusters = clustersByGroup.get(groupKey) ?? [];
            if (clusters.length === 0) return null;
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const renderClusterColumn = (cluster: ReturnType<typeof clusterColors>[0], key: string) => (
              <div key={key} className="theme-palette-cluster-column">
                <div
                  className="theme-palette-swatch theme-palette-swatch-primary"
                  style={{ backgroundColor: cluster.representative }}
                  title={cluster.representative}
                  aria-label={`Primary ${cluster.representative}`}
                />
                <div className="theme-palette-member-swatches">
                  {cluster.members.map((hex, midx) => (
                    <div
                      key={midx}
                      className="theme-palette-swatch theme-palette-swatch-member"
                      style={{ backgroundColor: hex }}
                      title={hex}
                      aria-label={hex}
                    />
                  ))}
                </div>
              </div>
            );
            return (
              <div key={groupKey} className="theme-palette-group-block">
                <div className="theme-palette-group-label-inline">{groupLabel}</div>
                <div className="theme-palette-group-swatches-row">
                  {clusters.map((cluster, idx) =>
                    renderClusterColumn(cluster, String(idx)),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
