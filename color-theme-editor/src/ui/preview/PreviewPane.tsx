import type { GeneratedTheme, PreviewTokenizedSample, SemanticTokenValue } from "../../domain/types";

interface PreviewPaneProps {
  title: string;
  theme: GeneratedTheme;
  samples: Array<
    PreviewTokenizedSample
    | {
        id: string;
        relativePath: string;
        content: string;
      }
  >;
}

function normalizeSampleLines(sample: PreviewPaneProps["samples"][number]): {
  id: string;
  relativePath: string;
  lines: Array<{ lineNumber: number; spans: Array<{ text: string; scopes: string[] }> }>;
} {
  if ("sampleId" in sample) {
    return {
      id: sample.sampleId,
      relativePath: sample.relativePath,
      lines: sample.lines.map((line) => ({
        lineNumber: line.lineNumber,
        spans: line.spans.map((span) => ({
          text: span.text,
          scopes: span.scopes,
        })),
      })),
    };
  }

  return {
    id: sample.id,
    relativePath: sample.relativePath,
    lines: sample.content.split("\n").map((line, index) => ({
      lineNumber: index + 1,
      spans: [{ text: line, scopes: [] }],
    })),
  };
}

function asScopeList(scope: string | string[] | undefined): string[] {
  if (!scope) return [];
  return Array.isArray(scope) ? scope : [scope];
}

function semanticForeground(value: SemanticTokenValue | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.foreground ?? null;
}

function scopeMatches(entryScope: string, tokenScope: string): boolean {
  return (
    tokenScope === entryScope
    || tokenScope.startsWith(`${entryScope}.`)
    || entryScope.startsWith(`${tokenScope}.`)
  );
}

function resolveSemanticByScopes(theme: GeneratedTheme, scopes: string[]): string | null {
  const lowered = scopes.map((scope) => scope.toLowerCase());

  if (lowered.some((scope) => scope.includes("comment"))) {
    return semanticForeground(theme.semanticTokenColors.comment);
  }

  if (lowered.some((scope) => scope.includes("string") || scope.includes("punctuation.definition.string"))) {
    return semanticForeground(theme.semanticTokenColors.string);
  }

  if (lowered.some((scope) => scope.includes("keyword") || scope.includes("storage") || scope.includes("control"))) {
    return semanticForeground(theme.semanticTokenColors.keyword);
  }

  return null;
}

export function resolveScopeForeground(theme: GeneratedTheme, scopes: string[]): string {
  const fallback = theme.colors["editor.foreground"] ?? (theme.type === "dark" ? "#d4d4d4" : "#202020");
  if (scopes.length === 0) {
    return fallback;
  }

  const normalizedScopes = scopes.map((scope) => scope.toLowerCase());

  for (const tokenScope of normalizedScopes.slice().reverse()) {
    for (const entry of theme.tokenColors) {
      const entryScopes = asScopeList(entry.scope).map((scope) => scope.toLowerCase());
      if (entry.settings.foreground && entryScopes.some((entryScope) => scopeMatches(entryScope, tokenScope))) {
        return entry.settings.foreground;
      }
    }
  }

  const semantic = resolveSemanticByScopes(theme, normalizedScopes);
  if (semantic) {
    return semantic;
  }

  return fallback;
}

export function PreviewPane({ title, theme, samples }: PreviewPaneProps): JSX.Element {
  const background = theme.colors["editor.background"] ?? (theme.type === "dark" ? "#1e1e1e" : "#f6f6f6");
  const foreground = theme.colors["editor.foreground"] ?? (theme.type === "dark" ? "#d4d4d4" : "#202020");
  const border = theme.colors["panel.border"] ?? (theme.type === "dark" ? "#3c3c3c" : "#c5c5c5");

  return (
    <section style={{ border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden", background }}>
      <header style={{ padding: "10px 12px", borderBottom: `1px solid ${border}`, color: foreground, fontWeight: 600 }}>
        {title}
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, padding: 12, maxHeight: 620, overflow: "auto" }}>
        {samples.map((sample) => {
          const normalized = normalizeSampleLines(sample);
          return (
          <article key={normalized.id} style={{ border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
            <div
              style={{
                padding: "6px 10px",
                borderBottom: `1px solid ${border}`,
                color: foreground,
                fontSize: 12,
                fontFamily: "Consolas, monospace",
              }}
            >
              {normalized.relativePath}
            </div>
            <pre
              style={{
                margin: 0,
                padding: 10,
                fontSize: 12,
                lineHeight: 1.45,
                color: foreground,
                background,
                fontFamily: "Consolas, 'Courier New', monospace",
                overflow: "auto",
              }}
            >
              {normalized.lines.slice(0, 38).map((line) => (
                <div key={`${normalized.id}-line-${line.lineNumber}`}>
                  {line.spans.map((span, spanIndex) => (
                    <span
                      key={`${normalized.id}-${line.lineNumber}-${spanIndex}`}
                      style={{ color: resolveScopeForeground(theme, span.scopes) }}
                    >
                      {span.text}
                    </span>
                  ))}
                </div>
              ))}
            </pre>
          </article>
          );
        })}
      </div>
    </section>
  );
}
