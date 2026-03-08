import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastVariable,
  Mapping,
} from '../../model/schemas';
import type { TokenizedPreview } from '../../core/tokenizer';
import { contrastRatio } from '../../core/color';
import { buildScopeColorMap, resolveColorForThemeTokenKey, resolveTokenColor, resolveTokenEntry } from '../../core/scope-resolver';
import { previewService } from '../../services/preview-service';

/** Precomputed colors per token for both modes; avoids resolveTokenColor during render. */
interface ResolvedToken {
  text: string;
  darkColor: string;
  lightColor: string;
  /** Tooltip for the dark preview column. */
  titleDark: string;
  /** Tooltip for the light preview column. */
  titleLight: string;
}

type ResolvedLine = { tokens: ResolvedToken[] };
type ResolvedPreview = { previewKey: string; lines: ResolvedLine[] };

const DEFAULT_DARK_FG = '#d4d4d4';
const DEFAULT_LIGHT_FG = '#1f1f1f';

/** Returns black or white for readable text on the given hex background (relative luminance). */
function textColorForBackground(hex: string): string {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.exec(hex);
  if (!m) return '#ffffff';
  let r: number, g: number, b: number;
  const raw = m[1];
  const rgbPart = raw.length === 8 ? raw.slice(0, 6) : raw;
  if (rgbPart.length === 3) {
    r = parseInt(rgbPart[0] + rgbPart[0], 16) / 255;
    g = parseInt(rgbPart[1] + rgbPart[1], 16) / 255;
    b = parseInt(rgbPart[2] + rgbPart[2], 16) / 255;
  } else {
    r = parseInt(rgbPart.slice(0, 2), 16) / 255;
    g = parseInt(rgbPart.slice(2, 4), 16) / 255;
    b = parseInt(rgbPart.slice(4, 6), 16) / 255;
  }
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

interface EditorPreviewsCardProps {
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  mappings: readonly Mapping[];
  idePrimaryTokenRef: string | null;
  onChangeIdePrimaryTokenRef: (tokenKey: string | null) => void;
  themeBackgroundTokenRef: string | null;
  onChangeThemeBackgroundTokenRef: (tokenKey: string | null) => void;
  lineNumberBackgroundTokenRef: string | null;
  onChangeLineNumberBackgroundTokenRef: (tokenKey: string | null) => void;
  lineNumberForegroundTokenRef: string | null;
  onChangeLineNumberForegroundTokenRef: (tokenKey: string | null) => void;
  ideTabTokenRef: string | null;
  onChangeIdeTabTokenRef: (tokenKey: string | null) => void;
  ideTabBarBackgroundTokenRef: string | null;
  onChangeIdeTabBarBackgroundTokenRef: (tokenKey: string | null) => void;
  ideTabBarForegroundTokenRef: string | null;
  onChangeIdeTabBarForegroundTokenRef: (tokenKey: string | null) => void;
  editorPreviewScrollbarBackgroundTokenRef: string | null;
  onChangeEditorPreviewScrollbarBackgroundTokenRef: (tokenKey: string | null) => void;
  editorPreviewScrollbarForegroundTokenRef: string | null;
  onChangeEditorPreviewScrollbarForegroundTokenRef: (tokenKey: string | null) => void;
  editorPreviewSelectionBackgroundTokenRef: string | null;
  onChangeEditorPreviewSelectionBackgroundTokenRef: (tokenKey: string | null) => void;
}

function colorForRef(
  colorAssignments: readonly ColorAssignment[],
  ref: string | null,
  mode: 'dark' | 'light',
  fallback: string,
): string {
  if (!ref) return fallback;
  const a = colorAssignments.find((x) => x.colorRef === ref);
  if (!a) return fallback;
  if (mode === 'dark') return a.dark?.value ?? fallback;
  return a.useDarkForLight ? (a.dark?.value ?? fallback) : (a.light?.value ?? fallback);
}

/** Get contrast assignment params for a contrast variable and mode, or null. */
function contrastParamsForRef(
  contrastAssignments: readonly ContrastAssignment[],
  contrastVariableRef: string,
  mode: 'dark' | 'light',
): { value: number; comparisonMethod: string; min: number | null; max: number | null } | null {
  const a = contrastAssignments.find((x) => x.contrastVariableRef === contrastVariableRef);
  if (!a) return null;
  const val = mode === 'dark' ? a.dark : a.useDarkForLight ? a.dark : a.light;
  if (!val) return null;
  return {
    value: val.value,
    comparisonMethod: val.comparisonMethod,
    min: val.min ?? null,
    max: val.max ?? null,
  };
}

interface FilterableTokenSelectProps {
  label: string;
  value: string | null;
  onChange: (tokenKey: string | null) => void;
  options: string[];
}

function FilterableTokenSelect({ label, value, onChange, options }: FilterableTokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return options;
    const q = filter.trim().toLowerCase();
    return options.filter((k) => k.toLowerCase().includes(q));
  }, [options, filter]);

  return (
    <div className="theme-preview-token-select-wrap" ref={wrapRef}>
      <label className="field-row theme-preview-field">
        <span className="field-label">{label}</span>
        <span className="theme-preview-field-inline theme-preview-token-select-inline">
          <button
            type="button"
            className="field-select theme-preview-token-select-btn"
            onClick={() => setIsOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={label}
          >
            {value ?? '— token —'}
          </button>
          {isOpen && (
            <div className="mappings-filter-dropdown theme-preview-token-dropdown" role="listbox">
              <input
                type="text"
                className="theme-preview-token-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Type to filter…"
                aria-label="Filter tokens"
                autoFocus
              />
              <button
                type="button"
                className="theme-preview-token-clear"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                  setFilter('');
                }}
              >
                Clear
              </button>
              <div className="theme-preview-token-list">
                {filtered.length === 0 ? (
                  <div className="theme-preview-token-empty">No matching tokens</div>
                ) : (
                  filtered.map((k) => (
                    <div
                      key={k}
                      role="option"
                      aria-selected={value === k}
                      className="mappings-filter-check theme-preview-token-option"
                      onClick={() => {
                        onChange(k);
                        setIsOpen(false);
                        setFilter('');
                      }}
                    >
                      {k}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </span>
      </label>
    </div>
  );
}

export function EditorPreviewsCard({
  colorAssignments,
  contrastAssignments,
  contrastVariables,
  mappings,
  idePrimaryTokenRef,
  onChangeIdePrimaryTokenRef,
  themeBackgroundTokenRef,
  onChangeThemeBackgroundTokenRef,
  lineNumberBackgroundTokenRef,
  onChangeLineNumberBackgroundTokenRef,
  lineNumberForegroundTokenRef,
  onChangeLineNumberForegroundTokenRef,
  ideTabTokenRef,
  onChangeIdeTabTokenRef,
  ideTabBarBackgroundTokenRef,
  onChangeIdeTabBarBackgroundTokenRef,
  ideTabBarForegroundTokenRef,
  onChangeIdeTabBarForegroundTokenRef,
  editorPreviewScrollbarBackgroundTokenRef,
  onChangeEditorPreviewScrollbarBackgroundTokenRef,
  editorPreviewScrollbarForegroundTokenRef,
  onChangeEditorPreviewScrollbarForegroundTokenRef,
  editorPreviewSelectionBackgroundTokenRef,
  onChangeEditorPreviewSelectionBackgroundTokenRef,
}: EditorPreviewsCardProps) {
  const [previews, setPreviews] = useState<TokenizedPreview[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    previewService
      .loadPreviews()
      .then((list) => {
        if (!cancelled) setPreviews(list);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(String(err?.message ?? err));
      });
    return () => { cancelled = true; };
  }, []);

  const scopeColorMap = useMemo(
    () =>
      buildScopeColorMap(mappings, colorAssignments, contrastAssignments, contrastVariables),
    [mappings, colorAssignments, contrastAssignments, contrastVariables],
  );

  const themeTokenKeys = useMemo(
    () =>
      [...new Set(
        mappings
          .filter((m) => m.token.type === 'theme' && m.colorVariableRef != null)
          .map((m) => m.token.key),
      )].sort((a, b) => a.localeCompare(b)),
    [mappings],
  );

  const resolvedPreviews = useMemo((): ResolvedPreview[] => {
    return previews.map((preview) => ({
      previewKey: `${preview.language}/${preview.fileName}`,
      lines: preview.lines.map((line) => ({
        tokens: line.tokens.map((token) => {
          const entry = resolveTokenEntry(token.scopes, scopeColorMap);
          const scopeLabel = token.scopes.length > 0 ? token.scopes.join(' › ') : 'no scope';
          if (entry) {
            const buildTitle = (mode: 'dark' | 'light') => {
              const lines: string[] = [
                scopeLabel,
                `Color variable: ${entry.colorVariableRef}`,
                `Contrast variable: ${entry.contrastVariableRef ?? '—'}`,
              ];
              const assigned = mode === 'dark' ? entry.assignedDark : entry.assignedLight;
              const resolved = mode === 'dark' ? entry.darkColor : entry.lightColor;
              if (entry.contrastVariableRef) {
                const cv = contrastVariables.find((v) => v.key === entry.contrastVariableRef);
                const comparisonSourceRef = cv?.comparisonSourceRef ?? null;
                const comparisonSourceColor = comparisonSourceRef
                  ? colorForRef(colorAssignments, comparisonSourceRef, mode, '')
                  : null;
                const sourceColorDisplay = comparisonSourceColor || '—';
                lines.push(
                  `Comparison source: ${comparisonSourceRef ?? '—'} (${sourceColorDisplay})`,
                );
                const params = contrastParamsForRef(contrastAssignments, entry.contrastVariableRef, mode);
                if (params) {
                  const minMax = [params.min, params.max].filter((x) => x != null).length
                    ? `, min: ${params.min ?? '—'}, max: ${params.max ?? '—'}`
                    : '';
                  lines.push(
                    `Contrast params: value: ${params.value}, method: ${params.comparisonMethod}${minMax}`,
                  );
                }
                const hasMinMax = params && (params.min != null || params.max != null);
                const BLACK = '#000000';
                if (comparisonSourceColor) {
                  const evaluated =
                    assigned ? contrastRatio(assigned, comparisonSourceColor) : null;
                  const resolvedRatio =
                    resolved ? contrastRatio(resolved, comparisonSourceColor) : null;
                  const evaluatedVsBlack = assigned ? contrastRatio(assigned, BLACK) : null;
                  const resolvedVsBlack = resolved ? contrastRatio(resolved, BLACK) : null;
                  const evalSuffix = hasMinMax && evaluatedVsBlack != null ? ` (vs black: ${evaluatedVsBlack.toFixed(2)})` : '';
                  const resolvedSuffix = hasMinMax && resolvedVsBlack != null ? ` (vs black: ${resolvedVsBlack.toFixed(2)})` : '';
                  lines.push(
                    `Evaluated contrast: ${evaluated != null ? evaluated.toFixed(2) : '—'}${evalSuffix}`,
                    `Resolved contrast: ${resolvedRatio != null ? resolvedRatio.toFixed(2) : '—'}${resolvedSuffix}`,
                  );
                } else {
                  lines.push('Evaluated contrast: —', 'Resolved contrast: —');
                }
              }
              lines.push(`Assigned: ${assigned ?? '—'}`, `Resolved: ${resolved ?? '—'}`);
              return lines.join('\n');
            };
            return {
              text: token.text,
              darkColor: entry.darkColor ?? DEFAULT_DARK_FG,
              lightColor: entry.lightColor ?? DEFAULT_LIGHT_FG,
              titleDark: buildTitle('dark'),
              titleLight: buildTitle('light'),
            };
          }
          return {
            text: token.text,
            darkColor: resolveTokenColor(token.scopes, scopeColorMap, 'dark') ?? DEFAULT_DARK_FG,
            lightColor: resolveTokenColor(token.scopes, scopeColorMap, 'light') ?? DEFAULT_LIGHT_FG,
            titleDark: scopeLabel,
            titleLight: scopeLabel,
          };
        }),
      })),
    }));
  }, [previews, scopeColorMap, colorAssignments, contrastAssignments, contrastVariables]);

  const darkColumnBg = resolveColorForThemeTokenKey(idePrimaryTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#1e1e1e');
  const lightColumnBg = resolveColorForThemeTokenKey(idePrimaryTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#ffffff');
  const darkCodeBg = resolveColorForThemeTokenKey(themeBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#1e1e1e');
  const lightCodeBg = resolveColorForThemeTokenKey(themeBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#ffffff');
  const darkTextColor = textColorForBackground(darkColumnBg);
  const lightTextColor = textColorForBackground(lightColumnBg);

  const darkLineNumBg = resolveColorForThemeTokenKey(lineNumberBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#252526');
  const lightLineNumBg = resolveColorForThemeTokenKey(lineNumberBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#f3f3f3');
  const darkLineNumFg = resolveColorForThemeTokenKey(lineNumberForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#858585');
  const lightLineNumFg = resolveColorForThemeTokenKey(lineNumberForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#237893');
  const darkIdeTabColor = resolveColorForThemeTokenKey(ideTabTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#2d2d30');
  const lightIdeTabColor = resolveColorForThemeTokenKey(ideTabTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#ffffff');
  const darkIdeTabBarBg = resolveColorForThemeTokenKey(ideTabBarBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#252526');
  const lightIdeTabBarBg = resolveColorForThemeTokenKey(ideTabBarBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#f3f3f3');
  const darkIdeTabBarFg = resolveColorForThemeTokenKey(ideTabBarForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#cccccc');
  const lightIdeTabBarFg = resolveColorForThemeTokenKey(ideTabBarForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#333333');
  const darkScrollbarBg = resolveColorForThemeTokenKey(editorPreviewScrollbarBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#1e1e1e');
  const lightScrollbarBg = resolveColorForThemeTokenKey(editorPreviewScrollbarBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#ffffff');
  const darkScrollbarFg = resolveColorForThemeTokenKey(editorPreviewScrollbarForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#79797966');
  const lightScrollbarFg = resolveColorForThemeTokenKey(editorPreviewScrollbarForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#79797966');
  const darkSelectionBg = resolveColorForThemeTokenKey(editorPreviewSelectionBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#264f78');
  const lightSelectionBg = resolveColorForThemeTokenKey(editorPreviewSelectionBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#add6ff');

  const darkScrollRef = useRef<HTMLDivElement | null>(null);
  const lightScrollRef = useRef<HTMLDivElement | null>(null);
  const isSyncingScrollRef = useRef(false);
  const [sampleDropdownOpen, setSampleDropdownOpen] = useState(false);
  const sampleDropdownRef = useRef<HTMLDivElement | null>(null);
  /** Track scroll position so sticky bar label updates reliably when the user scrolls. */
  const [scrollTop, setScrollTop] = useState(0);

  const virtualizer = useVirtualizer({
    count: previews.length,
    getScrollElement: () => darkScrollRef.current,
    estimateSize: () => 212,
    overscan: 2,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  /** When scroll container has no size (e.g. jsdom, initial layout), virtualizer returns no items; show first N so content is visible. */
  const fallbackIndices =
    previews.length > 0 && virtualItems.length === 0
      ? previews.map((_, i) => i).slice(0, 10)
      : null;

  /** Index of the sample at the top of the scroll view (for sticky bar label). Use the item that contains scrollTop, or the last item that starts before scrollTop (e.g. when in padding between items). */
  const currentSampleIndex = (() => {
    const containing = virtualItems.find((item) => scrollTop >= item.start && scrollTop < item.end);
    if (containing != null) return containing.index;
    const lastBefore = virtualItems.filter((item) => item.start <= scrollTop).pop();
    return lastBefore?.index ?? virtualItems[0]?.index ?? fallbackIndices?.[0] ?? 0;
  })();
  const currentPreview = previews[currentSampleIndex];

  useEffect(() => {
    if (!sampleDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const el = sampleDropdownRef.current;
      if (el && !el.contains(e.target as Node)) setSampleDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sampleDropdownOpen]);

  const scrollToSample = (index: number) => {
    virtualizer.scrollToIndex(index, { align: 'start' });
    isSyncingScrollRef.current = true;
    requestAnimationFrame(() => {
      const dark = darkScrollRef.current;
      const light = lightScrollRef.current;
      if (dark) setScrollTop(dark.scrollTop);
      if (dark && light) light.scrollTop = dark.scrollTop;
      isSyncingScrollRef.current = false;
    });
    setSampleDropdownOpen(false);
  };

  const handleDarkScroll = () => {
    const el = darkScrollRef.current;
    const other = lightScrollRef.current;
    if (el) setScrollTop(el.scrollTop);
    if (isSyncingScrollRef.current) return;
    if (!el || !other) return;
    isSyncingScrollRef.current = true;
    other.scrollTop = el.scrollTop;
    other.scrollLeft = el.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  const handleLightScroll = () => {
    const el = lightScrollRef.current;
    const other = darkScrollRef.current;
    if (other) setScrollTop(other.scrollTop);
    if (isSyncingScrollRef.current) return;
    if (!el || !other) return;
    isSyncingScrollRef.current = true;
    other.scrollTop = el.scrollTop;
    other.scrollLeft = el.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  return (
    <div className="tokens-card theme-previews-card">
      <h2>Editor Previews</h2>

      <div className="theme-preview-fields">
        <div className="theme-preview-fields-row theme-preview-fields-row-4">
          <FilterableTokenSelect
            label="IDE Primary"
            value={idePrimaryTokenRef}
            onChange={onChangeIdePrimaryTokenRef}
            options={themeTokenKeys}
          />
          <FilterableTokenSelect
            label="Theme background"
            value={themeBackgroundTokenRef}
            onChange={onChangeThemeBackgroundTokenRef}
            options={themeTokenKeys}
          />
        </div>
        <div className="theme-preview-fields-row theme-preview-fields-row-4">
          <FilterableTokenSelect
            label="Line number bg"
            value={lineNumberBackgroundTokenRef}
            onChange={onChangeLineNumberBackgroundTokenRef}
            options={themeTokenKeys}
          />
          <FilterableTokenSelect
            label="Line number fg"
            value={lineNumberForegroundTokenRef}
            onChange={onChangeLineNumberForegroundTokenRef}
            options={themeTokenKeys}
          />
        </div>
        <div className="theme-preview-fields-row theme-preview-fields-row-4">
          <FilterableTokenSelect
            label="IDE Tab Color"
            value={ideTabTokenRef}
            onChange={onChangeIdeTabTokenRef}
            options={themeTokenKeys}
          />
          <FilterableTokenSelect
            label="IDE Tab Bar Bg"
            value={ideTabBarBackgroundTokenRef}
            onChange={onChangeIdeTabBarBackgroundTokenRef}
            options={themeTokenKeys}
          />
        </div>
        <div className="theme-preview-fields-row theme-preview-fields-row-4">
          <FilterableTokenSelect
            label="IDE Tab Bar Fg"
            value={ideTabBarForegroundTokenRef}
            onChange={onChangeIdeTabBarForegroundTokenRef}
            options={themeTokenKeys}
          />
          <FilterableTokenSelect
            label="Scrollbar bg"
            value={editorPreviewScrollbarBackgroundTokenRef}
            onChange={onChangeEditorPreviewScrollbarBackgroundTokenRef}
            options={themeTokenKeys}
          />
        </div>
        <div className="theme-preview-fields-row theme-preview-fields-row-4">
          <FilterableTokenSelect
            label="Scrollbar fg"
            value={editorPreviewScrollbarForegroundTokenRef}
            onChange={onChangeEditorPreviewScrollbarForegroundTokenRef}
            options={themeTokenKeys}
          />
          <FilterableTokenSelect
            label="Selection bg"
            value={editorPreviewSelectionBackgroundTokenRef}
            onChange={onChangeEditorPreviewSelectionBackgroundTokenRef}
            options={themeTokenKeys}
          />
        </div>
      </div>

      {loadError && (
        <p className="theme-preview-error" role="alert">
          {loadError}
        </p>
      )}

      <div className="theme-preview-columns">
        <div
          className="theme-preview-col"
          style={{
            backgroundColor: darkColumnBg,
            color: darkTextColor,
            ['--theme-preview-selection-bg' as string]: darkSelectionBg,
          }}
        >
          <h3 className="theme-preview-heading">Dark</h3>
          {previews.length > 0 && (
            <div
              className="theme-preview-sticky-bar"
              style={{ backgroundColor: darkIdeTabBarBg, color: darkIdeTabBarFg }}
              ref={sampleDropdownRef}
            >
              <span
                className="theme-preview-sticky-bar-label theme-preview-sticky-bar-tab"
                style={{ backgroundColor: darkIdeTabColor, color: darkTextColor }}
              >
                {currentPreview ? currentPreview.language : ''}
              </span>
              <div className="theme-preview-sample-dropdown-wrap">
                <button
                  type="button"
                  className="theme-preview-sample-dropdown-btn"
                  style={{ backgroundColor: darkIdeTabBarBg, color: darkIdeTabBarFg, borderColor: darkIdeTabBarFg }}
                  onClick={() => setSampleDropdownOpen((v) => !v)}
                  aria-expanded={sampleDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Show sample list"
                >
                  <span className="material-symbols-outlined" aria-hidden>list</span>
                </button>
                {sampleDropdownOpen && (
                  <div className="theme-preview-sample-dropdown" role="listbox">
                    {previews.map((p, i) => (
                      <button
                        key={`${p.language}/${p.fileName}`}
                        type="button"
                        role="option"
                        className="theme-preview-sample-dropdown-item"
                        onClick={() => scrollToSample(i)}
                      >
                        {p.language}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            ref={darkScrollRef}
            className="theme-preview-column-inner"
            onScroll={handleDarkScroll}
            style={{ scrollbarColor: `${darkScrollbarFg} ${darkScrollbarBg}` }}
          >
            {previews.length === 0 ? (
              <div className="theme-preview-block">
                <span className="theme-preview-placeholder">
                  Load examples from disk
                </span>
              </div>
            ) : fallbackIndices ? (
              fallbackIndices.map((idx) => {
                const preview = previews[idx];
                const resolved = resolvedPreviews[idx];
                const key = `${preview.language}/${preview.fileName}`;
                const lines = resolved?.lines ?? [];
                return (
                  <div key={key} className="theme-preview-block">
                    <div className="theme-preview-block-label">
                      {preview.language}
                    </div>
                    <div className="theme-preview-code-wrap">
                      <div
                        className="theme-preview-line-numbers"
                        style={{ backgroundColor: darkLineNumBg, color: darkLineNumFg }}
                        aria-hidden
                      >
                        {lines.map((_, i) => (
                          <div key={i} className="theme-preview-line-number">{i + 1}</div>
                        ))}
                      </div>
                      <pre
                        className="theme-preview-code"
                        style={{ backgroundColor: darkCodeBg }}
                      >
                        <code>
                          <ResolvedPreviewLines lines={lines} mode="dark" />
                        </code>
                      </pre>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="theme-preview-virtual-inner"
                style={{ height: totalSize }}
              >
                {virtualItems.map((virtualItem) => {
                  const preview = previews[virtualItem.index];
                  const resolved = resolvedPreviews[virtualItem.index];
                  const key = `${preview.language}/${preview.fileName}`;
                  const lines = resolved?.lines ?? [];
                  return (
                    <div
                      key={key}
                      ref={(el) => el && virtualizer.measureElement(el)}
                      data-index={virtualItem.index}
                      className="theme-preview-block theme-preview-virtual-block"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div className="theme-preview-block-label">
                        {preview.language}
                      </div>
                      <div className="theme-preview-code-wrap">
                        <div
                          className="theme-preview-line-numbers"
                          style={{ backgroundColor: darkLineNumBg, color: darkLineNumFg }}
                          aria-hidden
                        >
                          {lines.map((_, i) => (
                            <div key={i} className="theme-preview-line-number">{i + 1}</div>
                          ))}
                        </div>
                        <pre
                          className="theme-preview-code"
                          style={{ backgroundColor: darkCodeBg }}
                        >
                          <code>
                            <ResolvedPreviewLines lines={lines} mode="dark" />
                          </code>
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div
          className="theme-preview-col"
          style={{
            backgroundColor: lightColumnBg,
            color: lightTextColor,
            ['--theme-preview-selection-bg' as string]: lightSelectionBg,
          }}
        >
          <h3 className="theme-preview-heading">Light</h3>
          {previews.length > 0 && (
            <div
              className="theme-preview-sticky-bar"
              style={{ backgroundColor: lightIdeTabBarBg, color: lightIdeTabBarFg }}
            >
              <span
                className="theme-preview-sticky-bar-label theme-preview-sticky-bar-tab"
                style={{ backgroundColor: lightIdeTabColor, color: lightTextColor }}
              >
                {currentPreview ? currentPreview.language : ''}
              </span>
            </div>
          )}
          <div
            ref={lightScrollRef}
            className="theme-preview-column-inner"
            onScroll={handleLightScroll}
            style={{ scrollbarColor: `${lightScrollbarFg} ${lightScrollbarBg}` }}
          >
            {previews.length === 0 ? (
              <div className="theme-preview-block">
                <span className="theme-preview-placeholder">
                  Load examples from disk
                </span>
              </div>
            ) : fallbackIndices ? (
              fallbackIndices.map((idx) => {
                const preview = previews[idx];
                const resolved = resolvedPreviews[idx];
                const key = `${preview.language}/${preview.fileName}`;
                const lines = resolved?.lines ?? [];
                return (
                  <div key={key} className="theme-preview-block">
                    <div className="theme-preview-block-label">
                      {preview.language}
                    </div>
                    <div className="theme-preview-code-wrap">
                      <div
                        className="theme-preview-line-numbers"
                        style={{ backgroundColor: lightLineNumBg, color: lightLineNumFg }}
                        aria-hidden
                      >
                        {lines.map((_, i) => (
                          <div key={i} className="theme-preview-line-number">{i + 1}</div>
                        ))}
                      </div>
                      <pre
                        className="theme-preview-code"
                        style={{ backgroundColor: lightCodeBg }}
                      >
                        <code>
                          <ResolvedPreviewLines lines={lines} mode="light" />
                        </code>
                      </pre>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="theme-preview-virtual-inner"
                style={{ height: totalSize }}
              >
                {virtualItems.map((virtualItem) => {
                  const preview = previews[virtualItem.index];
                  const resolved = resolvedPreviews[virtualItem.index];
                  const key = `${preview.language}/${preview.fileName}`;
                  const lines = resolved?.lines ?? [];
                  return (
                    <div
                      key={key}
                      className="theme-preview-block theme-preview-virtual-block"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div className="theme-preview-block-label">
                        {preview.language}
                      </div>
                      <div className="theme-preview-code-wrap">
                        <div
                          className="theme-preview-line-numbers"
                          style={{ backgroundColor: lightLineNumBg, color: lightLineNumFg }}
                          aria-hidden
                        >
                          {lines.map((_, i) => (
                            <div key={i} className="theme-preview-line-number">{i + 1}</div>
                          ))}
                        </div>
                        <pre
                          className="theme-preview-code"
                          style={{ backgroundColor: lightCodeBg }}
                        >
                          <code>
                            <ResolvedPreviewLines lines={lines} mode="light" />
                          </code>
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResolvedPreviewLines({
  lines,
  mode,
}: {
  lines: ResolvedLine[];
  mode: 'dark' | 'light';
}) {
  return (
    <>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="theme-preview-line">
          {line.tokens.map((token, tokenIdx) => (
            <span
              key={tokenIdx}
              style={{ color: mode === 'dark' ? token.darkColor : token.lightColor }}
              title={mode === 'dark' ? token.titleDark : token.titleLight}
            >
              {token.text}
            </span>
          ))}
          {'\n'}
        </span>
      ))}
    </>
  );
}
