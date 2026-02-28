import { useEffect, useMemo, useRef, useState } from 'react';
import type { ColorAssignment, Mapping } from '../../model/schemas';
import type { TokenizedPreview } from '../../core/tokenizer';
import { buildScopeColorMap, resolveTokenColor } from '../../core/scope-resolver';
import { previewService } from '../../services/preview-service';

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
  colorVariableKeys: string[];
  idePrimaryColorRef: string | null;
  onChangeIdePrimaryColorRef: (ref: string | null) => void;
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

export function EditorPreviewsCard({
  colorAssignments,
  colorVariableKeys,
  idePrimaryColorRef,
  onChangeIdePrimaryColorRef,
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
    () => buildScopeColorMap(mappings, colorAssignments),
    [mappings, colorAssignments],
  );

  const darkColumnBg = colorForRef(colorAssignments, idePrimaryColorRef, 'dark', '#1e1e1e');
  const lightColumnBg = colorForRef(colorAssignments, idePrimaryColorRef, 'light', '#ffffff');
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
              previews.map((preview) => (
                <div key={`${preview.language}/${preview.fileName}`} className="theme-preview-block">
                  <div className="theme-preview-block-label">
                    {preview.language} / {preview.fileName}
                  </div>
                  <pre
                    className="theme-preview-code"
                    style={{ backgroundColor: darkCodeBg }}
                  >
                    <code>
                      <PreviewLines
                        lines={preview.lines}
                        scopeColorMap={scopeColorMap}
                        mode="dark"
                        defaultColor={DEFAULT_DARK_FG}
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
              previews.map((preview) => (
                <div key={`${preview.language}/${preview.fileName}`} className="theme-preview-block">
                  <div className="theme-preview-block-label">
                    {preview.language} / {preview.fileName}
                  </div>
                  <pre
                    className="theme-preview-code"
                    style={{ backgroundColor: lightCodeBg }}
                  >
                    <code>
                      <PreviewLines
                        lines={preview.lines}
                        scopeColorMap={scopeColorMap}
                        mode="light"
                        defaultColor={DEFAULT_LIGHT_FG}
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

type PreviewLinesProps = {
  lines: readonly { tokens: readonly { text: string; scopes: string[] }[] }[];
  scopeColorMap: ReturnType<typeof buildScopeColorMap>;
  mode: 'dark' | 'light';
  defaultColor: string;
};

function PreviewLines({ lines, scopeColorMap, mode, defaultColor }: PreviewLinesProps) {
  return (
    <>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="theme-preview-line">
          {line.tokens.map((token, tokenIdx) => {
            const color = resolveTokenColor(token.scopes, scopeColorMap, mode) ?? defaultColor;
            return (
              <span
                key={tokenIdx}
                style={{ color }}
                title={token.scopes.length > 0 ? token.scopes.join(' › ') : 'no scope'}
              >
                {token.text}
              </span>
            );
          })}
          {'\n'}
        </span>
      ))}
    </>
  );
}
