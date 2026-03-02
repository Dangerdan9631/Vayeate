import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastVariable,
  Mapping,
} from '../../model/schemas';
import type { TokenizedPreview } from '../../core/tokenizer';
import { adjustColorToMeetContrast, contrastRatio } from '../../core/color';
import { buildScopeColorMap, resolveTokenColor, resolveTokenEntry } from '../../core/scope-resolver';
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
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return '#ffffff';
  let r: number, g: number, b: number;
  const raw = m[1];
  if (raw.length === 3) {
    r = parseInt(raw[0] + raw[0], 16) / 255;
    g = parseInt(raw[1] + raw[1], 16) / 255;
    b = parseInt(raw[2] + raw[2], 16) / 255;
  } else {
    r = parseInt(raw.slice(0, 2), 16) / 255;
    g = parseInt(raw.slice(2, 4), 16) / 255;
    b = parseInt(raw.slice(4, 6), 16) / 255;
  }
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

interface EditorPreviewsCardProps {
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  colorVariableKeys: string[];
  idePrimaryColorRef: string | null;
  onChangeIdePrimaryColorRef: (ref: string | null) => void;
  idePrimaryColorContrastRef: string | null;
  onChangeIdePrimaryColorContrastRef: (ref: string | null) => void;
  themeBackgroundColorRef: string | null;
  onChangeThemeBackgroundColorRef: (ref: string | null) => void;
  mappings: readonly Mapping[];
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

/** Resolve IDE primary color, optionally applying the given contrast variable. */
function resolveIdePrimaryColor(
  colorAssignments: readonly ColorAssignment[],
  contrastAssignments: readonly ContrastAssignment[],
  contrastVariables: readonly ContrastVariable[],
  colorRef: string | null,
  contrastRef: string | null,
  mode: 'dark' | 'light',
  fallback: string,
): string {
  const base = colorForRef(colorAssignments, colorRef, mode, fallback);
  if (!contrastRef || !colorRef) return base;
  const cv = contrastVariables.find((v) => v.key === contrastRef);
  const sourceRef = cv?.comparisonSourceRef ?? null;
  if (!sourceRef) return base;
  const a = contrastAssignments.find((x) => x.contrastVariableRef === contrastRef);
  if (!a) return base;
  const val = mode === 'dark' ? a.dark : a.useDarkForLight ? a.dark : a.light;
  if (!val) return base;
  const sourceColor = colorForRef(colorAssignments, sourceRef, mode, fallback);
  const opts = {
    comparisonMethod: val.comparisonMethod,
    value: val.value,
    min: val.min ?? null,
    max: val.max ?? null,
  };
  return adjustColorToMeetContrast(base, sourceColor, opts);
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

export function EditorPreviewsCard({
  colorAssignments,
  contrastAssignments,
  contrastVariables,
  colorVariableKeys,
  idePrimaryColorRef,
  onChangeIdePrimaryColorRef,
  idePrimaryColorContrastRef,
  onChangeIdePrimaryColorContrastRef,
  themeBackgroundColorRef,
  onChangeThemeBackgroundColorRef,
  mappings,
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

  const darkColumnBg = resolveIdePrimaryColor(
    colorAssignments,
    contrastAssignments,
    contrastVariables,
    idePrimaryColorRef,
    idePrimaryColorContrastRef,
    'dark',
    '#1e1e1e',
  );
  const lightColumnBg = resolveIdePrimaryColor(
    colorAssignments,
    contrastAssignments,
    contrastVariables,
    idePrimaryColorRef,
    idePrimaryColorContrastRef,
    'light',
    '#ffffff',
  );
  const darkCodeBg = colorForRef(colorAssignments, themeBackgroundColorRef, 'dark', '#1e1e1e');
  const lightCodeBg = colorForRef(colorAssignments, themeBackgroundColorRef, 'light', '#ffffff');
  const darkTextColor = textColorForBackground(darkColumnBg);
  const lightTextColor = textColorForBackground(lightColumnBg);

  const darkInnerRef = useRef<HTMLDivElement | null>(null);
  const lightInnerRef = useRef<HTMLDivElement | null>(null);
  const isSyncingScrollRef = useRef(false);

  const handleDarkScroll = () => {
    if (isSyncingScrollRef.current) return;
    const el = darkInnerRef.current;
    const other = lightInnerRef.current;
    if (!el || !other) return;
    isSyncingScrollRef.current = true;
    other.scrollTop = el.scrollTop;
    other.scrollLeft = el.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  const handleLightScroll = () => {
    if (isSyncingScrollRef.current) return;
    const el = lightInnerRef.current;
    const other = darkInnerRef.current;
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

      <label className="field-row">
        <span className="field-label">IDE Primary Color Variable</span>
        <select
          className="field-select"
          value={idePrimaryColorRef ?? ''}
          onChange={(e) => onChangeIdePrimaryColorRef(e.target.value || null)}
        >
          <option value="">— select —</option>
          {colorVariableKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>

      <label className="field-row">
        <span className="field-label">IDE Primary Contrast Variable</span>
        <select
          className="field-select"
          value={idePrimaryColorContrastRef ?? ''}
          onChange={(e) => onChangeIdePrimaryColorContrastRef(e.target.value || null)}
        >
          <option value="">— select —</option>
          {contrastVariables.map((v) => (
            <option key={v.key} value={v.key}>
              {v.key}
            </option>
          ))}
        </select>
      </label>

      <label className="field-row">
        <span className="field-label">Theme Background Color Variable</span>
        <select
          className="field-select"
          value={themeBackgroundColorRef ?? ''}
          onChange={(e) => onChangeThemeBackgroundColorRef(e.target.value || null)}
        >
          <option value="">— select —</option>
          {colorVariableKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </label>

      {loadError && (
        <p className="theme-preview-error" role="alert">
          {loadError}
        </p>
      )}

      <div className="theme-preview-columns">
        <div className="theme-preview-col" style={{ backgroundColor: darkColumnBg, color: darkTextColor }}>
          <h3 className="theme-preview-heading">Dark</h3>
          <div ref={darkInnerRef} className="theme-preview-column-inner" onScroll={handleDarkScroll}>
            {previews.length === 0 ? (
              <div className="theme-preview-block">
                <span className="theme-preview-placeholder">
                  Load examples from disk
                </span>
              </div>
            ) : (
              previews.map((preview, idx) => (
                <div key={`${preview.language}/${preview.fileName}`} className="theme-preview-block">
                  <div className="theme-preview-block-label">
                    {preview.language} / {preview.fileName}
                  </div>
                  <pre
                    className="theme-preview-code"
                    style={{ backgroundColor: darkCodeBg }}
                  >
                    <code>
                      <ResolvedPreviewLines
                        lines={resolvedPreviews[idx]?.lines ?? []}
                        mode="dark"
                      />
                    </code>
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="theme-preview-col" style={{ backgroundColor: lightColumnBg, color: lightTextColor }}>
          <h3 className="theme-preview-heading">Light</h3>
          <div ref={lightInnerRef} className="theme-preview-column-inner" onScroll={handleLightScroll}>
            {previews.length === 0 ? (
              <div className="theme-preview-block">
                <span className="theme-preview-placeholder">
                  Load examples from disk
                </span>
              </div>
            ) : (
              previews.map((preview, idx) => (
                <div key={`${preview.language}/${preview.fileName}`} className="theme-preview-block">
                  <div className="theme-preview-block-label">
                    {preview.language} / {preview.fileName}
                  </div>
                  <pre
                    className="theme-preview-code"
                    style={{ backgroundColor: lightCodeBg }}
                  >
                    <code>
                      <ResolvedPreviewLines
                        lines={resolvedPreviews[idx]?.lines ?? []}
                        mode="light"
                      />
                    </code>
                  </pre>
                </div>
              ))
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
