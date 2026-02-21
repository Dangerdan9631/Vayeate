import type { GeneratedTheme } from "../../domain/types";
import type { PreviewSampleContent } from "./samples";

interface PreviewPaneProps {
  title: string;
  theme: GeneratedTheme;
  samples: PreviewSampleContent[];
}

type TokenKind = "plain" | "keyword" | "string" | "comment";

interface Token {
  text: string;
  kind: TokenKind;
}

const KEYWORD_BY_LANGUAGE: Record<PreviewSampleContent["language"], Set<string>> = {
  ts: new Set(["const", "let", "function", "return", "if", "else", "class", "import", "export", "new"]),
  json: new Set([]),
  md: new Set(["#", "##", "###", "-", "*", "```"]),
  ps1: new Set(["function", "param", "if", "else", "foreach", "return"]),
  rust: new Set(["fn", "let", "mut", "impl", "struct", "pub", "match", "return"]),
};

function tokenForeground(theme: GeneratedTheme, kind: TokenKind): string {
  const fallback = theme.colors["editor.foreground"] ?? (theme.type === "dark" ? "#d4d4d4" : "#202020");
  if (kind === "plain") return fallback;

  const byName = theme.tokenColors.find((entry) => (entry.name ?? "").toLowerCase().includes(kind));
  if (byName?.settings.foreground) return byName.settings.foreground;

  if (kind === "keyword") {
    const semantic = theme.semanticTokenColors.keyword;
    return typeof semantic === "string" ? semantic : semantic?.foreground ?? fallback;
  }
  if (kind === "string") {
    const semantic = theme.semanticTokenColors.string;
    return typeof semantic === "string" ? semantic : semantic?.foreground ?? fallback;
  }
  if (kind === "comment") {
    const semantic = theme.semanticTokenColors.comment;
    return typeof semantic === "string" ? semantic : semantic?.foreground ?? fallback;
  }

  return fallback;
}

function tokenizeLine(line: string, language: PreviewSampleContent["language"]): Token[] {
  const trimmed = line.trimStart();
  if (!trimmed) return [{ text: line, kind: "plain" }];

  if (language === "md") {
    if (trimmed.startsWith("#") || trimmed.startsWith("- ") || trimmed.startsWith("```")) {
      return [{ text: line, kind: "keyword" }];
    }
  }

  if (language === "ts" || language === "rust" || language === "ps1") {
    if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
      return [{ text: line, kind: "comment" }];
    }
  }

  if (language === "json" && trimmed.startsWith("//")) {
    return [{ text: line, kind: "comment" }];
  }

  const regex = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*')|([A-Za-z_][A-Za-z0-9_]*)/g;
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of line.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      tokens.push({ text: line.slice(cursor, index), kind: "plain" });
    }

    const value = match[0];
    const isString = value.startsWith("\"") || value.startsWith("'");
    if (isString) {
      tokens.push({ text: value, kind: "string" });
    } else {
      const isKeyword = KEYWORD_BY_LANGUAGE[language].has(value);
      tokens.push({ text: value, kind: isKeyword ? "keyword" : "plain" });
    }

    cursor = index + value.length;
  }

  if (cursor < line.length) {
    tokens.push({ text: line.slice(cursor), kind: "plain" });
  }

  return tokens.length > 0 ? tokens : [{ text: line, kind: "plain" }];
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
        {samples.map((sample) => (
          <article key={sample.id} style={{ border: `1px solid ${border}`, borderRadius: 6, overflow: "hidden" }}>
            <div
              style={{
                padding: "6px 10px",
                borderBottom: `1px solid ${border}`,
                color: foreground,
                fontSize: 12,
                fontFamily: "Consolas, monospace",
              }}
            >
              {sample.relativePath}
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
              {sample.content.split("\n").slice(0, 38).map((line, lineIndex) => (
                <div key={`${sample.id}-line-${lineIndex}`}>
                  {tokenizeLine(line, sample.language).map((token, tokenIndex) => (
                    <span key={`${sample.id}-${lineIndex}-${tokenIndex}`} style={{ color: tokenForeground(theme, token.kind) }}>
                      {token.text}
                    </span>
                  ))}
                </div>
              ))}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}