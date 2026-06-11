import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent
} from 'react';
import type { ColorAssignment } from '../../../model/schema/theme-schemas';
import type { ClusterResult } from '../../../domain/utils/color-clustering';
import {
  buildColorAssignmentsByGroup,
  PALETTE_UNGROUPED_KEY,
  sortedPaletteGroupKeys,
} from '../../../domain/utils/palette-cluster-inputs';
import { hexToHue, hslToRgb } from '../../../domain/utils/color-hsl';
import { rgbToHex } from '../../../domain/utils/color-hex';
import type { ThemePaneState } from '../../../model/theme-pane-state';
import { useThemePaletteCardViewModel } from './use-theme-palette-card-viewmodel';
import { TriStateCheckbox, type TriState } from '../../common/tristate-checkbox/TriStateCheckbox';
import { ThemePaletteClusterColumn } from './ThemePaletteClusterColumn';

/**
 * Build CSS linear-gradient for hue slider track so center (slider 0) matches ref hex hue; full hue cycle with that hue at center and at edges. Uses hex colors to avoid hsl() parsing issues in injected styles.
 */
function hueSliderGradientFromRefHex(refHex: string): string {
  const refHue = hexToHue(refHex);
  const stops: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const p = i / 12;
    const h = ((refHue + (p - 0.5) * 2) % 1 + 1) % 1;
    const pos = Math.round(p * 100);
    const hex = rgbToHex(hslToRgb({ h, s: 1, l: 0.5 }));
    stops.push(`${hex} ${pos}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

const CLUSTER_K_MIN = 1;
const CLUSTER_K_MAX = 12;

function normalizeHex(hex: string): string {
  const s = hex.trim().toLowerCase();
  return s.startsWith('#') ? s : `#${s}`;
}

/**
 * If input looks like a valid hex (3 or 6 digits), return normalized hex for gradient; else null.
 */
function validRefHexForGradient(input: string): string | null {
  const s = input.trim().toLowerCase().replace(/^#/, '');
  if (!/^[0-9a-f]+$/.test(s) || (s.length !== 3 && s.length !== 6)) return null;
  const expanded = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  return `#${expanded}`;
}

/**
 * Map normalized hex -> color refs that use that hex in their assignment.
 */
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

/**
 * Renders the Theme Palette Card UI for the theme editor.
 */
export function ThemePaletteCard() {
  const vm = useThemePaletteCardViewModel();
  const {
    hueAdjustment,
    hueReferenceHex,
    onHueChange,
    onHueReferenceChange,
    onRecenter,
    onHueDragStart,
    onHueDragEnd,
    applyToDark,
    applyToLight,
    onApplyToDarkChange,
    onApplyToLightChange,
    clusterCountK,
    onClusterCountDelta,
    onClusterCountCommit,
    clusterByDark,
    onClusterByDarkChange,
    paletteClustersByGroup,
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
    onHueReferenceEyedropperClick,
    onAssignEyedropperClick,
  } = vm;

  const [hueRefInputValue, setHueRefInputValue] = useState(hueReferenceHex);
  const isHueDraggingRef = useRef(false);
  const hueSliderStyleRef = useRef<HTMLStyleElement | null>(null);

  const hueSliderGradientValue = hueSliderGradientFromRefHex(
    validRefHexForGradient(hueRefInputValue) ?? hueReferenceHex,
  );

  useEffect(() => {
    setHueRefInputValue(hueReferenceHex);
  }, [hueReferenceHex]);

  useEffect(() => {
    const styleEl = hueSliderStyleRef.current;
    if (styleEl) {
      styleEl.textContent = `.theme-palette-slider-wrap{background:${hueSliderGradientValue} !important}#theme-palette-hue-slider::-webkit-slider-runnable-track{background:${hueSliderGradientValue} !important}#theme-palette-hue-slider::-moz-range-track{background:${hueSliderGradientValue} !important}`;
    }
  }, [hueSliderGradientValue]);

  const handleHueRefBlur = useCallback(() => {
    const normalized = normalizeHex(hueRefInputValue) || '#FF0000';
    if (normalized !== hueReferenceHex) {
      onHueReferenceChange(normalized);
    } else {
      setHueRefInputValue(normalized);
    }
  }, [hueRefInputValue, hueReferenceHex, onHueReferenceChange]);

  const handleHueRefKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

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
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [colorPickerValue, setColorPickerValue] = useState('#808080');
  const [pendingHex, setPendingHex] = useState<string | null>(null);
  const copyToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paletteColorInputRef = useRef<HTMLInputElement | null>(null);
  const colorPickerSnapshotRef = useRef<ThemePaneState | null>(null);
  const colorPickerCommitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastColorPickerCommitValueRef = useRef<string | null>(null);
  const primaryClickPendingRef = useRef<{
    timeoutId: ReturnType<typeof setTimeout>;
    clusterKey: string;
    stateAtFirstClick: TriState;
    allRefsInCluster: string[];
    primaryHex: string;
    refsInGroupSet: ReadonlySet<string>;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (copyToastTimeoutRef.current) clearTimeout(copyToastTimeoutRef.current);
      if (colorPickerCommitTimeoutRef.current) clearTimeout(colorPickerCommitTimeoutRef.current);
      if (primaryClickPendingRef.current) {
        clearTimeout(primaryClickPendingRef.current.timeoutId);
        primaryClickPendingRef.current = null;
      }
    };
  }, []);

  const byGroup = useMemo(
    () => buildColorAssignmentsByGroup(colorAssignments, colorVariables),
    [colorAssignments, colorVariables],
  );
  const groupKeysInOrder = useMemo(() => sortedPaletteGroupKeys(byGroup), [byGroup]);

  const hexToRefs = useMemo(
    () => buildHexToColorRefs(colorAssignments),
    [colorAssignments],
  );

  const clustersByGroup = useMemo((): Map<string, ClusterResult[]> => {
    if (!paletteClustersByGroup) return new Map();
    return new Map<string, ClusterResult[]>(Object.entries(paletteClustersByGroup));
  }, [paletteClustersByGroup]);

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
  const handleApplyToDarkChangeChecked = (checked: boolean) => onApplyToDarkChange(checked);
  const handleApplyToLightChangeChecked = (checked: boolean) => onApplyToLightChange(checked);
  const handleHueRefInputValueChange = (value: string) => setHueRefInputValue(value);
  const handleHueChangeValue = (value: string) => onHueChange(Number(value));
  const handleHuePointerDown = () => {
    isHueDraggingRef.current = true;
    onHueDragStart?.();
  };
  const handleClusterCountDeltaValue = (value: string) => onClusterCountDelta(Number(value));
  const handleClusterCountCommitCurrent = () => onClusterCountCommit(clusterCountK);
  const handleClusterByDarkChecked = (checked: boolean) => onClusterByDarkChange(checked);
  const handleHueReferenceEyedropper = onHueReferenceEyedropperClick;

  function onApplyToDarkCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    handleApplyToDarkChangeChecked(e.target.checked);
  }

  function onApplyToLightCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    handleApplyToLightChangeChecked(e.target.checked);
  }

  function onPendingHexInputChange(e: ChangeEvent<HTMLInputElement>) {
    setPendingHex(e.target.value);
  }

  function onPendingHexInputBlur(e: FocusEvent<HTMLInputElement>) {
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
  }

  function commitNativeColorPicker(value: string, closePicker: boolean) {
    if (colorPickerCommitTimeoutRef.current) {
      clearTimeout(colorPickerCommitTimeoutRef.current);
      colorPickerCommitTimeoutRef.current = null;
    }
    if (colorPickerSnapshotRef.current != null && onColorPickerClose) {
      if (lastColorPickerCommitValueRef.current !== value) {
        onColorPickerClose(colorPickerSnapshotRef.current, value);
        lastColorPickerCommitValueRef.current = value;
      }
      if (closePicker) colorPickerSnapshotRef.current = null;
    }
  }

  function scheduleNativeColorPickerCommit(value: string) {
    if (colorPickerCommitTimeoutRef.current) clearTimeout(colorPickerCommitTimeoutRef.current);
    colorPickerCommitTimeoutRef.current = setTimeout(() => {
      colorPickerCommitTimeoutRef.current = null;
      commitNativeColorPicker(value, false);
    }, 1200);
  }

  function onPaletteNativeColorInputInput(e: FormEvent<HTMLInputElement>) {
    const v = e.currentTarget.value;
    setColorPickerValue(v);
    setPendingHex(v);
    if (colorPickerSnapshotRef.current != null && onSetSelectedColorsPreview) {
      onSetSelectedColorsPreview(v);
    } else {
      onSetSelectedColors(v);
    }
  }

  function onPaletteNativeColorInputChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setColorPickerValue(v);
    setPendingHex(v);
    if (colorPickerSnapshotRef.current != null && onSetSelectedColorsPreview) {
      onSetSelectedColorsPreview(v);
      scheduleNativeColorPickerCommit(v);
      return;
    }
    onSetSelectedColors(v);
  }

  function onPaletteNativeColorInputBlur(e: FocusEvent<HTMLInputElement>) {
    commitNativeColorPicker(e.target.value, true);
  }

  function onPaletteColorSwatchButtonClick() {
    if (selectedColorsDisplay.kind === 'none') return;
    if (colorPickerCommitTimeoutRef.current) {
      clearTimeout(colorPickerCommitTimeoutRef.current);
      colorPickerCommitTimeoutRef.current = null;
    }
    colorPickerSnapshotRef.current = onColorPickerOpen();
    lastColorPickerCommitValueRef.current = null;
    setColorPickerValue(
      selectedColorsDisplay.kind === 'single' ? selectedColorsDisplay.hex : '#808080',
    );
    setPendingHex(null);
    paletteColorInputRef.current?.click();
  }

  function onAssignEyedropperButtonClick() {
    if (selectedColorsDisplay.kind === 'none') return;
    const firstRef = [...checkedColorRefs][0];
    if (!firstRef) return;
    onAssignEyedropperClick();
  }

  function onHueRefInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleHueRefInputValueChange(e.target.value);
  }

  function onHueSliderChange(e: ChangeEvent<HTMLInputElement>) {
    handleHueChangeValue(e.target.value);
  }

  function onClusterCountSliderChange(e: ChangeEvent<HTMLInputElement>) {
    handleClusterCountDeltaValue(e.target.value);
  }

  function onClusterByDarkCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
    handleClusterByDarkChecked(e.target.checked);
  }

  if (!vm.theme?.templateRef) return null;

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
              onChange={onApplyToDarkCheckboxChange}
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
              onChange={onApplyToLightCheckboxChange}
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
            onChange={onPendingHexInputChange}
            onBlur={onPendingHexInputBlur}
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
              onInput={onPaletteNativeColorInputInput}
              onChange={onPaletteNativeColorInputChange}
              onBlur={onPaletteNativeColorInputBlur}
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
              onClick={onPaletteColorSwatchButtonClick}
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
          <button
            type="button"
            className="theme-palette-btn theme-eyedropper-btn"
            disabled={selectedColorsDisplay.kind === 'none'}
            onClick={onAssignEyedropperButtonClick}
            title="Pick color from anywhere on screen"
            aria-label="Pick color from screen"
          >
            <span className="material-symbols-outlined" aria-hidden>colorize</span>
          </button>
        </div>
      </div>
      <div className="theme-palette-hue-row">
        <label htmlFor="theme-palette-hue-slider" className="theme-palette-hue-label">
          Hue Adjustment
        </label>
        <div className="theme-palette-actions">
          <button type="button" className="theme-palette-btn" onClick={onRecenter} aria-label="Recenter hue slider to 0">
            Recenter
          </button>
          <input
            type="text"
            className="theme-palette-hue-ref-input"
            value={hueRefInputValue}
            onChange={onHueRefInputChange}
            onBlur={handleHueRefBlur}
            onKeyDown={handleHueRefKeyDown}
            aria-label="Hue reference color (hex)"
            placeholder="#FF0000"
          />
          <button
            type="button"
            className="theme-palette-btn theme-eyedropper-btn"
            onClick={handleHueReferenceEyedropper}
            title="Pick hue reference from screen"
            aria-label="Pick hue reference color from screen"
          >
            <span className="material-symbols-outlined" aria-hidden>
              colorize
            </span>
          </button>
        </div>
      </div>
      <div className="theme-palette-slider-wrap">
        <style ref={hueSliderStyleRef} />
        <input
          id="theme-palette-hue-slider"
          type="range"
          className="theme-palette-hue-slider"
          min={-100}
          max={100}
          step={1}
          value={hueAdjustment}
          onChange={onHueSliderChange}
          onPointerDown={handleHuePointerDown}
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
            onChange={onClusterCountSliderChange}
            onPointerUp={handleClusterCountCommitCurrent}
            onMouseUp={handleClusterCountCommitCurrent}
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
            onChange={onClusterByDarkCheckboxChange}
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
            const groupLabel = groupKey === PALETTE_UNGROUPED_KEY ? 'Ungrouped' : groupKey;

            function onGroupTriStateChange(checked: boolean) {
              onSetColorGroupChecked(groupKey, checked);
            }

            return (
              <div key={groupKey} className="theme-palette-group-block">
                <div className="theme-palette-group-header">
                  <TriStateCheckbox
                    state={groupState}
                    onChange={onGroupTriStateChange}
                    ariaLabel={`Select all in group: ${groupLabel}`}
                    className="theme-palette-group-checkbox"
                  />
                  <span className="theme-palette-group-label-inline">{groupLabel}</span>
                </div>
                <div className="theme-palette-group-swatches-row">
                  {clusters.map((cluster, idx) => (
                    <ThemePaletteClusterColumn
                      key={`${groupKey}-${idx}`}
                      cluster={cluster}
                      groupKey={groupKey}
                      refsInGroupSet={refsInGroupSet}
                      hexToRefs={hexToRefs}
                      checkedColorRefs={checkedColorRefs}
                      onSetColorRefsChecked={onSetColorRefsChecked}
                      handleSwatchClick={handleSwatchClick}
                      copyHexToClipboard={copyHexToClipboard}
                      primaryClickPendingRef={primaryClickPendingRef}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
