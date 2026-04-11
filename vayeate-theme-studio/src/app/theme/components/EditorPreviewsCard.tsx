import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ColorAssignment, ContrastAssignment } from '../../../model/schemas';
import type { TokenizedPreview } from '../../../model/preview-types';
import { useEditorPreviewsCardViewModel } from '../viewmodel/use-editor-previews-card-viewmodel';
import { contrastRatio } from '../../../domain/utils/color';
import { buildScopeColorMap, resolveColorForThemeTokenKey, resolveTokenColor, resolveTokenEntry } from '../../../domain/utils/scope-resolver';

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
/** Text color for preview card chrome (heading, tab label) — not editor content. */
const CARD_CHROME_DARK = '#cccccc';
const CARD_CHROME_LIGHT = '#333333';

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

  function onTokenSelectToggleClick() {
    setIsOpen((o) => !o);
  }

  function onTokenFilterInputChange(e: ChangeEvent<HTMLInputElement>) {
    setFilter(e.target.value);
  }

  function onTokenSelectClearClick() {
    onChange(null);
    setIsOpen(false);
    setFilter('');
  }

  return (
    <div className="theme-preview-token-select-wrap" ref={wrapRef}>
      <label className="field-row theme-preview-field theme-preview-field-stacked">
        <span className="field-label">{label}</span>
        <span className="theme-preview-field-inline theme-preview-token-select-inline">
          <button
            type="button"
            className="field-select theme-preview-token-select-btn"
            onClick={onTokenSelectToggleClick}
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
                onChange={onTokenFilterInputChange}
                placeholder="Type to filter…"
                aria-label="Filter tokens"
                autoFocus
              />
              <button
                type="button"
                className="theme-preview-token-clear"
                onClick={onTokenSelectClearClick}
              >
                Clear
              </button>
              <div className="theme-preview-token-list">
                {filtered.length === 0 ? (
                  <div className="theme-preview-token-empty">No matching tokens</div>
                ) : (
                  filtered.map((k) => {
                    function onTokenOptionClick() {
                      onChange(k);
                      setIsOpen(false);
                      setFilter('');
                    }
                    return (
                    <div
                      key={k}
                      role="option"
                      aria-selected={value === k}
                      className="mappings-filter-check theme-preview-token-option"
                      onClick={onTokenOptionClick}
                    >
                      {k}
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </span>
      </label>
    </div>
  );
}

export function EditorPreviewsCard() {
  const vm = useEditorPreviewsCardViewModel();
  const {
    editorPreviews: previews,
    colorAssignments,
    contrastAssignments,
    contrastVariables,
    mappings,
    idePrimaryTokenRef,
    onChangeIdePrimaryTokenRef,
    ideForegroundTokenRef,
    onChangeIdeForegroundTokenRef,
    themeBackgroundTokenRef,
    onChangeThemeBackgroundTokenRef,
    themeForegroundTokenRef,
    onChangeThemeForegroundTokenRef,
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
    editorPreviewMenuForegroundTokenRef,
    onChangeEditorPreviewMenuForegroundTokenRef,
    editorPreviewMenuBackgroundTokenRef,
    onChangeEditorPreviewMenuBackgroundTokenRef,
  } = vm;

  const loadError: string | null = null;

  const scopeColorMap = useMemo(
    () =>
      buildScopeColorMap(mappings, colorAssignments, contrastAssignments, contrastVariables),
    [mappings, colorAssignments, contrastAssignments, contrastVariables],
  );

  /** Editor foreground: default text color for code in the preview blocks only (not card chrome). */
  const defaultEditorFgDark = resolveColorForThemeTokenKey(themeForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', DEFAULT_DARK_FG);
  const defaultEditorFgLight = resolveColorForThemeTokenKey(themeForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', DEFAULT_LIGHT_FG);

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
              darkColor: entry.darkColor ?? defaultEditorFgDark,
              lightColor: entry.lightColor ?? defaultEditorFgLight,
              titleDark: buildTitle('dark'),
              titleLight: buildTitle('light'),
            };
          }
          return {
            text: token.text,
            darkColor: resolveTokenColor(token.scopes, scopeColorMap, 'dark') ?? defaultEditorFgDark,
            lightColor: resolveTokenColor(token.scopes, scopeColorMap, 'light') ?? defaultEditorFgLight,
            titleDark: scopeLabel,
            titleLight: scopeLabel,
          };
        }),
      })),
    }));
  }, [previews, scopeColorMap, colorAssignments, contrastAssignments, contrastVariables, defaultEditorFgDark, defaultEditorFgLight]);

  const darkColumnBg = resolveColorForThemeTokenKey(idePrimaryTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#1e1e1e');
  const lightColumnBg = resolveColorForThemeTokenKey(idePrimaryTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#ffffff');
  const darkIdeFgColor = resolveColorForThemeTokenKey(ideForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', CARD_CHROME_DARK);
  const lightIdeFgColor = resolveColorForThemeTokenKey(ideForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', CARD_CHROME_LIGHT);
  const darkCodeBg = resolveColorForThemeTokenKey(themeBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#1e1e1e');
  const lightCodeBg = resolveColorForThemeTokenKey(themeBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#ffffff');
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
  const darkMenuFg = resolveColorForThemeTokenKey(editorPreviewMenuForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#cccccc');
  const darkMenuBg = resolveColorForThemeTokenKey(editorPreviewMenuBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'dark', '#2d2d2d');
  const lightMenuFg = resolveColorForThemeTokenKey(editorPreviewMenuForegroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#333333');
  const lightMenuBg = resolveColorForThemeTokenKey(editorPreviewMenuBackgroundTokenRef, mappings, colorAssignments, contrastAssignments, contrastVariables, 'light', '#ffffff');

  const darkScrollRef = useRef<HTMLDivElement | null>(null);
  const lightScrollRef = useRef<HTMLDivElement | null>(null);
  const isSyncingScrollRef = useRef(false);
  const [sampleDropdownOpen, setSampleDropdownOpen] = useState(false);
  const sampleDropdownRef = useRef<HTMLDivElement | null>(null);
  const lightSampleDropdownRef = useRef<HTMLDivElement | null>(null);
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

  /** When multiple previews share a language, show "lang - file.ex"; otherwise just the language. */
  const previewLabelByIndex = useMemo(() => {
    const countByLang = new Map<string, number>();
    for (const p of previews) {
      countByLang.set(p.language, (countByLang.get(p.language) ?? 0) + 1);
    }
    return (preview: TokenizedPreview) =>
      (countByLang.get(preview.language) ?? 0) > 1
        ? `${preview.language} - ${preview.fileName}`
        : preview.language;
  }, [previews]);

  useEffect(() => {
    if (!sampleDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const darkEl = sampleDropdownRef.current;
      const lightEl = lightSampleDropdownRef.current;
      const insideDark = darkEl?.contains(target);
      const insideLight = lightEl?.contains(target);
      if (!insideDark && !insideLight) setSampleDropdownOpen(false);
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

  function onSampleDropdownToggleClick() {
    setSampleDropdownOpen((v) => !v);
  }

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

  if (!vm.theme?.templateRef) return null;

  return (
    <div className="tokens-card theme-previews-card">
      <h2>Editor Previews</h2>

      <div className="theme-preview-fields theme-preview-fields-grid">
        <FilterableTokenSelect
          label="IDE Foreground"
          value={ideForegroundTokenRef}
          onChange={onChangeIdeForegroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="IDE Background"
          value={idePrimaryTokenRef}
          onChange={onChangeIdePrimaryTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="Editor Foreground"
          value={themeForegroundTokenRef}
          onChange={onChangeThemeForegroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="Editor Background"
          value={themeBackgroundTokenRef}
          onChange={onChangeThemeBackgroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="Line Number Foreground"
          value={lineNumberForegroundTokenRef}
          onChange={onChangeLineNumberForegroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="Line Number Background"
          value={lineNumberBackgroundTokenRef}
          onChange={onChangeLineNumberBackgroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="Scrollbar Foreground"
          value={editorPreviewScrollbarForegroundTokenRef}
          onChange={onChangeEditorPreviewScrollbarForegroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="Scrollbar Background"
          value={editorPreviewScrollbarBackgroundTokenRef}
          onChange={onChangeEditorPreviewScrollbarBackgroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="IDE Current Tab Color"
          value={ideTabTokenRef}
          onChange={onChangeIdeTabTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="IDE Tab Bar Foreground"
          value={ideTabBarForegroundTokenRef}
          onChange={onChangeIdeTabBarForegroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="IDE Tab Bar Background"
          value={ideTabBarBackgroundTokenRef}
          onChange={onChangeIdeTabBarBackgroundTokenRef}
          options={themeTokenKeys}
        />
        <FilterableTokenSelect
          label="Selection Background"
          value={editorPreviewSelectionBackgroundTokenRef}
          onChange={onChangeEditorPreviewSelectionBackgroundTokenRef}
          options={themeTokenKeys}
        />
        <div className="theme-preview-fields theme-preview-fields-menu-row">
          <FilterableTokenSelect
            label="Menu Foreground"
            value={editorPreviewMenuForegroundTokenRef}
            onChange={onChangeEditorPreviewMenuForegroundTokenRef}
            options={themeTokenKeys}
          />
          <FilterableTokenSelect
            label="Menu Background"
            value={editorPreviewMenuBackgroundTokenRef}
            onChange={onChangeEditorPreviewMenuBackgroundTokenRef}
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
            color: darkIdeFgColor,
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
                style={{ backgroundColor: darkIdeTabColor, color: darkIdeFgColor }}
              >
                <span className="material-symbols-outlined theme-preview-tab-icon theme-preview-tab-icon-left" aria-hidden>description</span>
                {currentPreview ? previewLabelByIndex(currentPreview) : ''}
                <span className="material-symbols-outlined theme-preview-tab-icon theme-preview-tab-icon-close" aria-hidden>close</span>
              </span>
              <div className="theme-preview-sample-dropdown-wrap">
                <button
                  type="button"
                  className="theme-preview-sample-dropdown-btn"
                  style={{ backgroundColor: darkIdeTabBarBg, color: darkIdeTabBarFg, borderColor: darkIdeTabBarFg }}
                  onClick={onSampleDropdownToggleClick}
                  aria-expanded={sampleDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Show sample list"
                >
                  <span className="material-symbols-outlined" aria-hidden>list</span>
                </button>
                {sampleDropdownOpen && (
                  <div
                    className="theme-preview-sample-dropdown"
                    role="listbox"
                    style={{
                      backgroundColor: darkMenuBg,
                      color: darkMenuFg,
                      scrollbarColor: `${darkMenuFg} ${darkMenuBg}`,
                    }}
                  >
                    {previews.map((p, i) => {
                      function onDarkSampleItemClick() {
                        scrollToSample(i);
                      }
                      return (
                      <button
                        key={`${p.language}/${p.fileName}`}
                        type="button"
                        role="option"
                        className="theme-preview-sample-dropdown-item"
                        onClick={onDarkSampleItemClick}
                      >
                        {previewLabelByIndex(p)}
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            ref={darkScrollRef}
            className="theme-preview-column-inner"
            onScroll={handleDarkScroll}
            style={{
              scrollbarColor: `${darkScrollbarFg} ${darkScrollbarBg}`,
              ['--preview-scrollbar-bg' as string]: darkScrollbarBg,
              ['--preview-scrollbar-fg' as string]: darkScrollbarFg,
            }}
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
                      {previewLabelByIndex(preview)}
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
                        {previewLabelByIndex(preview)}
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
            color: lightIdeFgColor,
            ['--theme-preview-selection-bg' as string]: lightSelectionBg,
          }}
        >
          <h3 className="theme-preview-heading">Light</h3>
          {previews.length > 0 && (
            <div
              className="theme-preview-sticky-bar"
              style={{ backgroundColor: lightIdeTabBarBg, color: lightIdeTabBarFg }}
              ref={lightSampleDropdownRef}
            >
              <span
                className="theme-preview-sticky-bar-label theme-preview-sticky-bar-tab"
                style={{ backgroundColor: lightIdeTabColor, color: lightIdeFgColor }}
              >
                <span className="material-symbols-outlined theme-preview-tab-icon theme-preview-tab-icon-left" aria-hidden>description</span>
                {currentPreview ? previewLabelByIndex(currentPreview) : ''}
                <span className="material-symbols-outlined theme-preview-tab-icon theme-preview-tab-icon-close" aria-hidden>close</span>
              </span>
              <div className="theme-preview-sample-dropdown-wrap">
                <button
                  type="button"
                  className="theme-preview-sample-dropdown-btn"
                  style={{ backgroundColor: lightIdeTabBarBg, color: lightIdeTabBarFg, borderColor: lightIdeTabBarFg }}
                  onClick={onSampleDropdownToggleClick}
                  aria-expanded={sampleDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Show sample list"
                >
                  <span className="material-symbols-outlined" aria-hidden>list</span>
                </button>
                {sampleDropdownOpen && (
                  <div
                    className="theme-preview-sample-dropdown"
                    role="listbox"
                    style={{
                      backgroundColor: lightMenuBg,
                      color: lightMenuFg,
                      scrollbarColor: `${lightMenuFg} ${lightMenuBg}`,
                    }}
                  >
                    {previews.map((p, i) => {
                      function onLightSampleItemClick() {
                        scrollToSample(i);
                      }
                      return (
                      <button
                        key={`${p.language}/${p.fileName}`}
                        type="button"
                        role="option"
                        className="theme-preview-sample-dropdown-item"
                        onClick={onLightSampleItemClick}
                      >
                        {previewLabelByIndex(p)}
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            ref={lightScrollRef}
            className="theme-preview-column-inner"
            onScroll={handleLightScroll}
            style={{
              scrollbarColor: `${lightScrollbarFg} ${lightScrollbarBg}`,
              ['--preview-scrollbar-bg' as string]: lightScrollbarBg,
              ['--preview-scrollbar-fg' as string]: lightScrollbarFg,
            }}
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
                      {previewLabelByIndex(preview)}
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
                        {previewLabelByIndex(preview)}
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
