import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ColorAssignment, ColorVariable } from '../../model/schemas';
import { clusterColors } from '../../core/color-clustering';
import type { SelectedColorsDisplay } from '../../viewmodel/use-theme-viewmodel';
import type { ThemePaneState } from '../context/UndoContext';
import { isEyedropperSupported, pickColorFromScreen } from '../utils/eyedropper';
import { TriStateCheckbox, type TriState } from './TriStateCheckbox';

const UNGROUPED_KEY = '__ungrouped__';

const CLUSTER_K_MIN = 1;
const CLUSTER_K_MAX = 12;
const CLUSTER_K_DEFAULT = 5;

function normalizeHex(hex: string): string {
  const s = hex.trim().toLowerCase();
  return s.startsWith('#') ? s : `#${s}`;
}

interface ThemePaletteCardProps {
  hueAdjustment: number;
  onHueChange: (value: number) => void;
  onRecenter: () => void;
  onHueDragStart?: () => void;
  onHueDragEnd?: () => void;
  applyToDark: boolean;
  applyToLight: boolean;
  onApplyToDarkChange: (checked: boolean) => void;
  onApplyToLightChange: (checked: boolean) => void;
  colorAssignments: readonly ColorAssignment[];
  colorVariables: readonly ColorVariable[];
  groups: readonly string[];
  checkedColorRefs: ReadonlySet<string>;
  onSetColorGroupChecked: (groupKey: string, checked: boolean) => void;
  onSetColorRefsChecked: (refs: string[], checked: boolean) => void;
  selectedColorsDisplay: SelectedColorsDisplay;
  onSetSelectedColors: (hex: string) => void;
  /** When set, color picker uses preview-on-change and one undo on close. */
  onColorPickerOpen?: () => ThemePaneState;
  onSetSelectedColorsPreview?: (hex: string) => void;
  onColorPickerClose?: (snapshot: ThemePaneState) => void;
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

function collectHexForGroupVariant(
  assignments: readonly ColorAssignment[],
  variant: 'light' | 'dark',
): string[] {
  const hexes: string[] = [];
  const seen = new Set<string>();
  for (const a of assignments) {
    if (variant === 'dark') {
      if (a.dark?.value) {
        const h = a.dark.value.toLowerCase();
        if (!seen.has(h)) {
          seen.add(h);
          hexes.push(a.dark.value);
        }
      }
    } else {
      const lightHex = a.useDarkForLight ? a.dark?.value : a.light?.value;
      if (lightHex) {
        const h = lightHex.toLowerCase();
        if (!seen.has(h)) {
          seen.add(h);
          hexes.push(lightHex);
        }
      }
    }
  }
  return hexes;
}

/** Map normalized hex -> color refs that use that hex in their assignment. */
function buildHexToColorRefs(assignments: readonly ColorAssignment[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const a of assignments) {
    const add = (hex: string | null) => {
      if (!hex) return;
      const key = normalizeHex(hex);
      let list = map.get(key);
      if (!list) {
        list = [];
        map.set(key, list);
      }
      if (!list.includes(a.colorRef)) list.push(a.colorRef);
    };
    add(a.dark?.value ?? null);
    if (!a.useDarkForLight) add(a.light?.value ?? null);
  }
  return map;
}

function swatchState(refs: string[], checkedColorRefs: ReadonlySet<string>): TriState {
  if (refs.length === 0) return 'none';
  const all = refs.every((r) => checkedColorRefs.has(r));
  const none = refs.every((r) => !checkedColorRefs.has(r));
  if (all) return 'all';
  if (none) return 'none';
  return 'some';
}

export function ThemePaletteCard({
  hueAdjustment,
  onHueChange,
  onRecenter,
  onHueDragStart,
  onHueDragEnd,
  applyToDark,
  applyToLight,
  onApplyToDarkChange,
  onApplyToLightChange,
  colorAssignments,
  colorVariables,
  groups: _groups,
  checkedColorRefs,
  onSetColorGroupChecked,
  onSetColorRefsChecked,
  selectedColorsDisplay,
  onSetSelectedColors,
  onColorPickerOpen,
  onSetSelectedColorsPreview,
  onColorPickerClose,
}: ThemePaletteCardProps) {
  const showRecenter = hueAdjustment !== 0;
  const isHueDraggingRef = useRef(false);

  const handleHuePointerUp = useCallback(() => {
    if (!isHueDraggingRef.current) return;
    isHueDraggingRef.current = false;
    onHueDragEnd?.();
  }, [onHueDragEnd]);

  useEffect(() => {
    if (!onHueDragEnd) return;
    window.addEventListener('pointerup', handleHuePointerUp);
    window.addEventListener('pointercancel', handleHuePointerUp);
    return () => {
      window.removeEventListener('pointerup', handleHuePointerUp);
      window.removeEventListener('pointercancel', handleHuePointerUp);
    };
  }, [onHueDragEnd, handleHuePointerUp]);
  const [clusterCountK, setClusterCountK] = useState(CLUSTER_K_DEFAULT);
  const [clusterByDark, setClusterByDark] = useState(true);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [colorPickerValue, setColorPickerValue] = useState('#808080');
  const [pendingHex, setPendingHex] = useState<string | null>(null);
  const copyToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paletteColorInputRef = useRef<HTMLInputElement | null>(null);
  const colorPickerSnapshotRef = useRef<ThemePaneState | null>(null);

  useEffect(() => {
    return () => {
      if (copyToastTimeoutRef.current) clearTimeout(copyToastTimeoutRef.current);
    };
  }, []);

  const byGroup = useMemo(
    () => buildColorAssignmentsByGroup(colorAssignments, colorVariables),
    [colorAssignments, colorVariables],
  );
  const groupKeysInOrder = useMemo(() => sortedGroupKeys(byGroup), [byGroup]);

  const hexToRefs = useMemo(
    () => buildHexToColorRefs(colorAssignments),
    [colorAssignments],
  );

  const clustersByGroup = useMemo(() => {
    const map = new Map<string, ReturnType<typeof clusterColors>>();
    const variant = clusterByDark ? 'dark' : 'light';
    for (const groupKey of groupKeysInOrder) {
      const groupAssignments = byGroup.get(groupKey) ?? [];
      const hexes = collectHexForGroupVariant(groupAssignments, variant);
      map.set(groupKey, clusterColors(hexes, { maxClusters: clusterCountK }));
    }
    return map;
  }, [byGroup, groupKeysInOrder, clusterCountK, clusterByDark]);

  const copyHexToClipboard = useCallback((hex: string) => {
    const normalized = normalizeHex(hex);
    navigator.clipboard.writeText(normalized);
    if (copyToastTimeoutRef.current) clearTimeout(copyToastTimeoutRef.current);
    setCopiedHex(normalized);
    copyToastTimeoutRef.current = setTimeout(() => {
      setCopiedHex(null);
      copyToastTimeoutRef.current = null;
    }, 2500);
  }, []);

  const handleSwatchClick = useCallback(
    (hex: string, refsInGroup: ReadonlySet<string>) => {
      const refs = (hexToRefs.get(normalizeHex(hex)) ?? []).filter((r) => refsInGroup.has(r));
      if (refs.length === 0) return;
      const state = swatchState(refs, checkedColorRefs);
      const nextChecked = state !== 'all';
      onSetColorRefsChecked(refs, nextChecked);
    },
    [hexToRefs, checkedColorRefs, onSetColorRefsChecked],
  );

  return (
    <div className="catalog-details-card placeholder theme-palette-card">
      {copiedHex && (
        <div className="theme-palette-copy-toast" role="status" aria-live="polite">
          Copied {copiedHex}
        </div>
      )}
      <div className="theme-palette-header-row">
        <div className="theme-palette-header-left">
          <h2>Theme Palette</h2>
          <label
            className="theme-palette-apply-checkbox theme-icon-checkbox"
            title={
              applyToDark
                ? 'Apply hue adjustments to dark theme colors. Currently on.'
                : 'Apply hue adjustments to dark theme colors. Currently off.'
            }
          >
            <input
              type="checkbox"
              checked={applyToDark}
              onChange={(e) => onApplyToDarkChange(e.target.checked)}
              aria-label="Apply adjustments to dark theme colors"
            />
            <span className="material-symbols-outlined" aria-hidden>dark_mode</span>
          </label>
          <label
            className="theme-palette-apply-checkbox theme-icon-checkbox"
            title={
              applyToLight
                ? 'Apply hue adjustments to light theme colors. Currently on.'
                : 'Apply hue adjustments to light theme colors. Currently off.'
            }
          >
            <input
              type="checkbox"
              checked={applyToLight}
              onChange={(e) => onApplyToLightChange(e.target.checked)}
              aria-label="Apply adjustments to light theme colors"
            />
            <span className="material-symbols-outlined" aria-hidden>light_mode</span>
          </label>
        </div>
        <div className="theme-palette-color-controls">
          <input
            type="text"
            className="field-input theme-color-hex theme-palette-hex-inline"
            placeholder="#000000"
            readOnly={selectedColorsDisplay.kind === 'mixed'}
            value={
              selectedColorsDisplay.kind === 'mixed'
                ? '------'
                : pendingHex !== null
                  ? pendingHex
                  : selectedColorsDisplay.kind === 'single'
                    ? selectedColorsDisplay.hex
                    : ''
            }
            onChange={(e) => setPendingHex(e.target.value)}
            onBlur={(e) => {
              if (selectedColorsDisplay.kind === 'mixed') return;
              const v = e.target.value.trim();
              if (v && /^#?[0-9a-fA-F]{6}$/.test(v.replace(/^#/, ''))) {
                const normalized = v.startsWith('#') ? v : `#${v}`;
                onSetSelectedColors(normalized);
                setColorPickerValue(normalized);
                setPendingHex(null);
              } else {
                setPendingHex(null);
              }
            }}
            aria-label="Hex color"
          />
          <div className="theme-palette-color-swatch-wrap">
            <input
              ref={paletteColorInputRef}
              type="color"
              className="theme-palette-color-input-native"
              value={
                pendingHex !== null && /^#?[0-9a-fA-F]{6}$/.test(pendingHex.replace(/^#/, ''))
                  ? (pendingHex.startsWith('#') ? pendingHex : `#${pendingHex}`).slice(0, 7)
                  : (colorPickerValue.startsWith('#') ? colorPickerValue : `#${colorPickerValue}`).slice(0, 7)
              }
              onChange={(e) => {
                const v = e.target.value;
                setColorPickerValue(v);
                setPendingHex(v);
                if (colorPickerSnapshotRef.current != null && onSetSelectedColorsPreview) {
                  onSetSelectedColorsPreview(v);
                } else {
                  onSetSelectedColors(v);
                }
              }}
              onBlur={() => {
                if (colorPickerSnapshotRef.current != null && onColorPickerClose) {
                  onColorPickerClose(colorPickerSnapshotRef.current);
                  colorPickerSnapshotRef.current = null;
                }
              }}
              disabled={selectedColorsDisplay.kind === 'none'}
              aria-label="Color"
            />
            <button
              type="button"
              className={`theme-palette-color-swatch theme-palette-color-swatch--${selectedColorsDisplay.kind}`}
              title={
                selectedColorsDisplay.kind === 'none'
                  ? 'Select palette swatches to set color'
                  : selectedColorsDisplay.kind === 'mixed'
                    ? 'Selected variables have different colors. Click to set all to one color.'
                    : 'Click to open color picker for selected variables'
              }
              disabled={selectedColorsDisplay.kind === 'none'}
              onClick={() => {
                if (selectedColorsDisplay.kind === 'none') return;
                if (onColorPickerOpen && onSetSelectedColorsPreview && onColorPickerClose) {
                  colorPickerSnapshotRef.current = onColorPickerOpen();
                }
                setColorPickerValue(
                  selectedColorsDisplay.kind === 'single' ? selectedColorsDisplay.hex : '#808080',
                );
                setPendingHex(null);
                paletteColorInputRef.current?.click();
              }}
              aria-label={
                selectedColorsDisplay.kind === 'none'
                  ? 'Select palette swatches to set color'
                  : 'Open color picker for selected variables'
              }
              style={
                selectedColorsDisplay.kind === 'single'
                  ? { backgroundColor: selectedColorsDisplay.hex }
                  : undefined
              }
            />
          </div>
          {isEyedropperSupported() && (
            <button
              type="button"
              className="theme-palette-btn theme-eyedropper-btn"
              disabled={selectedColorsDisplay.kind === 'none'}
              onClick={async () => {
                if (selectedColorsDisplay.kind === 'none') return;
                const hex = await pickColorFromScreen();
                if (hex) {
                  setColorPickerValue(hex);
                  setPendingHex(null);
                  onSetSelectedColors(hex);
                }
              }}
              title="Pick color from anywhere on screen"
              aria-label="Pick color from screen"
            >
              <span className="material-symbols-outlined" aria-hidden>colorize</span>
            </button>
          )}
        </div>
      </div>
      <div className="theme-palette-hue-row">
        <label htmlFor="theme-palette-hue-slider" className="theme-palette-hue-label">
          Hue Adjustment
        </label>
        {showRecenter && (
          <div className="theme-palette-actions">
            <button type="button" className="theme-palette-btn" onClick={onRecenter} aria-label="Recenter hue slider to 0">
              Recenter
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
          onPointerDown={() => {
            isHueDraggingRef.current = true;
            onHueDragStart?.();
          }}
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
        <label
          className="theme-palette-cluster-variant-checkbox theme-icon-checkbox"
          title={
            clusterByDark
              ? 'Swatches show colors from the dark theme. Click to show light theme colors.'
              : 'Swatches show colors from the light theme. Click to show dark theme colors.'
          }
        >
          <input
            type="checkbox"
            checked={clusterByDark}
            onChange={(e) => setClusterByDark(e.target.checked)}
            aria-label={clusterByDark ? 'Cluster by dark theme colors' : 'Cluster by light theme colors'}
          />
          <span className="material-symbols-outlined" aria-hidden>
            {clusterByDark ? 'dark_mode' : 'light_mode'}
          </span>
        </label>
      </div>

      <div className="theme-palette-scroll">
        <div className="theme-palette-swatches-wrap">
          {groupKeysInOrder.map((groupKey) => {
            const clusters = clustersByGroup.get(groupKey) ?? [];
            if (clusters.length === 0) return null;
            const groupAssignments = byGroup.get(groupKey) ?? [];
            const refsInGroup = groupAssignments.map((a) => a.colorRef);
            const refsInGroupSet = new Set(refsInGroup);
            const groupState: TriState =
              refsInGroup.length === 0
                ? 'none'
                : refsInGroup.every((r) => checkedColorRefs.has(r))
                  ? 'all'
                  : refsInGroup.every((r) => !checkedColorRefs.has(r))
                    ? 'none'
                    : 'some';
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const renderClusterColumn = (cluster: ReturnType<typeof clusterColors>[0], key: string) => {
              const primaryRefsAll = hexToRefs.get(normalizeHex(cluster.representative)) ?? [];
              const primaryRefs = primaryRefsAll.filter((r) => refsInGroupSet.has(r));
              const primaryState = swatchState(primaryRefs, checkedColorRefs);
              const primaryBorderClass =
                primaryState === 'all'
                  ? 'theme-palette-swatch-checked'
                  : primaryState === 'some'
                    ? 'theme-palette-swatch-partial'
                    : 'theme-palette-swatch-unchecked';
              return (
                <div key={key} className="theme-palette-cluster-column">
                  <div
                    role="button"
                    tabIndex={0}
                    className={`theme-palette-swatch theme-palette-swatch-primary ${primaryBorderClass}`}
                    style={{ backgroundColor: cluster.representative }}
                    title={
                      primaryRefs.length > 0
                        ? `${normalizeHex(cluster.representative)} — click to toggle variables, right-click to copy\n${primaryRefs.join('\n')}`
                        : `${normalizeHex(cluster.representative)} — click to toggle variables, right-click to copy`
                    }
                    aria-label={`${normalizeHex(cluster.representative)}, ${primaryState} selected. Click to toggle, right-click to copy.`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSwatchClick(cluster.representative, refsInGroupSet);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      copyHexToClipboard(cluster.representative);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSwatchClick(cluster.representative, refsInGroupSet);
                      }
                    }}
                  />
                  <div className="theme-palette-member-swatches">
                    {cluster.members.map((hex, midx) => {
                      const memberRefsAll = hexToRefs.get(normalizeHex(hex)) ?? [];
                      const memberRefs = memberRefsAll.filter((r) => refsInGroupSet.has(r));
                      const memberState = swatchState(memberRefs, checkedColorRefs);
                      const memberBorderClass =
                        memberState === 'all'
                          ? 'theme-palette-swatch-checked'
                          : memberState === 'some'
                            ? 'theme-palette-swatch-partial'
                            : 'theme-palette-swatch-unchecked';
                      return (
                        <div
                          key={midx}
                          role="button"
                          tabIndex={0}
                          className={`theme-palette-swatch theme-palette-swatch-member ${memberBorderClass}`}
                          style={{ backgroundColor: hex }}
                          title={
                            memberRefs.length > 0
                              ? `${normalizeHex(hex)} — click to toggle variables, right-click to copy\n${memberRefs.join('\n')}`
                              : `${normalizeHex(hex)} — click to toggle variables, right-click to copy`
                          }
                          aria-label={`${normalizeHex(hex)}, ${memberState} selected. Click to toggle, right-click to copy.`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSwatchClick(hex, refsInGroupSet);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            copyHexToClipboard(hex);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSwatchClick(hex, refsInGroupSet);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            };
            return (
              <div key={groupKey} className="theme-palette-group-block">
                <div className="theme-palette-group-header">
                  <TriStateCheckbox
                    state={groupState}
                    onChange={(checked) => onSetColorGroupChecked(groupKey, checked)}
                    onClickCapture={(e) => e.stopPropagation()}
                    ariaLabel={`Select all in group: ${groupLabel}`}
                    className="theme-palette-group-checkbox"
                  />
                  <span className="theme-palette-group-label-inline">{groupLabel}</span>
                </div>
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
